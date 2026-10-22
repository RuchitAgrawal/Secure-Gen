from __future__ import annotations

from datetime import datetime, timezone


def _model_summary(results: list[dict]) -> dict[str, dict]:
    summary: dict[str, dict] = {}
    for r in results:
        model = r.get("model", "unknown")
        if model not in summary:
            summary[model] = {"scores": [], "latencies": [], "provider": r.get("provider", "")}
        if r.get("score") is not None:
            summary[model]["scores"].append(r["score"])
        if r.get("latency_ms") is not None:
            summary[model]["latencies"].append(r["latency_ms"])
    return summary


def generate_markdown_report(results: list[dict], run_name: str) -> str:
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    summary = _model_summary(results)
    total = len(results)

    lines = [
        f"# Secure Gen Report: {run_name}",
        f"\nGenerated: {generated_at}  ",
        f"Total results: {total}",
        "",
        "## Model Summary",
        "",
        "| Model | Provider | Avg Score | Avg Latency | Tasks |",
        "|---|---|---|---|---|",
    ]

    for model, data in sorted(summary.items()):
        scores = data["scores"]
        lats = data["latencies"]
        avg_score = sum(scores) / len(scores) if scores else 0.0
        avg_lat = int(sum(lats) / len(lats)) if lats else 0
        lines.append(f"| {model} | {data['provider']} | {avg_score:.1%} | {avg_lat}ms | {len(scores)} |")

    lines += ["", "## Individual Results", ""]

    for r in results[:50]:
        score = r.get("score")
        score_str = f"{score:.2f}" if score is not None else "N/A"
        verdict = r.get("metadata", {}).get("verdict", "")
        lines.append(f"### {r.get('task_id', '?')} | {r.get('model', '?')}")
        lines.append(f"- Score: **{score_str}**")
        if verdict:
            lines.append(f"- Verdict: {verdict}")
        lines.append(f"- Latency: {r.get('latency_ms', 'N/A')}ms")
        flags = r.get("flags", [])
        if flags:
            lines.append(f"- Flags: {', '.join(flags)}")
        lines.append("")
        response = r.get("response", "")
        if response:
            preview = response[:300].replace("\n", " ")
            lines.append(f"> {preview}{'...' if len(response) > 300 else ''}")
        lines.append("")

    if total > 50:
        lines.append(f"*{total - 50} additional results omitted. View full JSON for complete data.*")

    return "\n".join(lines)
