---
title: "Toxic Comment Classification Dataset Folder"
---

Target location for the Kaggle **Toxic Comment Classification Challenge** data:

- Competition: `toxic-comment-classification-challenge`
- Path: `_datasets/toxic-comment-classification-challenge`

Download and extract with:

```bash
kaggle competitions download -c toxic-comment-classification-challenge \
  -p _datasets/toxic-comment-classification-challenge
unzip *.zip
```

You should then see files such as:

- `train.csv`
- `test.csv`
- `sample_submission.csv`

These will be used by notebooks under
`_competitions/toxic-comment-classification-challenge/notebooks/`.

