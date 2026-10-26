# llama-agents: small agent patterns for a local Llama (Ollama)

Four agent examples, each one short Python file built on `llm.py`, a standard-library Ollama
client with a deterministic replay backend. The examples run unchanged on a laptop, on a
GitHub Actions runner, and in the browser through Pyodide:
<https://scottweeden.online/toolkit/llama-agents/>

| file | pattern |
|---|---|
| `examples/01_react_calculator.py` | ReAct loop with `search_docs` + `calculator` tools |
| `examples/02_json_extraction.py` | Ollama JSON mode + schema validation + repair retries |
| `examples/03_planner_executor.py` | JSON plan → validated → tool execution → synthesis |
| `examples/04_self_critique.py` | draft → JSON self-critique + hard checks → revise |

## Run

```bash
LLAMA_BACKEND=mock python examples/01_react_calculator.py          # offline, replays recordings/
ollama serve & ollama pull llama3.2:1b
LLAMA_BACKEND=ollama LLAMA_MODEL=llama3.2:1b python examples/02_json_extraction.py
python -m unittest discover -s tests                                # offline

# what CI does: run all, log spans + Evidently report via ../evidently-llama, publish into the site
pip install -r ../evidently-llama/requirements.txt
python run_all.py --backend ollama --evidently --site ../..
```

Backends (`LLAMA_BACKEND`): `ollama` (live, `OLLAMA_HOST`, default `http://localhost:11434`),
`mock` (replays `recordings/<example>.json`), `replay` (replays the transcripts in `LLAMA_REPLAY`).
Replay matches requests by hash. When an edited prompt has no exact recording, it serves the
nearest recorded call and prints `[replay: nearest match]`.

## Files `run_all.py --site <jekyll root>` writes

* `assets/toolkit/agent-runs/latest/transcripts/<example>.json`: every LLM call (replayable) and every step
* `assets/toolkit/agent-runs/latest/{summary.json, report.html, tests.json, spans.jsonl, llm_calls.csv}`
* `assets/toolkit/llama-agents/py/`: `llm.py` and `examples/`, which Pyodide fetches
* `assets/toolkit/llama-agents/samples/`: copies of `recordings/`, the page's fallback
* `_data/agent_runs.json`: latest run plus a 20-entry history, used by the page's Liquid

## CI

`.github/workflows/llama-agents.yml` runs on `workflow_dispatch` (inputs `model`, `example`,
`deploy`) and `repository_dispatch` (`run-llama-agents`). It installs Ollama, pulls the model,
runs the unit tests and then the examples live, commits the results to `stable`, and builds
and deploys Pages itself. A push made with `GITHUB_TOKEN` does not trigger `deploy.yml`, so the
workflow can't rely on it.

```bash
gh workflow run llama-agents.yml -R sweeden-ttu/profile -f model=llama3.2:1b -f example=all
curl -X POST -H "Accept: application/vnd.github+json" -H "Authorization: Bearer <FINE_GRAINED_PAT>" \
  https://api.github.com/repos/sweeden-ttu/profile/dispatches \
  -d '{"event_type":"run-llama-agents","client_payload":{"model":"llama3.2:1b","example":"all"}}'
```

## About `recordings/`

The bundled recordings are **synthetic** scripted responses (`tools/seed_recordings.py`). They
keep the mock backend and the website working before the first CI run. Refresh them from a
live run with `python run_all.py --backend ollama --save-recordings`.
