---
title: "House Prices – LangSmith Experiment Design"
competition: "house-prices-advanced-regression-techniques"
status: "planned"
---

## Goal

Evaluate tabular regression pipelines for Kaggle's **House Prices: Advanced Regression Techniques** competition, and compare modern approaches (e.g., XGBoost, deep models from recent papers) while capturing rich traces in **LangSmith** for error analysis and ablation studies.

## Datasets

- Source: Kaggle competition `house-prices-advanced-regression-techniques`
- Local path: `_datasets/house-prices-advanced-regression-techniques/train.csv`

## Research grounding (arXiv)

- **“An Optimal House Price Prediction Algorithm: XGBoost”** (`arxiv:2402.04082`)
  - XGBoost as strong baseline; feature engineering and regularization choices.
- **“A Multi-Modal Deep Learning Based Approach for House Price Prediction”** (`arxiv:2409.05335`)
  - Combines tabular + auxiliary signals; inspires experiments with feature embeddings.

## Experiment matrix

1. **Baseline XGBoost (Paper-faithful)**
   - Features: cleaned numeric + one-hot encoded categoricals.
   - Model: XGBoost with hyperparameters approximating those in `arxiv:2402.04082`.
   - Metrics: RMSE (Kaggle metric), MAE.

2. **Tabular DNN with embeddings**
   - Features: numeric standardized; categoricals mapped to learned embeddings.
   - Model: MLP with dropout and batch norm.
   - Metrics: RMSE, calibration plots (logged via LangSmith artifacts).

3. **Hybrid / Stacked models**
   - Stack XGBoost + DNN via simple linear blender or meta-learner.
   - Compare ensemble vs. single models.

## LangSmith instrumentation

- **Trace schema**
  - Run-level metadata:
    - `run_id`, `model_name`, `config_hash`, `fold_id`.
  - For each validation fold:
    - Input: row features after preprocessing.
    - Output: predicted price, true price, residual.
    - Tags: `{ "phase": "validation", "competition": "house-prices" }`.

- **Logging hooks (Python sketch)**

```python
from langsmith import Client

client = Client()

def log_prediction_example(example_id, features, y_true, y_pred, config):
    client.log_trace(
        name="house-prices-regression",
        inputs={"features": features, "config": config},
        outputs={"y_true": float(y_true), "y_pred": float(y_pred)},
        tags=["house-prices", "tabular-regression", config["model_name"]],
    )
```

## Evaluation & analysis

- Compare RMSE/MAE across models and folds.
- Use LangSmith UI to:
  - Slice by feature ranges (e.g., expensive homes, rare neighborhoods).
  - Inspect largest residuals and patterns of systematic under/over‑prediction.
  - Attach plots (residual histograms, learning curves) as run artifacts.

