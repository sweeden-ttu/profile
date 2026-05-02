# Readme
---
title: "House Prices Dataset Folder"
---

Target location for the Kaggle competition data:

- Competition: `house-prices-advanced-regression-techniques`
- Path: `_datasets/house-prices-advanced-regression-techniques`

Expected files after running:

```bash
kaggle competitions download -c house-prices-advanced-regression-techniques \
  -p _datasets/house-prices-advanced-regression-techniques
unzip *.zip
```

Typical contents:

- `train.csv`
- `test.csv`
- `data_description.txt`

These will be loaded by the notebooks under `_competitions/house-prices-advanced-regression-techniques/notebooks/`.

