# evidently-llama: an Evidently template for local Llama agents

A copyable template that gives a small agent running on an **Ollama-served Llama model** a full
evaluation loop: datasets, versioned prompts, OpenTelemetry traces, descriptors, a local
LLM judge, reports with tests, a local Evidently dashboard, and loadable skills.
Everything runs on your machine. There are no cloud keys, and `--mock` replays recorded
responses, so it runs without Ollama too.

Write-up with diagram and sample report: <https://scottweeden.online/toolkit/evidently/>

## Quick start

```bash
pip install -r requirements.txt            # Python >= 3.11 (pandas 3). DO_NOT_TRACK=1 disables Evidently telemetry
python -m evllama demo --mock              # offline: replays data/recordings/demo.json
python -m unittest discover -s tests       # smoke tests, offline

ollama serve & ollama pull llama3.2:1b     # live
python -m evllama demo                     # LLAMA_MODEL=..., OLLAMA_HOST=... to override
python -m evllama demo --record            # live + refresh the recordings --mock replays
evidently ui --workspace out/workspace     # dashboard + snapshots at http://localhost:8000

python -m evllama prompts                  # prompt versions + feedback
python -m evllama skills                   # loaded skills
```

Outputs land in `out/`: `report.html` (current prompt vs reference prompt), `summary.json`
(metrics + test results per version), `dataset_v*.csv` (rows with every descriptor),
`spans.jsonl` (one OpenTelemetry span per agent step), `experiments.csv` (the ledger), and
`workspace/` (a local Evidently project with dashboard panels and one snapshot per run).

## What goes where

| Thing | Evidently surface | Module |
|---|---|---|
| agent I/O rows (`input`, `output` + metrics) | Dataset → Report | `evllama/datasets.py` |
| prompt + the feedback it earned | Prompt version (user/system = prompt, assistant = feedback) | `evllama/prompts.py` |
| each agent step (route/llm/tool/validate/judge) | span in ONE tracing dataset named `trace` | `evllama/tracing.py` |
| each evaluated configuration | row in ONE `experiments` ledger | `evllama/datasets.py` |
| an eval run | Report snapshot (`include_data=False`) | `evllama/dashboard.py` |

Set `EVIDENTLY_URL=http://localhost:8000` (plus `EVIDENTLY_TOKEN` if your UI has a secret) to
mirror everything to a self-hosted `evidently ui`. Prompts and the ledger go over REST, spans
go through Tracely, and snapshots go through `RemoteWorkspace`. This path was verified against
Evidently UI 0.7.23. Never create a dataset named after a surface (`prompts …`, `trace …`, `experiments …`).

## Layout

```
evllama/
  config.py        Settings (env: LLAMA_MODEL, OLLAMA_HOST, EVIDENTLY_URL, EVIDENTLY_TOKEN)
  llm.py           OllamaChat (stdlib urllib), ReplayChat (exact hash, then nearest), RecordingChat
  prompts.py       PromptRegistry: render / bump / record_feedback / push
  skills.py        load skills/*.md (front matter + instructions), deterministic routing
  tools.py         calc (AST-only arithmetic), lookup (keyword search over data/docs.json)
  agent.py         SkillAgent: route -> llm -> [TOOL name: arg -> tool -> llm] -> validate; spans per step
  tracing.py       AgentTracer (OTel SDK + JSONL exporter; Tracely when EVIDENTLY_URL is set)
  descriptors.py   TextLength/WordCount/SentenceCount + offline heuristics + json_valid + LocalJudge
  datasets.py      rows -> Evidently Dataset with DataDefinition; ExperimentLedger (append-only CSV)
  reports.py       build_report (TextEvals + thresholded tests), test_summary, save_html (shared JS lib)
  dashboard.py     local Workspace project + panels, add_run
  evidently_rest.py  stdlib REST client for the optional self-hosted UI
  cli.py           `python -m evllama demo|prompts|skills`
skills/            calculator, extractor, docs_qa, summarizer, general
prompts/registry.json   versioned prompts (agent-system v1/v2, judge v1), committed
data/              demo_tasks.jsonl, docs.json, recordings/demo.json
tools/make_mock_recordings.py   regenerates the offline recordings from scripted responses
tests/test_smoke.py
```

## Adapting it

* **Your own agent:** keep the contract `run(task) -> {"input", "output", ...metrics}` and wrap
  each step in `tracer.span(name, kind=..., input=...)`. Everything downstream stays as it is.
* **New skill:** drop a `skills/<name>.md` with `name/description/triggers/tools/output`.
* **New prompt version:** `registry.bump("agent-system", system=..., template=..., note="why")`,
  then `python -m evllama demo --reference-version 2 --current-version 3`.
* **Stricter gates:** thresholds live in `reports.build_report` and `descriptors.standard_descriptors`.
  `summary.json["versions"][...]["tests"]` is easy to fail a CI job on.
* **Online descriptors:** Evidently's `Sentiment()` (NLTK download) and `HuggingFaceToxicity()`
  (HF model) can replace the heuristics. `pip install litellm` enables Evidently's own
  `LLMEval(provider="ollama", ...)`.

## About the bundled recordings

`data/recordings/demo.json` holds **synthetic, hand-written** responses that imitate typical
`llama3.2:1b` behaviour (written by `tools/make_mock_recordings.py`). They exist so the demo runs
anywhere. Replace them with real model output with `python -m evllama demo --record`.

Pinned and verified together: evidently 0.7.23, tracely 0.2.12, opentelemetry 1.45.1, pandas 3.0.5.
Evidently's API changed substantially in 0.7 (`from evidently import Dataset, Report`, `evidently.presets`, descriptors
on `Dataset`). Code written for 0.4–0.6 (`ColumnMapping`, `TestSuite`, `evidently.metric_preset`) will not run here.
