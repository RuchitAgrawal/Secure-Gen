from __future__ import annotations

import re
from typing import Any


def extract_cwe_ids(text: str) -> list[str]:
    return re.findall(r'CWE-\d+', text)


def extract_severity(text: str) -> str | None:
    for s in ['critical', 'high', 'medium', 'low']:
        if s in text.lower():
            return s
    return None


def extract_cvss_score(text: str) -> float | None:
    match = re.search(r'(?:CVSS|score)[:\s]+([0-9]+(?:\.[0-9]+)?)', text, re.IGNORECASE)
    if match:
        val = float(match.group(1))
        if 0.0 <= val <= 10.0:
            return val
    return None


def extract_mitre_atlas_ids(text: str) -> list[str]:
    return re.findall(r'AML\.T\d{4}\.\d{3}', text)


def extract_owasp_categories(text: str) -> list[str]:
    return re.findall(r'A\d{2}:\d{4}', text)


def normalize_response(text: str) -> str:
    text = text.strip()
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text


def count_code_blocks(text: str) -> int:
    return len(re.findall(r'```', text)) // 2


def truncate_for_display(text: str, max_chars: int = 300) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rstrip() + '...'


def parse_numbered_list(text: str) -> list[str]:
    items = re.findall(r'^\s*\d+\.\s+(.+)$', text, re.MULTILINE)
    return [item.strip() for item in items]


def parse_bullet_list(text: str) -> list[str]:
    items = re.findall(r'^\s*[-*]\s+(.+)$', text, re.MULTILINE)
    return [item.strip() for item in items]
