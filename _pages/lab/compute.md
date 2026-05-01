---
layout: lab
permalink: /lab/compute/
lab_slug: compute
title: Compute
hero_title: "Reproducible compute, by default."
hero_lede: "4.2 PFLOPs of peak training, 612 TB of archival storage, and 100% of runs containerised. Every job carries the SHA of its inputs and the digest of its environment — a run that is not reproducible does not finish."
hero_visual: cluster
hero_caption_id: COMPUTE · AURORA-N7
hero_caption_status: scheduling
hero_actions:
  - { label: "Request access", href: "#request-access" }
  - { label: "See methodology", href: "/lab/methodology/" }
hero_metrics:
  - { value: "4.2 PF", label: "peak training" }
  - { value: "612 TB", label: "archival storage" }
  - { value: "100%", label: "containerised" }
hero_meta:
  - { label: "Cluster", value: "aurora-n7" }
  - { label: "GPUs", value: "8 × H100" }
  - { label: "Status", value: "online", tone: "good" }
toc_meta:
  - { label: "Cluster", value: "aurora-n7" }
  - { label: "Scheduler", value: "Slurm 24.05" }
  - { label: "Vault", value: "SHA-256 pinned" }
---

## The two non-negotiables

Every job that runs on lab compute carries two SHAs at the kernel level: the **digest of its container** and the **hash of its dataset manifest**. If either is missing, the scheduler refuses the job. If either changes, the job is treated as a new experiment and gets a new run ID.

```
$ etr run --pin sha256:9f2c1a…
  ✓ image verified
  ✓ dataset hash matched
  → launching on cluster aurora-n7
  → run id: r7-2026-04-29-1947
```

This is not a recommendation — it is a kernel-level requirement of the scheduler. Reviewers can re-issue any run by replaying the same two SHAs against the cluster, and the scheduler will refuse if anything has drifted.

<div class="lab-callout">
  <span class="lab-callout__mark">∎</span>
  <div>
    <p class="lab-callout__title">No "just one quick run" without a hash.</p>
    <p class="lab-callout__body">Ad-hoc runs are explicitly disallowed in the scheduler. If a researcher wants to try something experimental, they pin a sandbox container — which has its own SHA — and the experiment becomes part of the public ledger automatically.</p>
  </div>
</div>

## Cluster topology

The compute fabric is intentionally small and uniform. Six nodes, each addressable by name; one scheduler; one pin-vault that holds every SHA the lab has ever issued.

| Node           | Role                              | Hardware            |
| -------------- | --------------------------------- | ------------------- |
| `aurora-n7`    | Primary training cluster          | 8 × H100, 1.5 TB DRAM |
| `archive-α`    | Append-only artefact storage      | 612 TB, 3-way ECC   |
| `runner-β`     | CI / replication harness          | 24×7, 4 × A100       |
| `pin-vault`    | SHA-256 manifest authority        | dedicated, immutable|
| `scheduler`    | Slurm 24.05 with the pin enforcer | dual-node failover  |
| `peer-mirror`  | Three-replica off-site mirror     | partner institutions|

## Reproducibility, end to end

A reproducible run is not a collection of "best practices." It is a property the scheduler enforces:

<ul class="lab-list--check">
  <li><strong>Container digest pinned</strong> — every run carries the OCI digest of its image; floating tags are rejected.</li>
  <li><strong>Dataset manifest pinned</strong> — every run names the dataset by SHA, never by mutable path.</li>
  <li><strong>Random seeds versioned</strong> — seeds are recorded with the run; replays use the recorded seed by default.</li>
  <li><strong>Output content-addressed</strong> — every artefact a run emits is hashed at write time and indexed in the vault.</li>
  <li><strong>Replay command emitted</strong> — every run produces a one-line <code>replicate.sh</code> that any reviewer can run.</li>
</ul>

## Storage, in three tiers

The archival surface is structured so the **hot path is small** and the **historical surface is mirrored**.

<dl class="lab-defs">
  <div>
    <dt>Hot tier — 24 TB on cluster</dt>
    <dd>Active datasets and recent run outputs. Reads are local; writes go through the pin vault.</dd>
  </div>
  <div>
    <dt>Warm tier — 192 TB on archive-α</dt>
    <dd>Datasets and runs from the last 18 months. Reads are within seconds; writes are append-only.</dd>
  </div>
  <div>
    <dt>Cold tier — 396 TB mirrored</dt>
    <dd>Older artefacts replicated across the peer-mirror network. Reads can take minutes; integrity is checked at read time.</dd>
  </div>
  <div>
    <dt>Vault — 4 TB, dedicated</dt>
    <dd>Pin authority. Every SHA the lab has ever issued. Append-only with hash chains; an entry is never deleted.</dd>
  </div>
</dl>

## How a run looks in practice

A typical training run from a working group looks like:

```bash
$ etr run \
    --image     sha256:9f2c1a8b… \
    --dataset   sha256:7b3a4f12… \
    --config    configs/rl-feature-q.yaml \
    --seed      0xC0FFEE \
    --replicate manifests/r7-2026-04-29-1947.json

  ✓ image verified                    9f2c1a8b…
  ✓ dataset hash matched              7b3a4f12…
  ✓ pin vault entry created           v-r7-2947
  → launching on cluster              aurora-n7
  → run id                            r7-2026-04-29-1947
```

When the run finishes, the manifest is published to the vault, mirrored to peer storage, and the `replicate.sh` is added to the paper-in-progress. A reviewer with the manifest can replay the run on their own cluster, or on `runner-β` if they have access.

## Request access {#request-access}

Compute access is granted through one of three doors — the same as the network. The most direct door is a [collaboration proposal](/lab/collaborate/), which carries with it a 90-day allocation on `aurora-n7` once accepted.

For replication runs, access is automatic: anyone with a public claim's manifest can submit a replay against `runner-β` without a proposal. The replay is rate-limited to two concurrent jobs per replicating team.
