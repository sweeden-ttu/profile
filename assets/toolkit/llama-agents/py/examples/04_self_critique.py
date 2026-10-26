"""Example 4: draft -> critique -> revise (self-refinement) with hard checks.

The model critiques its own draft as JSON ({"score": 1-10, "issues": [...]}) and revises
until the critique score is >= 8 AND deterministic checks pass (word limit, a concrete
example). The hard checks matter: small models are generous graders of their own text.

Run:  LLAMA_BACKEND=ollama python examples/04_self_critique.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from llm import run_example  # noqa: E402

EXAMPLE = "self_critique"
TITLE = "Self-critique: draft -> critique -> revise"
TASK = "Explain data drift to a product manager in at most 50 words, including one concrete example."
MAX_WORDS = 50

CRITIC = ('You review short explanations for a product manager. Return JSON: '
          '{"score": <1-10>, "issues": ["..."]}. Penalize jargon, more than 50 words, and a missing concrete example.')


def hard_checks(text):
    words = len(re.findall(r"\b[\w'-]+\b", text))
    issues = []
    if words > MAX_WORDS:
        issues.append(f"{words} words; limit is {MAX_WORDS}")
    if not re.search(r"\b(for example|e\.g\.|for instance|such as)\b", text, re.IGNORECASE):
        issues.append("no concrete example")
    return issues


def run(llm, task, max_revisions=2):
    draft = llm.chat([{"role": "user", "content": task}], name="draft").strip()
    for rnd in range(max_revisions + 1):
        raw = llm.chat([{"role": "system", "content": CRITIC},
                        {"role": "user", "content": f"Task: {task}\n\nDraft:\n{draft}"}],
                       fmt="json", name=f"critique-{rnd + 1}")
        try:
            critique = json.loads(raw)
            score = int(critique.get("score", 0))
            issues = [str(i) for i in critique.get("issues", [])]
        except (json.JSONDecodeError, TypeError, ValueError, AttributeError):
            score, issues = 0, ["critique was not valid JSON"]
        hard = hard_checks(draft)
        passed = score >= 8 and not hard
        llm.transcript.step("critique", f"round-{rnd + 1}", draft, {"score": score, "issues": issues, "hard": hard},
                            ok=passed)
        print(f"  round {rnd + 1}: model score {score}, issues {issues}, hard checks {hard or 'ok'}")
        if passed or rnd == max_revisions:
            return draft, not hard
        fixes = "\n- ".join(issues + hard)
        draft = llm.chat([{"role": "user", "content": f"{task}\n\nRevise this draft to fix:\n- {fixes}\n\n"
                                                      f"Draft:\n{draft}\n\nReturn only the revised text."}],
                         name=f"revise-{rnd + 1}").strip()
    return draft, not hard_checks(draft)


if __name__ == "__main__":
    run_example(EXAMPLE, TASK, run)
