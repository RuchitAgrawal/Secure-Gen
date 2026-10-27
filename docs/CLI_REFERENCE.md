# Secure Gen CLI Reference

The `securegen` command line tool provides red-teaming, adversarial evaluation, benchmark scoring, and report generation workflows.

## Global Usage

```bash
securegen [OPTIONS] COMMAND [ARGS]...
```

Options:
- `--help`: Show command documentation and exit.

---

## 1. Environment Diagnostics: `securegen check`

Inspects local configuration, detects configured provider API keys, tests Ollama server connectivity, and checks the local dataset inventory.

```bash
securegen check [OPTIONS]
```

Options:
- `-d, --datasets PATH`: Path to datasets directory root. [default: datasets]

Example:
```bash
securegen check
```

---

## 2. Adversarial Attacks: `securegen attack run`

Evaluates LLM resistance against prompt injections, jailbreaks, tool abuse, and data extraction attempts.

```bash
securegen attack run [OPTIONS]
```

Options:
- `-d, --dataset PATH`: Path to attack dataset JSON. [required]
- `-m, --model TEXT`: Model specification formatted as `provider:model_id`. Repeatable.
- `-c, --config PATH`: Optional path to `config.yaml`.
- `-o, --output PATH`: Directory where run results will be saved. [default: runs]
- `--concurrency INTEGER`: Maximum concurrent asynchronous queries. [default: 5]

Example:
```bash
securegen attack run \
  --dataset datasets/prompt_injections/direct.json \
  --model openai:gpt-4o \
  --model anthropic:claude-3-5-sonnet \
  --output runs/attack_direct
```

---

## 3. Defensive Benchmarks: `securegen benchmark run`

Evaluates model capabilities across vulnerability detection, CVE triage, SAST analysis, and threat modeling.

```bash
securegen benchmark run [OPTIONS]
```

Options:
- `-d, --dataset PATH`: Path to benchmark dataset JSON. [required]
- `-m, --model TEXT`: Model specification formatted as `provider:model_id`. Repeatable.
- `-c, --config PATH`: Path to config YAML.
- `-o, --output PATH`: Output directory for evaluation results. [default: runs]
- `--concurrency INTEGER`: Max concurrent requests. [default: 5]

Example:
```bash
securegen benchmark run \
  --dataset datasets/security_tasks/cve_triage.json \
  --model anthropic:claude-3-5-sonnet \
  --output runs/bench_cve
```

---

## 4. Report Generation: `securegen report generate`

Converts a raw JSON evaluation run into an editorial Markdown or HTML report.

```bash
securegen report generate [OPTIONS]
```

Options:
- `-r, --run PATH`: Path to input evaluation run JSON file. [required]
- `-f, --format TEXT`: Output format: `md`, `html`, or `json`. [default: md]
- `-o, --output PATH`: Directory to save the formatted report. [default: reports]

Examples:
```bash
# Generate Markdown report
securegen report generate --run runs/bench_cve.json --format md

# Generate standalone styled HTML report
securegen report generate --run runs/bench_cve.json --format html --output reports/
```

---

## 5. Dataset Management: `securegen data export`

Converts curated dataset JSON arrays into JSONL or CSV format for fine-tuning, RAG ingestion, or analysis in external tools.

```bash
securegen data export [OPTIONS]
```

Options:
- `-d, --dataset PATH`: Path to input dataset JSON. [required]
- `-o, --output PATH`: Target file path for the exported file. [required]
- `-f, --format TEXT`: Export format: `jsonl` or `csv`. [default: jsonl]

Examples:
```bash
# Export to CSV
securegen data export \
  --dataset datasets/prompt_injections/direct.json \
  --output exports/direct_injections.csv \
  --format csv

# Export to JSONL
securegen data export \
  --dataset datasets/security_tasks/vuln_detection.json \
  --output exports/vuln_detection.jsonl \
  --format jsonl
```
