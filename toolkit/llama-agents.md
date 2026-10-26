---
layout: page
title: Local Llama agents in the browser
permalink: /toolkit/llama-agents/
eyebrow: "Toolkit"
description: "Four small agent patterns for a local Llama model (ReAct, JSON extraction with repair, planner/executor, self-critique). GitHub Actions runs them live on Ollama; this page re-runs the same Python in your browser against what the model said in the latest run."
---

<link rel="stylesheet" href="{{ '/assets/toolkit/toolkit.css' | relative_url }}">

{%- assign runs = site.data.agent_runs -%}
{%- assign latest = runs.latest -%}

Each example is one short Python file that talks to [Ollama](https://ollama.com)'s HTTP API.
A GitHub Actions workflow installs Ollama on a CPU runner, pulls `llama3.2:1b`, runs the
examples **live**, logs every step through the [Evidently template]({{ '/toolkit/evidently/' | relative_url }}),
and commits the transcripts and the report back into this site.

Your browser can't run Llama, but it can run Python. The runner below loads
[Pyodide](https://pyodide.org) (CPython compiled to WebAssembly) and runs the example code
unchanged. The model's replies come from `llm.py`'s replay backend, which serves the responses
recorded in the latest CI run. The tools, the parsing, the JSON validation and the retry
loops all run for real. Edit the code and run it again. If you change a prompt, the replay
backend returns the closest recorded reply and labels it `nearest match`.

<div class="tk-wide" data-agent-runner
     data-pyodide-url="https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"
     data-py-base="{{ '/assets/toolkit/llama-agents/py' | relative_url }}"
     data-sample-base="{{ '/assets/toolkit/llama-agents/samples' | relative_url }}"
     data-examples='[{"name":"react_calculator","file":"01_react_calculator.py","title":"1 · ReAct: docs search + calculator"},{"name":"json_extraction","file":"02_json_extraction.py","title":"2 · JSON extraction + validate/retry"},{"name":"planner_executor","file":"03_planner_executor.py","title":"3 · Planner → executor → synthesizer"},{"name":"self_critique","file":"04_self_critique.py","title":"4 · Self-critique: draft → critique → revise"}]'>

  <div class="tk-panel tk-gap-b">
    <p class="tk-eyebrow">Latest CI run</p>
    <dl class="tk-meta" data-meta></dl>
  </div>

  <div class="tk-toolbar">
    <label for="tk-example">Example</label>
    <select id="tk-example" data-example-select></select>
    <button type="button" class="btn btn--primary" data-run>Run in browser</button>
    <button type="button" class="btn btn--secondary" data-reset>Reset code</button>
    <span class="tk-toolbar__spacer"></span>
    <span class="tk-pill" data-status role="status" aria-live="polite">ready</span>
  </div>

  <div class="tk-runner">
    <div class="tk-pane">
      <div class="tk-pane__head"><label for="tk-editor"><code data-file>examples/…</code> (editable)</label><span>Ctrl/⌘ + Enter to run</span></div>
      <textarea id="tk-editor" class="tk-editor" data-editor spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Example source code"></textarea>
    </div>
    <div class="tk-pane">
      <div class="tk-pane__head"><span>stdout</span><span data-replay-source></span></div>
      <pre class="tk-output" data-output aria-live="polite" tabindex="0">Press “Run in browser”. The first run downloads Pyodide (about 10 MB) from cdn.jsdelivr.net.</pre>
    </div>
  </div>

  <div class="tk-panel tk-gap-t">
    <p class="tk-eyebrow">Recorded trace for this example (one row per span)</p>
    <ol class="tk-steps" data-steps></ol>
  </div>
</div>

<script type="application/json" id="agent-runs-data">{{ runs | jsonify | replace: "</", "<\/" }}</script>
<script defer src="{{ '/assets/toolkit/llama-agents.js' | relative_url }}"></script>

## The four patterns

<div class="tk-scroll" markdown="1">

| # | Pattern | What the Python does around the model | Pass check |
|---|---|---|---|
| 1 | ReAct | parses `Action:` / `Action Input:`, runs `search_docs` or `calculator`, feeds back `Observation:`; cuts any observation the model invents | answer contains `34302` |
| 2 | JSON extraction | Ollama `format: "json"`, then a schema check in plain Python; sends the exact errors back for up to 3 attempts | object validates |
| 3 | Planner → executor | JSON plan is validated before anything runs; the model writes the arithmetic, the calculator computes it | answer contains `6.5` |
| 4 | Self-critique | model scores its own draft as JSON, plus hard checks (≤ 50 words, has an example) it cannot argue with | hard checks pass |

</div>

All four share [`llm.py`]({{ '/assets/toolkit/llama-agents/py/llm.py' | relative_url }}): a
standard-library Ollama client, the replay backend, and a `Transcript` that records every
call (used for replay) and every step (turned into OpenTelemetry spans for Evidently).
Repo path: `toolkit-src/llama-agents/`.

```python
# llm.py — the whole live backend is one POST to Ollama
body = {"model": self.model, "messages": messages, "stream": False,
        "options": {"temperature": 0, "seed": 42}}
if fmt is not None:
    body["format"] = fmt  # "json" or a JSON schema -> Ollama constrains decoding
req = urllib.request.Request(f"{self.host}/api/chat", data=json.dumps(body).encode(),
                             headers={"content-type": "application/json"}, method="POST")
```

```python
# 02_json_extraction.py — validate, then repair with the exact errors
for attempt in range(1, max_attempts + 1):
    reply = llm.chat(messages, fmt="json", name=f"extract-attempt-{attempt}")
    obj = json.loads(reply)
    errors = validate(obj)
    if not errors:
        return obj, True
    messages += [{"role": "assistant", "content": reply},
                 {"role": "user", "content": "Your JSON failed validation:\n- " + "\n- ".join(errors)
                  + "\nReturn the corrected JSON object only."}]
```

Run them yourself:

```bash
cd toolkit-src/llama-agents
LLAMA_BACKEND=mock python examples/01_react_calculator.py      # offline, no Ollama
ollama serve & ollama pull llama3.2:1b
LLAMA_BACKEND=ollama python examples/01_react_calculator.py    # live
python run_all.py --backend ollama --evidently --site ../..    # what CI runs
```

## How a run gets from GitHub Actions to this page

```mermaid
flowchart TB
  T["workflow_dispatch<br/>or repository_dispatch"] --> R["run-agents job<br/>install Ollama + pull model"]
  R --> X["run_all.py --backend ollama<br/>4 examples, live"]
  X --> E["evllama: OTel spans,<br/>Evidently report + tests"]
  E --> C["commit transcripts, report,<br/>_data/agent_runs.json to stable"]
  C --> B["build job: jekyll build<br/>(same steps as deploy.yml)"]
  B --> D["deploy job:<br/>actions/deploy-pages"]
  D --> P["this page: Pyodide replays<br/>the new transcripts"]
```

The workflow is
[`.github/workflows/llama-agents.yml`](https://github.com/sweeden-ttu/profile/blob/stable/.github/workflows/llama-agents.yml).
It builds and deploys Pages itself because **a push made with `GITHUB_TOKEN` does not trigger
other workflows**: `deploy.yml` would never see the results commit. It still commits the
results to `stable`, so the next ordinary deploy keeps them. It also shares `deploy.yml`'s
concurrency group, `pages`, so the two never deploy over each other. Permissions are read-only
by default. Only the job that commits gets `contents: write`, and only the deploy job gets
`pages: write` and `id-token: write`.

Trigger it from the CLI:

```bash
gh workflow run llama-agents.yml -R sweeden-ttu/profile -f model=llama3.2:1b -f example=all
gh run watch -R sweeden-ttu/profile
```

Or from anywhere with `repository_dispatch`. This needs a fine-grained personal access token
scoped to this repository only, with **Contents: Read and write**. Never paste a real token
into a page or a commit.

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer github_pat_XXXXXXXXXXXXXXXXXXXXXXXX" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/sweeden-ttu/profile/dispatches \
  -d '{"event_type":"run-llama-agents","client_payload":{"model":"llama3.2:1b","example":"all"}}'
```

`model` must match `^[A-Za-z0-9._:/-]{1,64}$` and `example` must be `all` or an example name.
The workflow checks both before using them, and it never interpolates them into a shell
script. Keep to small models: the runner is a CPU-only VM.

## Recent runs

{% if runs.history and runs.history.size > 0 -%}
<div class="tk-scroll" markdown="1">

| When (UTC) | Model | Backend | Examples | Evidently tests | Run |
|---|---|---|---|---|---|
{% for h in runs.history limit: 10 -%}
| {{ h.generated_at | replace: "T", " " | replace: "+00:00", "" }} | `{{ h.model }}` | {{ h.backend }} | {{ h.passed }}/{{ h.total }} | {% if h.tests_total %}{{ h.tests_passed }}/{{ h.tests_total }}{% else %}—{% endif %} | {% if h.run_url %}[#{{ h.run_number }}]({{ h.run_url }}){% else %}local seed{% endif %} |
{% endfor %}

</div>
{%- else -%}
No runs recorded yet.
{%- endif %}

{% if latest.report %}The [Evidently report for the latest run]({{ latest.report | relative_url }}) covers
every LLM call: output length, JSON validity, refusals, toxicity heuristics and latency, with
pass/fail tests.{% endif %}
{% if latest.backend != "ollama" %}*The data shown now comes from the offline seed: scripted, synthetic responses
generated with `tools/seed_recordings.py`. The first workflow run replaces it with real
`llama3.2:1b` output.*{% endif %}
