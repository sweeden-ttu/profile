---
layout: lab
permalink: /lab/domains/
lab_slug: domains
title: Domains
hero_title: "Five surfaces, one scaffold."
hero_lede: "The lab studies problems where the right answer is contingent on the data — and where adversaries, biology, or physics can move faster than a static benchmark. Each surface inherits the same chain-of-custody."
hero_visual: orbit
hero_caption_id: DOMAIN · ATLAS-05
hero_actions:
  - { label: "See methodology", href: "/lab/methodology/" }
  - { label: "Open a proposal", href: "/lab/collaborate/" }
hero_metrics:
  - { value: "5", label: "research surfaces" }
  - { value: "9", label: "active sub-projects" }
  - { value: "2", label: "industrial collaborators" }
toc_meta:
  - { label: "Working groups", value: "5 active" }
  - { label: "Last review", value: "Mar 2026" }
---

## The shared scaffold

Every domain we work in has the same skeleton: a content-addressed dataset, a parametric and a non-parametric model run in parallel, an adversarial stress harness, and a public review thread. What changes between surfaces is the **adversary** — the source of the hardness — and that, more than the model class, is what tells us whether a result is real.

<div class="lab-callout lab-callout--good">
  <span class="lab-callout__mark">✓</span>
  <div>
    <p class="lab-callout__title">A domain earns its place by having a credible hard distribution.</p>
    <p class="lab-callout__body">If the only adversary on a domain is "we held out 20% of the data," it is not a research surface — it is an exam. Every domain below has a defended position on what the worst-case data looks like and why.</p>
  </div>
</div>

## 01 — Reinforcement learning &amp; agentic systems

We study agents that learn under **partial observability** and under **non-stationary** reward, where the environment itself shifts as the policy improves. The flagship project is feature-based Q-learning under spectral drift: the feature basis evolves with the policy, so a stable representation cannot be assumed.

- Open-loop and closed-loop benchmark suites with content-addressed seeds
- Counterfactual replays — what would the policy have done at this state-hash, two checkpoints ago?
- Public adversary catalogue: every reward perturbation we use is published and citeable

## 02 — Computational biology &amp; cohort analysis

Longitudinal cohorts are the hardest data we touch — sparse, irregular, and with a censoring process that is itself informative. We study **non-parametric bounds on observational bias** and the price of pretending a cohort is a randomised trial when it is not.

- Hazard-rate models with content-addressed cohort partitions
- Synthetic cohort generators for stress-testing causal claims
- A reproducibility audit pipeline for prior published findings — when a claim fails to replicate, the audit is published with the negative result

## 03 — Quantum-inspired optimisation

Not quantum hardware — **quantum-inspired** classical solvers that adopt the structure of variational ansätze for combinatorial problems. We are interested in where the speedup actually comes from: representation, or sampling, or both.

- Benchmarks against simulated annealing on the same problem encodings
- Ablation suites that strip the quantum-inspired layer to see if anything is left

## 04 — Cryptographic protocol verification

Protocol verification is a domain where a **negative result is the publishable result**. We focus on machine-checked proofs and the gap between the proven model and the deployed implementation.

- Proof artefacts in Coq and Lean, content-addressed alongside the protocol document
- Side-channel models published with the verification — a clean proof is not the same as a safe implementation
- Joint work with the Cryptography course (CS-6343) at TTU

## 05 — Adversarial robustness &amp; safety

The catch-all surface for problems where the **adversary is the data** — prompt injection, distributional shift, emergent misuse. The lab takes an empirical-first stance here: a defence claim is only as strong as the suite of attacks it survives.

- Public attack catalogue with reproducible payloads
- Held-out red team rotation — reviewers run their own attacks at peer-review time
- Disclosure protocol for vulnerabilities found in deployed systems

## How a domain joins the atlas

A new domain enters the atlas only when it has (a) a credible adversary, (b) a content-addressed dataset, and (c) a working group of at least three reviewers willing to triage submissions. We review the atlas every semester and retire surfaces that have lost their hard distribution.
