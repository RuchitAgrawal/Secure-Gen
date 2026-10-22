from __future__ import annotations

import os
from pathlib import Path

import yaml

from securegen.core.models import ModelConfig


def load_config(path: Path | None = None) -> dict:
    search_paths = [path, Path("config.yaml"), Path("config.yml")]
    for p in search_paths:
        if p and p.exists():
            with open(p) as f:
                return yaml.safe_load(f) or {}
    return {}


def models_from_config(config: dict) -> list[ModelConfig]:
    raw = config.get("models", [])
    return [ModelConfig(**m) for m in raw]


def default_models() -> list[ModelConfig]:
    defaults = []
    if os.environ.get("OPENAI_API_KEY"):
        defaults.append(ModelConfig(provider="openai", model="gpt-4o"))
    if os.environ.get("ANTHROPIC_API_KEY"):
        defaults.append(ModelConfig(provider="anthropic", model="claude-3-5-sonnet-20241022"))
    if os.environ.get("GOOGLE_API_KEY"):
        defaults.append(ModelConfig(provider="google", model="gemini-1.5-pro"))
    return defaults


def mask_key(key: str) -> str:
    if len(key) <= 8:
        return "***"
    return key[:4] + "***" + key[-4:]
