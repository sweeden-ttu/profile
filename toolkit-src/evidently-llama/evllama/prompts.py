"""Versioned prompt registry (a JSON file you commit), mirroring Evidently Prompts.

Each prompt is one *question you ask the model*; each version stores both halves:

    {"version": 2, "system": "...", "template": "Task: $task", "note": "why it changed",
     "feedback": "what the eval said about this version", "metrics": {...}, "created_at": "..."}

* `render(name, version, task=...)` -> chat messages (templates use `$var`, so JSON braces are safe)
* `bump(name, system=..., template=..., note=...)` -> new version (prompt changed)
* `record_feedback(name, version, feedback, metrics)` -> fills a pending feedback in place;
  a *different* feedback for an already-answered version becomes a new version
  (same prompt, new answer) so belief updates stay visible as history.
* `push(rest, project_id)` -> mirrors every version to a self-hosted Evidently UI as
  MessagesPromptContent [system, user=template, assistant=feedback].
"""
from __future__ import annotations

import datetime as dt
import json
from pathlib import Path
from string import Template
from typing import Any, Dict, List, Optional, Union

PENDING = "(pending feedback)"


def _now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


class PromptRegistry:
    def __init__(self, path: Union[str, Path]):
        self.path = Path(path)
        self.data: Dict[str, Any] = (
            json.loads(self.path.read_text(encoding="utf-8")) if self.path.exists() else {"prompts": {}}
        )

    # -- read -----------------------------------------------------------------------
    def names(self) -> List[str]:
        return sorted(self.data["prompts"])

    def versions(self, name: str) -> List[Dict[str, Any]]:
        return self.data["prompts"][name]["versions"]

    def get(self, name: str, version: Union[int, str] = "latest") -> Dict[str, Any]:
        vs = self.versions(name)
        if version == "latest":
            return vs[-1]
        for v in vs:
            if v["version"] == int(version):
                return v
        raise KeyError(f"{name} has no version {version}")

    def render(self, name: str, version: Union[int, str] = "latest", **variables: Any) -> List[Dict[str, str]]:
        v = self.get(name, version)
        msgs = []
        if v.get("system"):
            msgs.append({"role": "system", "content": Template(v["system"]).safe_substitute(**variables)})
        msgs.append({"role": "user", "content": Template(v["template"]).safe_substitute(**variables)})
        return msgs

    # -- write ----------------------------------------------------------------------
    def bump(self, name: str, *, template: str, system: str = "", note: str = "",
             description: str = "") -> Dict[str, Any]:
        entry = self.data["prompts"].setdefault(name, {"description": description, "versions": []})
        if description:
            entry["description"] = description
        version = 1 + max((v["version"] for v in entry["versions"]), default=0)
        v = {"version": version, "created_at": _now(), "system": system, "template": template,
             "note": note, "feedback": PENDING, "metrics": {}}
        entry["versions"].append(v)
        return v

    def record_feedback(self, name: str, version: int, feedback: str,
                        metrics: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        v = self.get(name, version)
        if v.get("feedback") in (None, "", PENDING):
            v["feedback"], v["metrics"] = feedback, metrics or {}
            v["answered_at"] = _now()
            return v
        if v["feedback"] == feedback:
            return v  # deterministic re-run (e.g. --mock): nothing new learned
        nv = self.bump(name, template=v["template"], system=v.get("system", ""),
                       note=f"re-evaluated v{version}")
        nv.update(feedback=feedback, metrics=metrics or {}, answered_at=_now(), derived_from=version)
        return nv

    def save(self) -> Path:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        return self.path

    # -- Evidently UI mirror ----------------------------------------------------------
    def push(self, rest, project_id: str) -> int:
        n = 0
        for name in self.names():
            for v in self.versions(name):
                msgs = ([{"role": "system", "content": v["system"]}] if v.get("system") else []) + [
                    {"role": "user", "content": v["template"]},
                    {"role": "assistant", "content": v.get("feedback") or PENDING},
                ]
                meta = {"note": v.get("note", ""), "metrics": json.dumps(v.get("metrics", {}))}
                if rest.push_prompt_version(project_id, name, v["version"], msgs, metadata=meta):
                    n += 1
        return n
