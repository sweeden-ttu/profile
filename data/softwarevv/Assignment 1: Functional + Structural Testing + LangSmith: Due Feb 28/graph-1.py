"""LangGraph integrated graph template.

This module provides the main graph that integrates all demos and assignments:
- Demo 1: Heuristic routing for customer feedback
- Demo 2: LLM-based routing with Ollama
- Demo 2 LangSmith: LLM routing with LangSmith tracing
- Quiz 1: Vague Specification Detection Agent
- Quiz 1 LangSmith: Vague Spec Detection with LangSmith tracing
- LangSmith Demo: Content validation pipeline with allowlist verification
- Workflow Case Study: Bell County news article integration workflow
"""

from __future__ import annotations

from typing import Any, Dict, Literal

from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict

from agent.demo1_graph import (
    Demo1State,
    demo1_graph,
    build_demo1_graph,
)
from agent.demo2_graph import (
    Demo2State,
    demo2_graph,
    build_demo2_graph,
)
from agent.demo2_langsmith_graph import (
    Demo2LangSmithState,
    demo2_langsmith_graph,
    build_demo2_langsmith_graph,
)
from agent.quiz1_graph import (
    Quiz1State,
    quiz1_graph,
    build_quiz1_graph,
)
from agent.quiz1_langsmith_graph import (
    Quiz1LangSmithState,
    quiz1_langsmith_graph,
    build_quiz1_langsmith_graph,
)
from agent.langsmith_demo import (
    ValidationState,
    langsmith_demo_graph,
    build_langsmith_demo_graph,
    run_validation_pipeline,
)
from agent.workflow_case_study import (
    WorkflowState,
    workflow_case_study_graph,
    build_workflow_case_study_graph,
    run_workflow_case_study,
)


GraphType = Literal[
    "demo1",
    "demo2",
    "demo2_langsmith",
    "quiz1",
    "quiz1_langsmith",
    "langsmith_demo",
    "workflow_case_study",
]


class Context(TypedDict):
    """Context parameters for the integrated agent."""

    graph_type: GraphType
    my_configurable_param: str


class State(TypedDict):
    """Input state for the integrated agent."""

    graph_type: GraphType
    payload: list[dict]
    specification: str
    source_text: str
    source_url: str
    article_title: str
    content: str
    result: Dict[str, Any]


def route_to_graph(state: State) -> str:
    """Route to the appropriate graph based on graph_type."""
    return state.get("graph_type", "demo1")


def run_demo1(state: State) -> Dict[str, Any]:
    """Run Demo 1 graph."""
    graph = build_demo1_graph()
    result = graph.invoke({"payload": state["payload"]})
    return {"result": result}


def run_demo2(state: State) -> Dict[str, Any]:
    """Run Demo 2 graph."""
    graph = build_demo2_graph()
    result = graph.invoke({"payload": state["payload"]})
    return {"result": result}


def run_demo2_langsmith(state: State) -> Dict[str, Any]:
    """Run Demo 2 LangSmith graph."""
    graph = build_demo2_langsmith_graph()
    result = graph.invoke({"payload": state["payload"]})
    return {"result": result}


def run_quiz1(state: State) -> Dict[str, Any]:
    """Run Quiz 1 graph."""
    graph = build_quiz1_graph()
    result = graph.invoke({"specification": state["specification"]})
    return {"result": result}


def run_quiz1_langsmith(state: State) -> Dict[str, Any]:
    """Run Quiz 1 LangSmith graph."""
    graph = build_quiz1_langsmith_graph()
    result = graph.invoke({"specification": state["specification"]})
    return {"result": result}


def run_langsmith_demo(state: State) -> Dict[str, Any]:
    """Run LangSmith validation demo."""
    result = run_validation_pipeline(
        source_text=state.get("source_text", ""),
        source_url=state.get("source_url", ""),
    )
    return {"result": result}


def run_workflow_case_study_node(state: State) -> Dict[str, Any]:
    """Run workflow case study."""
    result = run_workflow_case_study(
        article_title=state.get("article_title", ""),
        source_url=state.get("source_url", ""),
        content=state.get("content", ""),
    )
    return {"result": result}


graph = (
    StateGraph(State, context_schema=Context)
    .add_node("demo1", run_demo1)
    .add_node("demo2", run_demo2)
    .add_node("demo2_langsmith", run_demo2_langsmith)
    .add_node("quiz1", run_quiz1)
    .add_node("quiz1_langsmith", run_quiz1_langsmith)
    .add_node("langsmith_demo", run_langsmith_demo)
    .add_node("workflow_case_study", run_workflow_case_study_node)
    .add_conditional_edges(
        START,
        route_to_graph,
        {
            "demo1": "demo1",
            "demo2": "demo2",
            "demo2_langsmith": "demo2_langsmith",
            "quiz1": "quiz1",
            "quiz1_langsmith": "quiz1_langsmith",
            "langsmith_demo": "langsmith_demo",
            "workflow_case_study": "workflow_case_study",
        },
    )
    .add_edge("demo1", END)
    .add_edge("demo2", END)
    .add_edge("demo2_langsmith", END)
    .add_edge("quiz1", END)
    .add_edge("quiz1_langsmith", END)
    .add_edge("langsmith_demo", END)
    .add_edge("workflow_case_study", END)
    .compile(name="Integrated LangGraph")
)

__all__ = [
    "graph",
    "demo1_graph",
    "demo2_graph",
    "demo2_langsmith_graph",
    "quiz1_graph",
    "quiz1_langsmith_graph",
    "langsmith_demo_graph",
    "workflow_case_study_graph",
    "build_demo1_graph",
    "build_demo2_graph",
    "build_demo2_langsmith_graph",
    "build_quiz1_graph",
    "build_quiz1_langsmith_graph",
    "build_langsmith_demo_graph",
    "build_workflow_case_study_graph",
    "run_validation_pipeline",
    "run_workflow_case_study",
    "Demo1State",
    "Demo2State",
    "Demo2LangSmithState",
    "Quiz1State",
    "Quiz1LangSmithState",
    "ValidationState",
    "WorkflowState",
    "State",
    "Context",
    "GraphType",
]
