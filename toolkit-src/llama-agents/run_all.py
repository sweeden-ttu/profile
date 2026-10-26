"""Run the agent examples, then log them through the Evidently template and publish results.

    # live (needs `ollama serve` + `ollama pull llama3.2:1b`)
    python run_all.py --backend ollama --model llama3.2:1b --evidently --site ../..

    # offline: replay bundled recordings (what seeded the website)
    python run_all.py --backend mock --evidently --site ../..

With --site <jekyll root> it writes:
    assets/toolkit/agent-runs/latest/transcripts/<example>.json   (replayable in the browser)
    assets/toolkit/agent-runs/latest/summary.json
    assets/toolkit/agent-runs/latest/report.html                  (Evidently, shared JS bundle)
    assets/toolkit/agent-runs/latest/spans.jsonl                  (OpenTelemetry spans)
    assets/toolkit/llama-agents/py/{llm.py, examples/*.py}         (sources Pyodide loads)
    _data/agent_runs.json                                         (latest + history, used by Liquid)
"""
from __future__ import annotations

import argparse
import datetime as dt
import importlib.util
import json
import os
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from llm import DEFAULT_MODEL, get_backend, run_example  # noqa: E402

EXAMPLES = {  # name -> file (order = display order on the site)
    "react_calculator": "01_react_calculator.py",
    "json_extraction": "02_json_extraction.py",
    "planner_executor": "03_planner_executor.py",
    "self_critique": "04_self_critique.py",
}
HISTORY_LIMIT = 20


def load_example(name: str):
    path = HERE / "examples" / EXAMPLES[name]
    spec = importlib.util.spec_from_file_location(f"example_{name}", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def summarize(t: Dict[str, Any], site_prefix: str) -> Dict[str, Any]:
    steps = t["steps"]
    return {
        "name": t["example"], "title": t.get("title", t["example"]), "file": EXAMPLES[t["example"]],
        "ok": t["ok"], "final_answer": t["final_answer"], "steps": len(steps),
        "llm_calls": sum(s["kind"] == "llm" for s in steps),
        "tool_calls": sum(s["kind"] == "tool" for s in steps),
        "tool_errors": sum(s["kind"] == "tool" and not s["ok"] for s in steps),
        "latency_ms": round(sum(s.get("latency_ms", 0.0) for s in steps), 1),
        "completion_tokens": sum(s.get("completion_tokens", 0) for s in steps),
        "transcript": f"{site_prefix}/transcripts/{t['example']}.json",
    }


# --------------------------------------------------------------------------------------
# Evidently: transcript steps -> OTel spans; LLM calls -> Dataset -> Report + tests
# --------------------------------------------------------------------------------------
def log_with_evidently(transcripts: List[Dict[str, Any]], out_dir: Path, lib_dir: Optional[Path]) -> Dict[str, Any]:
    sys.path.insert(0, str(HERE.parent / "evidently-llama"))
    from evllama.datasets import agent_dataset, rows_frame
    from evllama.descriptors import standard_descriptors
    from evllama.evidently_rest import EvidentlyREST
    from evllama.reports import build_report, save_html, save_json, test_summary
    from evllama.tracing import AgentTracer, load_spans

    url, token = os.environ.get("EVIDENTLY_URL"), os.environ.get("EVIDENTLY_TOKEN")
    pid = EvidentlyREST(url, token).project_id("llama-agents-ci") if url else None
    tracer = AgentTracer(out_dir / "spans.jsonl", service="llama-agents", evidently_url=url,
                         evidently_token=token, project_id=pid)

    def ns(iso: str) -> int:
        return int(dt.datetime.fromisoformat(iso).timestamp() * 1e9)

    rows = []
    for t in transcripts:
        # Rebuild the run's timeline from recorded step latencies so span durations are real.
        cursor = ns(t["started_at"])
        total = int(sum(s.get("latency_ms", 0.0) for s in t["steps"]) * 1e6) + 1
        root = tracer.tracer.start_span(f"example.{t['example']}", start_time=cursor)
        for k, v in {"kind": "agent", "statement": t["example"], "input": t["task"],
                     "output": json.dumps(t["final_answer"]) if not isinstance(t["final_answer"], str)
                     else t["final_answer"], "ok": bool(t["ok"]), "model": t["model"],
                     "backend": t["backend"]}.items():
            root.set_attribute(k, v)
        from opentelemetry import trace as otel_trace

        ctx = otel_trace.set_span_in_context(root)
        for s in t["steps"]:
            dur = int(s.get("latency_ms", 0.0) * 1e6) + 1
            span = tracer.tracer.start_span(f"{s['kind']}.{s['name']}", context=ctx, start_time=cursor)
            for k in ("kind", "input", "output", "ok", "latency_ms", "prompt_tokens", "completion_tokens", "match"):
                if k in s:
                    v = s[k]
                    span.set_attribute(k, v if isinstance(v, (str, int, float, bool)) else json.dumps(v))
            span.set_attribute("statement", f"{t['example']} step {s['step']}")
            span.end(end_time=cursor + dur)
            cursor += dur
        root.end(end_time=ns(t["started_at"]) + total)
        for c in t["calls"]:  # one dataset row per LLM call: input = last user turn, output = reply
            rows.append({"input": c["messages"][-1]["content"], "output": c["response"], "example": t["example"],
                         "expects_json": c.get("format") is not None, "latency_ms": c.get("latency_ms", 0.0),
                         "prompt_tokens": c.get("prompt_tokens", 0), "completion_tokens": c.get("completion_tokens", 0)})
    tracer.shutdown()

    df = rows_frame(rows)
    ds = agent_dataset(df, standard_descriptors(judge=None, max_chars=1500),
                       numeric=["latency_ms", "prompt_tokens", "completion_tokens"],
                       categorical=["example", "expects_json"])
    columns = list(ds.as_dataframe().columns)
    snap = build_report(columns, latency_budget_ms=15000.0, has_judge=False).run(
        ds, None, name="llama-agents run", tags=[f"model:{transcripts[0]['model']}"])
    save_html(snap, out_dir / "report.html", shared_lib_dir=lib_dir)
    ds.as_dataframe().to_csv(out_dir / "llm_calls.csv", index=False)
    tests = test_summary(snap)
    save_json(tests, out_dir / "tests.json")
    if url:
        from evidently.ui.workspace import RemoteWorkspace

        RemoteWorkspace(url, secret=token).add_run(pid, snap, include_data=False)
    return {"tests": {"passed": tests["passed"], "total": tests["total"]}, "spans": len(load_spans(out_dir / "spans.jsonl")),
            "rows": len(df)}


def github_meta() -> Dict[str, Any]:
    env = os.environ.get
    repo, run_id, server = env("GITHUB_REPOSITORY"), env("GITHUB_RUN_ID"), env("GITHUB_SERVER_URL", "https://github.com")
    return {
        "trigger": env("GITHUB_EVENT_NAME", "local"),
        "repository": repo,
        "run_id": run_id,
        "run_number": env("GITHUB_RUN_NUMBER"),
        "run_url": f"{server}/{repo}/actions/runs/{run_id}" if repo and run_id else None,
        "sha": env("GITHUB_SHA"),
        "ref": env("GITHUB_REF_NAME"),
    }


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--backend", default=os.environ.get("LLAMA_BACKEND", "mock"), choices=["ollama", "mock", "replay"])
    ap.add_argument("--model", default=os.environ.get("LLAMA_MODEL", DEFAULT_MODEL))
    ap.add_argument("--example", default="all", help="all or one of: " + ", ".join(EXAMPLES))
    ap.add_argument("--out", type=Path, default=HERE / "out", help="output dir (ignored with --site)")
    ap.add_argument("--site", type=Path, default=None, help="Jekyll site root to publish into")
    ap.add_argument("--evidently", action="store_true", help="log spans + build the Evidently report")
    ap.add_argument("--save-recordings", action="store_true",
                    help="also copy transcripts into recordings/ (refreshes the offline mock)")
    ap.add_argument("--fail-on-error", action="store_true", help="exit 1 if any example fails its check")
    args = ap.parse_args(argv)

    names = list(EXAMPLES) if args.example == "all" else [args.example]
    unknown = [n for n in names if n not in EXAMPLES]
    if unknown:
        ap.error(f"unknown example(s): {unknown}")

    site_prefix = "/assets/toolkit/agent-runs/latest"
    out = (args.site / site_prefix.lstrip("/")) if args.site else args.out
    if args.site and args.example == "all" and out.exists():
        shutil.rmtree(out)  # 'latest' is replaced wholesale on a full run
    (out / "transcripts").mkdir(parents=True, exist_ok=True)

    transcripts = []
    for name in names:
        mod = load_example(name)
        backend = get_backend(args.backend, args.model, example=name)
        t = run_example(name, mod.TASK, mod.run, backend=backend)
        t["title"], t["file"] = getattr(mod, "TITLE", name), EXAMPLES[name]
        (out / "transcripts" / f"{name}.json").write_text(json.dumps(t, indent=1, ensure_ascii=False) + "\n")
        if args.save_recordings:
            (HERE / "recordings" / f"{name}.json").write_text(json.dumps(t, indent=1, ensure_ascii=False) + "\n")
        transcripts.append(t)
        print()

    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    latest: Dict[str, Any] = {
        "generated_at": now, "model": args.model if args.backend == "ollama" else transcripts[0]["model"],
        "backend": args.backend, **github_meta(),
        "examples": [summarize(t, site_prefix) for t in transcripts],
    }
    if args.evidently:
        lib_dir = (args.site / "assets/toolkit/evidently/lib") if args.site else None
        ev = log_with_evidently(transcripts, out, lib_dir)
        latest.update(report=f"{site_prefix}/report.html", spans_file=f"{site_prefix}/spans.jsonl", **ev)
    data_file = args.site / "_data" / "agent_runs.json" if args.site else None
    previous: Dict[str, Any] = {}
    if data_file is not None and data_file.exists():
        try:
            previous = json.loads(data_file.read_text())
        except json.JSONDecodeError:
            previous = {}
    if args.example != "all" and previous.get("latest"):
        # single-example run: keep the other examples' last results next to the new one
        ran = {e["name"] for e in latest["examples"]}
        kept = [dict(e, stale=True) for e in previous["latest"].get("examples", []) if e["name"] not in ran]
        latest["examples"] = sorted(latest["examples"] + kept, key=lambda e: list(EXAMPLES).index(e["name"]))
    if not args.evidently and previous.get("latest", {}).get("report"):
        for k in ("report", "spans_file", "tests", "spans", "rows"):
            if k in previous["latest"]:
                latest[k] = previous["latest"][k]
        latest["report_stale"] = True
    latest["passed"] = sum(e["ok"] for e in latest["examples"])
    latest["total"] = len(latest["examples"])
    (out / "summary.json").write_text(json.dumps(latest, indent=1, ensure_ascii=False) + "\n")

    if args.site:
        # sources for the in-browser runner (Pyodide fetches these)
        py = args.site / "assets/toolkit/llama-agents/py"
        (py / "examples").mkdir(parents=True, exist_ok=True)
        shutil.copy(HERE / "llm.py", py / "llm.py")
        for f in EXAMPLES.values():
            shutil.copy(HERE / "examples" / f, py / "examples" / f)
        # bundled offline transcripts: the page falls back to these if a CI transcript is missing
        samples = args.site / "assets/toolkit/llama-agents/samples"
        samples.mkdir(parents=True, exist_ok=True)
        for f in sorted((HERE / "recordings").glob("*.json")):
            shutil.copy(f, samples / f.name)
        # Jekyll data file: latest run + short history
        history = previous.get("history", [])
        keys = ("generated_at", "model", "backend", "trigger", "run_id", "run_number", "run_url", "sha", "passed", "total")
        entry = {k: latest.get(k) for k in keys}
        if "tests" in latest:
            entry["tests_passed"], entry["tests_total"] = latest["tests"]["passed"], latest["tests"]["total"]
        if entry["run_id"]:  # a re-run of the same Actions run replaces its entry
            history = [h for h in history if h.get("run_id") != entry["run_id"]]
        else:  # local/offline runs: keep only the most recent one
            history = [h for h in history if h.get("run_id")]
        history = [entry] + history
        data_file.write_text(json.dumps({"latest": latest, "history": history[:HISTORY_LIMIT]},
                                        indent=1, ensure_ascii=False) + "\n")
    print(f"{latest['passed']}/{latest['total']} examples passed; results in {out}")
    return 1 if args.fail_on_error and latest["passed"] < latest["total"] else 0


if __name__ == "__main__":
    sys.exit(main())
