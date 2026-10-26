"""Example 1: ReAct (Reason + Act) with two tools: docs search and a calculator.

The model alternates Thought / Action / Action Input lines; we run the tool, feed back an
Observation, and loop until it writes "Final Answer:". Small models often hallucinate the
Observation themselves, so we cut the reply right after "Action Input" before appending it.

Run:  LLAMA_BACKEND=ollama python examples/01_react_calculator.py
      LLAMA_BACKEND=mock   python examples/01_react_calculator.py   # no Ollama needed
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # import llm.py
from llm import calculator, run_example, search_docs  # noqa: E402

EXAMPLE = "react_calculator"
TITLE = "ReAct: docs search + calculator"
TASK = "Ollama serves its API on a default port. What is that port number multiplied by 3?"
EXPECTED = "34302"  # 11434 * 3 -> used for the pass/fail check

SYSTEM = """You are a ReAct agent. You can use these tools:
- search_docs: look up a fact in the documentation. Input: a short search query.
- calculator: evaluate arithmetic. Input: an expression such as 12 * (3 + 4).

Reply in exactly this format, one step at a time:
Thought: <what you need next>
Action: <search_docs or calculator>
Action Input: <the tool input>

When you know the answer, reply:
Thought: <why you are done>
Final Answer: <the answer>"""

TOOLS = {"search_docs": search_docs, "calculator": calculator}
ACTION = re.compile(r"Action:\s*`?(\w+)`?\s*\n+\s*Action Input:\s*(.+)", re.IGNORECASE)
FINAL = re.compile(r"Final Answer:\s*(.+)", re.IGNORECASE | re.DOTALL)


def run(llm, task, max_turns=6):
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": task}]
    for turn in range(1, max_turns + 1):
        reply = llm.chat(messages, name=f"react-turn-{turn}")
        action = ACTION.search(reply)
        final = FINAL.search(reply)
        if final and not action:  # prefer acting if the model did both in one reply
            answer = final.group(1).strip().splitlines()[0]
            return answer, EXPECTED in answer.replace(",", "")
        if not action:
            messages += [{"role": "assistant", "content": reply},
                         {"role": "user", "content": "Use the format: Thought / Action / Action Input, or Final Answer."}]
            continue
        tool, arg = action.group(1), action.group(2).strip().splitlines()[0]
        observation = llm.tool(tool, TOOLS[tool], arg) if tool in TOOLS else f"unknown tool {tool!r}"
        kept = reply[: action.end()].split("Observation:")[0]  # drop any invented observation
        messages += [{"role": "assistant", "content": kept},
                     {"role": "user", "content": f"Observation: {observation}"}]
    return "gave up after max turns", False


if __name__ == "__main__":
    run_example(EXAMPLE, TASK, run)
