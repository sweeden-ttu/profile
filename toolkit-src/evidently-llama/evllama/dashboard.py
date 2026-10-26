"""Local Evidently UI workspace: project + dashboard panels + one snapshot per eval run.

Browse with:   evidently ui --workspace out/workspace --port 8000   (then http://localhost:8000)
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from evidently.sdk.models import PanelMetric
from evidently.sdk.panels import bar_plot_panel, counter_panel, line_plot_panel, text_panel
from evidently.ui.workspace import Workspace


def _panels():
    def mean(col: str, legend: str) -> PanelMetric:
        return PanelMetric(legend=legend, metric="MeanValue", metric_labels={"column": col})

    return [
        text_panel(title="Local Llama agent — quality & latency",
                   description="One point per eval run (prompt version). Reports: Snapshots tab."),
        counter_panel(title="Agent runs evaluated", size="half", aggregation="sum",
                      values=[PanelMetric(legend="rows", metric="RowCount")]),
        counter_panel(title="Mean judge score (last run)", size="half", aggregation="last",
                      values=[mean("judge_score", "judge")]),
        line_plot_panel(title="LLM-as-judge score (1-5)", size="half", values=[mean("judge_score", "judge")]),
        line_plot_panel(title="Mean latency per task (ms)", size="half", values=[mean("latency_ms", "latency")]),
        line_plot_panel(title="Tool-call success rate", size="half", values=[mean("tool_success", "tool success")]),
        bar_plot_panel(title="Invalid JSON outputs", size="half", values=[
            PanelMetric(legend="invalid", metric="CategoryCount",
                        metric_labels={"column": "json_valid", "value_type": "count"})]),
    ]


def open_project(workspace_dir: Path, name: str, description: str = ""):
    ws = Workspace(str(workspace_dir))
    existing = [p for p in ws.list_projects() if p.name == name]
    if existing:
        return ws, existing[0]
    project = ws.create_project(name, description=description or None)
    for panel in _panels():
        project.dashboard.add_panel(panel)
    return ws, project


def add_run(ws, project, snapshot, name: Optional[str] = None):
    """Store a Report snapshot. include_data=False: runs are not datasets (keeps /datasets clean)."""
    return ws.add_run(project.id, snapshot, include_data=False, name=name)
