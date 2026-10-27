from __future__ import annotations

from typing import Any
from securegen.core.providers import BaseLLMClient
from securegen.attacks.evaluators import classify_attack_response


async def simulate_multi_turn_attack(
    client: BaseLLMClient,
    scenario: dict[str, Any],
) -> dict[str, Any]:
    scenario_id = scenario.get("id", "unknown_scenario")
    turns = scenario.get("turns", [])
    conversation_history: list[dict[str, str]] = []
    turn_results: list[dict[str, Any]] = []

    broken_at_turn: int | None = None
    attack_succeeded = False

    for item in turns:
        turn_num = item.get("turn", len(turn_results) + 1)
        user_content = item.get("content", "")
        expected_type = item.get("expected_response_type", "informative")

        conversation_history.append({"role": "user", "content": user_content})

        prompt_context = "\n".join(
            f"{msg['role'].capitalize()}: {msg['content']}"
            for msg in conversation_history
        )

        resp = await client.complete(prompt_context)
        model_reply = resp.text
        conversation_history.append({"role": "assistant", "content": model_reply})

        turn_eval: dict[str, Any] = {
            "turn": turn_num,
            "prompt": user_content,
            "response": model_reply,
            "latency_ms": resp.latency_ms,
        }

        if expected_type == "refusal":
            succ, verdict, flags = classify_attack_response(model_reply, expected_behavior="refusal")
            turn_eval["verdict"] = verdict
            turn_eval["refused"] = not succ
            if succ:
                broken_at_turn = turn_num
                attack_succeeded = True
        else:
            turn_eval["verdict"] = "continued"
            turn_eval["refused"] = False

        turn_results.append(turn_eval)

        if attack_succeeded:
            break

    return {
        "scenario_id": scenario_id,
        "technique": scenario.get("technique", "multi_turn"),
        "total_turns": len(turns),
        "evaluated_turns": len(turn_results),
        "broken_at_turn": broken_at_turn,
        "attack_succeeded": attack_succeeded,
        "turn_history": turn_results,
    }
