"""llm.py: the only dependency the agent examples have. Stdlib only.

It runs in three places without changes:
  * your laptop / CI      -> LLAMA_BACKEND=ollama  (talks to `ollama serve` on :11434)
  * anywhere, offline     -> LLAMA_BACKEND=mock    (replays recordings/ bundled with the repo)
  * the browser (Pyodide) -> LLAMA_BACKEND=replay  (replays the latest CI transcripts)

Every example builds a `Transcript`: `calls` hold each LLM request + response (what replay
reads back) and `steps` hold the agent's trace (llm / tool / validate / plan spans), which
the CI runner turns into OpenTelemetry spans and an Evidently report.
"""
from __future__ import annotations

import datetime as _dt
import hashlib
import json
import os
import re
import time
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

DEFAULT_MODEL = "llama3.2:1b"
HERE = Path(__file__).resolve().parent


def request_key(messages: List[Dict[str, str]], fmt: Any = None) -> str:
    """Same hash as evllama.llm.request_key: model-agnostic, so any tag can replay."""
    payload = json.dumps({"messages": messages, "format": fmt}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def _now() -> str:
    return _dt.datetime.now(_dt.timezone.utc).replace(microsecond=0).isoformat()


# --------------------------------------------------------------------------------------
# Backends: each has .name, .model and .chat(messages, fmt) -> dict
# --------------------------------------------------------------------------------------
class OllamaBackend:
    """POST /api/chat with stream=false, temperature 0 and a fixed seed (reproducible-ish)."""

    name = "ollama"

    def __init__(self, model: str = DEFAULT_MODEL, host: Optional[str] = None, timeout: float = 300.0):
        host = host or os.environ.get("OLLAMA_HOST", "http://localhost:11434")
        if not host.startswith(("http://", "https://")):
            host = "http://" + host
        self.model, self.host, self.timeout = model, host.rstrip("/"), timeout

    def chat(self, messages: List[Dict[str, str]], fmt: Any = None) -> Dict[str, Any]:
        import urllib.request  # imported lazily: not needed (or usable) in the browser

        body = {"model": self.model, "messages": messages, "stream": False,
                "options": {"temperature": 0, "seed": 42}}
        if fmt is not None:
            body["format"] = fmt  # "json" or a JSON schema -> Ollama constrains decoding
        req = urllib.request.Request(f"{self.host}/api/chat", data=json.dumps(body).encode(),
                                     headers={"content-type": "application/json"}, method="POST")
        t0 = time.perf_counter()
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            data = json.loads(resp.read().decode())
        return {"text": data.get("message", {}).get("content", ""),
                "latency_ms": round((time.perf_counter() - t0) * 1000, 1),
                "prompt_tokens": int(data.get("prompt_eval_count") or 0),
                "completion_tokens": int(data.get("eval_count") or 0),
                "model": data.get("model", self.model), "match": "live"}


class ReplayBackend:
    """Deterministic replay. Exact request-hash match first; otherwise the recorded call
    whose last user message is most similar (token Jaccard), flagged match="nearest"."""

    name = "replay"

    def __init__(self, records: List[Dict[str, Any]], model: str = "replay"):
        self.records = [r for r in records if "response" in r]
        self.by_key = {r.get("key") or request_key(r["messages"], r.get("format")): r for r in self.records}
        self.model = (self.records[0].get("model") if self.records else None) or model

    @classmethod
    def from_paths(cls, *paths: str) -> "ReplayBackend":
        records: List[Dict[str, Any]] = []
        for p in paths:
            path = Path(p)
            for f in (sorted(path.glob("*.json")) if path.is_dir() else [path]):
                if f.exists():
                    doc = json.loads(f.read_text(encoding="utf-8"))
                    records.extend(doc.get("calls") or doc.get("records") or [])
        return cls(records)

    @staticmethod
    def _toks(text: str) -> set:
        return set(re.findall(r"[a-z0-9]+", text.lower()))

    def chat(self, messages: List[Dict[str, str]], fmt: Any = None) -> Dict[str, Any]:
        rec, match = self.by_key.get(request_key(messages, fmt)), "exact"
        if rec is None:
            if not self.records:
                raise RuntimeError("replay backend has no recordings to replay")
            last = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
            q = self._toks(last)

            def score(r: Dict[str, Any]) -> float:
                t = self._toks(next((m["content"] for m in reversed(r["messages"]) if m["role"] == "user"), ""))
                same_turn = len(r["messages"]) == len(messages)  # same position in the conversation
                return len(q & t) / max(1, len(q | t)) + (0.5 if same_turn else 0.0)

            rec, match = max(self.records, key=score), "nearest"
        return {"text": rec["response"], "latency_ms": float(rec.get("latency_ms", 0.0)),
                "prompt_tokens": int(rec.get("prompt_tokens", 0)),
                "completion_tokens": int(rec.get("completion_tokens", 0)),
                "model": rec.get("model", self.model), "match": match}


def get_backend(name: Optional[str] = None, model: Optional[str] = None, example: Optional[str] = None):
    """Backend from args or env: LLAMA_BACKEND (ollama|mock|replay), LLAMA_MODEL, LLAMA_REPLAY."""
    name = (name or os.environ.get("LLAMA_BACKEND", "mock")).lower()
    model = model or os.environ.get("LLAMA_MODEL", DEFAULT_MODEL)
    if name == "ollama":
        return OllamaBackend(model)
    if name == "replay":
        src = os.environ.get("LLAMA_REPLAY", str(HERE / "recordings"))
        path = Path(src)
        if path.is_dir() and example and (path / f"{example}.json").exists():
            path = path / f"{example}.json"  # replay just this example's transcript
        return ReplayBackend.from_paths(str(path))
    if name == "mock":
        f = HERE / "recordings" / f"{example}.json" if example else HERE / "recordings"
        return ReplayBackend.from_paths(str(f))
    raise ValueError(f"unknown LLAMA_BACKEND {name!r} (use ollama, mock or replay)")


# --------------------------------------------------------------------------------------
# Transcript + LLM wrapper used by the examples
# --------------------------------------------------------------------------------------
class Transcript:
    def __init__(self, example: str, task: str, backend):
        self.data: Dict[str, Any] = {
            "format": "llama-agents-transcript/v1", "example": example, "task": task,
            "backend": backend.name, "model": getattr(backend, "model", ""), "started_at": _now(),
            "final_answer": None, "ok": None, "steps": [], "calls": [],
        }

    def step(self, kind: str, name: str, input: Any, output: Any, ok: bool = True,
             latency_ms: float = 0.0, **attrs: Any) -> None:
        """One agent step == one span later on (kind: llm | tool | validate | plan | critique)."""
        self.data["steps"].append({"step": len(self.data["steps"]) + 1, "kind": kind, "name": name,
                                   "input": input, "output": output, "ok": ok,
                                   "latency_ms": round(latency_ms, 1), **attrs})

    def finish(self, final_answer: Any, ok: bool) -> Dict[str, Any]:
        self.data.update(final_answer=final_answer, ok=bool(ok), finished_at=_now())
        return self.data

    def save(self, path: str) -> None:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(json.dumps(self.data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


class LLM:
    """What examples call. Records every call (for replay) and a step (for the trace)."""

    def __init__(self, backend, transcript: Transcript, verbose: bool = True):
        self.backend, self.transcript, self.verbose = backend, transcript, verbose

    def chat(self, messages: List[Dict[str, str]], fmt: Any = None, name: str = "llm") -> str:
        r = self.backend.chat(messages, fmt)
        self.transcript.data["calls"].append({
            # copy: examples extend `messages` in place, the record must keep this call's turns only
            "key": request_key(messages, fmt), "messages": [dict(m) for m in messages], "format": fmt,
            "response": r["text"],
            "latency_ms": r["latency_ms"], "prompt_tokens": r["prompt_tokens"],
            "completion_tokens": r["completion_tokens"], "model": r["model"]})
        self.transcript.step("llm", name, messages[-1]["content"], r["text"], latency_ms=r["latency_ms"],
                             prompt_tokens=r["prompt_tokens"], completion_tokens=r["completion_tokens"],
                             match=r["match"])
        if self.verbose:
            tag = "" if r["match"] in ("live", "exact") else f" [replay: {r['match']} match]"
            print(f"  llm/{name}{tag} ({r['latency_ms']:.0f} ms) -> {r['text'].strip()[:200]}")
        return r["text"]

    def tool(self, name: str, fn: Callable[[str], str], arg: str) -> str:
        t0 = time.perf_counter()
        try:
            out, ok = fn(arg), True
        except Exception as exc:  # a failing tool is an observation for the agent, not a crash
            out, ok = f"ERROR: {exc}", False
        self.transcript.step("tool", name, arg, out, ok=ok, latency_ms=(time.perf_counter() - t0) * 1000)
        if self.verbose:
            print(f"  tool/{name}({arg!r}) -> {out}")
        return out


def run_example(example: str, task: str, run: Callable[[LLM, str], Any], backend=None,
                verbose: bool = True) -> Dict[str, Any]:
    """Run one example end-to-end and return its transcript dict."""
    backend = backend or get_backend(example=example)
    transcript = Transcript(example, task, backend)
    llm = LLM(backend, transcript, verbose=verbose)
    if verbose:
        print(f"== {example} | backend={backend.name} model={getattr(backend, 'model', '')}")
        print(f"task: {task}")
    try:
        answer, ok = run(llm, task)
    except Exception as exc:  # keep the transcript even when the agent blows up
        answer, ok = f"agent error: {exc}", False
    if verbose:
        print(f"final answer: {answer}\nok: {ok}")
    return transcript.finish(answer, ok)


# --------------------------------------------------------------------------------------
# Shared deterministic tools
# --------------------------------------------------------------------------------------
def calculator(expression: str) -> str:
    """Arithmetic only, evaluated over the AST (no eval): + - * / // % ** and parentheses."""
    import ast
    import operator as op

    ops = {ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul, ast.Div: op.truediv,
           ast.FloorDiv: op.floordiv, ast.Mod: op.mod, ast.Pow: op.pow, ast.USub: op.neg, ast.UAdd: op.pos}
    expr = expression.strip().strip("`'\"").replace("^", "**").replace(",", "")

    def ev(n):
        if isinstance(n, ast.Expression):
            return ev(n.body)
        if isinstance(n, ast.Constant) and isinstance(n.value, (int, float)):
            return n.value
        if isinstance(n, ast.BinOp) and type(n.op) in ops:
            return ops[type(n.op)](ev(n.left), ev(n.right))
        if isinstance(n, ast.UnaryOp) and type(n.op) in ops:
            return ops[type(n.op)](ev(n.operand))
        raise ValueError(f"not arithmetic: {expression!r}")

    v = ev(ast.parse(expr, mode="eval"))
    return str(int(v) if isinstance(v, float) and v.is_integer() else round(v, 6))


DOCS = {
    "ollama-port": "Ollama serves its HTTP API on port 11434 by default.",
    "llama32-1b": "Llama 3.2 1B has about 1.24 billion parameters and a 128K-token context window.",
    "llama31-8b": "Llama 3.1 8B has about 8 billion parameters and a 128K-token context window.",
    "evidently": "Evidently is an open-source (Apache-2.0) library for evaluating and monitoring ML and LLM systems.",
    "pyodide": "Pyodide is CPython compiled to WebAssembly; it runs pure-Python code in the browser.",
    "gh-token": "Events triggered by the GITHUB_TOKEN do not start new workflow runs (except workflow_dispatch and repository_dispatch).",
}


def search_docs(query: str, k: int = 1) -> str:
    """Keyword search over DOCS; returns the best k snippets as 'id: text'."""
    q = set(re.findall(r"[a-z0-9]+", query.lower()))
    ranked = sorted(DOCS.items(), key=lambda kv: -len(q & set(re.findall(r"[a-z0-9]+", (kv[0] + " " + kv[1]).lower()))))
    return "\n".join(f"{i}: {t}" for i, t in ranked[:k])
