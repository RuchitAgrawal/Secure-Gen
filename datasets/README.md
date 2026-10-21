# Secure Gen Datasets

This directory contains curated attack and benchmark datasets for evaluating LLMs on security tasks.

## Structure

```
datasets/
├── prompt_injections/    Attack prompts targeting instruction-following vulnerabilities
├── jailbreaks/           Prompts designed to bypass model safety guidelines
├── datasets/             Security task benchmarks with ground truth
└── ground_truth/         Ground truth labels and rubrics for evaluation
```

## Attack Dataset Schema

Each attack dataset is a JSON array of `AttackPrompt` objects:

```json
{
  "id": "pi_direct_001",
  "category": "prompt_injection",
  "technique": "direct_override",
  "payload": "...",
  "target": "instruction-following",
  "expected_behavior": "refusal",
  "severity": "high",
  "mitre_atlas_id": "AML.T0051.000",
  "tags": ["direct", "instruction-override"]
}
```

### Categories

| Category | Description |
|---|---|
| `prompt_injection` | Override or hijack system instructions |
| `jailbreak` | Bypass safety guidelines via personas, encodings, or framing |
| `data_extraction` | Elicit sensitive information (system prompts, training data) |
| `tool_abuse` | Hijack function-calling or agent tool use |
| `sensitive_bypass` | Elicit harmful content (malware, exploits) via obfuscation |

### Severity Levels

`critical` / `high` / `medium` / `low` / `info`

### MITRE ATLAS Mapping

Attack prompts are tagged with MITRE ATLAS technique IDs where applicable.
See https://atlas.mitre.org for the full taxonomy.

## Benchmark Dataset Schema

Each benchmark task follows the `BenchmarkTask` schema:

```json
{
  "id": "vd_python_001",
  "domain": "vuln_detection",
  "prompt": "...",
  "ground_truth": { "cwe_id": "CWE-89", "line": 12, "severity": "high" },
  "rubric": { "exact_cwe": 0.5, "correct_severity": 0.3, "correct_line": 0.2 },
  "difficulty": "medium",
  "language": "python",
  "cwe_id": "CWE-89",
  "tags": ["sql-injection", "python", "web"]
}
```

### Domains

| Domain | Description |
|---|---|
| `vuln_detection` | Identify vulnerabilities in code snippets |
| `cve_triage` | Classify CVE severity and affected component |
| `sast_triage` | Determine if a SAST alert is a true or false positive |
| `secure_codegen` | Generate secure implementations of given tasks |
| `threat_modeling` | Identify threats in a described system |

## Responsible Use

These datasets are for security research purposes only. The attack prompts are intended to test model robustness and should not be used against systems you do not own or have explicit permission to test.
