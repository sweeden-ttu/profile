# Figure and data generators

Scripts that produced the charts and demo data on the site (paths inside are the ones used when they were generated; adjust before re-running).

| Script | Output |
|---|---|
| `style.py` | shared matplotlib style; categorical palette validated for colour-vision deficiency |
| `kagg_charts.py` | `assets/images/projects/kaggriculture/k1–k4` from the post-mortem dataset |
| `make_kaggriculture_demo.py` | `assets/kaggriculture/games.json` (two recorded games, kaggle-environments 1.33.2) and the weights |
| `rsna_usd_charts.py` | `assets/images/projects/rsna-knee/r6–r7`, `assets/images/projects/usd-llm/u1` |
| `usd_experiments.py` | `u2` (usdfid by corruption family) and `u3` (tokenizer audit) |
| `seminar_charts.py` | `assets/images/seminars/*`: charts rebuilt from the CS graduate seminar slides |
| `make_nbs.py` | the three Colab notebooks in `notebooks/usd-llm/` |
