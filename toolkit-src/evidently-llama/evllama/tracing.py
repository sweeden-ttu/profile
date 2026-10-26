"""OpenTelemetry spans for every agent step, Tracely-compatible.

Every span carries the same four core attributes the Evidently /traces table expects
(`kind`, `statement`, `input`, `output`) plus step metrics (latency_ms, ok, tokens, ...).

* Always: spans go to a local JSONL file (out/spans.jsonl) via `JsonlSpanExporter`,
  so traces work fully offline and can be turned into an Evidently Dataset.
* If EVIDENTLY_URL is set: Tracely (`tracely.init_tracing`) also ships them over OTLP/HTTP
  to the project's single tracing dataset, named "trace".
"""
from __future__ import annotations

import contextlib
import datetime as dt
import json
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Sequence

from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import ReadableSpan, TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, SpanExporter, SpanExportResult


def _attr(v: Any) -> Any:
    """OTel attributes must be str/int/float/bool; everything else becomes JSON text."""
    if isinstance(v, (str, bool, int, float)):
        return v
    if v is None:
        return ""
    return json.dumps(v, default=str, ensure_ascii=False)


def _iso(ns: int) -> str:
    return dt.datetime.fromtimestamp(ns / 1e9, dt.timezone.utc).isoformat()


class JsonlSpanExporter(SpanExporter):
    """Append finished spans to a JSON-lines file (one span per line)."""

    def __init__(self, path: Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def export(self, spans: Sequence[ReadableSpan]) -> SpanExportResult:
        with self.path.open("a", encoding="utf-8") as f:
            for s in spans:
                ctx = s.get_span_context()
                f.write(json.dumps({
                    "trace_id": format(ctx.trace_id, "032x"),
                    "span_id": format(ctx.span_id, "016x"),
                    "parent_id": format(s.parent.span_id, "016x") if s.parent else None,
                    "name": s.name,
                    "start": _iso(s.start_time),
                    "end": _iso(s.end_time),
                    "duration_ms": round((s.end_time - s.start_time) / 1e6, 3),
                    "status": s.status.status_code.name,
                    "attributes": dict(s.attributes or {}),
                }, ensure_ascii=False) + "\n")
        return SpanExportResult.SUCCESS

    def shutdown(self) -> None:  # nothing to close; file is opened per batch
        pass


class AgentTracer:
    """Small facade over an OTel TracerProvider.

    with tracer.span("llm", kind="llm", input=prompt) as s:
        ...; s.set_attribute("output", text)
    """

    def __init__(self, spans_path: Path, service: str = "evllama-agent", evidently_url: Optional[str] = None,
                 evidently_token: Optional[str] = None, project_id: Optional[str] = None, fresh: bool = True):
        self.spans_path = Path(spans_path)
        if fresh and self.spans_path.exists():
            self.spans_path.unlink()
        if evidently_url and project_id:
            from tracely import init_tracing  # pip install tracely

            # Creates/gets the tracing dataset by name, then exports OTLP/HTTP to /api/v1/traces.
            self.provider = init_tracing(address=evidently_url, exporter_type="http", project_id=project_id,
                                         export_name="trace", processor_type="simple", api_key=evidently_token)
            self.remote = True
        else:
            self.provider = TracerProvider(resource=Resource.create({"service.name": service}))
            self.remote = False
        self.provider.add_span_processor(SimpleSpanProcessor(JsonlSpanExporter(self.spans_path)))
        self.tracer = self.provider.get_tracer("evllama")

    @contextlib.contextmanager
    def span(self, name: str, kind: str, input: Any = "", statement: str = "", **attrs: Any) -> Iterator[Any]:
        with self.tracer.start_as_current_span(name) as s:
            s.set_attribute("kind", kind)
            s.set_attribute("statement", statement or name)
            s.set_attribute("input", _attr(input))
            for k, v in attrs.items():
                s.set_attribute(k, _attr(v))
            yield s

    @staticmethod
    def set(span: Any, **attrs: Any) -> None:
        for k, v in attrs.items():
            span.set_attribute(k, _attr(v))

    def shutdown(self) -> None:
        self.provider.force_flush()
        self.provider.shutdown()


def load_spans(path: Path) -> List[Dict[str, Any]]:
    path = Path(path)
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def spans_frame(path: Path):
    """Flatten spans into a DataFrame with `input`/`output` first (ready for Dataset.from_pandas)."""
    import pandas as pd

    rows = []
    for s in load_spans(path):
        a = s["attributes"]
        rows.append({"input": a.get("input", ""), "output": a.get("output", ""), "name": s["name"],
                     "kind": a.get("kind", ""), "duration_ms": s["duration_ms"], "trace_id": s["trace_id"],
                     **{k: v for k, v in a.items() if k not in ("input", "output", "kind")}})
    return pd.DataFrame(rows)
