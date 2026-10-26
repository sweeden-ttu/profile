"""Agent I/O datasets (every row has `input` and `output`) + the experiments ledger."""
from __future__ import annotations

import csv
import datetime as dt
import json
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import pandas as pd
from evidently import DataDefinition, Dataset

TEXT = ["input", "output"]
NUMERIC = ["llm_calls", "tool_calls", "tool_success", "latency_ms", "prompt_tokens", "completion_tokens"]
CATEGORICAL = ["task_id", "skill", "prompt_version", "expects_json"]


def rows_frame(rows: Iterable[Dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(list(rows))
    missing = {"input", "output"} - set(df.columns)
    if missing:
        raise ValueError(f"agent rows must carry input/output columns (missing {missing})")
    if "expects_json" in df:
        df["expects_json"] = df["expects_json"].astype(bool)
    ordered = ["input", "output"] + [c for c in df.columns if c not in ("input", "output")]
    return df[ordered]


def agent_dataset(df: pd.DataFrame, descriptors: Optional[List[Any]] = None,
                  numeric: Optional[List[str]] = None, categorical: Optional[List[str]] = None) -> Dataset:
    numeric = [c for c in (numeric or NUMERIC) if c in df.columns]
    categorical = [c for c in (categorical or CATEGORICAL) if c in df.columns]
    definition = DataDefinition(text_columns=[c for c in TEXT if c in df.columns],
                                numerical_columns=numeric, categorical_columns=categorical)
    keep = [c for c in df.columns if c in TEXT or c in numeric or c in categorical]
    return Dataset.from_pandas(df[keep].copy(), data_definition=definition, descriptors=descriptors)


class ExperimentLedger:
    """ONE append-only CSV (`experiments.csv`); mirrors to the remote `experiments` dataset."""

    def __init__(self, path: Path):
        self.path = Path(path)

    def rows(self) -> List[Dict[str, str]]:
        if not self.path.exists():
            return []
        with self.path.open(newline="", encoding="utf-8") as f:
            return list(csv.DictReader(f))

    def append(self, row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Append one run. Corrections are new rows (never edits); an exact repeat of an
        existing row (ignoring timestamp, e.g. a deterministic --mock re-run) is skipped."""
        row = {k: (json.dumps(v, sort_keys=True) if isinstance(v, (dict, list)) else v) for k, v in row.items()}
        row.setdefault("input", row.get("config", ""))
        row.setdefault("output", row.get("score", ""))
        row = {k: str(v) for k, v in row.items()}
        rows = self.rows()
        def core(r: Dict[str, str]) -> Dict[str, str]:
            return {k: v for k, v in r.items() if k != "timestamp" and v != ""}

        if any(core(r) == core(row) for r in rows):
            return None
        row = {"timestamp": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(), **row}
        rows.append(row)
        cols = sorted({k for r in rows for k in r}, key=lambda c: (c not in ("input", "output", "timestamp"), c))
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerows(rows)
        return row
