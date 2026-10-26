---
layout: page
title: Toolkit
permalink: /toolkit/
eyebrow: "Working notes, runnable"
description: "Reference material and runnable templates for evaluating small local language models: a cheat sheet, an Evidently observability template, and agent examples you can run in the browser."
---

<link rel="stylesheet" href="{{ '/assets/toolkit/toolkit.css' | relative_url }}">

<div class="tk-wide">
  <div class="grid grid--3 tk-cards">
    <article class="card">
      <span class="card__eyebrow">Reference</span>
      <h2 class="card__title"><a href="{{ '/toolkit/cheatsheet/' | relative_url }}">Cheat sheet</a></h2>
      <p class="card__excerpt">The 23 GoF patterns plus modern service and agent patterns, and competitive-programming algorithms with C++/Python snippets, complexity budgets and step-through visualisers. Search with <kbd>/</kbd>.</p>
      <div class="card__meta"><span>React · single file · works offline</span></div>
    </article>
    <article class="card">
      <span class="card__eyebrow">Template · Python</span>
      <h2 class="card__title"><a href="{{ '/toolkit/evidently/' | relative_url }}">Evidently template for local Llama agents</a></h2>
      <p class="card__excerpt">Datasets, versioned prompts, OpenTelemetry traces, heuristic descriptors, a local LLM judge, reports with tests, and a dashboard, all on an Ollama model. Includes a sample report.</p>
      <div class="card__meta"><span>Evidently 0.7.23 · runs offline with --mock</span></div>
    </article>
    <article class="card">
      <span class="card__eyebrow">Interactive · Pyodide + CI</span>
      <h2 class="card__title"><a href="{{ '/toolkit/llama-agents/' | relative_url }}">Llama agents in the browser</a></h2>
      <p class="card__excerpt">Four agent patterns that GitHub Actions runs live on Ollama. You can edit and re-run them here in Python (WebAssembly) against the model's recorded replies.</p>
      <div class="card__meta">
        {%- assign latest = site.data.agent_runs.latest -%}
        {%- if latest %}<span>Last run: {{ latest.passed }}/{{ latest.total }} passed · <code>{{ latest.model }}</code>{% if latest.backend != "ollama" %} (seed){% endif %}</span>{% endif -%}
      </div>
    </article>
  </div>

  <h2 class="tk-section-title">Kaggle competition cheat sheets</h2>
  <p>Reference notes for the open competitions I have entered: rules, scoring, compute limits and checklists, taken from the official pages and my own runs.</p>
  <div class="grid grid--3 tk-cards">
    <article class="card">
      <span class="card__eyebrow">ARC Prize 2026 · due 2 Nov</span>
      <h3 class="card__title"><a href="{{ '/toolkit/notes/arc-agi-2/' | relative_url }}">ARC-AGI-2</a></h3>
      <p class="card__excerpt">Submission format, exact-match scoring, measured data statistics and a verified baseline scorer that shows why fixed transforms score zero.</p>
    </article>
    <article class="card">
      <span class="card__eyebrow">ARC Prize 2026 · due 2 Nov</span>
      <h3 class="card__title"><a href="{{ '/toolkit/notes/arc-agi-3/' | relative_url }}">ARC-AGI-3</a></h3>
      <p class="card__excerpt">Interactive games, frames and actions, the squared-efficiency score with worked examples, and the agent interface.</p>
    </article>
  </div>
</div>
