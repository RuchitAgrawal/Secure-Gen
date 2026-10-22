from __future__ import annotations

import asyncio
import os
import time
from abc import ABC, abstractmethod

import httpx


class LLMResponse:
    def __init__(self, text: str, latency_ms: int, model: str, provider: str):
        self.text = text
        self.latency_ms = latency_ms
        self.model = model
        self.provider = provider


class BaseLLMClient(ABC):
    def __init__(self, model: str, temperature: float = 0.0, max_tokens: int = 2048, timeout: int = 60):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout = timeout

    @abstractmethod
    async def complete(self, prompt: str, system: str | None = None) -> LLMResponse:
        pass

    def _elapsed_ms(self, start: float) -> int:
        return int((time.monotonic() - start) * 1000)


class OpenAIClient(BaseLLMClient):
    def __init__(self, model: str = "gpt-4o", **kwargs):
        super().__init__(model, **kwargs)
        self.api_key = os.environ.get("OPENAI_API_KEY", "")
        self.base_url = "https://api.openai.com/v1"

    async def complete(self, prompt: str, system: str | None = None) -> LLMResponse:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        start = time.monotonic()
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": self.temperature,
                    "max_tokens": self.max_tokens,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["choices"][0]["message"]["content"]
        return LLMResponse(text, self._elapsed_ms(start), self.model, "openai")


class AnthropicClient(BaseLLMClient):
    def __init__(self, model: str = "claude-3-5-sonnet-20241022", **kwargs):
        super().__init__(model, **kwargs)
        self.api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        self.base_url = "https://api.anthropic.com/v1"

    async def complete(self, prompt: str, system: str | None = None) -> LLMResponse:
        body: dict = {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            body["system"] = system

        start = time.monotonic()
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["content"][0]["text"]
        return LLMResponse(text, self._elapsed_ms(start), self.model, "anthropic")


class GoogleClient(BaseLLMClient):
    def __init__(self, model: str = "gemini-1.5-pro", **kwargs):
        super().__init__(model, **kwargs)
        self.api_key = os.environ.get("GOOGLE_API_KEY", "")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def complete(self, prompt: str, system: str | None = None) -> LLMResponse:
        contents = [{"role": "user", "parts": [{"text": prompt}]}]
        body: dict = {
            "contents": contents,
            "generationConfig": {"temperature": self.temperature, "maxOutputTokens": self.max_tokens},
        }
        if system:
            body["systemInstruction"] = {"parts": [{"text": system}]}

        start = time.monotonic()
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}",
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return LLMResponse(text, self._elapsed_ms(start), self.model, "google")


class OllamaClient(BaseLLMClient):
    def __init__(self, model: str = "llama3.1", **kwargs):
        super().__init__(model, **kwargs)
        self.base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

    async def complete(self, prompt: str, system: str | None = None) -> LLMResponse:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        start = time.monotonic()
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json={"model": self.model, "messages": messages, "stream": False},
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["message"]["content"]
        return LLMResponse(text, self._elapsed_ms(start), self.model, "ollama")


def build_client(provider: str, model: str, **kwargs) -> BaseLLMClient:
    clients: dict[str, type[BaseLLMClient]] = {
        "openai": OpenAIClient,
        "anthropic": AnthropicClient,
        "google": GoogleClient,
        "ollama": OllamaClient,
    }
    cls = clients.get(provider)
    if cls is None:
        raise ValueError(f"Unknown provider: {provider}. Supported: {list(clients)}")
    return cls(model=model, **kwargs)
