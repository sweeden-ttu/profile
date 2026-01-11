#!/usr/bin/env python3
"""Generate Agent A lecture inventory from the CS-5384 course materials.

This scans the Logic course directory for lecture folders and writes
agent_a_state/lecture_inventory.json in the current repository root.
"""

from __future__ import annotations

import dataclasses
import datetime as dt
import json
import os
from pathlib import Path
from typing import Dict, List


COURSE_PATH = Path(
    os.environ.get(
        "AGENT_A_COURSE_PATH",
        "/Users/sdw/CS-5384-Logic-for-Computer-Scientists",
    )
)
LECTURE_ROOT = COURSE_PATH / "Lectures"
OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent / "agent_a_state" / "lecture_inventory.json"
)
RELEVANT_EXTS = {"pdf", "txt", "md", "json", "csv", "html", "tex"}


@dataclasses.dataclass
class LectureInventory:
    lecture_id: str
    path: str
    files: Dict[str, List[str]]


def collect_files(lecture_dir: Path) -> Dict[str, List[str]]:
    files: Dict[str, List[str]] = {}
    for item in lecture_dir.iterdir():
        if item.is_dir():
            continue
        ext = item.suffix.lower().lstrip(".")
        key = ext if ext in RELEVANT_EXTS else "other"
        files.setdefault(key, []).append(item.name)
    return {k: sorted(v) for k, v in sorted(files.items())}


def build_inventory() -> Dict[str, object]:
    lectures: List[LectureInventory] = []

    if not LECTURE_ROOT.exists():
        raise SystemExit(f"Lecture directory not found: {LECTURE_ROOT}")

    for lecture_dir in sorted(LECTURE_ROOT.iterdir()):
        if not lecture_dir.is_dir() or not lecture_dir.name.startswith("Lec_"):
            continue
        lectures.append(
            LectureInventory(
                lecture_id=lecture_dir.name,
                path=str(lecture_dir),
                files=collect_files(lecture_dir),
            )
        )

    return {
        "course": "CS-5384-Logic-for-Computer-Scientists",
        "course_path": str(COURSE_PATH),
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "lectures": [dataclasses.asdict(lec) for lec in lectures],
    }


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    inventory = build_inventory()
    OUTPUT_PATH.write_text(json.dumps(inventory, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote Agent A lecture inventory to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
