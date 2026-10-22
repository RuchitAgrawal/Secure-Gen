from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table

from securegen.core.config import default_models, load_config, models_from_config
from securegen.core.models import ModelConfig
from securegen.core.runner import BatchRunner
from securegen.attacks.evaluators import classify_attack_response, compute_attack_success_rate
from securegen.benchmarks.scorers import score_response

app = typer.Typer(help="Secure Gen - LLM red-teaming and benchmarking framework")
attack_app = typer.Typer(help="Run adversarial attacks against LLMs")
benchmark_app = typer.Typer(help="Run security task benchmarks")
report_app = typer.Typer(help="Generate and serve reports")

app.add_typer(attack_app, name="attack")
app.add_typer(benchmark_app, name="benchmark")
app.add_typer(report_app, name="report")

console = Console()


def _load_models(config_path: Optional[Path], model_strs: list[str]) -> list[ModelConfig]:
    if config_path:
        cfg = load_config(config_path)
        return models_from_config(cfg)
    if model_strs:
        models = []
        for s in model_strs:
            parts = s.split(":")
            if len(parts) == 2:
                models.append(ModelConfig(provider=parts[0], model=parts[1]))
            else:
                console.print(f"[yellow]Warning: could not parse model spec '{s}', expected provider:model[/yellow]")
        return models
    return default_models()


@attack_app.command("run")
def attack_run(
    dataset: Path = typer.Option(..., "--dataset", "-d", help="Path to attack dataset JSON"),
    models: list[str] = typer.Option([], "--model", "-m", help="Model specs as provider:model (repeatable)"),
    config: Optional[Path] = typer.Option(None, "--config", "-c", help="Path to config.yaml"),
    output: Path = typer.Option(Path("runs"), "--output", "-o", help="Output directory"),
    concurrency: int = typer.Option(5, "--concurrency", help="Max concurrent API calls"),
):
    """Run adversarial attack prompts against one or more LLMs."""
    if not dataset.exists():
        console.print(f"[red]Dataset not found: {dataset}[/red]")
        raise typer.Exit(1)

    with open(dataset) as f:
        tasks = json.load(f)

    model_configs = _load_models(config, models)
    if not model_configs:
        console.print("[red]No models configured. Set API keys or use --model provider:model[/red]")
        raise typer.Exit(1)

    console.print(f"[bold]Running [cyan]{len(tasks)}[/cyan] attack prompts against [cyan]{len(model_configs)}[/cyan] model(s)[/bold]")

    runner = BatchRunner(model_configs, concurrency=concurrency)

    results = []
    with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
        task_id = progress.add_task("Running attacks...", total=None)

        def on_result(result):
            attack_prompt = next((t for t in tasks if t["id"] == result.task_id), {})
            succeeded, verdict, flags = classify_attack_response(
                result.response, attack_prompt.get("expected_behavior", "refusal")
            )
            result.score = 0.0 if succeeded else 1.0
            result.flags = flags
            result.metadata["verdict"] = verdict
            result.metadata["attack_succeeded"] = succeeded
            result.metadata["category"] = attack_prompt.get("category", "")
            results.append(result)
            status = "[red]BYPASSED[/red]" if succeeded else "[green]REFUSED[/green]"
            progress.print(f"  {result.model} | {result.task_id} | {status} | {result.latency_ms}ms")

        asyncio.run(runner.run_all(tasks, "attack", on_result=on_result))

    out_file = runner.save_results(results, output, f"attack_{dataset.stem}")

    asr_data = [{"category": r.metadata.get("category"), "attack_succeeded": r.metadata.get("attack_succeeded")} for r in results]
    asr = compute_attack_success_rate(asr_data)

    table = Table(title="Attack Success Rate by Category")
    table.add_column("Category", style="cyan")
    table.add_column("ASR", style="red")
    for cat, rate in sorted(asr.items()):
        table.add_row(cat, f"{rate:.1%}")
    console.print(table)
    console.print(f"\n[green]Results saved to {out_file}[/green]")


@attack_app.command("list")
def attack_list(
    dataset: Optional[Path] = typer.Option(None, "--dataset", "-d"),
):
    """List available attack prompts."""
    paths = [dataset] if dataset else list(Path("datasets").rglob("*.json"))
    for p in paths:
        if not p.exists():
            continue
        with open(p) as f:
            items = json.load(f)
        console.print(f"\n[bold cyan]{p}[/bold cyan] ({len(items)} prompts)")
        for item in items[:5]:
            console.print(f"  [dim]{item['id']}[/dim] [{item.get('severity', '')}] {item.get('technique', '')}")
        if len(items) > 5:
            console.print(f"  ... and {len(items) - 5} more")


@benchmark_app.command("run")
def benchmark_run(
    dataset: Path = typer.Option(..., "--dataset", "-d", help="Path to benchmark task JSON"),
    models: list[str] = typer.Option([], "--model", "-m"),
    config: Optional[Path] = typer.Option(None, "--config", "-c"),
    output: Path = typer.Option(Path("runs"), "--output", "-o"),
    concurrency: int = typer.Option(5, "--concurrency"),
):
    """Run security benchmark tasks against one or more LLMs."""
    if not dataset.exists():
        console.print(f"[red]Dataset not found: {dataset}[/red]")
        raise typer.Exit(1)

    with open(dataset) as f:
        tasks = json.load(f)

    model_configs = _load_models(config, models)
    if not model_configs:
        console.print("[red]No models configured.[/red]")
        raise typer.Exit(1)

    console.print(f"[bold]Benchmarking [cyan]{len(tasks)}[/cyan] tasks against [cyan]{len(model_configs)}[/cyan] model(s)[/bold]")

    runner = BatchRunner(model_configs, concurrency=concurrency)
    results = []

    system_prompt = (
        "You are a security expert. Answer the question accurately and concisely. "
        "Base your answer only on the information provided."
    )

    with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
        progress.add_task("Running benchmark...", total=None)

        def on_result(result):
            task = next((t for t in tasks if t["id"] == result.task_id), {})
            domain = task.get("domain", "")
            gt = task.get("ground_truth", {})
            result.score = score_response(domain, result.response, gt)
            result.metadata["domain"] = domain
            results.append(result)

        asyncio.run(runner.run_all(tasks, "benchmark", system=system_prompt, on_result=on_result))

    out_file = runner.save_results(results, output, f"bench_{dataset.stem}")

    model_scores: dict[str, list[float]] = {}
    for r in results:
        model_scores.setdefault(r.model, []).append(r.score or 0.0)

    table = Table(title="Benchmark Results")
    table.add_column("Model", style="cyan")
    table.add_column("Avg Score", style="green")
    table.add_column("Tasks")
    for model, scores in sorted(model_scores.items()):
        avg = sum(scores) / len(scores)
        table.add_row(model, f"{avg:.1%}", str(len(scores)))
    console.print(table)
    console.print(f"\n[green]Results saved to {out_file}[/green]")


@benchmark_app.command("list")
def benchmark_list():
    """List available benchmark datasets."""
    for p in Path("datasets/security_tasks").glob("*.json"):
        with open(p) as f:
            items = json.load(f)
        console.print(f"[cyan]{p.name}[/cyan] - {len(items)} tasks")


@report_app.command("generate")
def report_generate(
    run: Path = typer.Option(..., "--run", "-r", help="Path to run results JSON"),
    format: str = typer.Option("md", "--format", "-f", help="Output format: md, html, json"),
    output: Path = typer.Option(Path("reports/output"), "--output", "-o"),
):
    """Generate a report from a benchmark or attack run."""
    if not run.exists():
        console.print(f"[red]Run file not found: {run}[/red]")
        raise typer.Exit(1)

    from securegen.reporters.markdown import generate_markdown_report
    output.mkdir(parents=True, exist_ok=True)
    with open(run) as f:
        results = json.load(f)

    stem = run.stem
    if format == "md":
        out = output / f"{stem}.md"
        content = generate_markdown_report(results, stem)
        out.write_text(content)
        console.print(f"[green]Report written to {out}[/green]")
    elif format == "json":
        out = output / f"{stem}_report.json"
        out.write_text(json.dumps(results, indent=2))
        console.print(f"[green]JSON report written to {out}[/green]")
    else:
        console.print(f"[yellow]Format '{format}' not yet supported, using markdown.[/yellow]")
        out = output / f"{stem}.md"
        content = generate_markdown_report(results, stem)
        out.write_text(content)
        console.print(f"[green]Report written to {out}[/green]")


if __name__ == "__main__":
    app()
