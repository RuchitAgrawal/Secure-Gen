# Changelog

All notable changes to the Secure Gen project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-27

### Added
- Core Python evaluation engine (`securegen`) with asynchronous provider support for OpenAI, Anthropic, Google, and Ollama.
- Offline deterministic mock provider for zero-credential test execution and CI workflows.
- Curated adversarial datasets covering 130+ attack vectors across direct prompt injection, jailbreaks, tool abuse, supply chain poisoning, and multi-turn cognitive drift.
- Defensive benchmark evaluation suites covering vulnerability detection, CVE triage and CVSS estimation, SAST alert triaging, threat modeling, and OWASP Top 10 for LLMs.
- Full React 18 + Vite + TypeScript web visualization dashboard with warm editorial aesthetic:
  - Custom design token system with cream canvas (#faf9f5) and restrained coral accents (#cc785c).
  - Head-to-head model Leaderboard with sortable multi-metric rankings and comparison radar.
  - Interactive Attack Playground with live severity estimation, single-prompt mode, and multi-turn scenario steppers.
  - Run Explorer with side-by-side run comparison modal, provider filters, and keyword search.
  - MITRE ATLAS coverage matrix and heatmap view in Visualizations page.
  - Dataset Browser with debounced search, category filters, and JSON export.
  - Printable PDF reports and client-side Markdown and JSON report downloaders.
- Reusable UI primitives: Modal dialog with backdrop blur, Toast notification system, SVG RadarChart, ScoreGauge, CodeBlock with syntax styling, and DiffViewer.
- Dataset schema validation script (`scripts/validate_datasets.py`) ensuring structural integrity and unique IDs.
- GitHub Actions CI workflows for multi-version Python testing (3.10, 3.11, 3.12), frontend build and typecheck, and Bandit AST security scanning.
- Comprehensive technical documentation including Architecture Specification, Benchmark Methodology, Threat Model, and CLI Reference.
