# Secure Gen

[![CI Status](https://github.com/RuchitAgrawal/Secure-Gen/actions/workflows/ci.yml/badge.svg)](https://github.com/RuchitAgrawal/Secure-Gen/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12-blue)](cli/pyproject.toml)
[![React 18](https://img.shields.io/badge/frontend-React%2018%20%2B%20TypeScript-coral)](web/package.json)

An open source red-teaming and adversarial cybersecurity evaluation platform for Large Language Models.

Secure Gen provides a dual-sided evaluation harness:
1. Adversarial Robustness: Measure resistance against direct overrides, multi-turn cognitive drift, tool hijacking, RAG injection, and system prompt leakage.
2. Defensive Capabilities: Benchmark model performance on real-world vulnerability detection, CVE triage, SAST alert triaging, and threat modeling.

---

## Key Features

- Curated Adversarial Datasets: Over 130 standardized attack vectors mapped directly to the MITRE ATLAS matrix and OWASP Top 10 for LLM Applications.
- Multi-Provider Support: Unified asynchronous interface for OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google (Gemini 1.5 Pro), and local Ollama instances (Llama 3.1, Mistral).
- Offline Deterministic Testing: Mock offline provider enabling full end-to-end evaluation runs in CI pipelines without live API keys.
- Warm Editorial Dashboard: Custom React TypeScript frontend featuring serif display typography, tinted cream canvas (#faf9f5), restrained coral accents, and SVG radar charts.
- Export and Diagnostics: Native CSV and JSONL dataset exporters, PDF-ready print reports, and automated environment diagnostic check commands.

---

## Repository Layout

```text
Secure-Gen/
├── cli/                 # Python evaluation package (securegen)
│   ├── securegen/
│   │   ├── core/        # Models, providers, runner, diagnostics
│   │   ├── attacks/     # Red-teaming evaluators and multi-turn simulator
│   │   ├── benchmarks/  # Vulnerability, CVE, SAST, and OWASP scorers
│   │   └── reporters/   # HTML, Markdown, CSV, and JSONL exporters
│   └── tests/           # Unit and integration test suite
├── datasets/            # Curated JSON attack payloads and security benchmarks
│   ├── prompt_injections/
│   ├── jailbreaks/
│   ├── security_tasks/
│   └── ground_truth/
├── web/                 # React 18 + Vite + TypeScript web application
│   └── src/
│       ├── components/  # Modal, Toast, RadarChart, AtlasHeatmap, Gauges
│       ├── pages/       # Leaderboard, Playground, RunExplorer, Visualizations
│       └── lib/         # Hooks, export utilities, and types
├── scripts/             # CI and dataset schema verification scripts
└── docs/                # Architecture, threat model, and usage specifications
```

---

## Quickstart

### 1. Python CLI (`securegen`)

```bash
# Clone the repository
git clone https://github.com/RuchitAgrawal/Secure-Gen.git
cd Secure-Gen/cli

# Install package in development mode
pip install -e ".[dev]"

# Run environment diagnostics
securegen check

# Run an adversarial evaluation
securegen attack run --dataset ../datasets/prompt_injections/direct.json --model openai:gpt-4o

# Run defensive benchmark evaluation
securegen benchmark run --dataset ../datasets/security_tasks/cve_triage.json --model anthropic:claude-3-5-sonnet

# Generate formatted HTML report
securegen report generate --run runs/bench_cve_triage.json --format html
```

### 2. Web Visualization Dashboard

```bash
cd ../web

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` to explore the live Leaderboard, Attack Playground, and MITRE ATLAS matrix.

---

## Documentation

- [Architecture Specification](docs/ARCHITECTURE.md): Comprehensive system overview and data contracts.
- [Benchmark Methodology](docs/BENCHMARK_METHODOLOGY.md): Experimental controls, scoring formulas, and decontamination protocol.
- [Threat Model](docs/THREAT_MODEL.md): Full alignment with MITRE ATLAS and OWASP Top 10 for LLMs.
- [CLI Reference](docs/CLI_REFERENCE.md): Command flags, options, and automation examples.
- [Dataset Contribution Guidelines](docs/DATASET_GUIDELINES.md): Schema validation rules and submission guidelines.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
