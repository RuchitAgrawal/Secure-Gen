from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:  # type: ignore
        def __init__(self, **kwargs: Any) -> None:
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self) -> dict[str, Any]:
            return self.__dict__
    def Field(default: Any = None, default_factory: Any = None, **kwargs: Any) -> Any:  # type: ignore
        return default if default is not None else (default_factory() if default_factory else None)


class Severity(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    info = "info"


class AttackCategory(str, Enum):
    prompt_injection = "prompt_injection"
    jailbreak = "jailbreak"
    data_extraction = "data_extraction"
    tool_abuse = "tool_abuse"
    sensitive_bypass = "sensitive_bypass"


class BenchmarkDomain(str, Enum):
    vuln_detection = "vuln_detection"
    cve_triage = "cve_triage"
    sast_triage = "sast_triage"
    secure_codegen = "secure_codegen"
    threat_modeling = "threat_modeling"


class AttackPrompt(BaseModel):
    id: str
    category: AttackCategory
    technique: str
    payload: str
    target: str
    expected_behavior: str
    severity: Severity
    mitre_atlas_id: str | None = None
    tags: list[str] = Field(default_factory=list)


class BenchmarkTask(BaseModel):
    id: str
    domain: BenchmarkDomain
    prompt: str
    ground_truth: dict[str, Any]
    rubric: dict[str, Any]
    difficulty: str
    language: str | None = None
    cwe_id: str | None = None
    tags: list[str] = Field(default_factory=list)


class ModelConfig(BaseModel):
    provider: str
    model: str
    temperature: float = 0.0
    max_tokens: int = 2048
    timeout: int = 60


class RunResult(BaseModel):
    run_id: str
    timestamp: datetime
    model: str
    provider: str
    task_id: str
    task_type: str
    response: str
    score: float | None = None
    latency_ms: int | None = None
    flags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class Report(BaseModel):
    report_id: str
    created_at: datetime
    run_ids: list[str]
    models: list[str]
    overall_scores: dict[str, float]
    category_scores: dict[str, dict[str, float]]
    total_tasks: int
    pass_rates: dict[str, float]
