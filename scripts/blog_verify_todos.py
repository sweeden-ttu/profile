#!/usr/bin/env python3
"""
Scan Jekyll blog posts for unfinished placeholder content and emit a TODO report.

- Looks for bracketed placeholders like `[Content to be written]`, `[Introduction content]`, etc.
- Writes a markdown TODO report summarizing all findings.
- Optionally sends a JSON payload to an SSE/event endpoint if BLOG_SSE_ENDPOINT is set.
"""

from __future__ import annotations

import datetime as _dt
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List


ROOT_DIR = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT_DIR / "_posts"
REPORT_DIR = ROOT_DIR / "analysis_output"
REPORT_PATH = REPORT_DIR / "blog_todo_report.md"

# Match bracketed placeholders, e.g. [Content to be written]
_BRACKET_RE = re.compile(r"\[(.+?)\]")


def _current_branch() -> str:
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=str(ROOT_DIR),
            stderr=subprocess.DEVNULL,
        )
        return out.decode("utf-8", errors="replace").strip()
    except Exception:
        return "unknown"


def _is_placeholder(line: str, match_start: int, match_text: str) -> bool:
    """
    Heuristic to distinguish placeholders from markdown links.
    We treat as a TODO placeholder if:
    - the bracketed text contains words like 'content', 'todo', 'write', OR
    - the following non-space character after ']' is not '(' (i.e. not `[text](url)`).
    """
    # If this is immediately followed by '(' it's almost certainly a link label.
    end_index = match_start + len(match_text) + 2  # +2 for the surrounding brackets
    if end_index < len(line) and line[end_index] == "(":
        return False

    lowered = match_text.lower()
    keywords = ("content", "todo", "write", "tbd", "fill in", "to be written")
    return any(k in lowered for k in keywords)


def scan_posts() -> List[Dict[str, Any]]:
    todos: List[Dict[str, Any]] = []

    if not POSTS_DIR.exists():
        return todos

    for md_path in sorted(POSTS_DIR.glob("*.md")):
        try:
            text = md_path.read_text(encoding="utf-8")
        except Exception as exc:  # pragma: no cover - defensive
            print(f"[blog_verify_todos] Skipping {md_path}: {exc}", file=sys.stderr)
            continue

        rel_path = md_path.relative_to(ROOT_DIR).as_posix()
        for lineno, line in enumerate(text.splitlines(), start=1):
            for match in _BRACKET_RE.finditer(line):
                placeholder = match.group(1).strip()
                if not placeholder:
                    continue
                if not _is_placeholder(line, match.start(), placeholder):
                    continue

                todos.append(
                    {
                        "file": rel_path,
                        "line": lineno,
                        "placeholder": placeholder,
                    }
                )

    return todos


def write_report(todos: List[Dict[str, Any]], branch: str) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    now = _dt.datetime.now().astimezone()
    ts = now.isoformat()

    lines = []
    lines.append("# Blog TODO Report")
    lines.append("")
    lines.append(f"- Generated at: {ts}")
    lines.append(f"- Git branch: `{branch}`")
    lines.append(f"- Total TODO placeholders found: **{len(todos)}**")
    lines.append("")

    if not todos:
        lines.append("No unfinished placeholder content detected in `_posts/`.")
    else:
        lines.append("| File | Line | Placeholder |")
        lines.append("|------|------|-------------|")
        for item in todos:
            lines.append(
                f"| `{item['file']}` | {item['line']} | `{item['placeholder']}` |"
            )

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def emit_sse(todos: List[Dict[str, Any]], branch: str) -> None:
    """
    Optionally send a JSON payload describing the TODOs to an SSE/event gateway.

    Configure via:
      - BLOG_SSE_ENDPOINT: URL to POST JSON payload to (e.g. http://localhost:3002/events)
    """
    endpoint = os.environ.get("BLOG_SSE_ENDPOINT")
    if not endpoint:
        return

    payload = {
        "event": "blog.todo.detected",
        "branch": branch,
        "generated_at": _dt.datetime.now().astimezone().isoformat(),
        "todos": todos,
    }

    try:
        import urllib.request

        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:  # nosec B310
            # Best-effort: ignore body, just ensure request succeeds.
            _ = resp.read()
    except Exception as exc:  # pragma: no cover - network best-effort
        print(f"[blog_verify_todos] SSE emission failed: {exc}", file=sys.stderr)


def main(argv: List[str] | None = None) -> int:
    branch = _current_branch()
    todos = scan_posts()
    write_report(todos, branch)
    emit_sse(todos, branch)

    # Also print a concise summary for git hook logs.
    print(
        f"[blog_verify_todos] Found {len(todos)} TODO placeholder(s) in _posts/ on branch {branch}"
    )
    print(f"[blog_verify_todos] Report written to: {REPORT_PATH.relative_to(ROOT_DIR)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

