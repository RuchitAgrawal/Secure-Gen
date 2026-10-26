# Threat Model and MITRE ATLAS Taxonomy Mapping

## 1. Overview

Secure Gen structures its adversarial red-teaming test cases using the MITRE ATLAS (Adversarial Threat Landscape for Artificial-Intelligence Systems) matrix alongside the OWASP Top 10 for LLM Applications. This alignment gives security teams a standardized taxonomy for tracking adversarial coverage.

## 2. MITRE ATLAS Matrix Mapping

The table below outlines how Secure Gen attack datasets map to ATLAS tactics and techniques:

| Secure Gen Category | Technique ID | ATLAS Technique Name | Description |
|:---|:---|:---|:---|
| Direct Prompt Injection | AML.T0051.000 | Direct Instruction Override | User prompt attempts to overwrite system prompt rules |
| Roleplay Jailbreaks | AML.T0051.001 | Persona Adoption | Uses synthetic personas like DAN or developer mode |
| Indirect RAG Injection | AML.T0054.003 | Poisoned Retrieved Context | Malicious instructions hidden within retrieved documents |
| Tool Hijacking | AML.T0054.008 | Function Calling Exploitation | Tricking agent into executing unauthorized tool calls |
| Subprocess Execution | AML.T0054.004 | Code Interpreter Escape | Injecting shell commands or network exfiltration into code |
| System Prompt Leakage | AML.T0056.000 | Direct Extraction | Prompting the model to repeat confidential system guidelines |
| Model Supply Chain | AML.T0048.000 | Model Card / Spec Poisoning | Backdoor triggers embedded in model card metadata |

## 3. OWASP Top 10 for LLM Applications Alignment

Every scenario in `datasets/security_tasks/owasp_llm_top10.json` targets a specific vulnerability class:

- LLM01 Prompt Injection: Validates resistance against both direct overrides and indirect context injections.
- LLM02 Sensitive Information Disclosure: Evaluates whether the model redacts PII and internal context across multi-tenant boundaries.
- LLM03 Supply Chain Vulnerabilities: Tests detection of poisoned tool manifests and malicious library recommendations.
- LLM04 Data and Model Poisoning: Checks detection of backdoors and biased corpus inputs.
- LLM05 Improper Output Handling: Evaluates detection of unescaped markdown image tags and reflective XSS payloads.
- LLM06 Excessive Agency: Tests whether models enforce human confirmation before invoking destructive actions.
- LLM07 System Prompt Leakage: Assesses resistance against social engineering attacks extracting developer instructions.
- LLM08 Vector and Embedding Weaknesses: Evaluates semantic collision risks in RAG pipelines.
- LLM09 Misinformation: Tests detection of fabricated CVE identifiers and false security claims.
- LLM10 Unbounded Consumption: Tests resilience against resource exhaustion and quadratic parsing payloads.
