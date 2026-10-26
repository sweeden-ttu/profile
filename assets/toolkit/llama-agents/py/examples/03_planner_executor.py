"""Example 3: planner -> executor -> synthesizer.

1. Planner (JSON mode) writes a short plan of tool steps.
2. Executor runs them in order. Search steps call the tool directly; for a calculator step the
   model first turns the results so far into one arithmetic expression (the model reasons, the
   tool computes).
3. Synthesizer writes the final one-sentence answer from the step results.

Separating planning from execution makes each LLM call small and checkable, which matters a
lot for a 1B model. The plan is validated before anything runs.

Run:  LLAMA_BACKEND=ollama python examples/03_planner_executor.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from llm import calculator, run_example, search_docs  # noqa: E402

EXAMPLE = "planner_executor"
TITLE = "Planner -> executor -> synthesizer"
TASK = "How many times more parameters does Llama 3.1 8B have than Llama 3.2 1B? Round to one decimal."
EXPECTED = "6.5"  # 8 / 1.24 = 6.45 -> 6.5

PLANNER = """You plan tool use for a question. Tools:
- search_docs: input is a search query, returns one fact
- calculator: input is a description of what to compute from earlier results
Return JSON: {"steps": [{"tool": "search_docs" | "calculator", "input": "..."}]} with 2-4 steps."""

TOOLS = {"search_docs": search_docs, "calculator": calculator}


def valid_plan(obj):
    steps = obj.get("steps") if isinstance(obj, dict) else None
    return isinstance(steps, list) and 0 < len(steps) <= 4 and all(
        isinstance(s, dict) and s.get("tool") in TOOLS and isinstance(s.get("input"), str) for s in steps)


def run(llm, task):
    # 1) plan
    raw = llm.chat([{"role": "system", "content": PLANNER}, {"role": "user", "content": task}],
                   fmt="json", name="plan")
    try:
        plan = json.loads(raw)
    except json.JSONDecodeError:
        plan = {}
    ok_plan = valid_plan(plan)
    llm.transcript.step("plan", "plan-check", raw, plan if ok_plan else "invalid plan", ok=ok_plan)
    if not ok_plan:
        return "planner produced an invalid plan", False

    # 2) execute
    results = []
    for i, step in enumerate(plan["steps"], 1):
        if step["tool"] == "calculator":
            context = "\n".join(results)
            expr = llm.chat([{"role": "system", "content": "Write ONE arithmetic expression using only numbers and "
                                                           "+ - * / ( ). No words, no units, no equals sign."},
                             {"role": "user", "content": f"Facts:\n{context}\n\nCompute: {step['input']}"}],
                            name=f"step-{i}-expression")
            expr = re.sub(r"[^0-9.+\-*/() ]", "", expr.splitlines()[0])
            out = llm.tool("calculator", calculator, expr)
        else:
            out = llm.tool(step["tool"], TOOLS[step["tool"]], step["input"])
        results.append(f"step {i} ({step['tool']}: {step['input']}): {out}")

    # 3) synthesize
    answer = llm.chat([{"role": "system", "content": "Answer the question in one sentence using the step results."},
                       {"role": "user", "content": f"Question: {task}\n\nStep results:\n" + "\n".join(results)}],
                      name="synthesize").strip()
    return answer, EXPECTED in answer


if __name__ == "__main__":
    run_example(EXAMPLE, TASK, run)
