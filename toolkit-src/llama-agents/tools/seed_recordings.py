"""Write recordings/<example>.json WITHOUT Ollama, from scripted responses.

These synthetic turns imitate what llama3.2:1b typically does on each example (including the
first-try JSON mistakes and the over-long first draft that the repair/critique loops fix), so
`LLAMA_BACKEND=mock` and the website work before the first CI run. Every real CI run replaces
the site transcripts with live model output; refresh these offline seeds from a live run with
`python run_all.py --backend ollama --save-recordings`.

Usage: python tools/seed_recordings.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))
from llm import run_example  # noqa: E402
from run_all import EXAMPLES, load_example  # noqa: E402

SCRIPT = {
    "react_calculator": [
        "Thought: I need Ollama's default port from the docs.\nAction: search_docs\nAction Input: ollama default port",
        "Thought: The port is 11434. Now I multiply it by 3.\nAction: calculator\nAction Input: 11434 * 3",
        "Thought: The calculator says 34302.\nFinal Answer: 34302",
    ],
    "json_extraction": [
        '{"name": "Priya Natarajan", "email": "priya.n@lakeside-robotics.example", "company": "Lakeside Robotics", '
        '"meeting_date": "November 5, 2026", "topics": "drift monitoring, on-device Llama inference"}',
        '{"name": "Priya Natarajan", "email": "priya.n@lakeside-robotics.example", "company": "Lakeside Robotics", '
        '"meeting_date": "2026-11-05", "topics": ["drift monitoring", "on-device Llama inference"]}',
    ],
    "planner_executor": [
        '{"steps": [{"tool": "search_docs", "input": "Llama 3.1 8B parameters"}, '
        '{"tool": "search_docs", "input": "Llama 3.2 1B parameters"}, '
        '{"tool": "calculator", "input": "8B parameters divided by 1.24B parameters"}]}',
        "8 / 1.24",
        "Llama 3.1 8B has about 6.5 times more parameters than Llama 3.2 1B (8 / 1.24 = 6.45).",
    ],
    "self_critique": [
        "Data drift happens when the data your model sees in production gradually stops looking like the data it "
        "was trained on. Because machine learning models learn statistical patterns from historical training data, "
        "any shift in input distributions, user behaviour, seasonality or upstream pipelines can silently reduce "
        "accuracy over time, which is why teams monitor feature distributions and retrain models regularly.",
        '{"score": 5, "issues": ["too long for a product manager", "no concrete example", '
        '"jargon: statistical patterns, input distributions"]}',
        "Data drift means the real-world data a model sees slowly stops matching the data it learned from, so its "
        "predictions get worse. For example, a shopping recommender trained before the holidays may misjudge what "
        "people want in December. Teams watch for drift and retrain when it appears.",
        '{"score": 9, "issues": []}',
    ],
}


class Scripted:
    name, model = "mock", "llama3.2:1b"

    def __init__(self, turns):
        self.turns = list(turns)

    def chat(self, messages, fmt=None):
        text = self.turns.pop(0)
        prompt_chars = sum(len(m["content"]) for m in messages)
        return {"text": text, "latency_ms": round(220 + prompt_chars * 0.4 + len(text.split()) * 41.0, 1),
                "prompt_tokens": prompt_chars // 4, "completion_tokens": max(1, int(len(text.split()) * 1.3)),
                "model": self.model, "match": "live"}


def main() -> None:
    for name in EXAMPLES:
        mod = load_example(name)
        backend = Scripted(SCRIPT[name])
        t = run_example(name, mod.TASK, mod.run, backend=backend, verbose=False)
        assert not backend.turns, f"{name}: {len(backend.turns)} scripted turns unused"
        t["title"], t["file"] = getattr(mod, "TITLE", name), EXAMPLES[name]
        t["source"] = "scripted-mock (synthetic, see tools/seed_recordings.py)"
        (HERE / "recordings" / f"{name}.json").write_text(json.dumps(t, indent=1, ensure_ascii=False) + "\n")
        print(f"{name}: ok={t['ok']} calls={len(t['calls'])} steps={len(t['steps'])}")


if __name__ == "__main__":
    main()
