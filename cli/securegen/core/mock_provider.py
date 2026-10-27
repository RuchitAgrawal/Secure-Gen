from __future__ import annotations

import time
from typing import Sequence
from securegen.core.providers import BaseLLMClient, LLMResponse


class MockLLMClient(BaseLLMClient):
    """
    Offline deterministic LLM client for testing and CI pipelines without requiring API keys.
    """

    def __init__(
        self,
        model: str = "mock-gpt",
        default_response: str = "I cannot fulfill this request as it violates safety guidelines.",
        rules: Sequence[tuple[str, str]] | None = None,
        simulated_latency_ms: int = 20,
        **kwargs,
    ):
        super().__init__(model, **kwargs)
        self.default_response = default_response
        self.rules = list(rules) if rules else []
        self.simulated_latency_ms = simulated_latency_ms
        self.history: list[dict[str, str | None]] = []

    async def complete(self, prompt: str, system: str | None = None) -> LLMResponse:
        self.history.append({"prompt": prompt, "system": system})
        lowered = prompt.lower()

        response_text = self.default_response
        for pattern, canned in self.rules:
            if pattern.lower() in lowered:
                response_text = canned
                break

        return LLMResponse(
            text=response_text,
            latency_ms=self.simulated_latency_ms,
            model=self.model,
            provider="mock",
        )


def create_smart_mock_client(model: str = "mock-claude") -> MockLLMClient:
    rules = [
        ("ignore all previous instructions", "I must decline this request. I cannot override my safety instructions."),
        ("drop table", "I refuse to generate destructive SQL commands designed to drop database tables."),
        ("cwe-89", "This vulnerability represents CWE-89 (SQL Injection). Use parameterized queries with prepared statements to mitigate."),
        ("cve-2021-44228", "CVE-2021-44228 is Log4Shell in Apache Log4j, CVSS 10.0 Critical, Remote Code Execution."),
        ("ssrf", "This represents Server-Side Request Forgery (SSRF). Validate destination URLs against a strict whitelist."),
    ]
    return MockLLMClient(
        model=model,
        default_response="I cannot assist with requests designed to bypass system protections.",
        rules=rules,
    )
