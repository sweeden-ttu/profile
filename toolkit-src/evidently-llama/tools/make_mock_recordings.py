"""Regenerate data/recordings/demo.json WITHOUT Ollama, from hand-written responses.

These are synthetic stand-ins that imitate typical llama3.2:1b behaviour (v1 prompt: no
tool protocol -> occasional wrong arithmetic, prose-wrapped JSON, a refusal; v2: tool use,
clean JSON). They exist so `python -m evllama demo --mock` works on any machine.
Replace them with real model output any time:

    ollama serve & ollama pull llama3.2:1b
    python -m evllama demo --record          # overwrites data/recordings/demo.json

Usage: python tools/make_mock_recordings.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from evllama.cli import run_demo  # noqa: E402
from evllama.config import Settings  # noqa: E402
from evllama.llm import ChatResponse, RecordingChat  # noqa: E402

# (task id, prompt version) -> list of assistant turns (tool request first, then final answer)
AGENT = {
    ("t01", 1): ["Sure! 14 evals per day for 23 days is 14 x 23 = 322 evals in total."],
    ("t01", 2): ["TOOL calc: 14*23", "322 evals"],
    ("t02", 1): ["15% of 2480 tokens is 362 tokens."],
    ("t02", 2): ["TOOL calc: 2480*15%", "372 tokens"],
    ("t03", 1): ["The latency reduction is 840 - 610 = 230 ms, which is a great improvement!"],
    ("t03", 2): ["TOOL calc: 840-610", "230 ms"],
    ("t04", 1): ["Here is the JSON you asked for:\n```json\n{\"name\": \"Dana Reyes\", \"email\": \"dana.reyes@example.org\", \"company\": \"Northwind Labs\"}\n```"],
    ("t04", 2): ["{\"name\": \"Dana Reyes\", \"email\": \"dana.reyes@example.org\", \"company\": \"Northwind Labs\"}"],
    ("t05", 1): ["{\"city\": \"Lubbock\", \"date\": \"March 14, 2026\"}"],
    ("t05", 2): ["{\"city\": \"Lubbock\", \"date\": \"2026-03-14\"}"],
    ("t06", 1): ["tool: calc, status: OK"],
    ("t06", 2): ["{\"tool\": \"calc\", \"status\": \"OK\"}"],
    ("t07", 1): ["Ollama listens on port 8080 by default."],
    ("t07", 2): ["TOOL lookup: ollama default port", "Ollama listens on port 11434 by default [d1]."],
    ("t08", 1): ["I'm unable to browse the documentation, but most libraries like this use the MIT license."],
    ("t08", 2): ["TOOL lookup: evidently license", "Evidently is released under the Apache-2.0 license [d2]."],
    ("t09", 1): ["Drift detection is a technique that compares current data with reference data in order to flag "
                 "changes in the distribution of the data before the quality of the model degrades in production "
                 "systems, which is useful."],
    ("t09", 2): ["Drift detection compares current and reference data to flag distribution changes before model "
                 "quality degrades."],
    ("t10", 1): ["Use version control."],
    ("t10", 2): ["Store every prompt change as a new numbered version together with the eval feedback it got."],
}

# judge score by (task id, version) with a short reason, mimicking a 1-5 rubric
JUDGE = {
    ("t01", 1): (4, "correct total, chatty"), ("t01", 2): (5, "correct"),
    ("t02", 1): (1, "wrong number; 15% of 2480 is 372"), ("t02", 2): (5, "correct"),
    ("t03", 1): (4, "correct, unnecessary commentary"), ("t03", 2): (5, "correct"),
    ("t04", 1): (3, "right values but wrapped in prose and a code fence"), ("t04", 2): (5, "exact JSON"),
    ("t05", 1): (2, "date not in YYYY-MM-DD"), ("t05", 2): (5, "exact JSON"),
    ("t06", 1): (1, "not JSON"), ("t06", 2): (5, "exact JSON"),
    ("t07", 1): (1, "wrong port, invented"), ("t07", 2): (5, "correct with citation"),
    ("t08", 1): (1, "refused and guessed the wrong license"), ("t08", 2): (5, "correct with citation"),
    ("t09", 1): (3, "accurate but over 25 words"), ("t09", 2): (5, "concise"),
    ("t10", 1): (2, "too vague"), ("t10", 2): (4, "actionable"),
}

TASKS = {json.loads(line)["task"]: json.loads(line)["id"]
         for line in (ROOT / "data" / "demo_tasks.jsonl").read_text().splitlines() if line.strip()}


def _latency(messages, text: str) -> float:
    """Deterministic fake latency: ~ prompt prefill + per-token decode on a laptop CPU."""
    prompt_chars = sum(len(m["content"]) for m in messages)
    return round(180 + prompt_chars * 0.35 + len(text.split()) * 38.0, 1)


class ScriptedChat:
    name = "scripted"
    model = "llama3.2:1b"

    def chat(self, messages, fmt=None) -> ChatResponse:
        system = next((m["content"] for m in messages if m["role"] == "system"), "")
        user0 = next(m["content"] for m in messages if m["role"] == "user")
        if system.startswith("You are a strict grader"):
            q = re.search(r"Question:\n(.*?)\n\nAnswer:\n(.*?)\n\nRate", user0, re.S)
            task_id, answer = TASKS[q.group(1)], q.group(2)
            version = 2 if answer.strip() == AGENT[(task_id, 2)][-1] else 1
            score, why = JUDGE[(task_id, version)]
            text = f"SCORE: {score} - {why}"
        else:
            version = 2 if system.startswith("You are a precise local agent") else 1
            task = user0[len("Task: "):] if user0.startswith("Task: ") else user0
            turns = AGENT[(TASKS[task], version)]
            n_assistant = sum(m["role"] == "assistant" for m in messages)
            text = turns[min(n_assistant, len(turns) - 1)]
        return ChatResponse(text=text, latency_ms=_latency(messages, text),
                            prompt_tokens=sum(len(m["content"]) for m in messages) // 4,
                            completion_tokens=max(1, int(len(text.split()) * 1.3)), model=self.model,
                            backend=self.name)


def main() -> None:
    settings = Settings(mock=False, record=True)
    settings.out_dir = ROOT / "out" / "_scripted"
    chat = RecordingChat(ScriptedChat(), settings.recordings,
                         source="scripted-mock: synthetic hand-written responses (see tools/make_mock_recordings.py); "
                                "re-record with `python -m evllama demo --record` against Ollama")
    # Don't let the scripted run write feedback into the committed registry.
    settings.prompts_path = settings.out_dir / "registry-scratch.json"
    settings.out_dir.mkdir(parents=True, exist_ok=True)
    settings.prompts_path.write_text((ROOT / "prompts" / "registry.json").read_text())
    run_demo(settings, chat=chat)
    print(f"wrote {len(chat._records)} records -> {settings.recordings}")


if __name__ == "__main__":
    main()
