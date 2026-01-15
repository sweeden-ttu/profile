---
title: "Toxic Comment Classification Challenge – Kaggle Workspace"
---

This folder contains notebooks and notes for the Kaggle competition  
**“Toxic Comment Classification Challenge”** (`toxic-comment-classification-challenge`).

## Dataset download (Kaggle API)

With Kaggle API configured (`~/.kaggle/kaggle.json` present), you can enroll and download via:

```bash
cd /Users/sdw/Documents/gh/profile

kaggle competitions download -c toxic-comment-classification-challenge \
  -p _datasets/toxic-comment-classification-challenge

cd _datasets/toxic-comment-classification-challenge
unzip *.zip
```

The dataset includes multi-label toxicity annotations (`toxic`, `severe_toxic`, `obscene`, `threat`, `insult`, `identity_hate`), suitable for both classical ML and deep models as well as LLM-based evaluation.

## Related research (for LangSmith experiments)

Several arXiv papers use or extend this dataset, for example:

- **“Convolutional Neural Networks for Toxic Comment Classification”** (`arxiv:1802.09957`)  
- **“Extended LSTM: Adaptive Feature Gating for Toxic Comment Classification”** (`xLSTM`, `arxiv:2510.17018`)  
- Follow‑on work on bias and multilingual toxicity classification.

These provide target architectures and metrics for benchmarking LangSmith experiments.

## Notebooks

- `notebooks/toxic-comments-baseline.ipynb` – baseline multi-label toxic comment classifier (e.g., CNN/LSTM or transformer), with LangSmith logging hooks for per‑example predictions and error analysis.

