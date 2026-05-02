# Collaborate
---
layout: lab
permalink: /lab/collaborate/
lab_slug: collaborate
title: Collaborate
hero_title: "Bring a hard problem."
hero_lede: "The lab accepts three external collaborations per semester — industry, government, or academic. Submissions are reviewed against fit, feasibility, and public benefit. We say no often, and we publish why."
hero_visual: pipeline
hero_caption_id: INTAKE · 2026-Q2
hero_caption_status: open
hero_actions:
  - { label: "Open a proposal", href: "mailto:scott.weeden@gmail.com?subject=Research%20collaboration", external: true }
  - { label: "See compute", href: "/lab/compute/" }
hero_metrics:
  - { value: "3 / sem.", label: "external slots" }
  - { value: "14 days", label: "review SLA" }
  - { value: "Open", label: "current cycle" }
hero_meta:
  - { label: "Cycle", value: "2026 Spring" }
  - { label: "Closes", value: "2026-05-31" }
  - { label: "Slots", value: "2 of 3", tone: "good" }
toc_meta:
  - { label: "Cycle", value: "2026 Spring" }
  - { label: "Decision in", value: "≤ 14 days" }
  - { label: "Slots open", value: "2 of 3" }
---

## What we mean by "hard problem"

A hard problem is one where the **right answer is not yet known** to the lab and where the work would be defensible to a reviewer in five years. Three things make a problem hard for our purposes:

<ul class="lab-list--check">
  <li><strong>The data are real.</strong> Synthetic-only problems are interesting but rarely shippable; we want the friction of real measurement.</li>
  <li><strong>The adversary is credible.</strong> A held-out test set is not an adversary. Distributional shift, attackers, biology, or physics are.</li>
  <li><strong>Public benefit is plausible.</strong> The lab does not take work whose only beneficiary is the proposer's competitive moat.</li>
</ul>

<div class="lab-callout">
  <span class="lab-callout__mark">i</span>
  <div>
    <p class="lab-callout__title">A "no" is information, not a rejection.</p>
    <p class="lab-callout__body">When we decline a proposal, we publish a redacted reasoning note. Other groups have used these to refine their own proposals or to pick up problems we passed on.</p>
  </div>
</div>

## What a collaboration buys you

Accepting a collaboration is not a soft handshake — it is a commitment of compute, reviewer time, and publication runway. A successful proposal receives:

<dl class="lab-defs">
  <div>
    <dt>Compute allocation</dt>
    <dd>90 days on <code>aurora-n7</code> with a dedicated quota. Continuation is reviewed at the 60-day mark.</dd>
  </div>
  <div>
    <dt>Reviewer rotation</dt>
    <dd>Two reviewers from the relevant working group attached to the project for the duration. Reviews are content-addressed.</dd>
  </div>
  <div>
    <dt>Replication harness</dt>
    <dd>Your work runs through the same chain of custody as internal projects. Every figure ships with a <code>replicate.sh</code>.</dd>
  </div>
  <div>
    <dt>Publication runway</dt>
    <dd>If the work converges, the lab co-authors and walks the submission through peer review with the same standards as internal output.</dd>
  </div>
</dl>

## The intake pipeline

The four-stage intake is intentionally short. We do not run a long evaluation — we run a sharp one.

| Stage      | Duration  | Output                                                                             |
| ---------- | --------- | ---------------------------------------------------------------------------------- |
| 01 Inquiry | 1–2 days  | A reviewer is assigned; a one-page response confirms whether the fit is plausible. |
| 02 Scoping | 5–7 days  | A scoping brief describing the adversary, the data, and the success criterion.     |
| 03 Review  | ≤ 14 days | The working group runs a fit-and-feasibility review against the scoping brief.    |
| 04 Kickoff | 1 week    | Compute provisioned, reviewers attached, replication harness opened.              |

## What we will not take

To save proposers time, the lab is explicit about the work it does not accept:

- **Closed-source extensions to closed-source systems.** If neither side of the work can be open, the collaboration cannot exit through the chain.
- **Pure benchmark-chasing.** A proposal whose only deliverable is a SOTA number on a leaderboard is not a research surface.
- **Predictive policing, mass surveillance, autonomous weapons.** The lab does not contribute to systems that surveil populations, automate carceral decisions, or close the loop on use of force.
- **Compliance theatre.** Work whose primary purpose is to launder a deployed system through a research signature.

## How to open a proposal

The intake door is a single email with a one-page brief. Brevity is rewarded — the working group reviews dozens of these per cycle and a tight statement of the adversary, the data, and the success criterion will land faster than a thirty-page deck.

Send to <a href="mailto:scott.weeden@gmail.com?subject=Research%20collaboration"><code>scott.weeden@gmail.com</code></a> with subject line <strong>"Research collaboration"</strong>. Include:

<ul class="lab-list--check">
  <li>The proposing organisation and the named PI.</li>
  <li>One paragraph on the adversary — why is this problem hard?</li>
  <li>One paragraph on the data — provenance, scale, access.</li>
  <li>One paragraph on the success criterion — what would convince you that the work has converged?</li>
  <li>Public benefit statement — how does this work, if it succeeds, leave the world better than it found it?</li>
</ul>

You will hear from a reviewer within two working days, regardless of outcome.
