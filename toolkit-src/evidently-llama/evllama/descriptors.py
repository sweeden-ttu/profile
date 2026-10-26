"""Row-level descriptors for agent I/O: built-ins + offline heuristics + a local LLM judge.

Nothing here downloads a model or calls a cloud API:

* built-in Evidently: TextLength, WordCount, SentenceCount
* heuristics (CustomColumnDescriptor): lexicon sentiment, blocklist toxicity, refusal, PII
* JSON validity aware of which skill expected JSON (CustomDescriptor over the whole row)
* LocalJudge: LLM-as-judge using the SAME local Llama (or its replayed recordings)

Evidently's own Sentiment() needs an NLTK download and HuggingFaceToxicity() a HF model,
which is why the defaults below are heuristic. Swap them in if you are online.
"""
from __future__ import annotations

import re
from typing import Any, List, Optional

import pandas as pd
from evidently import Dataset
from evidently.core.datasets import DatasetColumn
from evidently.descriptors import (CustomColumnDescriptor, CustomDescriptor, SentenceCount, TestSummary, TextLength,
                                   WordCount)
from evidently.tests import eq, gte, lte

from .agent import extract_json
from .prompts import PromptRegistry

POSITIVE = {"good", "great", "helpful", "glad", "happy", "correct", "clear", "thanks", "excellent", "success",
            "works", "resolved", "easy", "welcome", "nice", "love", "best", "improved", "accurate"}
NEGATIVE = {"bad", "wrong", "error", "fail", "failed", "sorry", "unfortunately", "problem", "broken", "angry",
            "terrible", "worse", "worst", "hate", "slow", "confusing", "annoying", "useless", "crash"}
TOXIC = {"idiot", "stupid", "moron", "dumb", "shut up", "hate you", "loser", "pathetic"}
REFUSAL = re.compile(r"\b(i can(?:no|')t|i am unable|i'm unable|as an ai|i won't|cannot help|not able to)\b", re.I)
PII = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+|\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b")
WORD = re.compile(r"[a-z']+")


def _sentiment(col: DatasetColumn) -> DatasetColumn:
    def score(text: Any) -> float:
        words = WORD.findall(str(text).lower())
        pos, neg = sum(w in POSITIVE for w in words), sum(w in NEGATIVE for w in words)
        return 0.0 if pos + neg == 0 else round((pos - neg) / (pos + neg), 3)

    return DatasetColumn(type="num", data=col.data.map(score))


def _toxicity(col: DatasetColumn) -> DatasetColumn:
    return DatasetColumn(type="cat", data=col.data.map(
        lambda t: "flagged" if any(w in str(t).lower() for w in TOXIC) else "clean"))


def _refusal(col: DatasetColumn) -> DatasetColumn:
    return DatasetColumn(type="cat", data=col.data.map(lambda t: "refusal" if REFUSAL.search(str(t)) else "answer"))


def _pii(col: DatasetColumn) -> DatasetColumn:
    return DatasetColumn(type="cat", data=col.data.map(lambda t: "pii" if PII.search(str(t)) else "none"))


def _json_valid(ds: Dataset) -> DatasetColumn:
    df = ds.as_dataframe()
    expects = df["expects_json"] if "expects_json" in df else pd.Series(False, index=df.index)
    values = ["n/a" if not bool(e) else ("valid" if extract_json(str(o)) is not None else "invalid")
              for e, o in zip(expects, df["output"])]
    return DatasetColumn(type="cat", data=pd.Series(values, index=df.index))


class LocalJudge:
    """LLM-as-judge on the local model. Prompt comes from the registry ("judge"), so the
    judge itself is versioned. Parses `SCORE: <1-5>`; unparseable -> NaN (visible as missing)."""

    SCORE = re.compile(r"SCORE\s*[:=]\s*([1-5])", re.I)

    def __init__(self, chat, registry: PromptRegistry, tracer=None, version: Any = "latest"):
        self.chat, self.registry, self.tracer, self.version = chat, registry, tracer, version
        self.__name__ = "local_judge"  # CustomDescriptor records "<module>.<__name__>" for callables

    def score_one(self, question: str, answer: str) -> Optional[float]:
        msgs = self.registry.render("judge", self.version, question=question, answer=answer)
        if self.tracer is None:
            text = self.chat.chat(msgs).text
        else:
            with self.tracer.span("judge", kind="judge", input=answer, statement="LLM-as-judge") as s:
                resp = self.chat.chat(msgs)
                text = resp.text
                self.tracer.set(s, output=text, latency_ms=resp.latency_ms, replay_match=resp.match)
        m = self.SCORE.search(text)
        return float(m.group(1)) if m else float("nan")

    def __call__(self, ds: Dataset) -> DatasetColumn:
        df = ds.as_dataframe()
        scores = [self.score_one(str(q), str(a)) for q, a in zip(df["input"], df["output"])]
        return DatasetColumn(type="num", data=pd.Series(scores, index=df.index))


def standard_descriptors(judge: Optional[LocalJudge] = None, max_chars: int = 1200) -> List[Any]:
    """The descriptor set used by the demo and by the llama-agents CI run."""
    ds: List[Any] = [
        TextLength("output", alias="output_chars", tests=[lte(max_chars)]),
        WordCount("output", alias="output_words"),
        SentenceCount("output", alias="output_sentences"),
        CustomColumnDescriptor("output", _sentiment, alias="sentiment_heuristic"),
        CustomColumnDescriptor("output", _toxicity, alias="toxicity", tests=[eq("clean")]),
        CustomColumnDescriptor("output", _refusal, alias="refusal", tests=[eq("answer")]),
        CustomColumnDescriptor("output", _pii, alias="pii"),
        CustomDescriptor(_json_valid, alias="json_valid"),
    ]
    if judge is not None:
        ds.append(CustomDescriptor(judge, alias="judge_score", tests=[gte(3)]))
    ds.append(TestSummary(success_all=True, success_rate=True, alias="row_tests"))
    return ds
