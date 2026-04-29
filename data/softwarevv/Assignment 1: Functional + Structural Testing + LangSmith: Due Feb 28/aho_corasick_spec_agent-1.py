"""Aho-Corasick spec agent: vague-spec detection and artifact generation.

Uses the same LangGraph pattern as quiz1_langsmith_graph (check -> fix -> testcase)
to analyze SPEC_AHO_CORASICK_TRIE.md, then generates:
- README clarifications (algorithm details from Wikipedia)
- spec.js (test specification for Aho-Corasick implementations)

Always uses Granite via Ollama at OLLAMA_BASE_URL (default http://127.0.0.1:37659).
"""

from __future__ import annotations

import os
from pathlib import Path
from typing_extensions import TypedDict

from dotenv import load_dotenv

# Load .env from project and agent dirs so LANGCHAIN_API_KEY and OPENAI_API_KEY are set.
# Agent .env overrides project .env when both exist.
_agent_dir = Path(__file__).resolve().parent
_project_dir = _agent_dir.parent.parent
if (_project_dir / ".env").is_file():
    load_dotenv(_project_dir / ".env")
if (_agent_dir / ".env").is_file():
    load_dotenv(_agent_dir / ".env", override=True)
if not (_project_dir / ".env").is_file() and not (_agent_dir / ".env").is_file():
    load_dotenv()  # fallback: cwd or parent dirs

# Force Granite Ollama endpoint
os.environ.setdefault("OLLAMA_BASE_URL", "http://127.0.0.1:37659")

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage


def get_llm():
    """Get Granite (Ollama) LLM at http://127.0.0.1:37659/."""
    base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:37659").strip().rstrip("/")
    try:
        from langchain_ollama import ChatOllama
        return ChatOllama(model="granite4:3b", base_url=base_url, temperature=0)
    except Exception:
        return None


class AhoCorasickSpecState(TypedDict):
    specification: str
    is_vague: bool
    clarified_spec: str
    test_case: str
    readme_clarifications: str
    spec_js_content: str


def check_vagueness(state: AhoCorasickSpecState) -> dict:
    """Determine if the specification excerpt is vague or unclear."""
    spec = state["specification"]
    llm = get_llm()
    if llm:
        messages = [
            SystemMessage(
                content="""You are a specification analyzer for technical algorithm specs.
Determine if the following requirement or section is vague or unclear (missing definitions, ambiguous terms, unspecified behavior).
Respond with only 'VAGUE' or 'NOT_VAGUE'."""
            ),
            HumanMessage(content=spec[:4000]),
        ]
        response = llm.invoke(messages)
        is_vague = "VAGUE" in response.content.upper()
    else:
        is_vague = any(
            w in spec.lower()
            for w in ("appropriate", "efficient", "reasonable", "optional", "typically", "e.g.", "per implementation")
        )
    return {"is_vague": is_vague}


def fix_vagueness(state: AhoCorasickSpecState) -> dict:
    """Clarify vague parts using Wikipedia Aho-Corasick algorithm terminology."""
    spec = state["specification"]
    llm = get_llm()
    if llm:
        messages = [
            SystemMessage(
                content="""You are a requirements engineer. Clarify the following Aho-Corasick or trie specification excerpt.
Use precise terms: suffix link (longest strict suffix in graph), dictionary-suffix link (next dictionary node via suffix chain), linear time, no backtracking.
Return ONLY the clarified text, no preamble."""
            ),
            HumanMessage(content=spec[:4000]),
        ]
        response = llm.invoke(messages)
        clarified = response.content.strip()
    else:
        clarified = spec
    return {"clarified_spec": clarified}


def generate_test_case(state: AhoCorasickSpecState) -> dict:
    """Generate a test case specification (structured)."""
    spec = state.get("clarified_spec", state["specification"])
    llm = get_llm()
    if llm:
        messages = [
            SystemMessage(
                content="""You are a test engineer. For the given Aho-Corasick spec excerpt, produce a short test case: Input (dictionary + text), Expected Output (list of pattern:end_index). One concise paragraph."""
            ),
            HumanMessage(content=spec[:3000]),
        ]
        response = llm.invoke(messages)
        test_case = response.content.strip()
    else:
        test_case = "Dictionary {a, ab, bab, bc, bca, c, caa}; text abccab; expect a:1, ab:2, bc:3, c:3, c:4, a:5, ab:6."
    return {"test_case": test_case}


def generate_readme_clarifications(state: AhoCorasickSpecState) -> dict:
    """Generate README clarifications for the Aho-Corasick algorithm (Wikipedia-based)."""
    llm = get_llm()
    if llm:
        messages = [
            SystemMessage(
                content="""You are a technical writer. Write a short "Clarifications" section for a README that explains the Aho-Corasick algorithm for readers who have read the Wikipedia article (https://en.wikipedia.org/wiki/Aho-Corasick_algorithm). Include:
- Suffix link: longest strict suffix of the current path that exists in the trie; enables transition without backtracking.
- Dictionary-suffix link: first dictionary (accepting) node reachable by following suffix links; used to output all matches at current position.
- Complexity: linear in text length + total pattern length + number of matches; single pass, no backtracking.
- Example: dictionary {a, ab, bab, bc, bca, c, caa}, input abccab yields matches at positions as in the Wikipedia example table.
Use clear bullet points. No code. Markdown format."""
            ),
            HumanMessage(content="Reference: SPEC_AHO_CORASICK_TRIE and Wikipedia Aho-Corasick example."),
        ]
        response = llm.invoke(messages)
        readme = response.content.strip()
    else:
        readme = """### Clarifications (Aho-Corasick algorithm)

- **Suffix link (blue arc)**: From each node, the suffix link points to the node whose path is the longest *strict* suffix of the current path that exists in the trie. The root has no suffix link. This allows the automaton to transition on failure without backtracking in the text.

- **Dictionary-suffix link (green arc)**: From each node, the dictionary-suffix link points to the first node (if any) reachable by following suffix links that is a dictionary entry (`in_dictionary == true`). Used to output all matches ending at the current position.

- **Complexity**: Construction is linear in the total length of dictionary strings. Search is linear in the length of the text plus the number of matches. Single pass over the text; no backtracking.

- **Example** (from Wikipedia): Dictionary D = {a, ab, bab, bc, bca, c, caa}. On input "abccab", the algorithm reports: a:1, ab:2, bc:3, c:3, c:4, a:5, ab:6 (pattern and 1-based end index)."""
    return {"readme_clarifications": readme}


def generate_spec_js(state: AhoCorasickSpecState) -> dict:
    """Generate spec.js content: test specification for Aho-Corasick (JavaScript export)."""
    llm = get_llm()
    if llm:
        messages = [
            SystemMessage(
                content="""You are a test engineer. Generate the content of a JavaScript file named spec.js that exports a test specification for the Aho-Corasick algorithm. Use the Wikipedia example: dictionary ["a", "ab", "bab", "bc", "bca", "c", "caa"], input text "abccab", expected matches as list of { pattern, endIndex } (1-based). Export an object like: module.exports = { dictionary: [...], example: { text: "abccab", expected: [...] } }. Only output valid JavaScript, no markdown."""
            ),
            HumanMessage(content="Wikipedia Aho-Corasick example: abccab yields a:1, ab:2, bc:3, c:3, c:4, a:5, ab:6."),
        ]
        response = llm.invoke(messages)
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
        spec_js = raw
    else:
        spec_js = """/**
 * Aho-Corasick test specification (from docs/SPEC_AHO_CORASICK_TRIE.md and Wikipedia example).
 * Use with a test runner (e.g. Jest, Mocha) to validate build() and search().
 */
module.exports = {
  dictionary: ["a", "ab", "bab", "bc", "bca", "c", "caa"],
  example: {
    text: "abccab",
    expected: [
      { pattern: "a", endIndex: 1 },
      { pattern: "ab", endIndex: 2 },
      { pattern: "bc", endIndex: 3 },
      { pattern: "c", endIndex: 3 },
      { pattern: "c", endIndex: 4 },
      { pattern: "a", endIndex: 5 },
      { pattern: "ab", endIndex: 6 },
    ],
  },
};
"""
    return {"spec_js_content": spec_js}


def route_after_check(state: AhoCorasickSpecState) -> str:
    if state["is_vague"]:
        return "fix"
    return "testcase"


def build_aho_corasick_spec_graph():
    graph = StateGraph(AhoCorasickSpecState)

    graph.add_node("check", check_vagueness)
    graph.add_node("fix", fix_vagueness)
    graph.add_node("testcase", generate_test_case)
    graph.add_node("readme", generate_readme_clarifications)
    graph.add_node("spec_js", generate_spec_js)

    graph.set_entry_point("check")
    graph.add_conditional_edges("check", route_after_check, {"fix": "fix", "testcase": "testcase"})
    graph.add_edge("fix", "testcase")
    graph.add_edge("testcase", "readme")
    graph.add_edge("readme", "spec_js")
    graph.add_edge("spec_js", END)

    return graph.compile()


def run_agent_on_spec(
    spec_path: str | Path,
    data_structures_root: str | Path,
    *,
    write_spec_js: bool = True,
    write_readme_clarifications: bool = True,
) -> dict:
    """Load spec file, run agent, optionally write readme_clarifications and spec.js to data-structures repo."""
    spec_path = Path(spec_path)
    data_structures_root = Path(data_structures_root)

    spec_text = spec_path.read_text(encoding="utf-8")

    agent = build_aho_corasick_spec_graph()
    result = agent.invoke({
        "specification": spec_text,
        "is_vague": False,
        "clarified_spec": "",
        "test_case": "",
        "readme_clarifications": "",
        "spec_js_content": "",
    })

    if write_spec_js and result.get("spec_js_content"):
        spec_js_path = data_structures_root / "spec.js"
        spec_js_path.write_text(result["spec_js_content"], encoding="utf-8")

    if write_readme_clarifications and result.get("readme_clarifications"):
        readme_clar_path = data_structures_root / "README_CLARIFICATIONS_AC.md"
        readme_clar_path.write_text(result["readme_clarifications"], encoding="utf-8")

    return result


if __name__ == "__main__":
    import sys

    # Paths: data-structures repo (sibling of CS5374_Software_VV or env)
    repo_root = Path(__file__).resolve().parents[4]
    data_structures = repo_root / "data-structures"
    if not data_structures.is_dir():
        data_structures = Path(os.getenv("DATA_STRUCTURES_REPO", ".")).resolve()
    spec_path = data_structures / "docs" / "SPEC_AHO_CORASICK_TRIE.md"

    if not spec_path.is_file():
        print("Spec not found:", spec_path, file=sys.stderr)
        sys.exit(1)

    print("Aho-Corasick spec agent (Granite at", os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:37659"), ")")
    print("Input spec:", spec_path)
    print("Output dir:", data_structures)

    result = run_agent_on_spec(spec_path, data_structures)

    print("\nIs vague:", result["is_vague"])
    if result.get("clarified_spec"):
        print("Clarified (excerpt):", result["clarified_spec"][:200], "...")
    print("Test case (excerpt):", result["test_case"][:200], "...")
    if result.get("readme_clarifications"):
        print("\nREADME clarifications written to data-structures/README_CLARIFICATIONS_AC.md")
    if result.get("spec_js_content"):
        print("spec.js written to data-structures/spec.js")
