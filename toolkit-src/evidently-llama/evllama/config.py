"""Runtime settings. Everything is local by default; env vars override defaults.

| env var          | default                    | meaning                                         |
|------------------|----------------------------|-------------------------------------------------|
| LLAMA_MODEL      | llama3.2:1b                | Ollama model tag                                 |
| OLLAMA_HOST      | http://localhost:11434     | Ollama server (scheme optional, like ollama CLI) |
| EVIDENTLY_URL    | (unset)                    | optional self-hosted `evidently ui` to push to   |
| EVIDENTLY_TOKEN  | (unset)                    | optional `evidently-secret` for that UI          |
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

TEMPLATE_ROOT = Path(__file__).resolve().parent.parent  # .../evidently-llama


def _normalize_host(host: str) -> str:
    host = host.strip().rstrip("/")
    if not host.startswith(("http://", "https://")):
        host = "http://" + host
    return host


@dataclass
class Settings:
    model: str = field(default_factory=lambda: os.environ.get("LLAMA_MODEL", "llama3.2:1b"))
    ollama_host: str = field(
        default_factory=lambda: _normalize_host(os.environ.get("OLLAMA_HOST", "http://localhost:11434"))
    )
    mock: bool = False          # replay recorded responses, no Ollama needed
    record: bool = False        # call Ollama AND save responses so --mock can replay them later
    recordings: Path = TEMPLATE_ROOT / "data" / "recordings" / "demo.json"
    prompts_path: Path = TEMPLATE_ROOT / "prompts" / "registry.json"
    skills_dir: Path = TEMPLATE_ROOT / "skills"
    tasks_path: Path = TEMPLATE_ROOT / "data" / "demo_tasks.jsonl"
    out_dir: Path = TEMPLATE_ROOT / "out"
    project: str = "local-llama-agent"
    judge: bool = True
    evidently_url: Optional[str] = field(default_factory=lambda: os.environ.get("EVIDENTLY_URL") or None)
    evidently_token: Optional[str] = field(default_factory=lambda: os.environ.get("EVIDENTLY_TOKEN") or None)

    @property
    def workspace_dir(self) -> Path:
        """Local Evidently workspace; browse it with `evidently ui --workspace <this dir>`."""
        return self.out_dir / "workspace"

    @property
    def spans_path(self) -> Path:
        return self.out_dir / "spans.jsonl"
