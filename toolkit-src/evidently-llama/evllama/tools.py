"""Deterministic tools the agent can call. No network, no eval()."""
from __future__ import annotations

import ast
import json
import math
import operator
import re
from pathlib import Path
from typing import Callable, Dict, List

_BIN = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv,
        ast.FloorDiv: operator.floordiv, ast.Mod: operator.mod, ast.Pow: operator.pow}
_UNARY = {ast.UAdd: operator.pos, ast.USub: operator.neg}
_FUNCS = {"sqrt": math.sqrt, "round": round, "abs": abs, "min": min, "max": max}


def calc(expression: str) -> str:
    """Safely evaluate an arithmetic expression via the AST (numbers, + - * / // % **, a few funcs)."""
    expr = expression.strip().strip("`").replace("^", "**").replace("×", "*").replace(",", "")
    expr = re.sub(r"(\d+(?:\.\d+)?)\s*%", r"(\1/100)", expr)  # "15%" -> (15/100)

    def ev(node):
        if isinstance(node, ast.Expression):
            return ev(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in _BIN:
            if isinstance(node.op, ast.Pow) and abs(ev(node.right)) > 64:
                raise ValueError("exponent too large")
            return _BIN[type(node.op)](ev(node.left), ev(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY:
            return _UNARY[type(node.op)](ev(node.operand))
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in _FUNCS:
            return _FUNCS[node.func.id](*[ev(a) for a in node.args])
        raise ValueError(f"unsupported expression: {ast.dump(node)[:60]}")

    value = ev(ast.parse(expr, mode="eval"))
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    return str(round(value, 6) if isinstance(value, float) else value)


class DocsIndex:
    """Tiny keyword search over a JSON list of {"id", "title", "text"} docs."""

    def __init__(self, docs: List[Dict[str, str]]):
        self.docs = docs

    @classmethod
    def from_file(cls, path: Path) -> "DocsIndex":
        return cls(json.loads(Path(path).read_text(encoding="utf-8")))

    def search(self, query: str, k: int = 2) -> str:
        q = set(re.findall(r"[a-z0-9]+", query.lower()))
        scored = sorted(self.docs, key=lambda d: -len(q & set(re.findall(r"[a-z0-9]+", (d["title"] + " " + d["text"]).lower()))))
        hits = scored[:k]
        return "\n".join(f"[{d['id']}] {d['title']}: {d['text']}" for d in hits)


def make_tools(docs_path: Path) -> Dict[str, Callable[[str], str]]:
    index = DocsIndex.from_file(docs_path)
    return {"calc": calc, "lookup": index.search}
