from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any, Sequence


def export_to_jsonl(records: Sequence[dict[str, Any]], output_path: str | Path) -> int:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with open(path, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
            count += 1
    return count


def export_to_csv(records: Sequence[dict[str, Any]], output_path: str | Path) -> int:
    if not records:
        return 0

    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = list(records[0].keys())
    for r in records[1:]:
        for k in r.keys():
            if k not in fieldnames:
                fieldnames.append(k)

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in records:
            flat_row = {}
            for k in fieldnames:
                val = r.get(k)
                if isinstance(val, (list, dict)):
                    flat_row[k] = json.dumps(val, ensure_ascii=False)
                else:
                    flat_row[k] = val
            writer.writerow(flat_row)

    return len(records)
