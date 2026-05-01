---
layout: lab
permalink: /lab/endorsements/
lab_slug: endorsements
title: Endorsements
hero_title: "Reviewed at the bar of national labs."
hero_lede: "Endorsements are not a marketing surface — they are a record of what reviewers, area chairs, and replicating teams have said about the lab when the artefacts were on the table. We publish the dissents alongside the praise."
hero_visual: medallion
hero_caption_id: REVIEW · LEDGER-08
hero_actions:
  - { label: "Read methodology", href: "/lab/methodology/" }
  - { label: "Replication notes", href: "/lab/impact/" }
hero_metrics:
  - { value: "5.0", label: "median reviewer score" }
  - { value: "31", label: "external replications" }
  - { value: "2", label: "withdrawn negative results" }
toc_meta:
  - { label: "Source", value: "Open review threads" }
  - { label: "Verified", value: "Apr 2026" }
---

## What an endorsement is, and what it is not

An endorsement is a **public, signed quote from a reviewer who has seen the artefacts** — not a generic statement of association. Every quote on this page resolves to a review thread, a venue, or an institutional affiliation that the reviewer has agreed to publish.

<div class="lab-callout lab-callout--good">
  <span class="lab-callout__mark">✓</span>
  <div>
    <p class="lab-callout__title">Every endorsement on this page is signed.</p>
    <p class="lab-callout__body">No anonymous quotes. No "industry insider says." If a name is on this page, the lab has the reviewer's permission to attach the quote to their identity.</p>
  </div>
</div>

## Featured

> Their reproducibility pipeline is the closest thing to a gold-standard I have seen outside of national labs — and they ship the artefacts publicly.
>
> <cite>Dr. M. Aldoroty &middot; Reviewer, Nature Methods</cite>

> The replication tracker is the part I keep pointing other groups at. The fact that you can see, at a glance, which claims have been independently rebuilt — that is the hard part, and they have done it.
>
> <cite>Prof. R. Saavedra &middot; Area Chair, NeurIPS 2025</cite>

> When we ran their `replicate.sh` against our own infrastructure, every figure rebuilt within bounds. Twenty minutes, no privileged access. That is what a reproducible pipeline looks like.
>
> <cite>Open Science Office, NSF</cite>

## Recognised by

<div class="lab-cards">
  <article>
    <h3>Nature Methods</h3>
    <p>Featured in the November 2025 issue's editorial on reproducible ML pipelines, with the chain-of-custody figure reprinted with permission.</p>
    <div class="lab-card__meta"><span class="etr-tag">Editorial</span><span class="etr-tag etr-tag--quiet">2025-11</span></div>
  </article>
  <article>
    <h3>NeurIPS Reproducibility Track</h3>
    <p>Three accepted submissions in the reproducibility track over the last two cycles, all carrying a passing replication run at submission.</p>
    <div class="lab-card__meta"><span class="etr-tag">3 accepts</span><span class="etr-tag etr-tag--quiet">2024–2025</span></div>
  </article>
  <article>
    <h3>NSF Open Science</h3>
    <p>Cited as a reference implementation in the NSF Open Science Office's 2026 guidance on artefact submission for federally funded ML research.</p>
    <div class="lab-card__meta"><span class="etr-tag">Reference</span><span class="etr-tag etr-tag--quiet">2026-Q1</span></div>
  </article>
  <article>
    <h3>arXiv Replication Index</h3>
    <p>One of the eleven labs whose pre-prints automatically include a passing replication record at upload.</p>
    <div class="lab-card__meta"><span class="etr-tag">11 of N</span><span class="etr-tag etr-tag--quiet">since 2024</span></div>
  </article>
</div>

## And the dissents

Endorsements without dissents are marketing, not science. Two notable critiques the lab has received and acted on:

<dl class="lab-defs">
  <div>
    <dt>2024 — Cohort selection bias</dt>
    <dd>A reviewer flagged that one cohort's enrolment process was correlated with the outcome variable. We adjusted the published bound and added a synthetic-cohort generator to the audit suite.</dd>
  </div>
  <div>
    <dt>2025 — Adversarial coverage</dt>
    <dd>A red-team rotation reviewer found a perturbation our public catalogue did not cover. We added the perturbation to the catalogue, retroactively re-ran two relevant claims, and amended one paper.</dd>
  </div>
</dl>

We publish dissents because the lab's claim is not "we are always right" — it is "we are auditable."
