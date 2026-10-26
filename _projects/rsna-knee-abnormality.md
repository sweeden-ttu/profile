---
layout: project
title: "RSNA Knee Abnormality Detection: what a 0.941 blend is made of"
date: 2026-10-25
tech_stack: [Python, PyTorch, timm, CoAtNet, ConvNeXt, DICOM, Kaggle]
status: completed
difficulty: Advanced
subtitle: "Dissecting a public tri-model ensemble, then testing three pre-registered changes on the private leaderboard"
tags: [medical-imaging, mri, ensembles, kaggle, evaluation]
pinned: 2
pin_badge: "Medical imaging · Kaggle"
pin_image: /assets/images/projects/rsna-knee/04_raptor_gold_auc_384_vs_224.png
pin_stats:
  - "0.956 public / 0.941 private"
  - "7 checkpoints SHA-pinned"
  - "3 pre-registered tests"
kaggle: "https://www.kaggle.com/code/scottweeden/rsna-knee-symmetric-tta-blend"
description: "RSNA's 2026 knee-MRI challenge scores twelve findings by mean AUC. I took the 0.956/0.941 public tri-model blend apart down to tensor level and reproduced it exactly. I then tested three changes whose weights were fixed before any run. All three were null or slightly negative on the private set, and the page explains why that was the expected outcome."
---

The [RSNA 2026 Knee Abnormality Detection](https://www.rsna.org/news/2026/august/ai-challenge-knee-mri) challenge asked for twelve findings per knee MRI study: ACL, MCL, medial and lateral meniscus, medial, lateral and patellofemoral osteoarthritis, effusion, synovitis, Baker's cyst, bone contusion and fracture. The score is the **mean of twelve AUCs** on a hidden set of about 1,200 studies. The public leaderboard is computed on a small slice of it.

My own models ([`rsna-knee-abnormality-pipeline` v18](https://www.kaggle.com/code/scottweeden/rsna-knee-abnormality-pipeline): sagittal and coronal, fat-suppressed and non-fat-suppressed, 140 mm crops, F1-weighted fusion) reached **0.791 public / 0.763 private**. The public recipe sat at 0.958. So the useful question became: what is that recipe actually made of, and is there anything left in it to improve without labels?

> **What this page does not claim.** Nothing here detects injury. Each arm outputs a per-finding score that ranks studies, and the blend ranks them again. None of the blend weights were fitted on labels, I trained none of the blended models, and the 58 "gold" studies are not an independent validation set.

## 1 · The leaderboard is a property of the inputs

V1 was a byte-identical copy of the public *Tri-Model Multi-Resolution SWA Ensemble* by mayankraaz. It scored **0.956 public / 0.941 private**. It combines:

| Slot | Checkpoint(s) | What it is |
|---|---|---|
| Raptor (0.5) | nartaa's CoAtNet `coatnet_rmlp_2_rw` + attention-MIL, 384 px (anatomical mirror TTA) and 224 px (0.8 crop) | 73.2 M params each, SWA over 3 epochs, trained on LLM-read report labels with 2,399 OAI knees as masked external supervision |
| R7 (0.5) | heliosli's ConvNeXt-small, 4 folds | 50.1 M params each, 352-px knee-centred crops, 3 slices, plus a ResNet-34 laterality classifier and two post-hoc stackers |
| (anchor) | heliosli's OrthoFoundation V-Net | 9.4 M-param SKM-TEA knee segmenter that anchors the local views |

The per-finding blend is a percentile-rank mean:

$$
\text{score}_f = 0.5\Big[\,0.65\,\mathrm{rank}\big(R^{384}_f\big) + 0.35\,\mathrm{rank}\big(R^{224}_f\big)\Big] + 0.5\,\mathrm{rank}\big(R7_f\big)
$$

I downloaded all seven `.pt` files and checked their SHA-256 hashes (all match). I then opened each with `torch.load(weights_only=True)`. Two facts followed.

1. **The score belongs to the inputs, not the notebook.** Nothing is learned at inference, and no label file is read. The 58 gold studies were already spent upstream on selecting the Raptor checkpoints. So there is no clean set to fit blend weights on, and the source author was right to fix them before any run.
2. **The public→private drop belongs to the recipe.** 1,638 teams were tied at 0.958 public, and every blend built from the same three arms lands at 0.941–0.943 private. Reweighting those arms moves the third decimal on the public board and nothing on the private one. A real +0.01 had to come from a component that is *not* in the public recipe.

## 2 · What the checkpoints say about themselves

![Per-finding gold-58 AUC stored in each Raptor checkpoint](/assets/images/projects/rsna-knee/04_raptor_gold_auc_384_vs_224.png)

- **The two Raptor arms are complementary on paper.** The 224 arm is better on MCL (+0.034), effusion, lateral OA and PF OA. The 384 arm is better on synovitis (+0.057), Baker's cyst (+0.029), medial meniscus, fracture and contusion. V1 blends them 0.65/0.35 for every finding. Its per-finding dictionary `W_RAPTOR_C` exists but is all 0.5, so it has no effect.
- **The gold AUCs are noisy.** With roughly 4–20 positives per finding, one standard error is about 0.03–0.05. Most of the gaps above are inside that noise.
- **Both arms are weak on the same trio:** lateral OA (0.78), PF OA (0.84) and lateral meniscus (0.86). That is where a genuinely new model would matter.
- **The R7 bundle's own cross-fitting rejected most of its stackers.** Of twelve report-state stackers, only Baker's cleared the pre-registered +0.001 gain. The effusion fluid-volume stacker (+0.0012 against a +0.003 rule) was kept "by user override". Ten of twelve R7 logits are plain fold means.

![Cross-fitted stacker gains](/assets/images/projects/rsna-knee/05_state_stacker_gains.png)

- **The four R7 folds are nearly the same encoder.** Their encoders have 0.993 cosine similarity (16 frozen blocks), while their class heads range from 0.60 to 0.74. Averaging the folds therefore mostly averages heads.

![Report-derived base rate per finding](/assets/images/projects/rsna-knee/01_base_rate_per_finding.png)

## 3 · Three pre-registered changes

Each change was written down, with its weights, before it was submitted. None of them used a label.

| ID | Change | Reasoning |
|---|---|---|
| **E01** | Per-finding 224 share $$= 0.5\cdot0.35 + 0.5\cdot\dfrac{1/(1-\mathrm{AUC}_{224})}{1/(1-\mathrm{AUC}_{384}) + 1/(1-\mathrm{AUC}_{224})}$$ | Use the stored gold AUCs, shrunk halfway back to 0.35 because the gaps are within noise |
| **V2** | Symmetric TTA on every arm: `--flip-tta` on R7 (shipped in the worker, trained with `mirror: 0.5`, left off in the manifest) and the anatomical mirror ported to the 224 arm | Hygiene: both arms were trained mirror-augmented but scored one view |
| **V3** | V2 + Team Kangaroo's public half (tascj0's box-pool ensemble: ConvNeXt-T, MambaOut-B+, MaxxViT-V2-B, 6-channel variants) at **0.5 / 0.5 rank**, inside a 4.5-hour time box that falls back to V2 | A different architecture family (ROI box pooling rather than MIL over fixed windows), from the team that finished **1st on private (0.960)** |

V2 doubles the R7 GPU time per study (9.2 s → 19.5 s on 2×T4). DICOM decode, at about 41 s per study, still dominates and is unchanged.

## 4 · Results

![Every submission, public vs private](/assets/images/projects/rsna-knee/r6_submissions.svg)

| Submission | Public | Private | Δ private vs V1 |
|---|---|---|---|
| Own models v18 | 0.791 | 0.763 | −0.178 |
| V1 tri-model blend (copied) | 0.956 | 0.941 | — |
| R0 exact reproduction | 0.956 | 0.941 | 0.000 |
| E01 per-finding 224 share | 0.956 | 0.940 | −0.001 |
| V2 symmetric TTA on all arms | 0.956 | 0.941 | 0.000 |
| V3 V2 + Kangaroo public half | 0.955 | 0.939 | −0.002 |

![Zoom on the blends](/assets/images/projects/rsna-knee/r7_blends_zoom.svg)

**All three are null results, and that is the finding.**

- **E01.** The gold-58 gap between the two Raptor arms does not transfer to the hidden set. Re-weighting the arms from gold-58 is exhausted as a lever.
- **V2.** Symmetric TTA neither helped nor hurt at three decimals, which matches goodpjw2008's public measurement of 0.957 vs 0.958.
- **V3.** The most interesting one. Adding half of the winning team's ensemble at equal rank weight *lowered* private AUC by 0.002. Several explanations are possible, and I can't separate them without labels:
  - The public half may be the weaker half of a team blend whose other members stayed private.
  - A rank average at 0.5 may dilute an already well-calibrated tri-model blend.
  - Studies where one arm failed fall back to the other arm's rank, which mixes two rank scales.

The honest summary: with no clean labelled set, any weight is a guess, and pre-registering the guess is what makes the result mean something.

## 5 · Engineering notes

- **Hash-pin everything.** Cells 3, 6 and 9 assert the checkpoint hashes, so a mismatch stops the run instead of silently swapping in a model. This is the RSNA version of the Kaggriculture lesson about [silent loaders](/projects/kaggriculture-muzero/).
- **The decode is the bottleneck.** On 2×T4, the R7 stage spends 330 s of 471 s decoding DICOM on the CPU, about 48 s per study.
- **Receipts.** Each run writes a `blend_receipt.json` with arm timings, failure counts and the Spearman correlation between arms. On the three public studies, Raptor and R7 agree perfectly on MCL, synovitis and Baker's, and disagree on ACL and medial OA.

## Credits and licences

- **nartaa:** Raptor CoAtNet SWA checkpoints.
- **dreaddevelopment:** the Raptor CoAtNet/MIL recipe.
- **heliosli:** the R7 compact ConvNeXt bundle and the OrthoFoundation anatomy checkpoint.
- **mayankraaz** and **varshithakolupuri:** the tri-model notebook that V1 copies.
- **goodpjw2008:** the public TTA measurements.
- **tascj0 / Team Kangaroo:** the box-pool ensemble. Its licence is listed as "Other" with no terms text attached, so it was used here only for a post-deadline, non-competitive learning submission, with credit.
- **OAI/NDA:** acknowledgement as required by nartaa's dataset page (dataset identifier 10.15154/0hcg-f676).

**Kernels:**
- [rsna-knee-v1-reproduction](https://www.kaggle.com/code/scottweeden/rsna-knee-v1-reproduction)
- [rsna-knee-symmetric-tta-blend](https://www.kaggle.com/code/scottweeden/rsna-knee-symmetric-tta-blend)
- [rsna-knee-v1-plus-kangaroo-blend](https://www.kaggle.com/code/scottweeden/rsna-knee-v1-plus-kangaroo-blend)

**Related:** the knee-MRI work feeds directly into the [USD knee archetype and fine-tuned LLM plan](/projects/usd-scene-llm/).
