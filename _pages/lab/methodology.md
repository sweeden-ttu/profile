# Methodology
---
layout: lab
permalink: /lab/methodology/
lab_slug: methodology
title: Methodology
hero_title: "Six stages, one chain of custody."
hero_lede: "Trust is not a feeling — it is a process. Every published claim resolves to a content-addressed artefact set: the data it was trained on, the code that produced it, and the environment that ran it. Anyone with the SHA can rebuild the result."
hero_visual: pillars
hero_caption_id: METHOD · CC-06
hero_actions:
  - { label: "Run a replication", href: "/lab/compute/" }
  - { label: "Read endorsements", href: "/lab/endorsements/" }
hero_metrics:
  - { value: "98.4%", label: "reproducibility rate" }
  - { value: "6", label: "stages, hashed" }
  - { value: "100%", label: "runs containerised" }
toc_meta:
  - { label: "Standard", value: "ETR-CC v3" }
  - { label: "Adopted by", value: "32 institutions" }
  - { label: "Last revision", value: "2025-11" }
---

## The chain in one sentence

A claim is **valid** when an independent reviewer with the published manifest can rebuild every figure in every paper from the raw inputs in finite time, on commodity hardware, without privileged access. If they cannot, the claim does not ship.

<div class="lab-callout">
  <span class="lab-callout__mark">∎</span>
  <div>
    <p class="lab-callout__title">The chain is enforced at submission time, not at publication time.</p>
    <p class="lab-callout__body">A paper does not enter the queue without a passing replication run. The CI system rebuilds every figure from the manifest the reviewer will receive. If the rebuild fails, the paper does not move forward.</p>
  </div>
</div>

## 01 — Acquire

Raw inputs enter the chain through a content-addressed ingest. Each dataset gets a SHA-256 manifest of its bytes and a metadata blob describing the originating sensor, simulator, or cohort. From this point onwards, the dataset is **immutable** — any modification produces a new hash and a new versioned identifier.

- Append-only storage with explicit `replaces:` pointers
- Originating clock skew, software version, and operator ID recorded
- Synthetic datasets carry a generator hash so the synthesis is itself replayable

## 02 — Audit

Before a dataset is admitted to a study, an audit pass diffs its schema against the prior version, surfaces silent column drops, and checks that the originating provenance resolves to a known sensor or simulator. The audit is itself an artefact; it lives next to the dataset under the same hash umbrella.

```
$ etr audit dataset:cohort-2026-Q1
  ✓ schema diff vs cohort-2025-Q4 — no breaking changes
  ✓ provenance resolved (3 sensors, 2 sites)
  ! 4 rows with missing enrolment date — quarantined
  → audit hash:  sha256:7b3a…
```

## 03 — Model

We run **parametric and non-parametric** models in parallel on every claim. The two families serve as cross-checks: a parametric model that disagrees with a non-parametric companion is a flag, not a conclusion. Both runs share a containerised environment that is itself content-addressed.

<dl class="lab-defs">
  <div>
    <dt>Parametric track</dt>
    <dd>Tight assumptions, narrow confidence intervals — the headline result.</dd>
  </div>
  <div>
    <dt>Non-parametric track</dt>
    <dd>Loose assumptions, wider intervals — the sanity check.</dd>
  </div>
</dl>

## 04 — Stress-test

A claim must survive an **adversarial suite** before it advances. The lab maintains a public catalogue of attacks and ablations per domain. Every paper carries the suite it survived, in the manifest, with the attack hashes.

- Adversarial perturbations at sensor, transform, and decision layers
- Ablation matrices for every architectural choice
- Held-out red-team rotation: a different reviewer runs attacks each round

## 05 — Peer review

Submissions go through **blind triage by two or more reviewers** drawn from the working group of the relevant domain. Reviews are themselves content-addressed and carry a public review thread once the paper is accepted. Critique is a feature, not a footnote.

- Reviewer rotation prevents back-channel approvals
- Public review threads mean that a published paper carries its critique forward
- Negative results are routed through the same process — and published with the same prominence

## 06 — Publish

The final step is the easy one if the previous five succeeded. The lab publishes:

<ul class="lab-list--check">
  <li>The paper itself, with figure → manifest links</li>
  <li>The dataset manifest, content-addressed</li>
  <li>The container digest used to rebuild every figure</li>
  <li>The review thread, including dissents</li>
  <li>A <code>replicate.sh</code> that bootstraps the rebuild on commodity hardware</li>
</ul>

A claim that has shipped through the chain carries a citable DOI that resolves to the manifest, not just the PDF. Anyone who cites the paper is implicitly citing the manifest — and can verify it.

## What this gets us

The 98.4% reproducibility rate is a downstream effect of the chain, not a target we optimised for. We measure it because reviewers ask, but the rate is what falls out when every step is enforced. A higher rate would mean we are accepting easier problems.
