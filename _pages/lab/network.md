---
layout: lab
permalink: /lab/network/
lab_slug: network
title: Network
hero_title: "32 institutions, 11 countries, one ledger."
hero_lede: "The lab is async-first. Reviewers, replicating teams, and external collaborators meet at the artefacts — not at a calendar invite. A 24-hour triage SLA means a submission gets a human within a working day, anywhere on the planet."
hero_visual: globe
hero_caption_id: NET · ATLAS-32
hero_actions:
  - { label: "Open a proposal", href: "/lab/collaborate/" }
  - { label: "Working groups", href: "#working-groups" }
hero_metrics:
  - { value: "32", label: "institutions" }
  - { value: "11", label: "countries" }
  - { value: "24h", label: "triage SLA" }
hero_meta:
  - { label: "Live partners", value: "32" }
  - { label: "Time zones", value: "9" }
  - { label: "SLA", value: "24h", tone: "good" }
toc_meta:
  - { label: "Hub", value: "Texas Tech University" }
  - { label: "Anchor", value: "TTU CS Dept." }
  - { label: "Time zones", value: "UTC-8 to UTC+11" }
---

## Why async-first

The work the lab does — replication audits, peer review, adversarial stress-testing — does not survive synchronous meetings. A reviewer in a different time zone needs to be able to pick up an artefact, run it, comment, and pass it on without waiting for a stand-up. The chain of custody makes that possible: every artefact is a content-addressed atomic unit of work.

<div class="lab-callout">
  <span class="lab-callout__mark">⏱</span>
  <div>
    <p class="lab-callout__title">24-hour triage, anywhere.</p>
    <p class="lab-callout__body">A submission, a replication, or a vulnerability disclosure receives a human reviewer within 24 hours. The reviewer is drawn from the working group whose time zone is currently on shift — there is always one.</p>
  </div>
</div>

## Partner directory

The lab partners across academia, industry, and government. The directory below is the publicly listed subset; a longer roster is available under a non-disclosure for active proposals.

<div class="lab-cards">
  <article>
    <h3>Texas Tech University</h3>
    <p>Hub institution. CS department, Center for the Study of Digital Libraries, and the cryptography research group.</p>
    <div class="lab-card__meta"><span class="etr-tag">Hub</span><span class="etr-tag etr-tag--quiet">UTC-6</span></div>
  </article>
  <article>
    <h3>arXiv</h3>
    <p>Replication index integration — pre-prints from the lab carry a passing replication record at upload.</p>
    <div class="lab-card__meta"><span class="etr-tag">Pipeline</span><span class="etr-tag etr-tag--quiet">UTC-5</span></div>
  </article>
  <article>
    <h3>NeurIPS Foundation</h3>
    <p>Reproducibility track participation; reviewer rotation for the agentic-systems area.</p>
    <div class="lab-card__meta"><span class="etr-tag">Conference</span><span class="etr-tag etr-tag--quiet">UTC-5</span></div>
  </article>
  <article>
    <h3>Nature Methods Editorial</h3>
    <p>Methodology piece collaborator and reprint partner.</p>
    <div class="lab-card__meta"><span class="etr-tag">Press</span><span class="etr-tag etr-tag--quiet">UTC+0</span></div>
  </article>
  <article>
    <h3>NSF Open Science Office</h3>
    <p>Reference implementation for federally funded ML artefact submission.</p>
    <div class="lab-card__meta"><span class="etr-tag">Government</span><span class="etr-tag etr-tag--quiet">UTC-5</span></div>
  </article>
  <article>
    <h3>Kaggle Research Datasets</h3>
    <p>Cross-publication of replication-tracked datasets and adversary catalogues.</p>
    <div class="lab-card__meta"><span class="etr-tag">Industry</span><span class="etr-tag etr-tag--quiet">UTC-8</span></div>
  </article>
</div>

## Working groups {#working-groups}

A working group is the smallest unit of triage — a rotation of reviewers covering one research surface, with at least three members in three different time zones so 24-hour SLA is structurally feasible.

| Working group              | Members | Time zones      | Cadence       |
| -------------------------- | ------- | --------------- | ------------- |
| Agentic systems &amp; RL   | 8       | UTC-8 / -5 / +1 | rotation/2wk  |
| Computational biology      | 6       | UTC-6 / 0 / +5  | rotation/2wk  |
| Cryptographic verification | 5       | UTC-6 / 0 / +9  | rotation/3wk  |
| Adversarial robustness     | 7       | UTC-8 / -5 / +5 | rotation/wk   |
| Reproducibility audit      | 6       | UTC-6 / +0 / +9 | rolling intake |

## How to join the network

Researchers join the lab's network through one of three doors:

<ul class="lab-list--check">
  <li><strong>Replication contributor</strong> — pick a claim from the public tracker and submit a replication run. The tracker handles the rest.</li>
  <li><strong>Working group reviewer</strong> — apply via the working group's intake. Reviewers serve a 6-month rotation.</li>
  <li><strong>External collaborator</strong> — submit a proposal through <a href="/lab/collaborate/">/lab/collaborate/</a>. Three slots per semester.</li>
</ul>
