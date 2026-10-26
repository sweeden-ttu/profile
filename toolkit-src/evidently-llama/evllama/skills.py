"""Agent "skills": reusable instruction packs the agent loads from a folder.

A skill is a Markdown file with a tiny front-matter header (no PyYAML needed):

    ---
    name: calculator
    description: Arithmetic word problems; delegates the math to the calc tool.
    triggers: [calculate, how many, total, percent, "%"]
    tools: [calc]
    output: text            # text | json
    ---
    Instructions appended to the system prompt when this skill is active...

Routing is deterministic keyword scoring (no LLM call), so the same task always picks the
same skill and the trace/report stay comparable between prompt versions.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Union


@dataclass
class Skill:
    name: str
    description: str
    instructions: str
    triggers: List[str] = field(default_factory=list)
    tools: List[str] = field(default_factory=list)
    output: str = "text"
    path: str = ""

    @property
    def expects_json(self) -> bool:
        return self.output == "json"


def _parse_value(raw: str):
    raw = raw.strip()
    if raw.startswith("[") and raw.endswith("]"):
        items = [x.strip().strip("\"'") for x in raw[1:-1].split(",")]
        return [x for x in items if x]
    return raw.strip("\"'")


def parse_skill(text: str, path: str = "") -> Skill:
    meta: Dict[str, object] = {}
    body = text
    if text.startswith("---"):
        _, header, body = text.split("---", 2)
        for line in header.strip().splitlines():
            if ":" in line and not line.lstrip().startswith("#"):
                k, v = line.split(":", 1)
                meta[k.strip()] = _parse_value(v.split("  #")[0])
    return Skill(name=str(meta.get("name") or Path(path).stem), description=str(meta.get("description", "")),
                 instructions=body.strip(), triggers=list(meta.get("triggers") or []),
                 tools=list(meta.get("tools") or []), output=str(meta.get("output") or "text"), path=path)


def load_skills(directory: Union[str, Path]) -> Dict[str, Skill]:
    skills = {}
    for p in sorted(Path(directory).glob("*.md")):
        if p.name.lower() == "readme.md":
            continue
        s = parse_skill(p.read_text(encoding="utf-8"), str(p.name))
        skills[s.name] = s
    return skills


def route(task: str, skills: Dict[str, Skill], default: str = "general") -> Skill:
    """Pick the skill whose triggers best match the task (ties -> alphabetical)."""
    t = task.lower()
    scored = sorted(((sum(trig.lower() in t for trig in s.triggers), name) for name, s in skills.items()),
                    key=lambda x: (-x[0], x[1]))
    if scored and scored[0][0] > 0:
        return skills[scored[0][1]]
    return skills.get(default) or next(iter(skills.values()))
