"""`python -m unittest discover -s tests` — every example passes on the offline mock backend."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from llm import ReplayBackend, calculator, get_backend, request_key, run_example  # noqa: E402
from run_all import EXAMPLES, load_example  # noqa: E402


class Examples(unittest.TestCase):
    def test_all_examples_pass_on_mock(self):
        for name in EXAMPLES:
            with self.subTest(example=name):
                mod = load_example(name)
                t = run_example(name, mod.TASK, mod.run, backend=get_backend("mock", example=name), verbose=False)
                self.assertTrue(t["ok"], t["final_answer"])
                self.assertTrue(all(s.get("match", "exact") == "exact" for s in t["steps"] if s["kind"] == "llm"))

    def test_nearest_match_fallback(self):
        msgs = [{"role": "user", "content": "port of ollama?"}]
        backend = ReplayBackend([{"key": request_key(msgs), "messages": msgs, "response": "11434"}])
        r = backend.chat([{"role": "user", "content": "what port does ollama use"}])
        self.assertEqual((r["text"], r["match"]), ("11434", "nearest"))

    def test_calculator_is_not_eval(self):
        self.assertEqual(calculator("11434 * 3"), "34302")
        with self.assertRaises(ValueError):
            calculator("open('x')")


if __name__ == "__main__":
    unittest.main()
