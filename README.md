# Secure Gen

A red-teaming and benchmarking framework for evaluating LLM models on real-world security tasks.

## What it does

Secure Gen lets security researchers:

- **Attack** — run curated adversarial prompt datasets against LLMs (prompt injection, jailbreaks, tool abuse, data extraction)
- **Benchmark** — evaluate models head-to-head on real security tasks (vuln detection, CVE triage, SAST triage, threat modeling)
- **Analyze** — explore results through a web dashboard with leaderboards, visualizations, and a prompt playground
- **Automate** — integrate benchmarks into research pipelines via the CLI

## Project structure

```
secure-gen/
├── web/          # Vite + React dashboard
├── cli/          # Python CLI tool (securegen)
├── datasets/     # Attack and benchmark datasets
└── docs/         # Research methodology and writeups
```

## Quick start

### CLI

```bash
cd cli
pip install -e .
securegen --help
```

### Web dashboard

```bash
cd web
npm install
npm run dev
```

## Docs

- [Methodology](docs/methodology.md)
- [Attack Taxonomy](docs/attack-taxonomy.md)
- [Benchmark Design](docs/benchmark-design.md)
- [CLI Reference](cli/README.md)

## License

MIT
