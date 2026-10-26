"""Smoke tests: `python -m unittest discover -s tests` (no Ollama, no network)."""
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from evllama.cli import run_demo  # noqa: E402
from evllama.config import Settings  # noqa: E402
from evllama.llm import ReplayChat, request_key  # noqa: E402
from evllama.prompts import PENDING, PromptRegistry  # noqa: E402
from evllama.skills import load_skills, route  # noqa: E402
from evllama.tools import calc  # noqa: E402


class Units(unittest.TestCase):
    def test_calc(self):
        self.assertEqual(calc("14*23"), "322")
        self.assertEqual(calc("2480*15%"), "372")
        with self.assertRaises(ValueError):
            calc("__import__('os')")

    def test_skills_route(self):
        skills = load_skills(ROOT / "skills")
        self.assertIn("calculator", skills)
        self.assertEqual(route("Extract the name as JSON", skills).name, "extractor")
        self.assertEqual(route("nothing matches here", skills).name, "general")

    def test_replay_exact_then_nearest(self):
        msgs = [{"role": "user", "content": "what is the ollama port"}]
        chat = ReplayChat([{"key": request_key(msgs), "messages": msgs, "response": "11434"}])
        self.assertEqual(chat.chat(msgs).match, "exact")
        r = chat.chat([{"role": "user", "content": "which port does ollama use"}])
        self.assertEqual((r.text, r.match), ("11434", "nearest"))

    def test_registry_feedback_versions(self):
        with tempfile.TemporaryDirectory() as d:
            reg = PromptRegistry(Path(d) / "r.json")
            reg.bump("q", template="Task: $task")
            self.assertEqual(reg.get("q")["feedback"], PENDING)
            reg.record_feedback("q", 1, "good")          # fills pending in place
            reg.record_feedback("q", 1, "good")          # identical -> no-op
            self.assertEqual(len(reg.versions("q")), 1)
            reg.record_feedback("q", 1, "worse on v2 data")  # new answer -> new version
            self.assertEqual(len(reg.versions("q")), 2)
            self.assertEqual(reg.render("q", 1, task="x")[-1]["content"], "Task: x")


class DemoMock(unittest.TestCase):
    def test_demo_mock_end_to_end(self):
        with tempfile.TemporaryDirectory() as d:
            s = Settings(mock=True)
            s.out_dir = Path(d) / "out"
            s.prompts_path = Path(d) / "registry.json"
            shutil.copy(ROOT / "prompts" / "registry.json", s.prompts_path)
            s.evidently_url = None
            summary = run_demo(s, publish=Path(d) / "site")
            self.assertEqual(summary["tasks"], 10)
            self.assertGreater(summary["spans"], 40)
            v1, v2 = summary["versions"]["v1"]["metrics"], summary["versions"]["v2"]["metrics"]
            self.assertGreater(v2["judge_mean"], v1["judge_mean"])
            self.assertEqual(v2["tests_passed"], v2["tests_total"])
            self.assertTrue((s.out_dir / "report.html").exists())
            html = (Path(d) / "site" / "sample-report.html").read_text()
            self.assertIn('src="lib/evidently-', html)
            self.assertLess(len(html), 600_000)
            reg = json.loads(s.prompts_path.read_text())
            self.assertNotEqual(reg["prompts"]["agent-system"]["versions"][1]["feedback"], PENDING)


if __name__ == "__main__":
    unittest.main()
