# Secure Gen Architecture Specification

## 1. System Overview

Secure Gen is an open source LLM red-teaming, adversarial evaluation, and cybersecurity benchmark platform. It couples a modular Python evaluation engine with a client-side visualization dashboard styled around warm editorial typography and restrained coral accents.

The project addresses two intertwined security concerns for generative AI systems:
1. Adversarial Robustness: How well does an LLM resist jailbreaks, indirect prompt injection, tool hijacking, and data extraction attempts?
2. Defensive Capabilities: How effectively does an LLM detect software vulnerabilities, triage CVE reports, analyze SAST findings, and reason about threat models?

## 2. Monorepo Structure

```text
Secure Gen/
├── cli/                 # Python evaluation package and CLI
│   ├── securegen/
│   │   ├── core/        # Data models, provider clients, runner, analysis
│   │   ├── attacks/     # Red-teaming evaluators and classification logic
│   │   ├── benchmarks/  # Domain-specific scorers and rubric engines
│   │   └── reporters/   # Markdown, HTML, CSV, and JSONL report generators
│   └── tests/           # Unit and integration test suite
├── datasets/            # Curated JSON attack payloads and security benchmark tasks
│   ├── prompt_injections/
│   ├── jailbreaks/
│   ├── security_tasks/
│   └── ground_truth/
├── web/                 # React 18 + Vite + TypeScript web application
│   └── src/
│       ├── components/  # Reusable UI primitives (Buttons, Modals, RadarCharts)
│       ├── pages/       # Route views (Leaderboard, Playground, Datasets)
│       └── lib/         # Types, hooks, export utilities, demo fixtures
└── docs/                # Architecture, threat model, and usage guides
```

## 3. Core Engine Architecture

### 3.1 Provider Abstraction
The `BaseProvider` class defines an asynchronous interface for sending prompts to LLM providers:
- `OpenAIProvider`: OpenAI Chat Completion API (GPT-4o, GPT-4o-mini).
- `AnthropicProvider`: Anthropic Messages API (Claude 3.5 Sonnet, Claude 3 Haiku).
- `GoogleProvider`: Google Gemini GenerateContent API (Gemini 1.5 Pro, Flash).
- `OllamaProvider`: Local inference via Ollama HTTP API (Llama 3.1, Mistral).

### 3.2 Evaluation Lifecycle
1. Task Ingestion: Tasks are loaded from schema-validated JSON files via `load_dataset()`.
2. Batch Runner: `BatchRunner` distributes queries across configured providers with concurrency limits and retry logic.
3. Response Extraction: `parsing.py` isolates code snippets, CWE IDs, and structured verdicts from raw responses.
4. Scoring and Evaluation:
   - Attack Evaluators inspect refusals, compliance patterns, and system prompt leaks.
   - Benchmark Scorers match model answers against structured ground truth rubrics.
5. Reporting: Results are aggregated into run summaries and formatted as Markdown, HTML, or exported to CSV/JSONL.

## 4. Frontend Architecture

### 4.1 Design Philosophy
The frontend avoids generic dashboard templates in favor of a warm, editorial layout:
- Tinted Cream Canvas (#faf9f5) providing a soft, non-clinical background.
- Display Serif Typography (Cormorant Garamond, 400 weight) for headers.
- Coral Accent (#cc785c) applied intentionally for primary interactive elements.
- Alternating Surface Elevation separating sections through subtle card tones.

### 4.2 State Management and Components
- Router: React Router v6 provides client-side navigation.
- Data Flow: Local hooks manage filter state, debounced search, and browser persistence.
- Visualizations: SVG-based radar charts and Recharts components render cross-model performance distributions without heavyweight external dependencies.
