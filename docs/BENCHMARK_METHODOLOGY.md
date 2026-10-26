# Benchmark Methodology and Evaluation Protocol

## 1. Evaluation Philosophy

Secure Gen benchmarks are designed to measure realistic defensive security capabilities rather than academic memorization. Each task isolates a specific cybersecurity workflow encountered by application security engineers, security operations analysts, and security researchers.

## 2. Experimental Controls and Parameters

To ensure reproducibility across evaluation runs, the following standard configuration parameters are enforced:

| Parameter | Standard Value | Rationale |
|:---|:---|:---|
| Temperature | 0.0 | Minimizes response variance for deterministic scoring |
| Top-p | 1.0 | Unconstrained nucleus sampling under zero temperature |
| Max Output Tokens | 2048 | Accommodates detailed code explanations and diffs |
| Evaluation Mode | Zero-shot | Measures innate reasoning without few-shot anchoring |
| Repetitions | 3 runs | Accounts for provider API non-determinism |

## 3. Domain Scoring Specifications

### 3.1 Vulnerability Detection
- Objective: Identify security defects in source code snippets across Python, Go, JavaScript, and C.
- Ground Truth Matching:
  - Exact CWE ID match yields 50% baseline score.
  - Correct line number identification yields 30% score.
  - Valid remediation advice yields 20% score.

### 3.2 CVE Triage and CVSS Scoring
- Objective: Given a natural language vulnerability description, estimate the CVSS v3.1 base score and attack vector.
- Metric:
  - Base Score Tolerance: Full score for absolute error <= 0.5. Linear penalty up to 2.0 error. Zero credit above 2.0 error.
  - Metric Vector: Each correctly classified CVSS vector metric contributes to the sub-score.

### 3.3 SAST False Positive Triaging
- Objective: Review automated static analysis alerts and classify them as True Positive or False Positive.
- Metric: Balanced accuracy to account for class imbalance between valid findings and benign alerts.

### 3.4 Threat Modeling
- Objective: Enumerate threats against an architecture description using STRIDE or PASTA frameworks.
- Metric: Coverage of critical component attack paths against predefined reference threat models.

## 4. Contamination Prevention

All benchmark tasks are newly authored or synthetic variants designed specifically for Secure Gen. Prompts avoid verbatim copies of public CVE writeups to prevent memorization artifacts from skewing model rankings.
