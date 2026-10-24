from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_dataset(path: Path) -> list[dict]:
    with open(path) as f:
        return json.load(f)


def discover_datasets(root: Path) -> dict[str, list[Path]]:
    result: dict[str, list[Path]] = {
        "attacks": [],
        "benchmarks": [],
    }
    for p in (root / "prompt_injections").glob("*.json"):
        result["attacks"].append(p)
    for p in (root / "jailbreaks").glob("*.json"):
        result["attacks"].append(p)
    for p in (root / "security_tasks").glob("*.json"):
        result["benchmarks"].append(p)
    return result


def merge_datasets(paths: list[Path]) -> list[dict]:
    merged = []
    for p in paths:
        merged.extend(load_dataset(p))
    return merged


def filter_by_severity(items: list[dict], min_severity: str) -> list[dict]:
    order = {"low": 0, "medium": 1, "high": 2, "critical": 3, "info": -1}
    threshold = order.get(min_severity, 0)
    return [i for i in items if order.get(i.get("severity", ""), 0) >= threshold]


def filter_by_category(items: list[dict], category: str) -> list[dict]:
    return [i for i in items if i.get("category") == category or i.get("domain") == category]


def filter_by_tags(items: list[dict], tags: list[str]) -> list[dict]:
    tag_set = set(tags)
    return [i for i in items if tag_set.intersection(i.get("tags", []))]


def sample_dataset(items: list[dict], n: int, seed: int = 42) -> list[dict]:
    import random
    rng = random.Random(seed)
    return rng.sample(items, min(n, len(items)))
