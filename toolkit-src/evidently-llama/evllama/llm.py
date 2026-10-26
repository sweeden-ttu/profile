"""Chat backends for a local Llama served by Ollama, plus deterministic replay.

Stdlib only (urllib + json) so the same file works on a laptop, in CI and in Pyodide.

* OllamaChat    -> POST {OLLAMA_HOST}/api/chat  (stream=false, temperature 0, fixed seed)
* ReplayChat    -> returns recorded responses; exact request-hash match first, then the
                   nearest recorded request (token Jaccard on the last user message)
* RecordingChat -> wraps a live backend and writes every exchange to a recordings file,
                   which is exactly what ReplayChat / `--mock` reads back.

Recording file format (also accepted: llama-agents transcripts, which use "calls"):

    {"format": "evllama-recordings/v1", "model": "...", "source": "...",
     "records": [{"key", "messages", "format", "response", "latency_ms",
                  "prompt_tokens", "completion_tokens", "model"}]}
"""
from __future__ import annotations

import hashlib
import json
import re
import time
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Union

Message = Dict[str, str]
JsonFormat = Union[None, str, Dict[str, Any]]  # Ollama `format`: None, "json" or a JSON schema


def request_key(messages: List[Message], fmt: JsonFormat = None) -> str:
    """Stable hash of a chat request. The model name is deliberately NOT part of the key,
    so recordings made with llama3.2:1b replay fine when you configure another tag."""
    payload = json.dumps({"messages": messages, "format": fmt}, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


@dataclass
class ChatResponse:
    text: str
    latency_ms: float
    prompt_tokens: int = 0
    completion_tokens: int = 0
    model: str = ""
    backend: str = ""
    match: str = "live"  # live | exact | nearest


class OllamaChat:
    """Minimal Ollama /api/chat client (https://github.com/ollama/ollama/blob/main/docs/api.md)."""

    name = "ollama"

    def __init__(self, model: str, host: str = "http://localhost:11434", timeout: float = 300.0,
                 temperature: float = 0.0, seed: int = 42):
        self.model, self.host, self.timeout = model, host.rstrip("/"), timeout
        self.options = {"temperature": temperature, "seed": seed}

    def chat(self, messages: List[Message], fmt: JsonFormat = None) -> ChatResponse:
        body: Dict[str, Any] = {"model": self.model, "messages": messages, "stream": False, "options": self.options}
        if fmt is not None:
            body["format"] = fmt
        req = urllib.request.Request(
            f"{self.host}/api/chat", data=json.dumps(body).encode("utf-8"),
            headers={"content-type": "application/json"}, method="POST",
        )
        t0 = time.perf_counter()
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        latency_ms = (time.perf_counter() - t0) * 1000.0
        return ChatResponse(
            text=data.get("message", {}).get("content", ""),
            latency_ms=round(latency_ms, 1),
            prompt_tokens=int(data.get("prompt_eval_count") or 0),
            completion_tokens=int(data.get("eval_count") or 0),
            model=data.get("model", self.model),
            backend=self.name,
        )


_WORD = re.compile(r"[a-z0-9]+")


def _tokens(text: str) -> set:
    return set(_WORD.findall(text.lower()))


def _last_user(messages: List[Message]) -> str:
    for m in reversed(messages):
        if m.get("role") == "user":
            return m.get("content", "")
    return ""


def _system(messages: List[Message]) -> str:
    return next((m.get("content", "") for m in messages if m.get("role") == "system"), "")


class ReplayChat:
    """Deterministic replay of recorded exchanges. Never touches the network."""

    name = "replay"

    def __init__(self, records: Iterable[Dict[str, Any]], model: str = "replay", allow_nearest: bool = True):
        self.records = [r for r in records if "response" in r]
        self.by_key = {r.get("key") or request_key(r["messages"], r.get("format")): r for r in self.records}
        self.model, self.allow_nearest = model, allow_nearest

    @classmethod
    def from_files(cls, paths: Iterable[Union[str, Path]], **kw) -> "ReplayChat":
        records: List[Dict[str, Any]] = []
        for p in paths:
            p = Path(p)
            files = sorted(p.glob("*.json")) if p.is_dir() else [p]
            for f in files:
                doc = json.loads(f.read_text(encoding="utf-8"))
                records.extend(doc.get("records") or doc.get("calls") or [])
        return cls(records, **kw)

    def chat(self, messages: List[Message], fmt: JsonFormat = None) -> ChatResponse:
        key = request_key(messages, fmt)
        rec, match = self.by_key.get(key), "exact"
        if rec is None:
            if not self.allow_nearest or not self.records:
                raise KeyError(f"no recorded response for request {key}")
            # Nearest neighbour: same system prompt preferred, then Jaccard on the user turn.
            q, sys_prompt = _tokens(_last_user(messages)), _system(messages)

            def score(r: Dict[str, Any]) -> float:
                t = _tokens(_last_user(r["messages"]))
                jac = len(q & t) / max(1, len(q | t))
                return jac + (0.5 if _system(r["messages"]) == sys_prompt else 0.0)

            rec, match = max(self.records, key=score), "nearest"
        return ChatResponse(
            text=rec["response"], latency_ms=float(rec.get("latency_ms", 0.0)),
            prompt_tokens=int(rec.get("prompt_tokens", 0)), completion_tokens=int(rec.get("completion_tokens", 0)),
            model=rec.get("model", self.model), backend=self.name, match=match,
        )


class RecordingChat:
    """Wrap a live backend; every exchange is appended to `path` (deduplicated by key)."""

    def __init__(self, inner: OllamaChat, path: Union[str, Path], source: str = "ollama"):
        self.inner, self.path, self.source = inner, Path(path), source
        self.name = f"{inner.name}+record"
        self._records: Dict[str, Dict[str, Any]] = {}

    def chat(self, messages: List[Message], fmt: JsonFormat = None) -> ChatResponse:
        resp = self.inner.chat(messages, fmt)
        key = request_key(messages, fmt)
        self._records[key] = {"key": key, "messages": [dict(m) for m in messages], "format": fmt, "response": resp.text,
                              "latency_ms": resp.latency_ms, "prompt_tokens": resp.prompt_tokens,
                              "completion_tokens": resp.completion_tokens, "model": resp.model}
        return resp

    def save(self) -> Path:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        doc = {"format": "evllama-recordings/v1", "model": getattr(self.inner, "model", ""),
               "source": self.source, "records": list(self._records.values())}
        self.path.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
        return self.path


def make_chat(settings) -> Union[OllamaChat, ReplayChat, RecordingChat]:
    """Pick a backend from Settings: --mock replays, --record records, default is live Ollama."""
    if settings.mock:
        return ReplayChat.from_files([settings.recordings], model=settings.model)
    live = OllamaChat(settings.model, settings.ollama_host)
    if settings.record:
        return RecordingChat(live, settings.recordings, source=f"ollama:{settings.model}")
    return live


def response_dict(resp: ChatResponse) -> Dict[str, Any]:
    return asdict(resp)
