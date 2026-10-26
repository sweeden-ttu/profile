"""`python -m evllama ...` — run the end-to-end demo (or inspect prompts / skills).

    python -m evllama demo --mock                       # no Ollama needed (replays recordings)
    python -m evllama demo                              # live: ollama serve + ollama pull llama3.2:1b
    python -m evllama demo --record                     # live, and refresh data/recordings/demo.json
    python -m evllama demo --mock --publish ../../assets/toolkit/evidently   # site artifacts
    python -m evllama prompts | skills
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import shutil
import statistics
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from .agent import SYSTEM_PROMPT, SkillAgent
from .config import TEMPLATE_ROOT, Settings
from .dashboard import add_run, open_project
from .datasets import ExperimentLedger, agent_dataset, rows_frame
from .descriptors import LocalJudge, standard_descriptors
from .evidently_rest import EvidentlyREST
from .llm import RecordingChat, make_chat
from .prompts import PromptRegistry
from .reports import build_report, metric_values, save_html, save_json, test_summary
from .skills import load_skills
from .tools import make_tools
from .tracing import AgentTracer, load_spans


def _mean(values) -> Optional[float]:
    vals = [float(v) for v in values if v == v]  # drop NaN
    return round(statistics.mean(vals), 3) if vals else None


def _version_metrics(df, tests: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "rows": int(len(df)),
        "judge_mean": _mean(df["judge_score"]) if "judge_score" in df else None,
        "latency_ms_mean": _mean(df["latency_ms"]),
        "tool_success": _mean(df["tool_success"]),
        "json_invalid": int((df["json_valid"] == "invalid").sum()) if "json_valid" in df else 0,
        "refusals": int((df["refusal"] == "refusal").sum()) if "refusal" in df else 0,
        "tests_passed": tests["passed"],
        "tests_total": tests["total"],
    }


def run_demo(settings: Settings, ref_version: int = 1, cur_version: int = 2,
             publish: Optional[Path] = None, chat=None) -> Dict[str, Any]:
    out = settings.out_dir
    out.mkdir(parents=True, exist_ok=True)
    registry = PromptRegistry(settings.prompts_path)
    skills = load_skills(settings.skills_dir)
    tools = make_tools(TEMPLATE_ROOT / "data" / "docs.json")
    tasks = [json.loads(line) for line in settings.tasks_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    chat = chat or make_chat(settings)

    rest = pid = None
    if settings.evidently_url:  # optional mirror to a self-hosted Evidently UI
        rest = EvidentlyREST(settings.evidently_url, settings.evidently_token)
        pid = rest.project_id(settings.project, "Local Llama agent evals (evllama template)")
    tracer = AgentTracer(settings.spans_path, evidently_url=settings.evidently_url,
                         evidently_token=settings.evidently_token, project_id=pid)
    judge = LocalJudge(chat, registry, tracer) if settings.judge else None

    # 1) run the agent with both prompt versions -> agent I/O rows (input/output + metrics)
    frames = {}
    for v in (ref_version, cur_version):
        agent = SkillAgent(chat, registry, skills, tools, tracer, prompt_version=v)
        frames[v] = rows_frame(agent.run(t["id"], t["task"]) for t in tasks)

    # 2) descriptors (heuristics + local judge) are computed when the Dataset is built
    datasets = {v: agent_dataset(df, standard_descriptors(judge)) for v, df in frames.items()}
    enriched = {v: ds.as_dataframe() for v, ds in datasets.items()}
    columns = list(enriched[cur_version].columns)

    # 3) comparison report (current vs reference) = the HTML you look at
    comparison = build_report(columns, has_judge=judge is not None).run(
        datasets[cur_version], datasets[ref_version], name=f"{SYSTEM_PROMPT} v{cur_version} vs v{ref_version}")
    save_html(comparison, out / "report.html")

    # 4) one snapshot per version -> local workspace dashboard (+ remote UI if configured)
    ws, project = open_project(settings.workspace_dir, settings.project,
                               "Local Llama agent evals (evllama template)")
    remote_ws = None
    if rest is not None:
        from evidently.ui.workspace import RemoteWorkspace

        remote_ws = RemoteWorkspace(settings.evidently_url, secret=settings.evidently_token)
    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
    per_version: Dict[int, Dict[str, Any]] = {}
    for i, v in enumerate((ref_version, cur_version)):
        snap = build_report(columns, has_judge=judge is not None).run(
            datasets[v], None, timestamp=now - dt.timedelta(hours=1 - i), name=f"{SYSTEM_PROMPT} v{v}",
            tags=[f"prompt:v{v}", f"backend:{getattr(chat, 'name', '?')}"])
        add_run(ws, project, snap)
        if remote_ws is not None:
            remote_ws.add_run(pid, snap, include_data=False)
        tests = test_summary(snap)
        per_version[v] = {"tests": tests, "metrics": _version_metrics(enriched[v], tests),
                          "metric_values": metric_values(snap)}

    # 5) feedback -> prompt registry versions; one ledger row per evaluated version
    ledger = ExperimentLedger(out / "experiments.csv")
    for v, info in per_version.items():
        m = info["metrics"]
        feedback = (f"judge {m['judge_mean']}/5, mean latency {m['latency_ms_mean']} ms, tool success "
                    f"{m['tool_success']}, invalid JSON {m['json_invalid']}, refusals {m['refusals']}, "
                    f"tests {m['tests_passed']}/{m['tests_total']} ({getattr(chat, 'name', '?')} backend)")
        registry.record_feedback(SYSTEM_PROMPT, v, feedback, m)
        row = {"exp_id": f"{SYSTEM_PROMPT}-v{v}", "config": {"prompt": SYSTEM_PROMPT, "version": v,
               "model": settings.model, "backend": getattr(chat, "name", "?")},
               "score": m["judge_mean"], "status": "done", "parent": f"{SYSTEM_PROMPT}-v{ref_version}" if v != ref_version else ""}
        if ledger.append(row) is not None and rest is not None:
            rest.append_experiment(pid, row)
    if judge is not None:
        scores = [x for df in enriched.values() for x in df["judge_score"]]
        parsed = sum(x == x for x in scores)
        registry.record_feedback("judge", registry.get("judge", judge.version)["version"],
                                 f"parsed {parsed}/{len(scores)} scores (SCORE: n); mean {_mean(scores)}",
                                 {"parsed": parsed, "total": len(scores)})
    registry.save()
    if rest is not None:
        registry.push(rest, pid)

    tracer.shutdown()
    if isinstance(chat, RecordingChat):
        chat.save()

    # 6) artifacts
    for v, df in enriched.items():
        df.to_csv(out / f"dataset_v{v}.csv", index=False)
    summary = {
        "generated_at": now.isoformat(),
        "model": settings.model,
        "backend": getattr(chat, "name", "?"),
        "project": settings.project,
        "reference_version": ref_version,
        "current_version": cur_version,
        "tasks": len(tasks),
        "spans": len(load_spans(settings.spans_path)),
        "versions": {f"v{v}": {"metrics": info["metrics"], "tests": info["tests"]} for v, info in per_version.items()},
        "comparison_tests": test_summary(comparison),
    }
    save_json(summary, out / "summary.json")
    if publish is not None:
        publish_site(out, Path(publish), comparison, enriched[cur_version], registry, settings)
    return summary


def publish_site(out: Path, site_dir: Path, comparison, current_df, registry: PromptRegistry,
                 settings: Settings) -> None:
    """Copy small, page-friendly artifacts into the Jekyll site (assets/toolkit/evidently)."""
    site_dir.mkdir(parents=True, exist_ok=True)
    save_html(comparison, site_dir / "sample-report.html", shared_lib_dir=site_dir / "lib",
              title="evllama sample report")
    shutil.copy(out / "summary.json", site_dir / "summary.json")
    shutil.copy(out / "experiments.csv", site_dir / "experiments.csv")
    current_df.to_csv(site_dir / "dataset-sample.csv", index=False)
    spans = load_spans(settings.spans_path)
    # sample = the first agent run that used a tool (shows the full route -> llm -> tool -> llm tree)
    with_tool = [s["trace_id"] for s in spans if s["attributes"].get("kind") == "tool"]
    sample_trace = with_tool[0] if with_tool else (spans[0]["trace_id"] if spans else None)
    save_json([s for s in spans if s["trace_id"] == sample_trace], site_dir / "trace-sample.json")
    save_json(registry.data, site_dir / "prompts.json")


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(prog="evllama", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd")
    d = sub.add_parser("demo", help="run agent -> traces -> dataset -> descriptors -> report/tests -> dashboard")
    d.add_argument("--mock", action="store_true", help="replay recorded responses (no Ollama)")
    d.add_argument("--record", action="store_true", help="call Ollama and save responses for --mock")
    d.add_argument("--model", default=None, help="Ollama model tag (default: $LLAMA_MODEL or llama3.2:1b)")
    d.add_argument("--recordings", type=Path, default=None)
    d.add_argument("--out", type=Path, default=None)
    d.add_argument("--no-judge", action="store_true")
    d.add_argument("--reference-version", type=int, default=1)
    d.add_argument("--current-version", type=int, default=2)
    d.add_argument("--publish", type=Path, default=None, help="also write site artifacts into this folder")
    sub.add_parser("prompts", help="list prompt versions")
    sub.add_parser("skills", help="list skills")
    args = ap.parse_args(argv)

    settings = Settings()
    if args.cmd == "prompts":
        reg = PromptRegistry(settings.prompts_path)
        for name in reg.names():
            for v in reg.versions(name):
                print(f"{name} v{v['version']}: {v.get('note', '')} | feedback: {v.get('feedback', '')[:90]}")
        return 0
    if args.cmd == "skills":
        for s in load_skills(settings.skills_dir).values():
            print(f"{s.name:<12} tools={s.tools or '-'} output={s.output}  {s.description}")
        return 0
    if args.cmd != "demo":
        ap.print_help()
        return 1
    if args.mock and args.record:
        ap.error("--mock and --record are mutually exclusive")
    settings.mock, settings.record, settings.judge = args.mock, args.record, not args.no_judge
    if args.model:
        settings.model = args.model
    if args.recordings:
        settings.recordings = args.recordings
    if args.out:
        settings.out_dir = args.out
    summary = run_demo(settings, args.reference_version, args.current_version, args.publish)
    print(json.dumps({k: summary[k] for k in ("model", "backend", "tasks", "spans")}, indent=None))
    for v, info in summary["versions"].items():
        print(f"{v}: {info['metrics']}")
    print(f"report: {settings.out_dir / 'report.html'}")
    print(f"browse: evidently ui --workspace {settings.workspace_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
