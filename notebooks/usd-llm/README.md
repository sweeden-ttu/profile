# USD-literate LLM: notebooks and prototype code

Companion code for <https://scottweeden.online/projects/usd-scene-llm/>.

| File | What it is |
|---|---|
| `usdlab.py` | Toy knee builder, eight corruption families, the layered `usdfid` metric (L0–L4), text serialisation for the tokenizer audit, and SFT pair generation. Needs `usd-core` and `numpy`. |
| `01_usd_corpus_and_usdfid.ipynb` | CPU. Builds the corpus, runs every corruption through `usdfid`, audits tokenizers, writes `training.jsonl` / `validation.jsonl`. Runs end-to-end. |
| `02_usd_qlora_unsloth_colab.ipynb` | GPU. Unsloth QLoRA prototype on Gemma 4 E4B, evaluated with `usdfid`. Scaffold, not yet run. |
| `03_megatron_bridge_sft.ipynb` | Runbook for Megatron-Bridge conversion, LoRA/SFT recipes and adapter export. |
| `RESEARCH.md` | The sourced research report behind the plan (datasources, model review, Autodesk, Megatron, metrics). |
| `usdfid_by_family.json`, `token_audit.json` | Measured results shown on the project page. |
