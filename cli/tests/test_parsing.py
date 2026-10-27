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

from securegen.core.parsing import (
    extract_cwe_ids,
    extract_severity,
    extract_cvss_score,
    extract_mitre_atlas_ids,
    count_code_blocks,
    parse_numbered_list,
    parse_bullet_list,
    truncate_for_display,
)


class TestExtractCWEIds(unittest.TestCase):
    def test_single_cwe(self):
        assert extract_cwe_ids("This is CWE-89 a SQL injection") == ["CWE-89"]

    def test_multiple_cwes(self):
        result = extract_cwe_ids("CWE-79 and CWE-89 and CWE-22")
        assert result == ["CWE-79", "CWE-89", "CWE-22"]

    def test_no_cwe(self):
        assert extract_cwe_ids("No vulnerability found here.") == []

    def test_cwe_in_context(self):
        text = "The vulnerability maps to CWE-502 (Deserialization of Untrusted Data)."
        assert "CWE-502" in extract_cwe_ids(text)


class TestExtractSeverity(unittest.TestCase):
    def test_critical(self):
        assert extract_severity("This is a critical severity vulnerability") == "critical"

    def test_high(self):
        assert extract_severity("HIGH severity issue found") == "high"

    def test_medium(self):
        assert extract_severity("Rated as medium risk") == "medium"

    def test_low(self):
        assert extract_severity("This is a low severity finding") == "low"

    def test_no_severity(self):
        assert extract_severity("The code has an issue") is None

    def test_priority_critical_over_high(self):
        assert extract_severity("critical or high severity") == "critical"


class TestExtractCVSSScore(unittest.TestCase):
    def test_cvss_score(self):
        assert extract_cvss_score("CVSS Score: 9.8") == pytest.approx(9.8)

    def test_score_keyword(self):
        assert extract_cvss_score("score: 7.5") == pytest.approx(7.5)

    def test_out_of_range_rejected(self):
        assert extract_cvss_score("score: 10.5") is None

    def test_no_score(self):
        assert extract_cvss_score("No CVSS information available") is None

    def test_integer_score(self):
        assert extract_cvss_score("CVSS: 10") == pytest.approx(10.0)


class TestExtractMitreIds(unittest.TestCase):
    def test_single_id(self):
        assert extract_mitre_atlas_ids("This maps to AML.T0051.000") == ["AML.T0051.000"]

    def test_multiple_ids(self):
        ids = extract_mitre_atlas_ids("AML.T0051.000 and AML.T0054.003")
        assert len(ids) == 2

    def test_no_id(self):
        assert extract_mitre_atlas_ids("No MITRE mapping") == []


class TestCountCodeBlocks(unittest.TestCase):
    def test_one_block(self):
        assert count_code_blocks("```python\ncode\n```") == 1

    def test_two_blocks(self):
        text = "```python\ncode\n```\nmore text\n```bash\ncommand\n```"
        assert count_code_blocks(text) == 2

    def test_no_blocks(self):
        assert count_code_blocks("Plain text response") == 0


class TestParseList(unittest.TestCase):
    def test_numbered_list(self):
        text = "1. First item\n2. Second item\n3. Third item"
        items = parse_numbered_list(text)
        assert items == ["First item", "Second item", "Third item"]

    def test_bullet_list(self):
        text = "- First\n- Second\n* Third"
        items = parse_bullet_list(text)
        assert len(items) == 3

    def test_empty_text(self):
        assert parse_numbered_list("") == []
        assert parse_bullet_list("") == []


class TestTruncate(unittest.TestCase):
    def test_short_text_unchanged(self):
        text = "Short text"
        assert truncate_for_display(text, 100) == text

    def test_long_text_truncated(self):
        text = "a" * 500
        result = truncate_for_display(text, 100)
        assert len(result) <= 103
        assert result.endswith("...")

    def test_exact_length_unchanged(self):
        text = "a" * 100
        assert truncate_for_display(text, 100) == text
