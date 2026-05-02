"""Vague spec agent for TOT folder: crawl .tex files and detect vague specifications.

Uses Granite via Ollama at OLLAMA_BASE_URL to analyze LaTeX homework/assignment files
and identify vague specifications, adding clarifications or questions.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing_extensions import TypedDict

from dotenv import load_dotenv

_agent_dir = Path(__file__).resolve().parent
_project_dir = _agent_dir.parent.parent
if (_project_dir / ".env").is_file():
    load_dotenv(_project_dir / ".env")
if (_agent_dir / ".env").is_file():
    load_dotenv(_agent_dir / ".env", override=True)
if not (_project_dir / ".env").is_file() and not (_agent_dir / ".env").is_file():
    load_dotenv()

os.environ.setdefault("OLLAMA_BASE_URL", "http://127.0.0.1:37659")

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage


def get_llm():
    """Get Granite (Ollama) LLM at http://127.0.0.1:37659/."""
    base_url = (
        os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:37659").strip().rstrip("/")
    )
    try:
        from langchain_ollama import ChatOllama

        return ChatOllama(model="granite4:3b", base_url=base_url, temperature=0)
    except Exception:
        return None


class VagueSpecState(TypedDict):
    content: str
    file_path: str
    is_vague: bool
    vague_items: list
    clarifications: str


def extract_tex_content(file_path: Path) -> str:
    """Extract readable text content from LaTeX file, excluding commands and environments."""
    content = file_path.read_text(encoding="utf-8")

    import re

    lines = content.split("\n")
    result_lines = []
    in_item = False

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("\\item"):
            in_item = True
            result_lines.append(stripped)
        elif stripped.startswith("\\end") or stripped.startswith("\\begin"):
            result_lines.append(stripped)
        elif stripped.startswith("%"):
            continue
        elif stripped.startswith("\\"):
            result_lines.append(stripped)
        elif in_item:
            result_lines.append(stripped)

    return "\n".join(result_lines[:500])


def analyze_vagueness(state: VagueSpecState) -> dict:
    """Analyze LaTeX content for vague specifications."""
    content = state["content"]
    llm = get_llm()

    if llm:
        messages = [
            SystemMessage(
                content="""You are a specification analyzer for computer science homework assignments in LaTeX.
Analyze the content and identify vague or unclear specifications that a student might struggle with.
Look for:
- Missing definitions or unclear terminology
- Ambiguous requirements
- Unspecified behavior or expectations
- Missing examples or edge cases
- Unclear grading criteria

Respond with a list of vague items, each on its own line starting with a number.
If no vague items found, respond with "NONE"."""
            ),
            HumanMessage(content=content[:6000]),
        ]
        response = llm.invoke(messages)
        vague_text = response.content.strip()

        if vague_text.upper() == "NONE":
            vague_items = []
        else:
            vague_items = [
                line.strip() for line in vague_text.split("\n") if line.strip()
            ]
    else:
        vague_items = ["LLM not available"]

    is_vague = len(vague_items) > 0
    return {"is_vague": is_vague, "vague_items": vague_items}


def generate_clarifications(state: VagueSpecState) -> dict:
    """Generate clarifications or questions for vague items."""
    vague_items = state.get("vague_items", [])
    file_path = state["file_path"]
    llm = get_llm()

    if not vague_items:
        return {"clarifications": "No vague items identified."}

    vague_text = "\n".join(f"{i + 1}. {item}" for i, item in enumerate(vague_items))

    if llm:
        messages = [
            SystemMessage(
                content="""You are a teaching assistant. For each vague item identified in a CS homework assignment,
provide clarification questions that help clarify the requirement.
Format your response as:
## Clarifications for {filename}

### Item 1: [original vague item]
**Clarification:** [question to ask instructor]
**Suggested interpretation:** [how to approach this]

Keep responses concise and helpful for a student."""
            ),
            HumanMessage(content=f"File: {file_path}\n\nVague items:\n{vague_text}"),
        ]
        response = llm.invoke(messages)
        clarifications = response.content.strip()
    else:
        clarifications = f"Clarifications for {file_path}:\n" + "\n".join(
            f"- {item}" for item in vague_items
        )

    return {"clarifications": clarifications}


def build_vague_spec_agent():
    graph = StateGraph(VagueSpecState)

    graph.add_node("analyze", analyze_vagueness)
    graph.add_node("clarify", generate_clarifications)

    graph.set_entry_point("analyze")
    graph.add_conditional_edges(
        "analyze",
        lambda state: "clarify" if state.get("is_vague") else "end",
        {"clarify": "clarify", "end": END},
    )
    graph.add_edge("clarify", END)

    return graph.compile()


def crawl_tot_folder(tot_path: Path) -> dict:
    """Crawl TOT folder and analyze all .tex files."""
    agent = build_vague_spec_agent()

    results = {"files_analyzed": 0, "files_with_vague": 0, "findings": []}

    tex_files = list(tot_path.glob("*.tex"))

    for tex_file in tex_files:
        print(f"\nAnalyzing: {tex_file.name}")

        content = extract_tex_content(tex_file)

        result = agent.invoke(
            {
                "content": content,
                "file_path": str(tex_file),
                "is_vague": False,
                "vague_items": [],
                "clarifications": "",
            }
        )

        results["files_analyzed"] += 1

        if result.get("is_vague"):
            results["files_with_vague"] += 1
            results["findings"].append(
                {
                    "file": tex_file.name,
                    "path": str(tex_file),
                    "vague_items": result.get("vague_items", []),
                    "clarifications": result.get("clarifications", ""),
                }
            )
            print(f"  Found {len(result.get('vague_items', []))} vague items")
        else:
            print(f"  No vague items found")

    return results


if __name__ == "__main__":
    import sys

    tot_path = Path("/Users/owner/projects/data-structures/tot")

    if not tot_path.is_dir():
        print("TOT folder not found:", tot_path)
        sys.exit(1)

    print("Vague Spec Agent for TOT folder")
    print("=" * 50)
    print(f"Scanning: {tot_path}")
    print()

    results = crawl_tot_folder(tot_path)

    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Files analyzed: {results['files_analyzed']}")
    print(f"Files with vague specs: {results['files_with_vague']}")

    if results["findings"]:
        output_file = tot_path / "VAGUE_SPEC_ANALYSIS.md"
        with open(output_file, "w") as f:
            f.write("# Vague Specification Analysis for TOT Folder\n\n")
            f.write(f"## Summary\n")
            f.write(f"- Files analyzed: {results['files_analyzed']}\n")
            f.write(f"- Files with vague specs: {results['files_with_vague']}\n\n")
            f.write("---\n\n")

            for finding in results["findings"]:
                f.write(f"## {finding['file']}\n\n")
                f.write(f"**Path:** `{finding['path']}`\n\n")
                f.write(f"### Vague Items:\n")
                for item in finding.get("vague_items", []):
                    f.write(f"- {item}\n")
                f.write(f"\n### Clarifications:\n")
                f.write(finding.get("clarifications", ""))
                f.write("\n\n---\n\n")

        print(f"\nDetailed report written to: {output_file}")
