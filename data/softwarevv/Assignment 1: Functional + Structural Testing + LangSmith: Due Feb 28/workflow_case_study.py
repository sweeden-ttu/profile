"""Workflow Case Study: Bell County News Article Integration.

Complete workflow demonstrating START → PROCESS → DECISION → ACTION → VALIDATE → END
with full state management and decision tracking.

Integrated from legal-luminary demos/langsmith_langgraph_demo/workflow_case_study.py.

This demonstrates the full lifecycle with evidence capture at each step.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict


OUTPUT_DIR = Path(__file__).parent.parent.parent / "output" / "workflow_case_study"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def now_iso() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class WorkflowStateEnum(str, Enum):
    START = "START"
    PROCESS = "PROCESS"
    DECISION = "DECISION"
    ACTION = "ACTION"
    VALIDATE = "VALIDATE"
    END = "END"


@dataclass
class StateTransition:
    from_state: str
    to_state: str
    timestamp: str
    event: str
    data: Dict[str, Any]
    decision_result: Optional[bool] = None


class WorkflowState(TypedDict, total=False):
    workflow_id: str
    article_id: str
    article_title: str
    current_state: str
    source_url: str
    content: str
    content_hash: str
    domain: str
    transitions: List[Dict[str, Any]]
    decision: Optional[Dict[str, Any]]
    action_result: Optional[Dict[str, Any]]
    validation: Optional[Dict[str, Any]]
    allowlist: Dict[str, Any]


ALLOWLIST = {
    "domains": [
        "bellcountytx.gov",
        "killeendailyherald.com",
        "kdhnews.com",
        "kcen.com",
        "kwtx.com",
        "texasattorneygeneral.gov",
        "capitol.texas.gov",
    ]
}


def load_allowlist() -> Dict[str, Any]:
    allowlist_path = Path(__file__).parent.parent.parent / "config" / "allowlist.json"
    if allowlist_path.exists():
        with open(allowlist_path, "r") as f:
            return json.load(f)
    return ALLOWLIST


def canonicalize_url(url: str) -> str:
    u = url.strip().lower()
    for prefix in ["http://", "https://"]:
        if u.startswith(prefix):
            u = u[len(prefix) :]
    if u.endswith("/"):
        u = u[:-1]
    return u


def save_workflow_state(state: WorkflowState) -> None:
    path = OUTPUT_DIR / f"workflow-{state['workflow_id']}.json"
    with open(path, "w") as f:
        json.dump(state, f, indent=2, default=str)


def add_transition(
    state: WorkflowState,
    to_state: str,
    event: str,
    data: Dict[str, Any],
    decision_result: Optional[bool] = None,
) -> Dict[str, Any]:
    transition = {
        "from": state.get("current_state", "START"),
        "to": to_state,
        "timestamp": now_iso(),
        "event": event,
        "data": data,
        "decision_result": decision_result,
    }
    transitions = list(state.get("transitions", []))
    transitions.append(transition)
    return {"current_state": to_state, "transitions": transitions}


def node_start(state: WorkflowState) -> Dict[str, Any]:
    article_id = str(uuid.uuid4())[:8]
    workflow_id = str(uuid.uuid4())

    metadata = {
        "id": article_id,
        "title": state.get("article_title", ""),
        "source": state.get("source_url", ""),
        "ingestion_time": now_iso(),
    }

    return {
        "workflow_id": workflow_id,
        "article_id": article_id,
        "current_state": "PROCESS",
        "transitions": [
            {
                "from": "START",
                "to": "PROCESS",
                "timestamp": now_iso(),
                "event": "article_received",
                "data": metadata,
            }
        ],
    }


def node_process(state: WorkflowState) -> Dict[str, Any]:
    content = state.get("content", "")
    source_url = state.get("source_url", "")

    content_hash = compute_hash(content)
    domain = canonicalize_url(source_url)

    process_data = {
        "content_hash": content_hash,
        "content_length": len(content),
        "source_domain": domain,
    }

    transitions = add_transition(state, "DECISION", "content_processed", process_data)

    return {
        "content_hash": content_hash,
        "domain": domain,
        **transitions,
    }


def node_decision(state: WorkflowState) -> Dict[str, Any]:
    allowlist = load_allowlist()
    domain = state.get("domain", "")
    content_length = len(state.get("content", ""))

    domain_valid = False
    matched_domain = None

    for allowed in allowlist.get("domains", []):
        canonical_allowed = canonicalize_url(allowed)
        if domain == canonical_allowed or domain.endswith("." + canonical_allowed):
            domain_valid = True
            matched_domain = canonical_allowed
            break

    content_valid = content_length > 50

    accepted = domain_valid and content_valid

    decision = {
        "domain_check": {"valid": domain_valid, "matched": matched_domain},
        "content_check": {"valid": content_valid, "length": content_length},
        "final_decision": "ACCEPT" if accepted else "REJECT",
        "reasons": []
        if accepted
        else [
            "Domain not in allowlist" if not domain_valid else "Content below threshold"
        ],
    }

    next_state = "ACTION" if accepted else "VALIDATE"
    transitions = add_transition(
        state, next_state, "verification_complete", decision, accepted
    )

    return {"decision": decision, **transitions}


def route_decision(state: WorkflowState) -> str:
    return (
        "action"
        if state.get("decision", {}).get("final_decision") == "ACCEPT"
        else "validate"
    )


def node_action(state: WorkflowState) -> Dict[str, Any]:
    if state.get("decision", {}).get("final_decision") != "ACCEPT":
        transitions = add_transition(
            state, "VALIDATE", "action_skipped", {"reason": "rejected"}
        )
        return {"action_result": {"action": "skipped"}, **transitions}

    article_title = state.get("article_title", "Article")
    article_id = state.get("article_id", "")
    content = state.get("content", "")
    workflow_id = state.get("workflow_id", "")
    source_url = state.get("source_url", "")

    page_filename = f"article-{article_id}.md"
    markdown = f"""---
title: {article_title}
source: {source_url}
verification_id: {workflow_id}
---

{content}
"""

    staging_dir = OUTPUT_DIR / "staging"
    staging_dir.mkdir(exist_ok=True)

    page_path = staging_dir / page_filename
    with open(page_path, "w") as f:
        f.write(markdown)

    action_result = {
        "action": "page_created",
        "page_filename": page_filename,
        "page_path": str(page_path),
        "size": len(markdown),
    }

    transitions = add_transition(state, "VALIDATE", "content_integrated", action_result)

    return {"action_result": action_result, **transitions}


def node_validate(state: WorkflowState) -> Dict[str, Any]:
    checks = {}
    all_passed = True

    workflow_path = OUTPUT_DIR / f"workflow-{state.get('workflow_id')}.json"
    if workflow_path.exists():
        checks["workflow_log"] = {"status": "PASS", "detail": "Log exists"}
    else:
        checks["workflow_log"] = {"status": "FAIL", "detail": "Log missing"}
        all_passed = False

    action_result = state.get("action_result")
    if action_result and action_result.get("action") == "page_created":
        page_path = Path(action_result.get("page_path", ""))
        if page_path.exists():
            checks["page_file"] = {
                "status": "PASS",
                "detail": f"Size: {page_path.stat().st_size}",
            }
        else:
            checks["page_file"] = {"status": "FAIL", "detail": "Page file missing"}
            all_passed = False

    decision = state.get("decision", {})
    if decision.get("final_decision") in ["ACCEPT", "REJECT"]:
        checks["decision"] = {"status": "PASS", "detail": decision["final_decision"]}
    else:
        checks["decision"] = {"status": "FAIL", "detail": "Invalid decision"}
        all_passed = False

    validation = {
        "checks": checks,
        "all_passed": all_passed,
    }

    transitions = add_transition(
        state, "END", "validation_complete", validation, all_passed
    )

    return {"validation": validation, **transitions}


def node_end(state: WorkflowState) -> Dict[str, Any]:
    save_workflow_state(state)

    report = {
        "workflow_id": state.get("workflow_id"),
        "article_id": state.get("article_id"),
        "article_title": state.get("article_title"),
        "final_state": "END",
        "total_transitions": len(state.get("transitions", [])),
        "validation_passed": state.get("validation", {}).get("all_passed", False),
    }

    report_path = OUTPUT_DIR / f"report-{state.get('workflow_id')}.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    return {}


def build_workflow_case_study_graph() -> StateGraph:
    graph_builder = StateGraph(WorkflowState)

    graph_builder.add_node("start", node_start)
    graph_builder.add_node("process", node_process)
    graph_builder.add_node("decision", node_decision)
    graph_builder.add_node("action", node_action)
    graph_builder.add_node("validate", node_validate)
    graph_builder.add_node("end", node_end)

    graph_builder.add_edge(START, "start")
    graph_builder.add_edge("start", "process")
    graph_builder.add_edge("process", "decision")

    graph_builder.add_conditional_edges(
        "decision",
        route_decision,
        {"action": "action", "validate": "validate"},
    )

    graph_builder.add_edge("action", "validate")
    graph_builder.add_edge("validate", "end")
    graph_builder.add_edge("end", END)

    return graph_builder.compile()


workflow_case_study_graph = build_workflow_case_study_graph()


def run_workflow_case_study(
    article_title: str,
    source_url: str,
    content: str,
) -> Dict[str, Any]:
    """Run complete workflow case study.

    Args:
        article_title: Title of the article
        source_url: Source URL for domain verification
        content: Article content text

    Returns:
        Final workflow state with complete audit trail
    """
    graph = build_workflow_case_study_graph()
    initial: WorkflowState = {
        "article_title": article_title,
        "source_url": source_url,
        "content": content,
        "allowlist": load_allowlist(),
    }
    return graph.invoke(initial)


if __name__ == "__main__":
    article_title = "Bell County Commissioners Approve New Legal Resource Center"
    article_source = "killeendailyherald.com"
    article_content = """
    The Bell County Commissioners Court met on February 11, 2026 to discuss 
    emerging community legal services. The commissioners approved funding for 
    a new centralized legal resource center to serve residents across Bell County.
    
    The center will provide access to legal information, referral services, and 
    educational materials. It will complement existing services provided by the 
    Texas Attorney General's office and the State Bar of Texas.
    
    County Judge noted the importance of ensuring equitable access 
    to legal information for all county residents. The center is expected to open 
    by Q3 2026.
    """

    print("=" * 70)
    print("WORKFLOW CASE STUDY: Article Integration")
    print("=" * 70)

    result = run_workflow_case_study(article_title, article_source, article_content)

    print(f"\nWorkflow ID: {result.get('workflow_id')}")
    print(f"Article ID: {result.get('article_id')}")
    print(f"Decision: {result.get('decision', {}).get('final_decision')}")
    print(
        f"Validation: {'PASSED' if result.get('validation', {}).get('all_passed') else 'FAILED'}"
    )
    print(f"Transitions: {len(result.get('transitions', []))}")

    print("\nState Transitions:")
    for t in result.get("transitions", []):
        print(f"  {t['from']:12} → {t['to']:12} ({t['event']})")
