"""A small skills-driven agent for a local Llama, traced span-by-span.

Loop per task:
  route (keyword -> skill) -> llm -> [TOOL <name>: <arg> -> tool -> llm]* -> validate -> answer

The model asks for a tool by emitting a line `TOOL calc: 17*23` or `TOOL lookup: ollama port`.
Every step is an OTel span (kind = agent | route | llm | tool | validate) with input/output.
`run()` returns one *dataset row* with `input`/`output` plus the metrics the report needs.
"""
from __future__ import annotations

import json
import re
import time
from typing import Any, Callable, Dict, List, Optional

from .prompts import PromptRegistry
from .skills import Skill, route
from .tracing import AgentTracer

TOOL_LINE = re.compile(r"^\s*TOOL\s+([a-z_]+)\s*:\s*(.+?)\s*$", re.IGNORECASE | re.MULTILINE)
SYSTEM_PROMPT = "agent-system"


def extract_json(text: str) -> Optional[Any]:
    """Return the first JSON object in `text` (tolerates ```json fences), else None."""
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


class SkillAgent:
    def __init__(self, chat, registry: PromptRegistry, skills: Dict[str, Skill], tools: Dict[str, Callable[[str], str]],
                 tracer: AgentTracer, prompt_version: int, max_tool_calls: int = 2):
        self.chat, self.registry, self.skills, self.tools = chat, registry, skills, tools
        self.tracer, self.prompt_version, self.max_tool_calls = tracer, prompt_version, max_tool_calls

    def _llm(self, messages: List[Dict[str, str]], fmt=None):
        with self.tracer.span("llm", kind="llm", input=messages[-1]["content"],
                              statement="chat completion") as s:
            resp = self.chat.chat(messages, fmt)
            self.tracer.set(s, output=resp.text, latency_ms=resp.latency_ms, prompt_tokens=resp.prompt_tokens,
                            completion_tokens=resp.completion_tokens, model=resp.model, backend=resp.backend,
                            replay_match=resp.match)
        return resp

    def run(self, task_id: str, task: str) -> Dict[str, Any]:
        t0 = time.perf_counter()
        llm_latency, prompt_tokens, completion_tokens = 0.0, 0, 0
        tool_calls, tool_errors, llm_calls = 0, 0, 0
        with self.tracer.span("agent.run", kind="agent", input=task, statement=f"task {task_id}",
                              task_id=task_id, prompt_name=SYSTEM_PROMPT, prompt_version=self.prompt_version) as root:
            with self.tracer.span("route", kind="route", input=task, statement="pick skill") as s:
                skill = route(task, self.skills)
                self.tracer.set(s, output=skill.name)

            messages = self.registry.render(SYSTEM_PROMPT, self.prompt_version, task=task, skill=skill.name,
                                            skill_instructions=skill.instructions,
                                            tools=", ".join(skill.tools) or "none")
            fmt = "json" if skill.expects_json else None
            while True:
                resp = self._llm(messages, fmt)
                llm_calls += 1
                llm_latency += resp.latency_ms
                prompt_tokens += resp.prompt_tokens
                completion_tokens += resp.completion_tokens
                m = TOOL_LINE.search(resp.text)
                if not m or tool_calls >= self.max_tool_calls or m.group(1).lower() not in skill.tools:
                    break
                name, arg = m.group(1).lower(), m.group(2)
                tool_calls += 1
                with self.tracer.span(f"tool.{name}", kind="tool", input=arg, statement=f"call {name}") as s:
                    try:
                        result, ok = self.tools[name](arg), True
                    except Exception as exc:  # tool failure is data, not a crash
                        result, ok = f"ERROR: {exc}", False
                        tool_errors += 1
                    self.tracer.set(s, output=result, ok=ok)
                messages = messages + [{"role": "assistant", "content": resp.text},
                                       {"role": "user", "content": f"Tool result: {result}\nNow give the final answer."}]

            answer = resp.text.strip()
            json_ok: Optional[bool] = None
            if skill.expects_json:
                with self.tracer.span("validate.json", kind="validate", input=answer, statement="output is JSON") as s:
                    json_ok = extract_json(answer) is not None
                    self.tracer.set(s, output=str(json_ok), ok=json_ok)
            self.tracer.set(root, output=answer, skill=skill.name, llm_calls=llm_calls, tool_calls=tool_calls)
            trace_id = format(root.get_span_context().trace_id, "032x")

        return {
            "input": task,
            "output": answer,
            "task_id": task_id,
            "skill": skill.name,
            "prompt_version": f"v{self.prompt_version}",
            "expects_json": skill.expects_json,
            "json_ok": json_ok,
            "llm_calls": llm_calls,
            "tool_calls": tool_calls,
            "tool_success": 1.0 if tool_errors == 0 else 0.0,
            "latency_ms": round(llm_latency if getattr(self.chat, "name", "") == "replay"
                                else (time.perf_counter() - t0) * 1000.0, 1),
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "trace_id": trace_id,
        }
