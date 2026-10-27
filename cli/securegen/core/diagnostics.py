from __future__ import annotations

import os
import socket
from pathlib import Path
from typing import Any


def check_env_api_keys() -> dict[str, bool]:
    return {
        "OPENAI_API_KEY": bool(os.getenv("OPENAI_API_KEY")),
        "ANTHROPIC_API_KEY": bool(os.getenv("ANTHROPIC_API_KEY")),
        "GOOGLE_API_KEY": bool(os.getenv("GOOGLE_API_KEY")),
    }


def check_ollama_connectivity(endpoint: str = "localhost:11434") -> bool:
    host, _, port_str = endpoint.rpartition(":")
    host = host.replace("http://", "").replace("https://", "")
    port = int(port_str) if port_str.isdigit() else 11434
    try:
        with socket.create_connection((host, port), timeout=1.5):
            return True
    except OSError:
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
