---
layout: lab
permalink: /lab/observability/
lab_slug: observability
title: Observability
hero_title: "High-dimensional telemetry, decomposed in real time."
hero_lede: "Streaming PCA over 1.2 million-feature embeddings — variance attribution updates every 250 ms during ingest, with anomaly flags surfaced before the gradient step ever lands."
hero_visual: spectrum
hero_caption_id: SIGNAL · SPEC-04
hero_caption_status: streaming
hero_actions:
  - { label: "See methodology", href: "/lab/methodology/" }
  - { label: "Replication notes", href: "/blog/" }
hero_metrics:
  - { value: "250 ms", label: "ingest-to-attribution" }
  - { value: "1.2M", label: "feature width" }
  - { value: "32.4 dB", label: "median SNR" }
hero_meta:
  - { label: "FFT window", value: "1024" }
  - { label: "SNR", value: "32.4 dB" }
  - { label: "Anomaly", value: "flagged", tone: "warn" }
toc_meta:
  - { label: "Owners", value: "Telemetry working group" }
  - { label: "Last review", value: "Apr 2026" }
  - { label: "Replication ID", value: "etr-obs-2026.04" }
finale_eyebrow: "Continue along the chain of custody"
finale_title: "From signal to claim, in one auditable stride."
finale_lede: "Observability is the front-door of the lab — the moment raw signal enters versioned space. Continue to the second stage, where domains carve the space into research surfaces."
---

## Why observability is a research surface

Most "monitoring" stacks were designed to keep services alive — counter-of-the-week, threshold alerts, a dashboard in a war-room. We treat observability as a **first-class research artefact**: the stream of measurements is the experiment, and every transformation between sensor and figure is content-addressed.

The result is that the system that watches an experiment _is_ the experiment. There is no separate telemetry that diverges from the published claim.

<div class="lab-callout">
  <span class="lab-callout__mark">i</span>
  <div>
    <p class="lab-callout__title">A claim is a hash, not a screenshot.</p>
    <p class="lab-callout__body">Every figure that ships with a paper resolves to a SHA-pinned dataset, a SHA-pinned container, and a SHA-pinned commit. If the inputs no longer hash to the same bytes, the figure is invalidated automatically.</p>
  </div>
</div>

## What we instrument

We instrument three layers — **sensor**, **transform**, and **decision** — and emit a parallel stream of audit events that mirrors the data path.

<dl class="lab-defs">
  <div>
    <dt>Sensor layer</dt>
    <dd>Raw acquisition: hardware counters, simulator state vectors, cohort enrolment events. Hashed at ingest with the originating clock skew recorded.</dd>
  </div>
  <div>
    <dt>Transform layer</dt>
    <dd>Every parametric and non-parametric step in the analysis graph. Each transform writes a deterministic function-of-inputs hash so the path is replayable.</dd>
  </div>
  <div>
    <dt>Decision layer</dt>
    <dd>Where a model emits a class, a flag, or a confidence interval. We capture the full posterior, not just the winning argmax, because reviewers ask.</dd>
  </div>
  <div>
    <dt>Audit channel</dt>
    <dd>A side-channel of structured events tagged with experiment ID, container digest, and reviewer ID. It survives independently of the data path so a corrupted run is detectable post-hoc.</dd>
  </div>
</dl>

## Streaming decomposition, not batch summarisation

The telemetry surface runs an online principal-component decomposition over the embedding stream. The top-10 components are updated every 250 ms with a moving variance attribution that lets a reviewer see — before the next gradient step — whether the signal is concentrating into a single dominant axis.

In practice this means anomalies are caught at the **representation level**, not at the loss level. A model whose loss looks fine but whose embeddings have collapsed onto two effective dimensions is flagged before checkpoint.

```python
from etr.observability import StreamingPCA

# 1.2M feature embeddings, 10 retained components
pca = StreamingPCA(n_components=10, decay=0.97)

for batch in loader:
    z = encoder(batch).detach()
    attr = pca.update(z)
    if attr.dominant_share() > 0.62:
        audit.flag("representation_collapse", attr=attr.snapshot())
```

The `audit.flag` call is not a side-effect — it produces a content-addressed event that becomes part of the run's manifest. A reviewer querying the published artefacts will see the flag in the same stride as the figures it influenced.

## What gets surfaced to a reviewer

Reviewers do not see a dashboard. They see the **same stream of decompositions** the lab sees, frozen at the run hash. Every figure in a published paper is a query against this stream — anyone with the SHA can re-issue the query and confirm the figure.

- Top-k component drift, with attribution variance bands
- Anomaly flags with their originating transform hash
- Cluster-residency timelines for the embedding stream
- Counterfactual replays at any point in the run

## Replication

Every published claim that depends on observability data carries a `replicate.sh` that pins the container, the dataset, and the streaming PCA seed. A reviewer with one machine and one GPU should be able to rebuild any anomaly figure in under twenty minutes — or the claim does not ship.
