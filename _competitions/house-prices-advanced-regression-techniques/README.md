---
title: "House Prices: Advanced Regression Techniques – Kaggle Workspace"
---

This folder contains notebooks and notes for the Kaggle competition
**“House Prices: Advanced Regression Techniques”** (`house-prices-advanced-regression-techniques`).

## Dataset download (Kaggle API)

Once your Kaggle API is configured (`~/.kaggle/kaggle.json` present), you can enroll and download with:

```bash
cd /Users/sdw/Documents/gh/profile

# Enroll (implicit) and download competition data
kaggle competitions download -c house-prices-advanced-regression-techniques \
  -p _datasets/house-prices-advanced-regression-techniques

cd _datasets/house-prices-advanced-regression-techniques
unzip *.zip
```

This will populate `_datasets/house-prices-advanced-regression-techniques/` with:

- `train.csv`
- `test.csv`
- `data_description.txt` (and any extra files Kaggle ships)

## Related research (for LangSmith experiments)

We’ll ground experiments in methods from papers such as:

- **“An Optimal House Price Prediction Algorithm: XGBoost”** (`arxiv:2402.04082`)
- **“A Multi-Modal Deep Learning Based Approach for House Price Prediction”** (`arxiv:2409.05335`)

These will inspire baseline models, feature engineering strategies, and evaluation protocols.

## Notebooks

- `notebooks/house-prices-baseline.ipynb` – baseline feature-engineered regression model (XGBoost / tree ensemble), instrumented for LangSmith logging and comparison to paper results.

