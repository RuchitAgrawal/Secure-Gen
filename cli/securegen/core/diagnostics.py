from __future__ import annotations

import os
from pathlib import Path
from typing import Any
import urllib.request
import urllib.error


def check_env_api_keys() -> dict[str, bool]:
    return {
        "OPENAI_API_KEY": bool(os.getenv("OPENAI_API_KEY")),
        "ANTHROPIC_API_KEY": bool(os.getenv("ANTHROPIC_API_KEY")),
        "GOOGLE_API_KEY": bool(os.getenv("GOOGLE_API_KEY")),
    }


def check_ollama_connectivity(endpoint: str = "http://localhost:11434") -> bool:
    try:
        req = urllib.request.Request(f"{endpoint}/api/tags", headers={"User-Agent": "SecureGen-Check"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            return resp.status == 200
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def check_dataset_inventory(datasets_dir: str | Path = "datasets") -> dict[str, Any]:
    path = Path(datasets_dir)
    if not path.exists():
        return {"exists": False, "total_files": 0, "categories": {}}

    categories: dict[str, int] = {}
    total = 0
    for file_path in path.rglob("*.json"):
        cat = file_path.parent.name
        categories[cat] = categories.get(cat, 0) + 1
        total += 1

    return {
        "exists": True,
        "total_files": total,
        "categories": categories,
    }


def run_system_diagnostics(datasets_dir: str | Path = "datasets") -> dict[str, Any]:
    keys = check_env_api_keys()
    ollama_ok = check_ollama_connectivity()
    datasets_info = check_dataset_inventory(datasets_dir)

    has_at_least_one_key = any(keys.values()) or ollama_ok
    all_datasets_present = datasets_info["total_files"] >= 5

    overall_ready = has_at_least_one_key and all_datasets_present

    return {
        "overall_ready": overall_ready,
        "api_keys": keys,
        "ollama_connected": ollama_ok,
        "datasets": datasets_info,
    }
