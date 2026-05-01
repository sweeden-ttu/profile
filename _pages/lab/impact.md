---
layout: lab
permalink: /lab/impact/
lab_slug: impact
title: Impact
hero_title: "1,247 citations, 38% YoY — and a public replication tracker."
hero_lede: "Citation counts are a noisy signal of research quality. We pair them with a transparent replication tracker so a reader can tell which claims have been independently rebuilt and which are still load-bearing on a single team."
hero_visual: sparkline
hero_caption_id: IMPACT · TRK-26
hero_caption_status: indexing
hero_actions:
  - { label: "Read the journal", href: "/blog/" }
  - { label: "Replication notes", href: "/lab/methodology/" }
hero_metrics:
  - { value: "1,247", label: "citations indexed" }
  - { value: "+38%", label: "YoY growth" }
  - { value: "31", label: "independent replications" }
hero_meta:
  - { label: "Index", value: "OpenAlex+arXiv" }
  - { label: "Last sync", value: "2026-04-22" }
  - { label: "Drift", value: "ok", tone: "good" }
toc_meta:
  - { label: "Index source", value: "OpenAlex" }
  - { label: "Audit cadence", value: "monthly" }
---

## Citations are necessary, not sufficient

A citation count tells you that other researchers have read a paper. It does not tell you that the result is correct, that it has been independently rebuilt, or that the field has even tried. The lab tracks both numbers — the citation timeline and the **replication ratio** — and publishes them side by side.

<div class="lab-callout">
  <span class="lab-callout__mark">i</span>
  <div>
    <p class="lab-callout__title">A claim crosses the 100-citation threshold &rarr; replication audit opens.</p>
    <p class="lab-callout__body">Once a claim has accumulated 100 citations, the lab automatically opens a replication audit and posts the results in the public journal. We do this whether the claim is one of ours or not.</p>
  </div>
</div>

## What we count, and what we do not

We count appearances in the OpenAlex and arXiv indexes, weighted by venue type, with self-citations excluded by default. We do not count blog mentions or social-media posts in the headline number, though those are tracked in the secondary feed for context.

| Source                   | Weight | Self-cite filter |
| ------------------------ | ------ | ---------------- |
| Peer-reviewed venue      | 1.00   | yes              |
| Workshop                 | 0.65   | yes              |
| Pre-print                | 0.40   | yes              |
| Thesis                   | 0.50   | yes              |
| Book chapter             | 0.85   | yes              |
| Patent                   | 0.20   | no               |

## Replication tracker

Every cited paper from the lab carries a status flag in the public tracker:

<ul class="lab-list--check">
  <li><strong>Replicated</strong> — at least one independent group has rebuilt the central figure to within reported error bands.</li>
  <li><strong>Pending</strong> — replication is open but not yet complete; reviewer assigned.</li>
  <li><strong>Adjusted</strong> — replication revealed a bound that needs updating; the paper carries an addendum.</li>
  <li><strong>Withdrawn</strong> — replication failed and the claim has been withdrawn. We publish the negative result with the same prominence as the original.</li>
</ul>

## Top venues

The headline citation count masks a long tail. The five venues below account for 62% of the indexed citations.

<div class="lab-cards">
  <article>
    <h3>NeurIPS</h3>
    <p>Reinforcement learning and agentic-systems track. Largest single venue contribution.</p>
    <div class="lab-card__meta"><span class="etr-tag">412 citations</span><span class="etr-tag etr-tag--quiet">7 papers</span></div>
  </article>
  <article>
    <h3>Nature Methods</h3>
    <p>Methodology pieces on reproducibility pipelines and content-addressed artefact management.</p>
    <div class="lab-card__meta"><span class="etr-tag">198 citations</span><span class="etr-tag etr-tag--quiet">2 papers</span></div>
  </article>
  <article>
    <h3>IEEE S&amp;P</h3>
    <p>Cryptographic protocol verification, including the 18-protocol audit series.</p>
    <div class="lab-card__meta"><span class="etr-tag">156 citations</span><span class="etr-tag etr-tag--quiet">3 papers</span></div>
  </article>
  <article>
    <h3>ICML</h3>
    <p>Adversarial robustness benchmarks and counterfactual cohort analysis.</p>
    <div class="lab-card__meta"><span class="etr-tag">127 citations</span><span class="etr-tag etr-tag--quiet">4 papers</span></div>
  </article>
</div>

## How to read the impact page

If you have arrived here from a citation list and want to know whether a particular paper has been replicated: the public tracker is queryable by DOI. If the tracker says <strong>Pending</strong>, the lab welcomes your replication — and will cite it.
