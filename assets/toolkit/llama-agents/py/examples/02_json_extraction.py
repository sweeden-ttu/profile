"""Example 2: structured JSON extraction with validation and a repair loop.

Ollama's `format: "json"` forces syntactically valid JSON, but not the *right* JSON: keys can
be missing, dates come back as "November 5", lists as comma strings. So we validate in plain
Python and, on failure, send the exact errors back and ask for a corrected object (max 3 tries).

Run:  LLAMA_BACKEND=ollama python examples/02_json_extraction.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from llm import run_example  # noqa: E402

EXAMPLE = "json_extraction"
TITLE = "Structured JSON extraction + validate/retry"
TASK = ("Hi Scott, this is Priya Natarajan from Lakeside Robotics (priya.n@lakeside-robotics.example). "
        "Could we meet on 2026-11-05 to talk about drift monitoring and on-device Llama inference? Thanks!")

SCHEMA = {  # key -> (type, extra check, hint)
    "name": (str, None, "sender's full name"),
    "email": (str, re.compile(r"^[^@\s]+@[^@\s]+\.[a-z]+$"), "sender's email address"),
    "company": (str, None, "sender's company"),
    "meeting_date": (str, re.compile(r"^\d{4}-\d{2}-\d{2}$"), "date in YYYY-MM-DD"),
    "topics": (list, None, "list of short topic strings"),
}

SYSTEM = ("Extract fields from the email as ONE JSON object with exactly these keys:\n"
          + "\n".join(f'- "{k}": {t.__name__} ({hint})' for k, (t, _, hint) in SCHEMA.items())
          + "\nReturn JSON only.")


def validate(obj):
    """Return a list of human-readable errors (empty list == valid)."""
    if not isinstance(obj, dict):
        return ["top level must be a JSON object"]
    errors = [f'missing key "{k}"' for k in SCHEMA if k not in obj]
    errors += [f'unexpected key "{k}"' for k in obj if k not in SCHEMA]
    for key, (typ, pattern, hint) in SCHEMA.items():
        if key not in obj:
            continue
        value = obj[key]
        if not isinstance(value, typ):
            errors.append(f'"{key}" must be a {typ.__name__} ({hint}), got {type(value).__name__}')
        elif pattern is not None and not pattern.match(value):
            errors.append(f'"{key}" must look like {hint}, got {value!r}')
        elif typ is list and (not value or not all(isinstance(x, str) for x in value)):
            errors.append(f'"{key}" must be a non-empty list of strings')
    return errors


def run(llm, task, max_attempts=3):
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": task}]
    for attempt in range(1, max_attempts + 1):
        reply = llm.chat(messages, fmt="json", name=f"extract-attempt-{attempt}")
        try:
            obj = json.loads(reply)
            errors = validate(obj)
        except json.JSONDecodeError as exc:
            obj, errors = None, [f"not valid JSON: {exc.msg}"]
        llm.transcript.step("validate", f"schema-check-{attempt}", reply, errors or "valid", ok=not errors)
        print(f"  validate attempt {attempt}: {'valid' if not errors else errors}")
        if not errors:
            return obj, True
        messages += [{"role": "assistant", "content": reply},
                     {"role": "user", "content": "Your JSON failed validation:\n- " + "\n- ".join(errors)
                      + "\nReturn the corrected JSON object only."}]
    return obj, False


if __name__ == "__main__":
    run_example(EXAMPLE, TASK, run)
