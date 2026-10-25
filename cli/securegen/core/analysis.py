from __future__ import annotations

from typing import TypedDict


class ModelSummary(TypedDict):
    model: str
    provider: str
    overall_score: float
    attack_resistance: float
    benchmark_score: float
    total_runs: int
    avg_latency_ms: float


def aggregate_run_results(results: list[dict]) -> list[ModelSummary]:
    by_model: dict[str, dict] = {}

    for r in results:
        model = r.get("model", "unknown")
        provider = r.get("provider", "unknown")
        if model not in by_model:
            by_model[model] = {
                "model": model,
                "provider": provider,
                "scores": [],
                "latencies": [],
                "attack_scores": [],
                "benchmark_scores": [],
            }

        score = r.get("score")
        if score is not None:
            by_model[model]["scores"].append(score)
            task_type = r.get("task_type", "")
            if task_type == "attack":
                by_model[model]["attack_scores"].append(score)
            elif task_type == "benchmark":
                by_model[model]["benchmark_scores"].append(score)

        latency = r.get("latency_ms")
        if latency is not None:
            by_model[model]["latencies"].append(latency)

    summaries: list[ModelSummary] = []
    for data in by_model.values():
        all_scores = data["scores"]
        attack = data["attack_scores"]
        bench = data["benchmark_scores"]
        lats = data["latencies"]

        summaries.append({
            "model": data["model"],
            "provider": data["provider"],
            "overall_score": round(sum(all_scores) / len(all_scores) * 100, 1) if all_scores else 0.0,
            "attack_resistance": round(sum(attack) / len(attack) * 100, 1) if attack else 0.0,
            "benchmark_score": round(sum(bench) / len(bench) * 100, 1) if bench else 0.0,
            "total_runs": len(all_scores),
            "avg_latency_ms": round(sum(lats) / len(lats), 1) if lats else 0.0,
        })

    return sorted(summaries, key=lambda x: x["overall_score"], reverse=True)


def rank_models(summaries: list[ModelSummary]) -> list[ModelSummary]:
    return sorted(summaries, key=lambda x: x["overall_score"], reverse=True)


def compare_models(
    a_results: list[dict],
    b_results: list[dict],
    task_ids: list[str] | None = None,
) -> dict[str, dict]:
    a_by_task = {r["task_id"]: r for r in a_results if "task_id" in r}
    b_by_task = {r["task_id"]: r for r in b_results if "task_id" in r}

    tasks = task_ids or list(set(a_by_task) & set(b_by_task))
    comparison: dict[str, dict] = {}

    for task in tasks:
        a = a_by_task.get(task)
        b = b_by_task.get(task)
        if not a or not b:
            continue

        a_score = a.get("score", 0.0) or 0.0
        b_score = b.get("score", 0.0) or 0.0
        winner = "a" if a_score > b_score else "b" if b_score > a_score else "tie"

        comparison[task] = {
            "task_id": task,
            "a_score": a_score,
            "b_score": b_score,
            "delta": round(a_score - b_score, 3),
            "winner": winner,
        }

    return comparison
