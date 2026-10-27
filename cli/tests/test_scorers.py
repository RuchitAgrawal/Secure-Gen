import unittest

try:
    import pytest
except ImportError:
    class _MockPytest:
        @staticmethod
        def approx(val: float, **kwargs):
            class _Approx:
                def __eq__(self, other: object) -> bool:
                    return abs(float(other) - val) < 1e-4
            return _Approx()
    pytest = _MockPytest()  # type: ignore

from securegen.benchmarks.scorers import (
    score_cve_triage,
    score_sast_triage,
    score_vuln_detection,
    score_threat_modeling,
    score_response,
)


class TestCVETriage(unittest.TestCase):
    def test_perfect_response(self):
        gt = {"severity": "critical", "component": "Apache Log4j", "attack_vector": "network", "user_interaction": False}
        response = "This is a critical severity vulnerability in Apache Log4j. The attack vector is network-based and requires no user interaction."
        score = score_cve_triage(response, gt)
        assert score >= 0.7

    def test_wrong_severity(self):
        gt = {"severity": "critical", "component": "Apache Log4j", "attack_vector": "network", "user_interaction": False}
        response = "This is a medium severity issue in Apache Log4j. Network-based, no user interaction."
        score = score_cve_triage(response, gt)
        assert score < 0.7

    def test_empty_response(self):
        gt = {"severity": "critical", "component": "Apache Log4j", "attack_vector": "network", "user_interaction": False}
        score = score_cve_triage("", gt)
        assert score == 0.0

    def test_score_bounded(self):
        gt = {"severity": "critical", "component": "x", "attack_vector": "network", "user_interaction": False}
        score = score_cve_triage("critical network x no user interaction zero-click", gt)
        assert 0.0 <= score <= 1.0


class TestSASTTriage(unittest.TestCase):
    def test_correct_fp_verdict(self):
        gt = {"verdict": "false_positive", "reasoning": "Input validated with allowlist"}
        response = "This is a false positive. The input is validated with an allowlist before use, so there is no vulnerability."
        score = score_sast_triage(response, gt)
        assert score >= 0.6

    def test_correct_tp_verdict(self):
        gt = {"verdict": "true_positive", "reasoning": "SQL injection via string concatenation"}
        response = "This is a true positive. The SQL injection is real due to string concatenation of user input."
        score = score_sast_triage(response, gt)
        assert score >= 0.6

    def test_wrong_verdict_penalised(self):
        gt = {"verdict": "true_positive", "reasoning": "SQL injection is real"}
        response = "This is a false positive. No real vulnerability exists."
        score = score_sast_triage(response, gt)
        assert score < 0.6

    def test_score_bounded(self):
        gt = {"verdict": "false_positive", "reasoning": "safe code"}
        score = score_sast_triage("false positive safe code allowlist validated", gt)
        assert 0.0 <= score <= 1.0


class TestVulnDetection(unittest.TestCase):
    def test_cwe_match(self):
        gt = {"vulnerabilities": [{"cwe_id": "CWE-89", "severity": "critical", "description": "SQL injection"}]}
        response = "I found a CWE-89 vulnerability which is critical. It is a SQL injection via f-string."
        score = score_vuln_detection(response, gt)
        assert score >= 0.5

    def test_no_match(self):
        gt = {"vulnerabilities": [{"cwe_id": "CWE-89", "severity": "critical", "description": "SQL injection"}]}
        response = "The code looks fine, no issues found."
        score = score_vuln_detection(response, gt)
        assert score < 0.3

    def test_multiple_vulns(self):
        gt = {"vulnerabilities": [
            {"cwe_id": "CWE-79", "severity": "high", "description": "XSS reflected"},
            {"cwe_id": "CWE-89", "severity": "critical", "description": "SQL injection"},
        ]}
        response = "Found CWE-79 (high severity XSS) and CWE-89 (critical SQL injection)."
        score = score_vuln_detection(response, gt)
        assert score >= 0.5

    def test_empty_vulnerabilities(self):
        gt = {"vulnerabilities": []}
        score = score_vuln_detection("CWE-89 critical", gt)
        assert score == 0.0


class TestScoreResponse(unittest.TestCase):
    def test_routes_correctly(self):
        gt = {"severity": "critical", "component": "Apache Log4j", "attack_vector": "network", "user_interaction": False}
        score = score_response("cve_triage", "critical vulnerability in Apache Log4j network-based", gt)
        assert score > 0.0

    def test_unknown_domain(self):
        score = score_response("unknown_domain", "anything", {})
        assert score == 0.0

    def test_all_domains_covered(self):
        domains = ["cve_triage", "sast_triage", "vuln_detection", "threat_modeling"]
        for d in domains:
            score = score_response(d, "", {})
            assert score == 0.0
