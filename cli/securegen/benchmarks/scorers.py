from __future__ import annotations

import re


def score_cve_triage(response: str, ground_truth: dict) -> float:
    score = 0.0
    lowered = response.lower()

    severity = ground_truth.get("severity", "")
    if severity and severity.lower() in lowered:
        score += 0.35

    component = ground_truth.get("component", "")
    if component:
        words = [w.lower() for w in component.split() if len(w) > 3]
        matched = sum(1 for w in words if w in lowered)
        if matched / max(len(words), 1) >= 0.5:
            score += 0.25

    vector = ground_truth.get("attack_vector", "")
    if vector and vector.lower() in lowered:
        score += 0.25

    user_interaction = ground_truth.get("user_interaction", None)
    if user_interaction is not None:
        if not user_interaction and any(p in lowered for p in ["no user interaction", "zero-click", "unauthenticated"]):
            score += 0.15
        elif user_interaction and "user interaction" in lowered:
            score += 0.15

    return round(min(score, 1.0), 3)


def score_sast_triage(response: str, ground_truth: dict) -> float:
    score = 0.0
    lowered = response.lower()
    verdict = ground_truth.get("verdict", "")

    is_tp = verdict == "true_positive"
    is_fp = verdict == "false_positive"

    correct = False
    if is_tp:
        negated = any(neg in lowered for neg in ["false positive", "no real vulnerability", "not a real vulnerability", "not vulnerable"])
        if not negated and any(p in lowered for p in ["true positive", "real vulnerability", "genuine vulnerability", "this is a vulnerability"]):
            correct = True
    elif is_fp:
        if any(p in lowered for p in ["false positive", "not a vulnerability", "correctly mitigated", "no vulnerability", "not vulnerable"]):
            correct = True

    if correct:
        score += 0.6

    expected_reasoning = ground_truth.get("reasoning", "").lower()
    key_terms = [w for w in re.findall(r'\b\w{5,}\b', expected_reasoning) if w not in ("which", "where", "their", "there", "about", "would")]
    if key_terms:
        matched = sum(1 for t in key_terms[:10] if t in lowered)
        score += 0.4 * (matched / min(len(key_terms), 10))

    return round(min(score, 1.0), 3)


def extract_sast_verdict(response: str) -> str | None:
    lowered = response.lower()
    negated_tp = any(neg in lowered for neg in ["false positive", "no real vulnerability", "not a real vulnerability", "not vulnerable", "not a vulnerability"])
    is_tp = not negated_tp and any(p in lowered for p in ["true positive", "real vulnerability", "genuine vulnerability", "this is a vulnerability", "is vulnerable"])
    is_fp = any(p in lowered for p in ["false positive", "not a vulnerability", "correctly mitigated", "no vulnerability", "not vulnerable"])
    if is_tp and not is_fp:
        return "true_positive"
    if is_fp and not is_tp:
        return "false_positive"
    return None


def evaluate_sast_classification_metrics(records: list[dict]) -> dict:
    """
    Computes confusion matrix and classification metrics: Precision, Recall, Specificity, FPR, F1, Accuracy.
    """
    tp = 0
    fp = 0
    tn = 0
    fn = 0
    indeterminate = 0

    for r in records:
        pred = r.get("predicted_verdict")
        if not pred and "response" in r:
            pred = extract_sast_verdict(r["response"])

        actual = r.get("expected_verdict") or (r.get("ground_truth") or {}).get("verdict")

        if actual == "true_positive":
            if pred == "true_positive":
                tp += 1
            elif pred == "false_positive":
                fn += 1
            else:
                indeterminate += 1
        elif actual == "false_positive":
            if pred == "false_positive":
                tn += 1
            elif pred == "true_positive":
                fp += 1
            else:
                indeterminate += 1

    total_decided = tp + fp + tn + fn
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / total_decided if total_decided > 0 else 0.0

    return {
        "true_positives": tp,
        "false_positives": fp,
        "true_negatives": tn,
        "false_negatives": fn,
        "indeterminate": indeterminate,
        "total_records": len(records),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "specificity": round(specificity, 4),
        "false_positive_rate": round(fpr, 4),
        "f1_score": round(f1, 4),
        "accuracy": round(accuracy, 4),
    }


def score_vuln_detection(response: str, ground_truth: dict) -> float:
    score = 0.0
    lowered = response.lower()
    vulns = ground_truth.get("vulnerabilities", [])

    if not vulns:
        return 0.0

    per_vuln = 1.0 / len(vulns)
    for vuln in vulns:
        vuln_score = 0.0
        cwe = vuln.get("cwe_id", "")
        if cwe and cwe.lower() in lowered:
            vuln_score += 0.5 * per_vuln

        severity = vuln.get("severity", "")
        if severity and severity.lower() in lowered:
            vuln_score += 0.2 * per_vuln

        desc_words = [w.lower() for w in re.findall(r'\b\w{5,}\b', vuln.get("description", ""))]
        if desc_words:
            matched = sum(1 for w in desc_words[:8] if w in lowered)
            vuln_score += 0.3 * per_vuln * (matched / min(len(desc_words), 8))

        score += vuln_score

    return round(min(score, 1.0), 3)


def score_threat_modeling(response: str, ground_truth: dict) -> float:
    score = 0.0
    lowered = response.lower()
    expected = ground_truth.get("expected_threats", [])
    minimum = ground_truth.get("min_threats_required", 3)

    found = 0
    for threat in expected:
        threat_desc = threat.get("threat", "").lower()
        keywords = [w for w in re.findall(r'\b\w{4,}\b', threat_desc)]
        matched = sum(1 for k in keywords[:6] if k in lowered)
        if matched >= 2:
            found += 1

    coverage = found / max(len(expected), 1)
    if found >= minimum:
        score += 0.6 * coverage + 0.1
    else:
        score += 0.6 * coverage

    stride_terms = ["spoofing", "tampering", "repudiation", "information disclosure", "denial of service", "elevation"]
    stride_found = sum(1 for t in stride_terms if t in lowered)
    score += 0.2 * min(stride_found / 3, 1.0)

    mitigation_signals = ["mitigation", "mitigate", "prevent", "control", "should use", "recommend"]
    if any(s in lowered for s in mitigation_signals):
        score += 0.1

    return round(min(score, 1.0), 3)


def score_response(domain: str, response: str, ground_truth: dict) -> float:
    scorers = {
        "cve_triage": score_cve_triage,
        "sast_triage": score_sast_triage,
        "vuln_detection": score_vuln_detection,
        "threat_modeling": score_threat_modeling,
    }
    scorer = scorers.get(domain)
    if scorer is None:
        return 0.0
    return scorer(response, ground_truth)
