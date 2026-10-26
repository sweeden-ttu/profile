"""Reports + test suites over agent datasets, and HTML export that is friendly to a static site.

`Report.run(current, reference)` gives a side-by-side comparison (here: prompt v2 vs v1).
With `include_tests=True` plus explicit tests, the same Report doubles as a *test suite*;
`test_summary()` turns the result into a compact pass/fail dict for CI gates and pages.
"""
from __future__ import annotations

import base64
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import evidently
from evidently import Report
from evidently.metrics import CategoryCount, MeanValue, QuantileValue, RowCount
from evidently.presets import TextEvals
from evidently.tests import eq, gte, lte

STATIC = Path(evidently.__file__).parent / "nbextension" / "static"
LIB_NAME = f"evidently-{evidently.__version__}.js"
FONT_NAME = "material-ui-icons.woff2"

DESCRIPTOR_COLUMNS = ["output_chars", "output_words", "output_sentences", "sentiment_heuristic", "toxicity",
                      "refusal", "pii", "json_valid", "judge_score", "row_tests"]


def build_report(columns: List[str], latency_budget_ms: float = 4000.0, min_judge: float = 3.5,
                 has_judge: bool = True) -> Report:
    """Descriptor summary (TextEvals) + explicit, thresholded tests = report AND test suite."""
    metrics: List[Any] = [
        TextEvals(columns=[c for c in DESCRIPTOR_COLUMNS if c in columns]),
        RowCount(),
        MeanValue(column="latency_ms", tests=[lte(latency_budget_ms)]),
        QuantileValue(column="latency_ms", quantile=0.95),
    ]
    if "tool_success" in columns:
        metrics.append(MeanValue(column="tool_success", tests=[gte(0.9)]))
    for col, bad in (("json_valid", "invalid"), ("refusal", "refusal"), ("toxicity", "flagged")):
        if col in columns:
            metrics.append(CategoryCount(column=col, category=bad, tests=[eq(0)]))
    if has_judge and "judge_score" in columns:
        metrics.append(MeanValue(column="judge_score", tests=[gte(min_judge)]))
    return Report(metrics, include_tests=True)


def test_summary(snapshot) -> Dict[str, Any]:
    tests = snapshot.dict().get("tests", [])
    rows = [{"name": t.get("name", ""), "status": t.get("status", ""), "description": t.get("description", "")}
            for t in tests]
    passed = sum(r["status"] == "SUCCESS" for r in rows)
    return {"total": len(rows), "passed": passed, "failed": len(rows) - passed, "tests": rows}


def metric_values(snapshot) -> Dict[str, Any]:
    """{metric_name: value} for quick JSON summaries (values may be dicts for count metrics)."""
    return {m["metric_name"]: m["value"] for m in snapshot.dict().get("metrics", [])}


def ensure_shared_lib(lib_dir: Path) -> Path:
    """Copy Evidently's report JS bundle (Apache-2.0) + icon font next to the reports once."""
    lib_dir.mkdir(parents=True, exist_ok=True)
    for src, name in ((STATIC / "index.js", LIB_NAME), (STATIC / FONT_NAME, FONT_NAME)):
        dst = lib_dir / name
        if not dst.exists() or dst.stat().st_size != src.stat().st_size:
            dst.write_bytes(src.read_bytes())
    lic = STATIC / "index.js.LICENSE.txt"
    if lic.exists():
        (lib_dir / f"{LIB_NAME}.LICENSE.txt").write_bytes(lic.read_bytes())
    return lib_dir


def save_html(snapshot, path: Path, shared_lib_dir: Optional[Path] = None, title: str = "") -> Path:
    """Save a report. Without `shared_lib_dir` this is Evidently's standalone ~3.6 MB file.
    With it, the inlined JS bundle and font are swapped for relative links to one shared copy,
    so each report is tens of KB (what you want for files committed by CI every run)."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    html = snapshot.get_html_str(as_iframe=False)
    if shared_lib_dir is not None:
        ensure_shared_lib(Path(shared_lib_dir))
        rel = os.path.relpath(Path(shared_lib_dir), path.parent).replace(os.sep, "/")
        js = (STATIC / "index.js").read_text(encoding="utf-8")
        font = base64.b64encode((STATIC / FONT_NAME).read_bytes()).decode()
        inline_js, inline_font = f"<script>{js}</script>", f"url(data:font/ttf;base64,{font}) format('woff2');"
        if inline_js not in html or inline_font not in html:
            raise RuntimeError("Evidently HTML layout changed; save without shared_lib_dir")
        html = html.replace(inline_js, f'<script src="{rel}/{LIB_NAME}"></script>')
        html = html.replace(inline_font, f"url({rel}/{FONT_NAME}) format('woff2');")
    if title:
        html = html.replace("<title>", f"<title>{title} · ", 1) if "<title>" in html else html
    path.write_text(html, encoding="utf-8")
    return path


def save_json(obj: Any, path: Path) -> Path:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, default=str, ensure_ascii=False) + "\n", encoding="utf-8")
    return path
