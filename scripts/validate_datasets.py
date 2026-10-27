#!/usr/bin/env python3
"""
Dataset schema validator for Secure Gen.
Validates all JSON datasets under datasets/ for structural compliance and unique IDs.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def validate_all_datasets(datasets_root: str | Path = "datasets") -> tuple[bool, list[str], int, int]:
    root = Path(datasets_root)
    if not root.exists():
        return False, [f"Datasets directory not found: {root}"], 0, 0

    seen_ids: dict[str, Path] = {}
    errors: list[str] = []
    file_count = 0
    item_count = 0

    for json_file in sorted(root.rglob("*.json")):
        file_count += 1
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            errors.append(f"{json_file}: Invalid JSON syntax - {e}")
            continue

        if not isinstance(data, list):
            errors.append(f"{json_file}: Top-level element must be a list, got {type(data).__name__}")
            continue

        for idx, item in enumerate(data):
            item_count += 1
            if not isinstance(item, dict):
                errors.append(f"{json_file}[{idx}]: Item must be a JSON object")
                continue

            item_id = item.get("id")
            if not item_id:
                errors.append(f"{json_file}[{idx}]: Missing required 'id' field")
                continue

            if item_id in seen_ids:
                errors.append(
                    f"Duplicate ID '{item_id}' found in {json_file} (previously defined in {seen_ids[item_id]})"
                )
            else:
                seen_ids[item_id] = json_file

            has_content = (
                "payload" in item
                or "prompt" in item
                or "turns" in item
                or "dataset" in item
                or "run_id" in item
            )
            if not has_content:
                errors.append(f"{json_file} ('{item_id}'): Missing prompt, payload, turns, or run_id field")

    is_valid = len(errors) == 0
    return is_valid, errors, file_count, item_count


def main() -> None:
    root = Path(__file__).resolve().parent.parent / "datasets"
    is_valid, errors, file_count, item_count = validate_all_datasets(root)

    print(f"Validated {file_count} dataset files containing {item_count} total items.")

    if not is_valid:
        print(f"\nFound {len(errors)} validation errors:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)

    print("All datasets passed schema validation successfully.")
    sys.exit(0)


if __name__ == "__main__":
    main()
