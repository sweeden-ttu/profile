"""evllama — Evidently observability template for local (Ollama-served) Llama agents.

Modules map 1:1 to Evidently surfaces:
    llm.py          Ollama client + deterministic replay/recording (stdlib only)
    prompts.py      versioned prompt registry (prompt + feedback per version)  -> /prompts
    tracing.py      OpenTelemetry spans per agent step (JSONL + optional Tracely) -> /traces
    datasets.py     agent I/O rows (input/output) + the single experiments ledger -> /datasets
    descriptors.py  heuristics + JSON validity + local LLM-as-judge
    reports.py      Report + tests (= test suite), static-site-friendly HTML
    dashboard.py    local Workspace project, panels, snapshots -> `evidently ui`
    skills.py       loadable agent skills (skills/*.md)
"""
__version__ = "0.1.0"
