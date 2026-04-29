"""LangGraph experiments and pipelines for Texas legal data processing.

This module provides LangGraph-based workflows for processing and analyzing
Texas legal datasets from various sources.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

from langgraph.graph import StateGraph
from langgraph.runtime import Runtime
from typing_extensions import TypedDict

from agent.data_loader import (
    DEFAULT_DATA_DIR,
    TexasLegalDataLoader,
    get_data_loader,
)
from agent.validation import (
    run_validation_pipeline,
)


# ============================================================
# State Definitions
# ============================================================


class ExperimentContext(TypedDict, total=False):
    """Context parameters for experiments."""

    data_dir: str
    experiment_name: str
    min_quality_score: float


class ExperimentState(TypedDict):
    """State for the experiment graph.

    This defines the data structure that flows through the graph nodes.
    """

    # Input parameters
    experiment_name: str
    data_dir: str
    
    # Processing results
    datasets_loaded: bool
    legal_datasets: List[Dict[str, Any]]
    news_items: List[Dict[str, Any]]
    comptroller_data: Dict[str, Any]
    
    # Validation results
    validation_results: Dict[str, Any]
    validation_passed: bool
    
    # Categorization results
    categorized_datasets: Dict[str, List[Dict[str, Any]]]
    high_priority_datasets: List[Dict[str, Any]]
    
    # Analysis results
    quality_scores: List[Dict[str, Any]]
    average_quality_score: float
    
    # Output
    experiment_results: Dict[str, Any]
    errors: List[str]


# ============================================================
# Graph Nodes
# ============================================================


async def load_datasets(
    state: ExperimentState, runtime: Runtime[ExperimentContext]
) -> Dict[str, Any]:
    """Load all datasets from the data directory.

    Args:
        state: Current experiment state.
        runtime: Runtime context with configuration.

    Returns:
        Updated state with loaded datasets.
    """
    data_dir = state.get("data_dir", str(DEFAULT_DATA_DIR))
    loader = TexasLegalDataLoader(Path(data_dir))
    
    errors = []
    legal_datasets = []
    news_items = []
    comptroller_data = {}
    
    try:
        legal_data = loader.load_legal_datasets()
        # Extract datasets from the nested structure
        datasets_dict = legal_data.get("datasets", {})
        for category, dataset_list in datasets_dict.items():
            for ds in dataset_list:
                ds_copy = dict(ds)
                ds_copy["category"] = category
                legal_datasets.append(ds_copy)
    except Exception as e:
        errors.append(f"Failed to load legal datasets: {str(e)}")
    
    try:
        news_items = loader.load_news_feed().get("all_items", [])
    except Exception as e:
        errors.append(f"Failed to load news feed: {str(e)}")
    
    try:
        comptroller_data = loader.load_comptroller_forms()
    except Exception as e:
        errors.append(f"Failed to load comptroller forms: {str(e)}")
    
    return {
        "datasets_loaded": len(legal_datasets) > 0,
        "legal_datasets": legal_datasets,
        "news_items": news_items,
        "comptroller_data": comptroller_data,
        "errors": errors,
    }


def validate_content(
    state: ExperimentState, runtime: Runtime[ExperimentContext]
) -> Dict[str, Any]:
    """Validate loaded content using the validation pipeline.

    Args:
        state: Current experiment state.
        runtime: Runtime context with configuration.

    Returns:
        Updated state with validation results.
    """
    legal_datasets = state.get("legal_datasets", [])
    news_items = state.get("news_items", [])
    comptroller_data = state.get("comptroller_data", {})
    
    # Run the validation pipeline
    validation_results = run_validation_pipeline(
        datasets=legal_datasets,
        news_items=news_items,
        comptroller_data=comptroller_data,
    )
    
    return {
        "validation_results": validation_results,
        "validation_passed": validation_results.get("overall_valid", False),
    }


def categorize_datasets(
    state: ExperimentState, runtime: Runtime[ExperimentContext]
) -> Dict[str, Any]:
    """Categorize datasets into legal categories.

    Args:
        state: Current experiment state.
        runtime: Runtime context with configuration.

    Returns:
        Updated state with categorized datasets.
    """
    legal_datasets = state.get("legal_datasets", [])
    
    # Define categorization rules based on tags and names
    categories = {
        "LAW_VERIFICATION": [],
        "NEWS": [],
        "ATTORNEY_RESOURCE": [],
        "CRIMINAL_JUSTICE": [],
        "ENVIRONMENTAL": [],
        "OTHER": [],
    }
    
    for ds in legal_datasets:
        tags = [t.lower() for t in ds.get("tags", [])]
        name = ds.get("name", "").lower()
        description = ds.get("description", "").lower()
        category = ds.get("category", "")
        
        # Categorize based on keywords
        if any(kw in tags or kw in name for kw in ["tdcj", "inmate", "prison", "criminal", "release", "incarcerated"]):
            categories["CRIMINAL_JUSTICE"].append(ds)
        elif any(kw in tags or kw in name for kw in ["environment", "sso", "sanitary", "wastewater"]):
            categories["ENVIRONMENTAL"].append(ds)
        elif any(kw in tags or kw in name for kw in ["license", "broker", "attorney", "agent"]):
            categories["ATTORNEY_RESOURCE"].append(ds)
        elif any(kw in tags or kw in name for kw in ["school", "nutrition", "procurement", "administrative"]):
            categories["NEWS"].append(ds)
        elif category or any(kw in tags for kw in ["law", "legal", "dfps", "cps", "victim"]):
            categories["LAW_VERIFICATION"].append(ds)
        else:
            categories["OTHER"].append(ds)
    
    # Get high priority datasets based on quality
    min_score = (runtime.context or {}).get("min_quality_score", 70.0)
    high_priority = [ds for ds in legal_datasets if ds.get("quality_score", 0) >= min_score]
    
    return {
        "categorized_datasets": categories,
        "high_priority_datasets": high_priority,
    }


def analyze_quality(
    state: ExperimentState, runtime: Runtime[ExperimentContext]
) -> Dict[str, Any]:
    """Analyze dataset quality scores.

    Args:
        state: Current experiment state.
        runtime: Runtime context with configuration.

    Returns:
        Updated state with quality analysis.
    """
    legal_datasets = state.get("legal_datasets", [])
    
    # Calculate quality scores for each dataset
    quality_scores = []
    for ds in legal_datasets:
        score = 0
        metrics = {}
        
        # Has description
        if ds.get("description"):
            score += 30
            metrics["hasDescription"] = True
            metrics["descLength"] = len(ds.get("description", ""))
        else:
            metrics["hasDescription"] = False
            metrics["descLength"] = 0
        
        # Has tags
        if ds.get("tags"):
            score += 20
            metrics["hasTags"] = True
        else:
            metrics["hasTags"] = False
        
        # View count factor (log scale)
        view_count = ds.get("viewCount", 0)
        if view_count > 0:
            score += min(20, int(10 * (1 + (view_count / 1000))))
        metrics["viewCount"] = view_count
        
        # Download count factor (log scale)
        download_count = ds.get("downloadCount", 0)
        if download_count > 0:
            score += min(30, int(15 * (1 + (download_count / 1000))))
        metrics["downloadCount"] = download_count
        
        quality_scores.append({
            "id": ds.get("id", ""),
            "name": ds.get("name", ""),
            "qualityScore": score,
            "metrics": metrics,
        })
    
    # Calculate average score
    total = sum(qs["qualityScore"] for qs in quality_scores)
    avg_score = total / len(quality_scores) if quality_scores else 0
    
    return {
        "quality_scores": quality_scores,
        "average_quality_score": avg_score,
    }


def generate_results(
    state: ExperimentState, runtime: Runtime[ExperimentContext]
) -> Dict[str, Any]:
    """Generate final experiment results.

    Args:
        state: Current experiment state.
        runtime: Runtime context with configuration.

    Returns:
        Updated state with experiment results.
    """
    experiment_name = state.get("experiment_name", "Texas Legal Data Experiment")
    
    results = {
        "experiment_name": experiment_name,
        "status": "completed",
        "summary": {
            "total_datasets": len(state.get("legal_datasets", [])),
            "total_news_items": len(state.get("news_items", [])),
            "categories": {k: len(v) for k, v in state.get("categorized_datasets", {}).items()},
            "high_priority_count": len(state.get("high_priority_datasets", [])),
            "average_quality_score": state.get("average_quality_score", 0),
            "validation_passed": state.get("validation_passed", False),
        },
        "validation": state.get("validation_results", {}),
        "top_datasets": state.get("high_priority_datasets", [])[:10],
        "errors": state.get("errors", []),
    }
    
    return {
        "experiment_results": results,
    }


# ============================================================
# Graph Compilation
# ============================================================


# Define the experiment graph
experiment_graph = (
    StateGraph(ExperimentState, context_schema=ExperimentContext)
    .add_node("load_datasets", load_datasets)
    .add_node("validate_content", validate_content)
    .add_node("categorize_datasets", categorize_datasets)
    .add_node("analyze_quality", analyze_quality)
    .add_node("generate_results", generate_results)
    .add_edge("__start__", "load_datasets")
    .add_edge("load_datasets", "validate_content")
    .add_edge("validate_content", "categorize_datasets")
    .add_edge("categorize_datasets", "analyze_quality")
    .add_edge("analyze_quality", "generate_results")
    .compile(name="texas_legal_experiment")
)


# ============================================================
# Experiment Runner
# ============================================================


@dataclass
class ExperimentConfig:
    """Configuration for an experiment run."""

    experiment_name: str = "Texas Legal Data Experiment"
    data_dir: str = str(DEFAULT_DATA_DIR)
    min_quality_score: float = 70.0


@dataclass
class ExperimentResult:
    """Results from an experiment run."""

    experiment_name: str
    status: str
    summary: Dict[str, Any]
    top_datasets: List[Dict[str, Any]]
    errors: List[str]


async def run_experiment(config: Optional[ExperimentConfig] = None) -> ExperimentResult:
    """Run the Texas legal data experiment.

    Args:
        config: Optional experiment configuration.

    Returns:
        ExperimentResult with the experiment outcomes.
    """
    if config is None:
        config = ExperimentConfig()
    
    # Prepare initial state
    initial_state: ExperimentState = {
        "experiment_name": config.experiment_name,
        "data_dir": config.data_dir,
        "datasets_loaded": False,
        "legal_datasets": [],
        "news_items": [],
        "comptroller_data": {},
        "validation_results": {},
        "validation_passed": False,
        "categorized_datasets": {},
        "high_priority_datasets": [],
        "quality_scores": [],
        "average_quality_score": 0.0,
        "experiment_results": {},
        "errors": [],
    }
    
    # Prepare context
    context: ExperimentContext = {
        "data_dir": config.data_dir,
        "experiment_name": config.experiment_name,
        "min_quality_score": config.min_quality_score,
    }
    
    # Run the graph
    result = await experiment_graph.ainvoke(
        initial_state,
        config=context,
    )
    
    experiment_results = result.get("experiment_results", {})
    
    return ExperimentResult(
        experiment_name=experiment_results.get("experiment_name", config.experiment_name),
        status=experiment_results.get("status", "unknown"),
        summary=experiment_results.get("summary", {}),
        top_datasets=experiment_results.get("top_datasets", []),
        errors=experiment_results.get("errors", []),
    )
