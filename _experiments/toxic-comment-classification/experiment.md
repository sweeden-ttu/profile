---
title: "Toxic Comment Classification – LangSmith Experiment Design"
competition: "toxic-comment-classification-challenge"
status: "planned"
---

## Goal

Benchmark toxic comment classifiers on Kaggle’s **Toxic Comment Classification Challenge** dataset, using architectures inspired by published models and leveraging **LangSmith** to study failure modes, bias, and calibration.

## Datasets

- Source: Kaggle `toxic-comment-classification-challenge`
- Local paths:
  - `_datasets/toxic-comment-classification-challenge/train.csv`
  - `_datasets/toxic-comment-classification-challenge/test.csv`

## Research grounding (arXiv)

- **“Convolutional Neural Networks for Toxic Comment Classification”** (`arxiv:1802.09957`)  
- **“Extended LSTM: Adaptive Feature Gating for Toxic Comment Classification”** (`arxiv:2510.17018`)  
- **“Detecting Unintended Social Bias in Toxic Language Datasets”** (ToxicBias, based on Jigsaw data, `arxiv:2210.11762`) – for bias analysis dimensions.

## Experiment matrix

1. **CNN baseline (paper-style)**  
   - Token-level CNN with pre-trained embeddings (e.g., GloVe).  
   - Multi-label sigmoid outputs for the 6 toxicity categories.  

2. **LSTM / xLSTM-style model**  
   - BiLSTM or gated LSTM with character-level features (inspired by xLSTM).  
   - Focus on long-range dependencies and rare words.  

3. **Transformer baseline (e.g., DistilBERT)**  
   - Fine-tuned transformer on the Kaggle labels.  
   - Serves as a modern comparison point to older CNN/LSTM models.

4. **Bias-focused evaluation subset**  
   - Subsample comments containing identity terms (following ToxicBias categories).  
   - Compare model behavior across identity groups for equalized odds / disparate impact style metrics.

## LangSmith instrumentation

- **Trace structure**
  - Inputs:
    - `comment_text`
    - `identity_terms` (parsed flags, if any)
  - Outputs:
    - `y_true`: multi-hot label vector
    - `y_pred`: model probabilities
    - `thresholded_labels`
  - Metadata:
    - `model_name`, `checkpoint`, `run_id`, `split` (train/val/test), `bias_slice` (e.g., `gender`, `religion`).

- **Example logging sketch**

```python
from langsmith import Client

client = Client()

def log_toxic_example(example_id, text, y_true, y_pred, meta):
    client.log_trace(
        name="toxic-comment-classification",
        inputs={"comment_text": text, "meta": meta},
        outputs={
            "y_true": y_true,
            "y_pred": y_pred,
            "thresholded": (y_pred > meta.get("threshold", 0.5)).tolist(),
        },
        tags=["toxic-comment", meta["model_name"], meta.get("bias_slice", "none")],
    )
```

## Evaluation & analysis

- Standard metrics:
  - Macro/micro F1, ROC-AUC per label, PR-AUC.  
- Bias metrics:
  - Performance gaps across identity slices (e.g., F1 for comments mentioning different groups).  
  - Rate of false positives/negatives on identity-bearing vs. neutral comments.  
- Use LangSmith to:
  - Drill into high-confidence errors (false positives/negatives).  
  - Compare traces between CNN/LSTM/transformer runs on the *same* comment.  
  - Attach confusion matrices and calibration plots as run artifacts.  

