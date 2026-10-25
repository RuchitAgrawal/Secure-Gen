from __future__ import annotations

from datetime import datetime, timezone

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Secure Gen Report: {run_name}</title>
<style>
  :root {{
    --canvas: #faf9f5;
    --ink: #141413;
    --body: #3d3d3a;
    --muted: #6c6a64;
    --primary: #cc785c;
    --dark: #181715;
    --hairline: #e6dfd8;
    --success: #5db872;
    --error: #c64545;
    --amber: #e8a55a;
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ background: var(--canvas); color: var(--body); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.55; }}
  .container {{ max-width: 1100px; margin: 0 auto; padding: 0 32px; }}
  header {{ background: var(--dark); padding: 32px 0; margin-bottom: 48px; }}
  header h1 {{ font-family: Georgia, serif; font-size: 36px; font-weight: 400; color: #faf9f5; letter-spacing: -0.5px; }}
  header p {{ color: rgba(250,249,245,0.6); font-size: 14px; margin-top: 8px; }}
  h2 {{ font-family: Georgia, serif; font-size: 26px; font-weight: 400; color: var(--ink); margin-bottom: 20px; letter-spacing: -0.3px; }}
  table {{ width: 100%; border-collapse: collapse; margin-bottom: 40px; }}
  th {{ text-align: left; padding: 10px 16px; font-size: 12px; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; background: #efe9de; border-bottom: 1px solid var(--hairline); }}
  td {{ padding: 14px 16px; border-bottom: 1px solid #ebe6df; font-size: 14px; }}
  tr:last-child td {{ border-bottom: none; }}
  .score-high {{ color: var(--success); font-weight: 600; }}
  .score-mid {{ color: var(--amber); font-weight: 600; }}
  .score-low {{ color: var(--error); font-weight: 600; }}
  .badge {{ display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; }}
  .badge-success {{ background: rgba(93,184,114,0.15); color: #2d8a40; }}
  .badge-error {{ background: rgba(198,69,69,0.12); color: var(--error); }}
  .badge-amber {{ background: rgba(232,165,90,0.15); color: #b07020; }}
  .section {{ margin-bottom: 56px; }}
  footer {{ border-top: 1px solid var(--hairline); padding: 32px 0; margin-top: 64px; color: var(--muted); font-size: 13px; }}
  code {{ font-family: 'Fira Code', monospace; font-size: 12px; background: #efe9de; padding: 2px 6px; border-radius: 4px; }}
</style>
</head>
<body>
<header>
  <div class="container">
    <h1>Secure Gen Report: {run_name}</h1>
    <p>Generated {generated_at} &mdash; {total} results</p>
  </div>
</header>
<div class="container">
  <section class="section">
    <h2>Model Summary</h2>
    <table>
      <thead><tr><th>Model</th><th>Provider</th><th>Avg Score</th><th>Avg Latency</th><th>Tasks</th></tr></thead>
      <tbody>{model_rows}</tbody>
    </table>
  </section>
  <section class="section">
    <h2>Individual Results</h2>
    <table>
      <thead><tr><th>Task</th><th>Model</th><th>Score</th><th>Verdict</th><th>Latency</th></tr></thead>
      <tbody>{result_rows}</tbody>
    </table>
  </section>
</div>
<footer>
  <div class="container">Secure Gen &mdash; <a href="https://github.com/RuchitAgrawal/Secure-Gen">github.com/RuchitAgrawal/Secure-Gen</a></div>
</footer>
</body>
</html>"""


def _score_class(score: float | None) -> str:
    if score is None:
        return ''
    if score >= 0.7:
        return 'score-high'
    if score >= 0.4:
        return 'score-mid'
    return 'score-low'


def _verdict_badge(verdict: str) -> str:
    if verdict == 'correctly_refused':
        return '<span class="badge badge-success">Refused</span>'
    if verdict == 'complied':
        return '<span class="badge badge-error">Bypassed</span>'
    return f'<span class="badge badge-amber">{verdict or "N/A"}</span>'


def generate_html_report(results: list[dict], run_name: str) -> str:
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    total = len(results)

    summary: dict[str, dict] = {}
    for r in results:
        model = r.get("model", "unknown")
        if model not in summary:
            summary[model] = {"scores": [], "latencies": [], "provider": r.get("provider", "")}
        if r.get("score") is not None:
            summary[model]["scores"].append(r["score"])
        if r.get("latency_ms") is not None:
            summary[model]["latencies"].append(r["latency_ms"])

    model_rows = ""
    for model, data in sorted(summary.items()):
        scores = data["scores"]
        lats = data["latencies"]
        avg_score = sum(scores) / len(scores) if scores else 0.0
        avg_lat = int(sum(lats) / len(lats)) if lats else 0
        cls = _score_class(avg_score)
        model_rows += f"<tr><td><code>{model}</code></td><td>{data['provider']}</td><td class='{cls}'>{avg_score:.1%}</td><td>{avg_lat}ms</td><td>{len(scores)}</td></tr>"

    result_rows = ""
    for r in results[:100]:
        score = r.get("score")
        verdict = r.get("metadata", {}).get("verdict", "")
        cls = _score_class(score)
        score_str = f"{score:.2f}" if score is not None else "N/A"
        result_rows += (
            f"<tr><td><code>{r.get('task_id', '?')}</code></td>"
            f"<td><code>{r.get('model', '?')}</code></td>"
            f"<td class='{cls}'>{score_str}</td>"
            f"<td>{_verdict_badge(verdict)}</td>"
            f"<td>{r.get('latency_ms', 'N/A')}ms</td></tr>"
        )

    return HTML_TEMPLATE.format(
        run_name=run_name,
        generated_at=generated_at,
        total=total,
        model_rows=model_rows,
        result_rows=result_rows,
    )
