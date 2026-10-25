from __future__ import annotations

import asyncio
import sys
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from securegen.core.config import load_config, models_from_config, default_models
from securegen.core.datasets import discover_datasets, merge_datasets
from securegen.core.runner import BatchRunner
from securegen.core.analysis import aggregate_run_results
from securegen.attacks.evaluators import classify_attack_response, compute_attack_success_rate
from securegen.benchmarks.scorers import score_response

console = Console()
full_app = typer.Typer(help="securegen full - run all attack and benchmark datasets in one pass")


@full_app.command()
def run(
    datasets_root: Path = typer.Option(Path("datasets"), "--datasets", "-d"),
    config: Path = typer.Option(None, "--config", "-c"),
    output: Path = typer.Option(Path("runs"), "--output", "-o"),
    concurrency: int = typer.Option(5, "--concurrency"),
    min_severity: str = typer.Option("medium", "--min-severity"),
):
    """Run the full evaluation suite: all attacks + all benchmarks."""
    discovered = discover_datasets(datasets_root)
    attack_datasets = discovered["attacks"]
    benchmark_datasets = discovered["benchmarks"]

    if not attack_datasets and not benchmark_datasets:
        console.print("[red]No datasets found in the specified root directory.[/red]")
        raise typer.Exit(1)

    cfg = load_config(config) if config else {}
    model_configs = models_from_config(cfg) if cfg.get("models") else default_models()

    if not model_configs:
        console.print("[red]No models configured. Set API keys in your environment.[/red]")
        raise typer.Exit(1)

    console.print(f"[bold]Full evaluation suite[/bold]")
    console.print(f"  Attack datasets: {len(attack_datasets)}")
    console.print(f"  Benchmark datasets: {len(benchmark_datasets)}")
    console.print(f"  Models: {[m.model for m in model_configs]}")

    all_results = []

    attack_tasks = merge_datasets(attack_datasets)
    if attack_tasks:
        console.print(f"\n[cyan]Running {len(attack_tasks)} attack prompts...[/cyan]")
        runner = BatchRunner(model_configs, concurrency=concurrency)

        def on_attack(result):
            task = next((t for t in attack_tasks if t["id"] == result.task_id), {})
            succeeded, verdict, flags = classify_attack_response(
                result.response, task.get("expected_behavior", "refusal")
            )
            result.score = 0.0 if succeeded else 1.0
            result.flags = flags
            result.metadata.update({"verdict": verdict, "attack_succeeded": succeeded, "category": task.get("category", "")})
            all_results.append(result)

        asyncio.run(runner.run_all(attack_tasks, "attack", on_result=on_attack))

    bench_tasks = merge_datasets(benchmark_datasets)
    if bench_tasks:
        console.print(f"\n[cyan]Running {len(bench_tasks)} benchmark tasks...[/cyan]")
        runner = BatchRunner(model_configs, concurrency=concurrency)
        system = "You are a security expert. Answer accurately and concisely."

        def on_bench(result):
            task = next((t for t in bench_tasks if t["id"] == result.task_id), {})
            result.score = score_response(task.get("domain", ""), result.response, task.get("ground_truth", {}))
            result.metadata["domain"] = task.get("domain", "")
            all_results.append(result)

        asyncio.run(runner.run_all(bench_tasks, "benchmark", system=system, on_result=on_bench))

    summaries = aggregate_run_results([r.model_dump(mode="json") for r in all_results])

    table = Table(title="Full Evaluation Results")
    table.add_column("Model", style="cyan")
    table.add_column("Overall", style="green")
    table.add_column("Attack Resist.", style="red")
    table.add_column("Benchmark", style="blue")
    table.add_column("Latency", style="dim")

    for s in summaries:
        table.add_row(
            s["model"],
            f"{s['overall_score']:.1f}%",
            f"{s['attack_resistance']:.1f}%",
            f"{s['benchmark_score']:.1f}%",
            f"{s['avg_latency_ms']:.0f}ms",
        )

    console.print(table)
    runner.save_results(all_results, output, "full_eval")
    console.print(f"\n[green]All results saved to {output}/full_eval.json[/green]")


if __name__ == "__main__":
    full_app()
