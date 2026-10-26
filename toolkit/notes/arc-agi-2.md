---
layout: page
title: "ARC-AGI-2 (ARC Prize 2026): competition cheat sheet"
permalink: /toolkit/notes/arc-agi-2/
eyebrow: "Toolkit · Kaggle reference"
description: "Format, scoring, compute limits, data statistics and a verified local scorer for the ARC Prize 2026 ARC-AGI-2 competition. Final submissions are due 2 November 2026."
---

> **Status (26 Oct 2026):** open. Today is the entry and team-merger deadline. **Final submission: Mon 2 Nov 2026, 23:59 UTC.** Winners are announced 4 Dec. [Competition page](https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2) · [paper track](/toolkit/notes/kaggle-paper-tracks/) (due 9 Nov).

## The task in one paragraph

Each task gives you a few **demonstration pairs** (input grid → output grid) and one or more **test inputs**. You must produce the exact output grid for each test input: choose its height and width, then fill every cell with a colour 0–9. Grids range from 1×1 to 30×30. Only **exact** matches count, and you get **two attempts per test output**. The hidden test set is **240 unseen tasks**. Most have one test input; a few have two.

## Scoring

$$
\text{score} = \frac{1}{N_{\text{outputs}}}\sum_{\text{task } t}\;\sum_{j \in \text{test}(t)} \mathbb 1\big[\,\hat y^{(1)}_{t,j} = y_{t,j}\ \lor\ \hat y^{(2)}_{t,j} = y_{t,j}\,\big]
$$

The score is averaged over test **outputs**, not tasks, so a task with two test inputs counts twice.

```json
{"00576224": [{"attempt_1": [[0,0],[0,0]], "attempt_2": [[0,0],[0,0]]}],
 "12997ef3": [{"attempt_1": [[..]], "attempt_2": [[..]]},
              {"attempt_1": [[..]], "attempt_2": [[..]]}]}
```

- The file must be named `submission.json`.
- **Every** task id must be present, and **both** attempts must appear even if you only have one guess. Fill the second with a copy or a fallback.
- Multiple outputs for one task go in the same order as its test inputs.

## Compute and rules

| Constraint | Value |
|---|---|
| Runtime | CPU or GPU notebook, **≤ 12 h** |
| Internet | **off** during the run |
| External data / pretrained models | allowed if freely and publicly available |
| Hardware | L4×4 pool (96 GB GPU memory), which uses GPU quota at **2× rate**; T4×2 and P100 also available |
| Score timing | runtimes are obfuscated (repeat submissions vary by up to ±10 min) |
| Open source | prize-eligible teams must open-source their solution |

**Prizes (USD 700k):** USD 275k in progress prizes for the top 8 on the leaderboard, a USD 275k grand prize judged on the writeup, and a USD 150k bonus that unlocks only at **≥ 85%**. The grand prize uses the same six criteria as the [paper track](/toolkit/notes/kaggle-paper-tracks/): accuracy, universality, progress, theory, completeness and novelty, each scored 0–5.

## The data, measured

I computed these from the competition files on 26 Oct 2026:

| File | Tasks | Median train pairs | Tasks with > 1 test input | Median input size (cells) |
|---|---|---|---|---|
| `training` | 1,000 | 3 (max 10) | 69 | 100 |
| `evaluation` | 120 | 3 (max 6) | 49 | 361 |
| `test` (placeholder) | 240 | 3 (max 8) | 17 | 121 |

- **About two-thirds of demonstration pairs keep the grid size** (65% in training, 69% in evaluation). Predicting the output *shape* first is therefore a cheap, high-value sub-problem.
- **Colour 0 (black background) covers 48% of output cells.** The other nine colours share the rest, with 8 (9.7%) and 1 (8.0%) the most common.
- **The public `test` file is a placeholder.** It is swapped for the hidden 240 tasks at scoring time, so never tune anything on it.

## A verified local scorer and baseline

This script tries nine whole-grid transforms (identity, rotations, flips, transpose, 2×2 tiling, 2× upscaling) plus a learned cell-wise colour map. It keeps every transform that explains *all* demonstration pairs and spends the two attempts on the first two that fit. It is a floor, not a method:

```python
# arc2_baseline.py  (run next to the competition JSON files)
import json, numpy as np
TRANSFORMS = {"identity": lambda g: g, "rot90": lambda g: np.rot90(g, 1), "rot180": lambda g: np.rot90(g, 2),
              "rot270": lambda g: np.rot90(g, 3), "flip_lr": np.fliplr, "flip_ud": np.flipud,
              "transpose": lambda g: g.T, "tile_2x2": lambda g: np.tile(g, (2, 2)),
              "upscale_2": lambda g: g.repeat(2, 0).repeat(2, 1)}

def colour_map(pairs, f):
    m = {}
    for x, y in pairs:
        fx = f(x)
        if fx.shape != y.shape: return None
        for a, b in zip(fx.ravel(), y.ravel()):
            if m.setdefault(int(a), int(b)) != int(b): return None
    return m

def predict(task):
    pairs = [(np.array(p["input"]), np.array(p["output"])) for p in task["train"]]
    fits = [(f, m) for f in TRANSFORMS.values() if (m := colour_map(pairs, f)) is not None]
    out = []
    for t in task["test"]:
        x, guesses = np.array(t["input"]), []
        for f, m in fits:
            g = np.vectorize(lambda v: m.get(int(v), int(v)))(f(x)).tolist()
            if g not in guesses: guesses.append(g)
        guesses = (guesses + [t["input"]] * 2)[:2]          # always two attempts
        out.append({"attempt_1": guesses[0], "attempt_2": guesses[1]})
    return out

def score(sub, sol):
    pairs = [(sub[t][i], y) for t, ys in sol.items() for i, y in enumerate(ys)]
    return sum(y in (p["attempt_1"], p["attempt_2"]) for p, y in pairs) / len(pairs)

ch = json.load(open("arc-agi_evaluation_challenges.json")); so = json.load(open("arc-agi_evaluation_solutions.json"))
sub = {k: predict(v) for k, v in ch.items()}; json.dump(sub, open("submission.json", "w"))
print(f"evaluation: {score(sub, so):.1%}")
```

**Result: 0 of 172 evaluation outputs (0.0%) and 13 of 1,076 training outputs (1.2%).** Adding three more transforms (anti-transpose, 3× upscaling, crop to non-zero) moves training to 16 of 1,076, and evaluation stays at 0. That gap is the point of ARC-AGI-2. Its evaluation tasks were designed so that a fixed transform library, applied whole-grid, gets nothing. Anything that scores has to *compose* rules it infers from each task's demonstrations.

## Approach families worth knowing

| Family | Idea | What it costs |
|---|---|---|
| **Program synthesis over a DSL** | Search compositions of grid primitives (objects, symmetry, colour, counting) for a program consistent with every demonstration | Search blows up with program depth; you need good primitives and pruning |
| **Test-time training (TTT)** | Fine-tune a model on each task's own demonstrations (with augmentations: rotations, flips, colour permutations) before predicting | Per-task GPU time inside 12 h; augmentation must preserve the rule |
| **LLM transduction** | A model reads the serialised grids and writes the output directly | Tokenisation of 30×30 grids; checking that a predicted grid is self-consistent |
| **LLM induction** | A model writes a *program* (e.g. Python) that is executed and checked against the demonstrations | The check is free and exact: discard any program that fails a demonstration |
| **Ensembling the two attempts** | Spend attempt 1 and attempt 2 on *different* families or augmentations, ranked by agreement | Two attempts are the cheapest diversity you will ever get |

The [ARC Prize 2024 technical report](https://arxiv.org/abs/2412.04604) describes how test-time training and deep-learning-guided program synthesis moved the state of the art. Read it before choosing a family.

## Checklist before the 2 Nov deadline

- [ ] `submission.json` contains **every** task id with **both** attempts, including tasks you skip.
- [ ] The notebook runs with internet **off** and all weights attached as Kaggle datasets or models.
- [ ] Wall-clock tested on the **evaluation** set and scaled to 240 tasks, with margin under 12 h. A timeout scores nothing.
- [ ] Shapes predicted before colours; a fallback guess (e.g. the input, or the most common demonstration-output shape) in place of an empty attempt.
- [ ] Two final submissions selected on the leaderboard page.
- [ ] Code and weights ready to open-source, and a [paper-track writeup](/toolkit/notes/kaggle-paper-tracks/) drafted (due 9 Nov).

*Sources: the competition's Overview, Data, Evaluation, Timeline, Prizes and Code Requirements pages, read on 26 Oct 2026 with `kaggle competitions pages -c arc-prize-2026-arc-agi-2 --content`. The statistics and baseline result come from running the code above on the competition files.*
