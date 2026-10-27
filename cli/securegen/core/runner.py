from __future__ import annotations

import asyncio
import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from tenacity import retry, stop_after_attempt, wait_exponential

from securegen.core.models import ModelConfig, RunResult
from securegen.core.providers import BaseLLMClient, LLMResponse, build_client


class BatchRunner:
    def __init__(self, models: list[ModelConfig], concurrency: int = 5):
        self.models = models
        self.concurrency = concurrency
        self._semaphore = asyncio.Semaphore(concurrency)

    def _build_clients(self) -> list[BaseLLMClient]:
        return [
            build_client(
                m.provider,
                m.model,
                temperature=m.temperature,
                max_tokens=m.max_tokens,
                timeout=m.timeout,
            )
            for m in self.models
        ]

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _run_one(
        self, client: BaseLLMClient, task_id: str, task_type: str, prompt: str, system: str | None = None
    ) -> RunResult:
        async with self._semaphore:
            response: LLMResponse = await client.complete(prompt, system=system)

        return RunResult(
            run_id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc),
            model=client.model,
            provider=getattr(client, "provider", response.provider),
            task_id=task_id,
            task_type=task_type,
            response=response.text,
            latency_ms=response.latency_ms,
            flags=[],
            metadata={},
        )

    async def run_all(
        self,
        tasks: list[dict],
        task_type: str,
        system: str | None = None,
        on_result: callable | None = None,
    ) -> list[RunResult]:
        clients = self._build_clients()
        coroutines = [
            self._run_one(
                client,
                task.get("id", str(uuid.uuid4())),
                task_type,
                task.get("prompt") or task.get("payload") or "",
                system,
            )
            for task in tasks
            for client in clients
        ]

        results: list[RunResult] = []
        for coro in asyncio.as_completed(coroutines):
            result = await coro
            results.append(result)
            if on_result:
                on_result(result)

        return results

    def save_results(self, results: list[RunResult], output_dir: Path, run_name: str) -> Path:
        output_dir.mkdir(parents=True, exist_ok=True)
        out_file = output_dir / f"{run_name}.json"
        data = [r.model_dump(mode="json") for r in results]
        out_file.write_text(json.dumps(data, indent=2, default=str))
        return out_file
