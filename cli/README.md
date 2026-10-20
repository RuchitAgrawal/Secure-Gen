# Secure Gen CLI

Command-line interface for running LLM red-teaming attacks and security benchmarks.

## Installation

```bash
pip install -e .
```

Or with `uv`:

```bash
uv pip install -e .
```

## Commands

### Attack

```bash
securegen attack run --dataset ../datasets/prompt_injections/direct.json --models gpt-4o claude-3-5-sonnet
securegen attack list
```

### Benchmark

```bash
securegen benchmark run --dataset ../datasets/security_tasks/vuln_detection.json --models gpt-4o gemini-1.5-pro
securegen benchmark compare --run-a run_001 --run-b run_002
securegen benchmark list
```

### Report

```bash
securegen report generate --run run_001 --format html
securegen report generate --run run_001 --format md
securegen report serve --run run_001
```

## Configuration

Copy `.env.example` to `.env` and set your API keys:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
MISTRAL_API_KEY=...
```

You can also use a `config.yaml` to configure model parameters:

```yaml
models:
  - provider: openai
    model: gpt-4o
    temperature: 0
  - provider: anthropic
    model: claude-3-5-sonnet-20241022
    temperature: 0

run:
  concurrency: 5
  timeout: 60
  retry_attempts: 3
```
