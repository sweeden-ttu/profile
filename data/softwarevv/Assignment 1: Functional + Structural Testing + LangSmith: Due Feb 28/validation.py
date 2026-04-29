"""Content validation pipeline for Texas legal data.

This module provides validation functions for:
- Dataset metadata validation
- News item validation
- Specification/content validation
- Data integrity checks
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


# ============================================================
# Validation Result Types
# ============================================================


@dataclass
class ValidationIssue:
    """A single validation issue."""

    field: str
    severity: str  # "error", "warning", "info"
    message: str
    value: Any = None


@dataclass
class ValidationResult:
    """Result of a validation operation."""

    is_valid: bool
    issues: List[ValidationIssue]
    validated_count: int = 0
    failed_count: int = 0

    def add_issue(self, issue: ValidationIssue):
        """Add a validation issue."""
        self.issues.append(issue)
        if issue.severity == "error":
            self.is_valid = False
            self.failed_count += 1

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "is_valid": self.is_valid,
            "validated_count": self.validated_count,
            "failed_count": self.failed_count,
            "issues": [
                {
                    "field": i.field,
                    "severity": i.severity,
                    "message": i.message,
                    "value": str(i.value) if i.value is not None else None,
                }
                for i in self.issues
            ],
        }


# ============================================================
# Dataset Validation
# ============================================================


def validate_dataset(dataset: Dict[str, Any]) -> ValidationResult:
    """Validate a single dataset.

    Args:
        dataset: Dataset dictionary to validate.

    Returns:
        ValidationResult with any issues found.
    """
    result = ValidationResult(is_valid=True, issues=[])

    # Required fields
    required_fields = ["id", "name", "description"]
    for field in required_fields:
        if not dataset.get(field):
            result.add_issue(
                ValidationIssue(
                    field=field,
                    severity="error",
                    message=f"Missing required field: {field}",
                    value=dataset.get(field),
                )
            )

    # Validate name length
    name = dataset.get("name", "")
    if name and len(name) < 3:
        result.add_issue(
            ValidationIssue(
                field="name",
                severity="warning",
                message="Name seems too short",
                value=name,
            )
        )

    # Validate description
    description = dataset.get("description", "")
    if description:
        if len(description) < 10:
            result.add_issue(
                ValidationIssue(
                    field="description",
                    severity="warning",
                    message="Description is very short",
                    value=description[:50],
                )
            )
    else:
        result.add_issue(
            ValidationIssue(
                field="description",
                severity="warning",
                message="Missing description",
                value=None,
            )
        )

    # Validate tags
    tags = dataset.get("tags", [])
    if not tags or len(tags) == 0:
        result.add_issue(
            ValidationIssue(
                field="tags",
                severity="info",
                message="No tags provided",
                value=tags,
            )
        )

    # Validate view/download counts
    view_count = dataset.get("viewCount", 0)
    if view_count < 0:
        result.add_issue(
            ValidationIssue(
                field="viewCount",
                severity="error",
                message="View count cannot be negative",
                value=view_count,
            )
        )

    download_count = dataset.get("downloadCount", 0)
    if download_count < 0:
        result.add_issue(
            ValidationIssue(
                field="downloadCount",
                severity="error",
                message="Download count cannot be negative",
                value=download_count,
            )
        )

    # Validate URL format
    url = dataset.get("url", "")
    if url and not _is_valid_url(url):
        result.add_issue(
            ValidationIssue(
                field="url",
                severity="warning",
                message="URL may not be valid",
                value=url,
            )
        )

    result.validated_count = 1
    return result


def validate_datasets(datasets: List[Dict[str, Any]]) -> ValidationResult:
    """Validate a list of datasets.

    Args:
        datasets: List of dataset dictionaries.

    Returns:
        ValidationResult with aggregated issues.
    """
    result = ValidationResult(is_valid=True, issues=[])

    for dataset in datasets:
        dataset_result = validate_dataset(dataset)
        result.issues.extend(dataset_result.issues)
        if not dataset_result.is_valid:
            result.is_valid = False
            result.failed_count += 1

    result.validated_count = len(datasets)
    return result


# ============================================================
# News Item Validation
# ============================================================


def validate_news_item(item: Dict[str, Any]) -> ValidationResult:
    """Validate a single news item.

    Args:
        item: News item dictionary to validate.

    Returns:
        ValidationResult with any issues found.
    """
    result = ValidationResult(is_valid=True, issues=[])

    # Required fields for news items
    required_fields = ["title", "link"]
    for field in required_fields:
        if not item.get(field):
            result.add_issue(
                ValidationIssue(
                    field=field,
                    severity="error",
                    message=f"Missing required field: {field}",
                    value=item.get(field),
                )
            )

    # Validate title
    title = item.get("title", "")
    if title and len(title) < 5:
        result.add_issue(
            ValidationIssue(
                field="title",
                severity="warning",
                message="Title seems too short",
                value=title,
            )
        )

    # Validate link
    link = item.get("link", "")
    if link and not _is_valid_url(link):
        result.add_issue(
            ValidationIssue(
                field="link",
                severity="warning",
                message="Link may not be valid",
                value=link,
            )
        )

    # Check for pubDate
    if not item.get("pubDate"):
        result.add_issue(
            ValidationIssue(
                field="pubDate",
                severity="info",
                message="No publication date provided",
                value=None,
            )
        )

    result.validated_count = 1
    return result


def validate_news_items(items: List[Dict[str, Any]]) -> ValidationResult:
    """Validate a list of news items.

    Args:
        items: List of news item dictionaries.

    Returns:
        ValidationResult with aggregated issues.
    """
    result = ValidationResult(is_valid=True, issues=[])

    for item in items:
        item_result = validate_news_item(item)
        result.issues.extend(item_result.issues)
        if not item_result.is_valid:
            result.is_valid = False
            result.failed_count += 1

    result.validated_count = len(items)
    return result


# ============================================================
# Specification Validation
# ============================================================


# Vague terms that indicate unclear specifications
VAGUE_TERMS = {
    "fast": "response time should be specified (e.g., < 200ms)",
    "easy": "should specify measurable criteria (e.g., <= 3 clicks)",
    "high-quality": "should reference specific standards (e.g., ISO 9001)",
    "timely": "should specify timeframe (e.g., within 2 business days)",
    "as appropriate": "should reference specific criteria or protocol",
    "secure": "should specify security standard (e.g., TLS 1.3)",
    "user-friendly": "should specify measurable usability (e.g., score >= 4.5/5)",
    "efficient": "should specify resource limits (e.g., < 80% CPU)",
    "robust": "should specify reliability metrics (e.g., 99.9% uptime)",
    "scalable": "should specify load capacity (e.g., 10x current load)",
    "reasonable": "should define specific criteria",
    "adequate": "should define measurable thresholds",
    "appropriate": "should specify what is appropriate in context",
    "sufficient": "should define sufficient quantity",
    "minimal": "should specify exact minimum",
    "optimal": "should define optimization criteria",
    "modern": "should specify technology standards",
    "reliable": "should specify reliability metrics",
    "accurate": "should define accuracy thresholds",
    "comprehensive": "should define coverage criteria",
}


def validate_specification(specification: str) -> ValidationResult:
    """Validate a specification for vague language.

    Args:
        specification: The specification text to validate.

    Returns:
        ValidationResult with any vague terms found.
    """
    result = ValidationResult(is_valid=True, issues=[])

    if not specification:
        result.add_issue(
            ValidationIssue(
                field="specification",
                severity="error",
                message="Specification is empty",
                value=None,
            )
        )
        result.validated_count = 1
        return result

    spec_lower = specification.lower()

    # Check for vague terms
    for term, suggestion in VAGUE_TERMS.items():
        if term in spec_lower:
            result.add_issue(
                ValidationIssue(
                    field=term,
                    severity="warning",
                    message=f"Vague term '{term}' found. {suggestion}",
                    value=term,
                )
            )

    # Check for missing metrics
    has_numbers = bool(re.search(r"\d+", specification))
    has_timeframe = bool(
        re.search(r"(second|minute|hour|day|week|month|year|ms|s|m|h|d|w)", spec_lower)
    )
    has_percentage = bool(re.search(r"\d+%", specification))

    if not has_numbers:
        result.add_issue(
            ValidationIssue(
                field="metrics",
                severity="info",
                message="No numeric values found - specification may lack measurable criteria",
                value=None,
            )
        )

    if not has_timeframe and not has_percentage:
        result.add_issue(
            ValidationIssue(
                field="criteria",
                severity="info",
                message="No specific timeframes or percentages found",
                value=None,
            )
        )

    # Set valid if only warnings/info (no errors)
    has_errors = any(issue.severity == "error" for issue in result.issues)
    result.is_valid = not has_errors

    result.validated_count = 1
    return result


def validate_specifications(specifications: List[str]) -> ValidationResult:
    """Validate multiple specifications.

    Args:
        specifications: List of specification strings.

    Returns:
        ValidationResult with aggregated issues.
    """
    result = ValidationResult(is_valid=True, issues=[])

    for spec in specifications:
        spec_result = validate_specification(spec)
        result.issues.extend(spec_result.issues)
        if not spec_result.is_valid:
            result.is_valid = False
            result.failed_count += 1

    result.validated_count = len(specifications)
    return result


# ============================================================
# Data Integrity Validation
# ============================================================


def validate_data_integrity(
    datasets: List[Dict[str, Any]],
    news_items: List[Dict[str, Any]],
    comptroller_data: Dict[str, Any],
) -> ValidationResult:
    """Validate overall data integrity across all sources.

    Args:
        datasets: List of legal datasets.
        news_items: List of news items.
        comptroller_data: Comptroller forms data.

    Returns:
        ValidationResult with integrity issues.
    """
    result = ValidationResult(is_valid=True, issues=[])

    # Check for duplicate dataset IDs
    dataset_ids = [ds.get("id") for ds in datasets if ds.get("id")]
    duplicate_ids = [id for id in dataset_ids if dataset_ids.count(id) > 1]
    if duplicate_ids:
        result.add_issue(
            ValidationIssue(
                field="datasets",
                severity="error",
                message=f"Duplicate dataset IDs found: {set(duplicate_ids)}",
                value=list(set(duplicate_ids)),
            )
        )

    # Check for empty categories
    if not datasets:
        result.add_issue(
            ValidationIssue(
                field="datasets",
                severity="error",
                message="No datasets found",
                value=None,
            )
        )

    if not news_items:
        result.add_issue(
            ValidationIssue(
                field="news_items",
                severity="warning",
                message="No news items found",
                value=None,
            )
        )

    # Validate data source consistency
    for ds in datasets:
        if ds.get("category") == "NEWS" and not any(
            kw in ds.get("name", "").lower()
            for kw in ["school", "nutrition", "procurement", "administrative"]
        ):
            result.add_issue(
                ValidationIssue(
                    field="category",
                    severity="warning",
                    message=f"Dataset '{ds.get('name')}' may be miscategorized as NEWS",
                    value=ds.get("category"),
                )
            )

    result.validated_count = 1
    return result


# ============================================================
# Helper Functions
# ============================================================


def _is_valid_url(url: str) -> bool:
    """Check if a string is a valid URL."""
    url_pattern = re.compile(
        r"^https?://"  # http:// or https://
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"  # domain
        r"localhost|"  # localhost
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # IP
        r"(?::\d+)?"  # optional port
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE,
    )
    return bool(url_pattern.match(url))


# ============================================================
# Validation Pipeline Integration
# ============================================================


def run_validation_pipeline(
    datasets: List[Dict[str, Any]],
    news_items: List[Dict[str, Any]],
    comptroller_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Run the complete validation pipeline.

    Args:
        datasets: List of legal datasets.
        news_items: List of news items.
        comptroller_data: Comptroller forms data.

    Returns:
        Dictionary with all validation results.
    """
    results = {}

    # Validate datasets
    dataset_validation = validate_datasets(datasets)
    results["datasets"] = dataset_validation.to_dict()

    # Validate news items
    news_validation = validate_news_items(news_items)
    results["news_items"] = news_validation.to_dict()

    # Validate data integrity
    integrity_validation = validate_data_integrity(datasets, news_items, comptroller_data)
    results["integrity"] = integrity_validation.to_dict()

    # Overall validation status
    results["overall_valid"] = all(
        [
            dataset_validation.is_valid,
            news_validation.is_valid,
            integrity_validation.is_valid,
        ]
    )

    return results
