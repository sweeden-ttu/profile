# Training a USD model: research plan for a prediction challenge and a USD-literate LLM

*Prepared 2026-10-26 for Scott Weeden (Texas Tech). Every factual claim links to its source. Anything I could not verify against a primary source is marked **unverified**.*

---

## 1. Executive summary

- **This niche is real but thinly populated.** NVIDIA's *USD Code* NIM is the main USD-specific language model in production. It is Llama-3.1-70B-Instruct plus RAG, writes OpenUSD **Python** (not `.usda`), and has no downloadable fine-tuned weights ([NVIDIA model overview](https://docs.api.nvidia.com/nim/reference/nvidia-usdcode)). The closest open research is **IL3D** (Oct 2025). It stores 27,816 room layouts as USDA and 29,215 assets as USDZ, and fine-tunes Qwen3 1.7B–14B to generate layouts ([arXiv 2510.12095](https://arxiv.org/pdf/2510.12095)). An LLM that reads and writes `.usda`, judged by a USD-native fidelity metric, is therefore a defensible research gap.
- **Use Megatron-Bridge as the fine-tuning path, with your Megatron-LM fork as the core.** Megatron-LM's own docs now say that for HF checkpoint conversion "see Megatron Bridge", and that Megatron-LM itself only supports converting Llama-3.x and Mistral ([Megatron-LM llama_mistral.md](https://raw.githubusercontent.com/NVIDIA/Megatron-LM/main/docs/llama_mistral.md)). Megatron-Bridge (Apache-2.0, PyPI `megatron-bridge` 0.6.2, released 2026-09-18, Python 3.12 only) pins Megatron-Core as a submodule at `3rdparty/Megatron-LM`. It handles HF↔Megatron conversion, SFT, and LoRA/DoRA for Llama 3.x, Qwen3/3.5, Gemma 3/4 and Nemotron-3 ([docs](https://docs.nvidia.com/nemo/megatron-bridge/latest), [PyPI](https://pypi.org/project/megatron-bridge/), [GitHub](https://github.com/NVIDIA-NeMo/Megatron-Bridge)).
- **Prototype on Colab, scale on a cluster.** Unsloth reports Gemma-4-31B QLoRA in about 22 GB and E4B LoRA in 10–17 GB, with free E2B/E4B notebooks and A100 notebooks for 26B/31B ([Unsloth Gemma 4 guide](https://unsloth.ai/docs/models/gemma-4/train)). Then move to Megatron-Bridge `*_peft_config` / `*_sft_config` recipes on 8×GPU nodes. For example, Qwen3-32B LoRA runs at TP=1/PP=1 on one 8-GPU node, and Qwen3-32B full SFT at TP=8/PP=2 on two nodes ([Qwen3 recipes](https://docs.nvidia.com/nemo/megatron-bridge/0.5.0/apidocs/bridge/bridge.recipes.qwen.qwen3.html)).
- **Data:** permissive USD-native data is scarce. Most large corpora are glTF/OBJ/FBX and need conversion, and **licences are the binding constraint**:
  - The Pixar Kitchen Set forbids redistribution ([EULA](https://openusd.org/release/dl_kitchen_set.html)).
  - ShapeNet and OAIZIB-CM are non-commercial.
  - Objaverse licences vary per object.
  - The cleanest bulk USD source is NVIDIA's **PhysicalAI-SimReady-Warehouse-01**: 753 USD assets, CC-BY-4.0 ([HF](https://huggingface.co/datasets/nvidia/PhysicalAI-SimReady-Warehouse-01)).
- **Challenge design:** score USD outputs in layers:
  1. Parse / compose validity (`Usd.Stage.Open`).
  2. Schema compliance (`usdchecker` / the UsdValidation framework).
  3. Structural match (prim-tree and attribute diff).
  4. Geometry (Chamfer, and F-score@τ, which [Tatarchenko et al.](https://ar5iv.arxiv.org/html/1905.03678) argue is more robust than Chamfer).
  5. Optional semantic alignment of rendered views (CLIP-sim; [3DGen-Bench](https://arxiv.org/html/2503.21745v2) shows CLIP aligns only weakly with human preference).

---

## 2. Datasources

Conversion to text USD is the same for every source. Once a file is any USD flavour, `usdcat -o out.usda in.usdc` writes text, and `usdcat --flatten` bakes references, sublayers and variants into one layer ([OpenUSD tutorial, tested with 26.11](https://openusd.org/release/tut_converting_between_layer_formats.html); [toolset](https://openusd.org/release/toolset.html)). `pip install usd-core` (26.11, released 2026-10-21, CPython 3.11–3.14, TOST licence) gives the core libraries without imaging plugins ([PyPI](https://pypi.org/project/usd-core/)). Whether the `usdcat`/`usdchecker` CLIs ship in that wheel is **unverified**; the Python equivalent `Sdf.Layer.FindOrOpen(p).Export("x.usda")` works with only the core libraries.

Non-USD formats have three main converters:
- **glTF/GLB → USD:** `guc` (Apache-2.0; USDA/USDC/USDZ output; MaterialX + UsdPreviewSurface; needs USD ≥ 24.08; built from source) ([guc](https://github.com/pablode/guc)).
- **FBX/OBJ/PLY/STL/glTF/SPZ:** Adobe's USD-Fileformat-plugins (built from source; supports USD 23.08–25.11) ([Adobe](https://github.com/adobe/USD-Fileformat-plugins)).
- **Medical volumes (NIfTI):** marching cubes on the label maps, then write `UsdGeom.Mesh`. scikit-image's `measure.marching_cubes` is the standard tool; its docs page was blocked during this research, so the API detail is **unverified here**.

| Name | Licence | Size | Native format | Conversion path to `.usda` | URL |
|---|---|---|---|---|---|
| **NVIDIA PhysicalAI-SimReady-Warehouse-01** | CC-BY-4.0 | 753 rows (HyperAI cites a ~15 GB archive) | USD + PNG thumbnails | `usdcat` / `Sdf.Layer.Export` | [HF](https://huggingface.co/datasets/nvidia/PhysicalAI-SimReady-Warehouse-01), [HyperAI](https://hyper.ai/en/datasets/nvidia-physical-ai-simready-warehouse-openusd), [NVIDIA blog](https://developer.nvidia.com/blog/?p=106496) |
| **SimReady Central Library** (OEM-hosted HF datasets) | Set by each owner; NVIDIA recommends CC-BY-4.0; some non-commercial | Not stated | OpenUSD packages, versioned git repos | Direct | [Omniverse docs](https://docs.omniverse.nvidia.com/simready/latest/simready-central.html) |
| **Pixar Kitchen Set** | Personal, non-commercial *testing* only; **no redistribution**, revocable | Not stated | USD | Direct, but **cannot be put in a public dataset or Kaggle** | [EULA](https://openusd.org/release/dl_kitchen_set.html), [downloads](https://openusd.org/release/dl_downloads.html) |
| **Animal Logic ALab** | ASWF Digital Assets License v1.1 (education, training, research, development, benchmarking; ML training not mentioned) | "Heavy"; 300+ assets; 4K EXR texture pack | Mostly `.usda` (`entry.usda`); splat pack `.usdc` | Direct (already text) | [GitHub](https://github.com/DigitalProductionExampleLibrary/ALab), [LICENSE](https://raw.githubusercontent.com/DigitalProductionExampleLibrary/ALab/main/LICENSE.md) |
| **usd-wg/assets** (ASWF USD working group) | Apache-2.0 repo; per-asset licences, "typically CC0" | Small (largest ~30 MB) | USD, including **deliberately malformed** test assets | Direct. The malformed files suit a repair task. | [GitHub](https://github.com/usd-wg/assets) |
| **IL3D** | **Unverified** (paper says only "publicly accessible") | 27,816 layouts, 29,215 assets | Layouts USDA, assets USDZ | Direct | [arXiv](https://arxiv.org/pdf/2510.12095), [project](https://wenxuzhou.github.io/project/IL3D/) |
| **Articulate3D** | Dataset licence **unverified** | 280 scanned indoor scenes | USD annotations (parts, articulation, mass) | Direct | [arXiv](https://arxiv.org/html/2412.01398v2) |
| **Objaverse 1.0** | ODC-By overall; per object: 721K CC-BY, 25K CC-BY-NC, 52K CC-BY-NC-SA, 16K CC-BY-SA, 3.5K CC0 | 800K+ objects, 8.9 TB | Mostly GLB (format not stated on the card) | `guc` | [HF](https://huggingface.co/datasets/allenai/objaverse) |
| **Objaverse-XL** | ODC-By overall; per-object licences (MIT, GPL, none…); Polycam subset non-commercial on request | 10.85M rows | glb, gltf, obj, fbx, dae, blend… | `guc` / Adobe plugins / Blender | [HF](https://huggingface.co/datasets/allenai/objaverse-xl) |
| **Khronos glTF-Sample-Assets** | Per-model (README per model; REUSE.toml) | Small | glTF / GLB | `guc`. A good **round-trip test set**. | [GitHub](https://github.com/KhronosGroup/glTF-Sample-Assets) |
| **ShapeNetCore v2** | Gated; non-commercial research and education only | ~51,300 models, 55 categories; 24 GB (GLB variant 63.4 GB) | OBJ; GLB/glTF mirrors | `guc` on the GLB mirror | [HF](https://huggingface.co/datasets/ShapeNet/ShapeNetCore), [GLB](https://huggingface.co/datasets/ShapeNet/shapenetcore-glb) |
| **3D-FRONT / 3D-FUTURE** | "Freely available to the academic community"; Alibaba use agreement | 6,813 houses, 44,427 rooms (18,968 furnished), 13,151 furniture models | JSON layouts + textured meshes | Script: JSON → USD Xform/references to converted meshes | [paper](https://ar5iv.labs.arxiv.org/html/2011.09127), [3D-FUTURE terms](https://terms.aliyun.com/legal-agreement/terms/suit_bu1_ali_cloud/suit_bu1_ali_cloud202004171628_60052.html) |
| **Hypersim** | Images CC BY-SA 3.0; **meshes must be bought** (Evermotion/TurboSquid) | 74,619 images, 461 scenes, ~1.9 TB | Images + annotations | Little use for USD text unless you buy the assets | [GitHub](https://github.com/apple/ml-hypersim) |
| **Infinigen / Infinigen Indoors** | BSD-3-Clause (code; output is yours) | Unbounded (procedural) | Exports **full scenes to USD**; assets to OBJ/FBX/STL/PLY/USD | Direct. The best source for **unlimited, licence-clean** synthetic scene–text pairs. | [CG Channel](https://www.cgchannel.com/2025/06/open-source-tool-infinigen-indoors-generates-procedural-3d-interiors/) |
| **OAIZIB-CM** (knee) | **CC BY-NC 4.0** | 507 MRIs (404 train / 103 test), 12.7 GB | NIfTI image + 5-label mask (femur, femoral cartilage, tibia, medial/lateral tibial cartilage) | marching cubes per label → `UsdGeom.Mesh` | [HF](https://huggingface.co/datasets/YongchengYAO/OAIZIB-CM), [Edinburgh](https://www.research.ed.ac.uk/en/datasets/oaizib-cm-dataset-from-the-cartimorph-project/) |
| **OAI (Osteoarthritis Initiative)** | OAI data-access terms through the NIMH Data Archive (application required) | 4,796 participants, annual bilateral knee MRI and X-ray, 2004–2019 | DICOM | Segment → mesh → USD | [NYU catalog](https://datacatalog.med.nyu.edu/dataset/10162) |
| **SKI10** | Closed; no redistribution, no commercial use, team only | n/a | MRI + segmentation | **Not usable** now ("You can no longer download the data") | [rules](https://ski10.grand-challenge.org/Rules/) |
| **TotalSegmentator v2 dataset** | CC BY 4.0 | 1,228 CT images, 117 structures, 23.6 GB | NIfTI | marching cubes → USD. Note: tibia, fibula and patella are in the separate *appendicular bones* model, which has a restricted licence that **forbids training similar algorithms** on its outputs. | [Zenodo](https://zenodo.org/records/10047292), [Slicer forum](https://discourse.slicer.org/t/totalsegmentator-v2/32470) |
| **fastMRI (knee)** | fastMRI Dataset Sharing Agreement; internal research and education only | >1,500 fully sampled knee MRIs (+10,000 clinical) | Raw/DICOM | Image-side only; no labels for meshes | [Data Collaboratives](https://datacollaboratives.org/cases/nyu-langone-fastmri-dataset.html) |
| **RSNA Knee Abnormality Detection (Kaggle)** | Dataset terms not stated in the announcement; winning models released under open licences | >5,000 knee MRI exams + reports, 16 sites; ran Aug 5–Oct 22, 2026 | DICOM | Related work and possible image-side data; check the Kaggle rules before reuse | [RSNA](https://www.rsna.org/news/2026/august/ai-challenge-knee-mri) |

**Recommended mix for the knee project:**
- **Core:** your synthetic archetype corruptions (licence-clean, because you generate them).
- **General USD fluency:** SimReady-Warehouse plus usd-wg/assets, plus Infinigen-generated scenes.
- **Anatomical realism:** OAIZIB-CM meshes, as a non-commercial research track.
- **Never redistribute:** Kitchen Set. Use it only as a private sanity check.

---

## 3. Model review

| Model | What it predicts | Representation | Size / base | Licence | Public weights? |
|---|---|---|---|---|---|
| **NVIDIA USD Code NIM** | Answers OpenUSD questions; generates OpenUSD **Python** code, including helper-function code | Python text + RAG over USD docs | Llama-3.1-70B-Instruct + NV-EmbedQA-E5 retriever | NVIDIA AI Foundation Models Community Licence; Llama 3.1 licence | Hosted NIM; downloadable weights **not stated** ([overview](https://docs.api.nvidia.com/nim/reference/nvidia-usdcode)) |
| **USD Search / USD Validate NIMs** (SIGGRAPH, Jul 29 2024) | Natural-language or image search over USD libraries; version-compatibility check + RTX render. USD Layout and SmartMaterial were announced as "coming soon". | Services | n/a | NVIDIA terms | Hosted only ([press release](https://www.nasdaq.com/press-release/nvidia-announces-generative-ai-models-and-nim-microservices-openusd-language-geometry)) |
| **nanousd-labs** (NVIDIA, Jul 2026) | Not a model: agents generate a USD runtime from the Core Spec and check it against spec-derived tests | C++/C ABI, nanousd-python | n/a | **Unverified** | Code ([NVIDIA blog](https://developer.nvidia.com/blog/develop-lightweight-usd-runtimes-faster-with-ai-agents/)) |
| **LLaMA-Mesh** (NVIDIA) | Text → mesh and mesh understanding in chat | OBJ vertices/faces as plain text, quantized coordinates, no new tokens | Llama-3.1-8B; ~30k Objaverse meshes under 500 faces | NSCLv1 (non-commercial) + Llama 3.1 | Yes, [HF](https://huggingface.co/Zhengyi/LLaMA-Mesh), [arXiv 2411.09595](https://arxiv.org/pdf/2411.09595). Bin count and compute not verified (arXiv page blocked) |
| **MeshLLM** (Aug 2025) | Mesh understanding and generation | Text-serialized meshes split into primitive-mesh subunits; 1.5M+ samples | Base and size not stated | Not stated | Not stated ([arXiv 2508.01242](https://arxiv.org/abs/2508.01242v2)) |
| **MeshGPT** (CVPR 2024) | Triangle-mesh generation | Learned vocabulary of graph-conv triangle embeddings; decoder-only transformer | Not stated | n/a | No official weights found (**unverified**) ([CVF](https://openaccess.thecvf.com/content/CVPR2024/html/Siddiqui_MeshGPT_Generating_Triangle_Meshes_with_Decoder-Only_Transformers_CVPR_2024_paper.html)) |
| **SceneScript** (Meta) | Point cloud → layout (walls, doors, windows) + 3D boxes | Structured-language token sequence | Not stated | CC BY-NC | Via the project site ([GitHub](https://github.com/facebookresearch/scenescript)) |
| **SpatialLM** (Manycore) | Point cloud → walls, doors, windows, oriented boxes | Structured text layout (`code_template.txt`) | Llama-3.2-1B / Qwen-2.5-0.5B | Weights CC-BY-NC-4.0 | Yes, HF ([GitHub](https://github.com/manycore-research/SpatialLM)) |
| **3D-GPT** | Training-free agents (dispatch, conceptualise, model) that drive Blender procedural modelling | Procedural parameters / code | API LLM | n/a | n/a ([arXiv](https://arxiv.org/abs/2310.12945v2)) |
| **LayoutGPT** (NeurIPS 2023) | 3D-FRONT bedroom layouts (and 2D) | Text layout via in-context prompting; scored by OOB rate and KL-div | GPT-4 / Llama-2 | MIT (code) | Prompting only ([GitHub](https://github.com/weixi-feng/LayoutGPT)) |
| **Holodeck** (AI2, CVPR 2024) | Text → AI2-THOR scene JSON with Objaverse assets | JSON | `gpt-4o-2024-05-13` API | Not stated in README | Prompting only ([README](https://github.com/allenai/Holodeck/blob/main/README.md)) |
| **IL3D-SFT** | Text → room layout | **USDA** layouts | Qwen3 1.7B/4B/14B SFT | Unverified | **Unverified** ([arXiv](https://arxiv.org/pdf/2510.12095)) |
| **Roblox Cube** | Text → shape; LLM-generated JSON scene graph for layout | Discrete shape tokens (512 tokens, 16,384-entry codebook; 273M-param tokenizer) | ~1.5M training assets | Not stated in paper | Yes, `Roblox/cube3d-v0.1` ([paper](https://arxiv.org/pdf/2503.15475), [README](https://huggingface.co/spaces/Nymbo/cube3d-interactive/blob/main/cube/README.md?code=true)) |
| **Autodesk WaLa-SK-1B** | Sketch → 3D shape | Wavelet latent of a 256³ TSDF | ~956M; trained on 10M+ shapes from 19 datasets | Autodesk Non-Commercial (3D Generative) v1.0 | Yes ([HF](https://huggingface.co/ADSKAILab/WaLa-SK-1B)) |
| **Autodesk Make-A-Shape (multi-view)** | 4 views → 3D | Wavelet-tree TSDF | 10M+ shapes from 18 datasets; ~23k A10G-hours | Autodesk Non-Commercial v1.0 | Yes ([HF](https://huggingface.co/ADSKAILab/Make-A-Shape-multi-view-20m)) |
| **Text2CAD** (NeurIPS 2024) | Text → parametric CAD sequence | Sketch-and-extrude tokens; ~170K models, ~660K prompts | Not stated | Not stated | Code promised ([arXiv](https://arxiv.org/abs/2409.17106v1)) |
| **CAD-Recode** (ICCV 2025) | Point cloud → CAD Python code | Python (CadQuery) | Qwen2-1.5B + one linear layer; 1M synthetic programs | Not stated on the page | Yes, `filapro/cad-recode(-v1.5)` ([GitHub](https://github.com/filaPro/cad-recode), [HF papers](https://huggingface.co/papers/2412.14042)) |

**Takeaways for the project:**
- **Serialize as text.** LLaMA-Mesh shows plain-text geometry works with no new tokens.
- **Execute-then-score.** CAD-Recode's code-as-output with execution-based scoring is the closest analogue to "write `.usda`, then open and score it".
- **Cite IL3D** as the most direct USD-LLM baseline.
- **USD Code** is the obvious zero-shot comparison, but it emits Python rather than `.usda`.

---

## 4. Autodesk

- **Standards role.** Autodesk is a founding member of the Alliance for OpenUSD, formed in 2023 with Pixar, Apple, Adobe and NVIDIA ([Autodesk OpenUSD page](https://www.autodesk.com/solutions/media-entertainment/openusd)). AOUSD released **Core Specification 1.0** in January 2026. It covers grammar and data types, the data model, composition, value resolution, and the USDA, USDC and USDZ formats, plus compliance criteria and reference tests ([Digital Production](https://digitalproduction.com/2026/01/05/aousd-releases-openusd-core-specification-1-0/)). That normative USDA grammar is what a "schema validity" metric should be anchored to.
- **Open-source USD tooling** ([Autodesk](https://www.autodesk.com/solutions/media-entertainment/openusd)):
  - **maya-usd**: Maya 2023–2027 support; text and binary import/export; Layer Editor; a Component Creator with Variant Manager new in Maya 2027 ([GitHub](https://github.com/Autodesk/maya-usd)).
  - **3dsmax-usd**, **arnold-usd** (Hydra delegate, procedural, schemas) and **bifrost-usd**.
  - **Aurora**: a GPU path tracer with a Hydra delegate (HdAurora), Apache-2.0, "work-in-progress" ([GitHub](https://github.com/Autodesk/Aurora)).
  - These are mainly **data-generation tools**. maya-usd and 3dsmax-usd exporters can turn existing DCC scenes into `.usda` training pairs. The maya-usd `test` folder might hold small USD fixtures; that is **unverified**.
- **Generative 3D research:**
  - **Project Bernini** (May 2024): multi-modal (image, text, voxel, point cloud) → functional 3D shapes, trained on ~10M shapes, "not available for public use" ([DEVELOP3D](https://develop3d.com/ai/autodesk-unveils-project-bernini-for-3d-generative-ai/)).
  - Open, non-commercial descendants: **WaLa** and **Make-A-Shape** (table above).
  - **Neural CAD** (unveiled at AU 2025): a geometry-aware foundation model that outputs editable B-rep; AutoConstrain in Fusion is the named shipping example. The article does not mention OpenUSD ([DEVELOP3D, Sep 2026](https://develop3d.com/cad/autodesks-ai-blueprint-for-cad/)).
- **Use as a benchmark or data source:**
  - No Autodesk USD dataset or USD benchmark was found.
  - WaLa / Make-A-Shape weights can serve as a **geometry baseline**: generate a TSDF mesh, wrap it in USD, and score it with the same metric.
  - The Make-A-Shape/WaLa list of 18–19 public sub-datasets (ShapeNet, ModelNet, Objaverse, ABC…) is a useful map of the mesh corpora.
  - Autodesk's non-commercial licence suits an academic challenge but rules out commercial derivatives.

---

## 5. Megatron-LM fine-tune plan (Colab prototype → Megatron at scale)

### 5.0 Recommended path (verified)
- **Megatron-LM** is "a reference example that includes Megatron Core plus pre-configured training scripts" ([README](https://github.com/NVIDIA/Megatron-LM), v0.19.0 badge). Its HF-conversion doc defers to Megatron-Bridge ([doc](https://raw.githubusercontent.com/NVIDIA/Megatron-LM/main/docs/llama_mistral.md)).
- **Megatron-Bridge** is "a refactor of the previous NeMo training stack". It has a NeMo 2.0 → Bridge migration guide, supports SFT LoRA but not RL LoRA, and is the packaging layer for the NeMo 26.06 training stack ([docs](https://docs.nvidia.com/nemo/megatron-bridge/latest)).
- **Plan:** keep `sweeden-ttu/Megatron-LM` (a confirmed fork of NVIDIA/Megatron-LM; [GitHub](https://github.com/sweeden-ttu/Megatron-LM)) as the Megatron-Core source. Point Bridge's `3rdparty/Megatron-LM` submodule at it only if you carry core patches. Otherwise use the pinned upstream.
- **Version drift:** the docs "latest" news lists 0.5.0 (Jun 22, 2026), while PyPI is at 0.6.2. Pin a version.

### Phase 0: data and tokenizer audit (Colab CPU)
1. **Build the corpus.** Generate `(instruction, .usda)` pairs:
   - O1: corrupted → fixed.
   - O2: description → stage.
   - General: SimReady / Infinigen / IL3D stages.

   Normalise with `usdcat --flatten`, strip comments and custom layer metadata, and give each file a canonical prim order so the loss is not wasted on formatting noise.
2. **Tokenizer considerations:**
   - **Numbers.** Llama-3 groups digits into chunks of up to 3 (`2164 → [216, 4]`); Gemma, Mistral, DeepSeek and Llama-2 split per digit ([Beren Millidge](https://beren.io/2024-05-11-Integer-tokenization-is-now-much-less-insane)). USD float arrays (`point3f[] points = [(0.123, …)]`) therefore cost 3–7 tokens per scalar with per-digit tokenizers.
   - **Mitigations:**
     - (a) Quantize or round coordinates to a fixed precision or integer grid, as LLaMA-Mesh does ([HF card](https://huggingface.co/Zhengyi/LLaMA-Mesh)).
     - (b) Keep heavy geometry out of the LLM's output. Have the model write prims, xforms, references and attributes, and *reference* mesh payloads (`references = @knee_femur.usdc@`) rather than inline point arrays.
     - (c) Do not add new tokens unless you also run continued pretraining. Megatron-Bridge reuses the HF tokenizer through its conversion, and new tokens would need embedding resizing (**unverified** support path).
   - **Measure first.** Count tokens per stage with each candidate tokenizer before choosing a model.
3. **Model choice.** Gemma 4 ships under Apache-2.0 as E2B, E4B, 26B-A4B MoE and 31B dense, with 128K / 256K context ([The Decoder](https://the-decoder.com/googles-gemma-4-is-now-available-with-apache-2-0-licensing-for-the-first-time/)).
   - Your notebook lists a "12B" Gemma 4. That size does not appear in this lineup; please check whether it is Gemma 3-12B.
   - Qwen3-8B/14B/32B has the most complete set of Megatron-Bridge recipes (below) and matches the IL3D baseline.

### Phase 1: Colab prototype (HF + Unsloth QLoRA)
- **Hardware.** Colab GPU availability "varies over time". T4, L4, A100 and H100 are reported for 2026 ([explainx summary](https://explainx.ai/blog/google-ai-pro-colab-a100-h100-200-compute-units-claimed-vs-verified-2026)). Exact memory and pricing are **unverified**.
- **Runs:**
  - E4B LoRA (10–17 GB) on L4 or A100 for fast iteration.
  - 31B QLoRA (~22 GB) on A100 ([Unsloth](https://unsloth.ai/docs/models/gemma-4/train)).
- **Unsloth caveats:** E2B/E4B loss of 13–15 is normal; there was a `use_cache=False` logit bug (now fixed); there is a 26B/31B inference `IndexError`; vLLM fast inference is not supported for Gemma 4 RL.
- **Notebook outline** (`01_usd_qlora_colab.ipynb`): load the corpus → `FastLanguageModel.from_pretrained(..., load_in_4bit=True)` → LoRA r=16–32 on attention+MLP → SFT with completion-only loss on the `.usda` → evaluate with the `usdfid` harness (Section 6) on a held-out set → export the adapter.
- **Exit criterion:** valid-parse rate and `usdfid` beat zero-shot Gemma 4 / USD Code on the dev split.

### Phase 2: Megatron-Bridge single node (8×A100/H100)
Install with the NeMo container `nvcr.io/nvidia/nemo:${TAG}` or `pip install megatron-bridge` on Python 3.12 ([GitHub](https://github.com/NVIDIA-NeMo/Megatron-Bridge), [PyPI](https://pypi.org/project/megatron-bridge/)).

```bash
# HF -> Megatron (CPU, stable CLI)
./scripts/conversion/convert.sh import --executor local --device cpu \
  --hf-model Qwen/Qwen3-8B --megatron-path ./ckpt/qwen3_8b
# (Megatron-LM docs show the equivalent:
#  python Megatron-Bridge/examples/conversion/convert_checkpoints.py import \
#    --hf-model <id> --megatron-path <dir> --torch-dtype bfloat16 --device-map auto)
```
([conversion README](https://raw.githubusercontent.com/NVIDIA-NeMo/Megatron-Bridge/main/examples/conversion/README.md))

**Data.** `training.jsonl` / `validation.jsonl` with `{"input": "<instruction + optional source stage>", "output": "<target .usda>"}` rows for `GPTSFTDatasetConfig`. Enable offline packing with `enable_offline_packing=True`, `PackedSequenceSpecs(packed_sequence_size=…)` ([data prep](https://docs.nvidia.com/nemo/megatron-bridge/latest/training/data-preparation.html)).

**Recipe** (verified function names, 0.5.0 API):

| Recipe | TP / PP | Nodes |
|---|---|---|
| `qwen3_8b_peft_config(peft_scheme='lora')` | 1 / 1 | 1 node |
| `qwen3_14b_peft_config` | 1 / 1 | 1 node |
| `qwen3_32b_peft_config` | 1 / 1 + recompute | 1 node |
| `qwen3_8b_sft_config` | 4 / 1 | 1 node |
| `qwen3_14b_sft_config` | 8 / 1 | 1 node |
| `qwen3_32b_sft_config` | 8 / 2 | 2 nodes |

Source: [Qwen3 recipes](https://docs.nvidia.com/nemo/megatron-bridge/0.5.0/apidocs/bridge/bridge.recipes.qwen.qwen3.html).

**LoRA config.** `megatron.bridge.peft.lora.LoRA(target_modules, dim=32, alpha=16, dropout=0.0)`. PEFT requires `checkpoint.pretrained_checkpoint` ([PEFT docs](https://docs.nvidia.com/nemo/megatron-bridge/0.3.1/training/peft.html)).

**Gemma 4 status:**
- The model table lists Gemma 4 26B-A4B and 31B ([docs](https://docs.nvidia.com/nemo/megatron-bridge/latest)).
- Published recipe functions are `gemma4_vl_26b_sft_config` / `gemma4_vl_26b_peft_config` and `gemma4_e4b_pretrain_config` ([VL](https://docs.nvidia.com/nemo/megatron-bridge/latest/apidocs/bridge/bridge.recipes.gemma4_vl.gemma4_vl.html), [text](https://docs.nvidia.com/nemo/megatron-bridge/latest/apidocs/bridge/bridge.recipes.gemma.gemma4.html)).
- A **31B text SFT/PEFT recipe was not confirmed**. Plan to adapt the Qwen3-32B recipe via `AutoBridge.from_hf_pretrained(...).to_megatron_provider()` (**unverified** for Gemma 4 31B).

```python
# sketch: names verified; override field paths should be checked against your pinned version
from megatron.bridge.recipes.qwen.qwen3 import qwen3_8b_peft_config
cfg = qwen3_8b_peft_config(peft_scheme="lora")
cfg.checkpoint.pretrained_checkpoint = "./ckpt/qwen3_8b"
# cfg.dataset -> GPTSFTDatasetConfig pointing at usd_sft/ ; set seq_length to packed size
# launch: uv run python -m torch.distributed.run --nproc-per-node=8 finetune_usd.py
```
The launch pattern and the `tutorials/recipes/llama/01_quickstart_finetune.py` example are in the [Bridge README](https://github.com/NVIDIA-NeMo/Megatron-Bridge).

**Export:**
```bash
uv run python examples/conversion/adapter/export_adapter.py --hf-model-id Qwen/Qwen3-8B \
  --megatron-peft-checkpoint <ckpt> --output-hf-path ./usd_lora
uv run python examples/conversion/adapter/verify_adapter.py --hf-model-id Qwen/Qwen3-8B --hf-adapter-path ./usd_lora
./scripts/conversion/convert.sh export --executor local --device cpu --hf-model Qwen/Qwen3-8B \
  --megatron-path <ckpt>/iter_XXXXXXX --hf-path ./usd_hf     # full SFT export
```
([conversion README](https://raw.githubusercontent.com/NVIDIA-NeMo/Megatron-Bridge/main/examples/conversion/README.md))

The exported HF adapter or model then drops into your existing **vLLM + ADK** arena for evaluation.

### Phase 3: multi-node and continued pretraining (optional)
- **Continued pretraining.** For raw `.usda` text, preprocess with Megatron-LM `tools/preprocess_data.py --input usd.jsonl --output-prefix … --json-keys text --append-eod --workers N` ([script](https://raw.githubusercontent.com/NVIDIA/Megatron-LM/main/tools/preprocess_data.py)). The output is `.bin`/`.idx` files consumed by Bridge pretrain configs ([data prep](https://docs.nvidia.com/nemo/megatron-bridge/latest/training/data-preparation.html)).
- **Parallelism.** 32B full SFT needs TP=8/PP=2 across 2 nodes. Larger models need EP for MoE (Megatron-LM parallelism guide, [README](https://github.com/NVIDIA/Megatron-LM)).

### Compute estimates
Estimates use C ≈ 6·N·D FLOPs ([Kaplan et al.](https://arxiv.org/pdf/2001.08361)) and the A100's 312 TFLOPS dense BF16 peak ([NVIDIA](https://developer.nvidia.com/blog/nvidia-ampere-architecture-in-depth)). The 40% MFU assumption is mine. LoRA skips weight gradients, so real cost is somewhat below 6ND; treat these as upper bounds.

| Run | Calculation | Result |
|---|---|---|
| E4B (~4B effective) × 20M tokens | 6 × 4e9 × 2e7 = 4.8e17 FLOPs | ≈ 1 A100-hour (Colab-feasible) |
| Qwen3-8B × 1B tokens | 4.8e19 FLOPs | ≈ 110 A100-hours ≈ 14 h on 8×A100 |
| 31–32B × 1B tokens | ~1.9e20 FLOPs | ≈ 420 A100-hours ≈ 2.2 days on 8×A100 (cluster; e.g. TACC or Texas Tech HPCC, availability **unverified**) |

A realistic first corpus is about 50k stages × 5–20k tokens, or 0.25–1B tokens.

---

## 6. Prediction challenge design and metrics

### Well-posed tasks (tie to O1–O3)
1. **Repair (O1).** Input: a corrupted knee stage plus an optional error hint. Output: the fixed `.usda`, either as a full stage or as a minimal diff layer authored as an override sublayer. Hold out *corruption families* (e.g. dangling references, wrong `upAxis` / `metersPerUnit`, transposed xform ops, swapped material binding, deleted cartilage prim, scaled patella) between train and test, so the task rewards generalisation rather than memorising templates. The usd-wg malformed test assets give extra, externally authored corruptions ([usd-wg/assets](https://github.com/usd-wg/assets)).
2. **Text → stage (O2).** Input: a healthy-baseline description. Output: a stage scored against the reference archetype.
3. **Anomaly localisation (O3 + imaging).** Input: a patient-derived stage, or MRI-derived meshes from OAIZIB-CM. Output: (a) a ranked list of prim paths that deviate from the archetype, scored by mAP / top-k accuracy; (b) a voxel divergence map, scored by Dice and AUROC against synthetic ground-truth deformations.
4. **Verification (O3, LSTM track).** Classify a stage pair as faithful or corrupted, scored by AUROC / F1.

Use a **code-competition format** with a hidden test set. The scorer must run deterministically on CPU with `usd-core`.

### `usdfid`: a layered, decomposable score (each component reported separately)
| Layer | Check | Tooling |
|---|---|---|
| L0 Parse | Opens and composes; no unresolved references | `Usd.Stage.Open`; Core Spec 1.0 grammar ([spec](https://digitalproduction.com/2026/01/05/aousd-releases-openusd-core-specification-1-0/)) |
| L1 Compliance | Number of errors / warnings | `usdchecker` (`--strict`, `--variantSets`, `--dumpRules`, `-o`) ([man page](https://mankier.com/1/usdchecker)); UsdValidation `ValidationContext([...]).Validate(stage)`, with custom knee validators via `RegisterStageValidator` ([UsdValidation](https://openusd.org/release/api/md_pxr_usd_validation_usd_validation__r_e_a_d_m_e.html)). UsdUtilsComplianceChecker is deprecated in 26.05 ([AOUSD](https://aousd.org/blog/announcing-openusd-v26-05-key-features-and-improvements/)). Optionally add NVIDIA Asset Validator rules (ExtentsChecker, DefaultPrimChecker, ManifoldChecker…) ([CLI](https://docs.omniverse.nvidia.com/kit/docs/asset-validator/latest/source/python/docs/cli.html)) |
| L2 Structure | Prim-path set Jaccard, type match, tree edit distance, metadata (`upAxis`, `metersPerUnit`, `defaultPrim`) | Custom. Note `usddiff` does no fuzzy numeric comparison ([toolset](https://openusd.org/release/toolset.html)), so compare attributes with tolerances |
| L3 Attributes | Relative error on xforms, extents, material bindings, custom anatomical attributes | Custom, with per-attribute tolerances |
| L4 Geometry | Chamfer + **F-score@τ** (τ ≈ 1% of bounding-box side) on points sampled from composed meshes | [Tatarchenko et al.](https://ar5iv.arxiv.org/html/1905.03678) |
| L5 Distribution (optional) | Fréchet distance between feature embeddings of generated and reference sets, analogous to P-FID (PointNet++ features) | [Point-E](https://arxiv.org/pdf/2212.08751) |
| L6 Semantics (optional) | CLIP-sim of rendered views vs. text (as in IL3D); treat as weak | [IL3D](https://arxiv.org/pdf/2510.12095), [3DGen-Bench](https://arxiv.org/html/2503.21745v2) |

**Aggregation:**
- **Gate:** L0 failure scores 0.
- **Weighted sum** of L1–L4, with weights published in advance.
- **Report** per-layer leaderboards so models cannot trade validity for geometry unseen.
- **Scene tasks:** add IL3D-style OOB / overlap rates.

---

## 7. Risks and open questions

- **Licences.**
  - The Kitchen Set forbids redistribution.
  - ALab's ASWF licence does not mention ML training.
  - ShapeNet, OAIZIB-CM, WaLa and LLaMA-Mesh are non-commercial.
  - TotalSegmentator's appendicular model forbids training similar algorithms on its outputs.
  - The RSNA dataset terms are unknown.

  Build the public challenge from **self-generated archetype data + CC-BY/CC0/BSD-generated content only**.
- **Sequence length and numerics.** Inline mesh arrays explode token counts with per-digit tokenizers. Reference payloads and quantize coordinates.
- **Gemma 4 in Megatron-Bridge.** The 31B text recipe was not confirmed, and the 0.7.0 deprecation schedule may affect older models. Qwen3 is the lower-risk Megatron target; Gemma 4 can stay on the HF/Unsloth/vLLM side.
- **Tooling gaps.** Whether `usd-core` includes the CLIs is unverified. The Adobe plugins and `guc` must be built from source. Megatron-Bridge needs Python 3.12; Colab's current Python version is **unverified**.
- **Metric validity.** CLIP-type metrics correlate weakly with human judgement (3DGen-Bench). Validate `usdfid` against a small expert-rated set: human preference vs. `usdfid` rank correlation.
- **Leakage.** Corruptions generated from one archetype are easy to memorise. Hold out corruption families and anatomical variants.
- **Clinical framing.** The knee archetype and anomaly maps are research artefacts, not diagnostic tools. State this on the project page.
- **Unverified or blocked sources:** the arXiv abstract page for LLaMA-Mesh (quantization bins, compute), the NVIDIA A100 datasheet PDF, and scikit-image docs could not be fetched. Values shown come from secondary sources or are marked.

---

## 8. Sources

- Megatron-Bridge docs (latest): https://docs.nvidia.com/nemo/megatron-bridge/latest
- Megatron-Bridge GitHub: https://github.com/NVIDIA-NeMo/Megatron-Bridge
- Megatron-Bridge PyPI: https://pypi.org/project/megatron-bridge/
- Megatron-Bridge conversion README: https://raw.githubusercontent.com/NVIDIA-NeMo/Megatron-Bridge/main/examples/conversion/README.md
- Megatron-Bridge Qwen3 recipes: https://docs.nvidia.com/nemo/megatron-bridge/0.5.0/apidocs/bridge/bridge.recipes.qwen.qwen3.html
- Megatron-Bridge PEFT: https://docs.nvidia.com/nemo/megatron-bridge/0.3.1/training/peft.html
- Megatron-Bridge data preparation: https://docs.nvidia.com/nemo/megatron-bridge/latest/training/data-preparation.html
- Megatron-Bridge Gemma4-VL recipes: https://docs.nvidia.com/nemo/megatron-bridge/latest/apidocs/bridge/bridge.recipes.gemma4_vl.gemma4_vl.html
- Megatron-Bridge Gemma4 text recipes: https://docs.nvidia.com/nemo/megatron-bridge/latest/apidocs/bridge/bridge.recipes.gemma.gemma4.html
- Megatron-Bridge recipe index: https://docs.nvidia.com/nemo/megatron-bridge/latest/apidocs/bridge/bridge.recipes.html
- Nemotron PEFT step: https://docs.nvidia.com/nemotron/nightly/train-models/reference/peft/megatron-bridge.html
- Megatron-LM README: https://github.com/NVIDIA/Megatron-LM
- Megatron-LM llama_mistral doc: https://raw.githubusercontent.com/NVIDIA/Megatron-LM/main/docs/llama_mistral.md
- Megatron-LM preprocess_data.py: https://raw.githubusercontent.com/NVIDIA/Megatron-LM/main/tools/preprocess_data.py
- sweeden-ttu fork: https://github.com/sweeden-ttu/Megatron-LM
- Unsloth Gemma 4 training: https://unsloth.ai/docs/models/gemma-4/train
- Gemma 4 release: https://the-decoder.com/googles-gemma-4-is-now-available-with-apache-2-0-licensing-for-the-first-time/
- Colab GPUs 2026: https://explainx.ai/blog/google-ai-pro-colab-a100-h100-200-compute-units-claimed-vs-verified-2026
- Kaplan scaling laws: https://arxiv.org/pdf/2001.08361
- A100 peak: https://developer.nvidia.com/blog/nvidia-ampere-architecture-in-depth
- Number tokenization: https://beren.io/2024-05-11-Integer-tokenization-is-now-much-less-insane
- USD Code NIM: https://docs.api.nvidia.com/nim/reference/nvidia-usdcode
- OpenUSD NIMs press release: https://www.nasdaq.com/press-release/nvidia-announces-generative-ai-models-and-nim-microservices-openusd-language-geometry
- nanousd-labs: https://developer.nvidia.com/blog/develop-lightweight-usd-runtimes-faster-with-ai-agents/
- LLaMA-Mesh: https://huggingface.co/Zhengyi/LLaMA-Mesh ; https://arxiv.org/pdf/2411.09595
- MeshLLM: https://arxiv.org/abs/2508.01242v2
- MeshGPT: https://openaccess.thecvf.com/content/CVPR2024/html/Siddiqui_MeshGPT_Generating_Triangle_Meshes_with_Decoder-Only_Transformers_CVPR_2024_paper.html
- SceneScript: https://github.com/facebookresearch/scenescript
- SpatialLM: https://github.com/manycore-research/SpatialLM
- 3D-GPT: https://arxiv.org/abs/2310.12945v2
- LayoutGPT: https://github.com/weixi-feng/LayoutGPT
- Holodeck: https://github.com/allenai/Holodeck/blob/main/README.md
- IL3D: https://arxiv.org/pdf/2510.12095
- Articulate3D: https://arxiv.org/html/2412.01398v2
- Roblox Cube: https://arxiv.org/pdf/2503.15475 ; https://huggingface.co/spaces/Nymbo/cube3d-interactive/blob/main/cube/README.md?code=true
- WaLa-SK-1B: https://huggingface.co/ADSKAILab/WaLa-SK-1B
- Make-A-Shape: https://huggingface.co/ADSKAILab/Make-A-Shape-multi-view-20m
- Text2CAD: https://arxiv.org/abs/2409.17106v1
- CAD-Recode: https://github.com/filaPro/cad-recode ; https://huggingface.co/papers/2412.14042
- Autodesk OpenUSD: https://www.autodesk.com/solutions/media-entertainment/openusd
- maya-usd: https://github.com/Autodesk/maya-usd
- Aurora: https://github.com/Autodesk/Aurora
- Project Bernini: https://develop3d.com/ai/autodesk-unveils-project-bernini-for-3d-generative-ai/
- Autodesk Neural CAD: https://develop3d.com/cad/autodesks-ai-blueprint-for-cad/
- AOUSD Core Spec 1.0: https://digitalproduction.com/2026/01/05/aousd-releases-openusd-core-specification-1-0/
- OpenUSD 26.05: https://aousd.org/blog/announcing-openusd-v26-05-key-features-and-improvements/
- OpenUSD licence rename: https://forum.aousd.org/t/upcoming-openusd-license-update/1561
- usd-core: https://pypi.org/project/usd-core/
- Converting layer formats: https://openusd.org/release/tut_converting_between_layer_formats.html
- USD toolset: https://openusd.org/release/toolset.html
- usdchecker: https://mankier.com/1/usdchecker
- UsdValidation: https://openusd.org/release/api/md_pxr_usd_validation_usd_validation__r_e_a_d_m_e.html
- NVIDIA Asset Validator CLI: https://docs.omniverse.nvidia.com/kit/docs/asset-validator/latest/source/python/docs/cli.html
- Kitchen Set EULA: https://openusd.org/release/dl_kitchen_set.html ; downloads: https://openusd.org/release/dl_downloads.html
- ALab: https://github.com/DigitalProductionExampleLibrary/ALab ; licence: https://raw.githubusercontent.com/DigitalProductionExampleLibrary/ALab/main/LICENSE.md
- usd-wg assets: https://github.com/usd-wg/assets
- SimReady Central: https://docs.omniverse.nvidia.com/simready/latest/simready-central.html
- SimReady Warehouse: https://huggingface.co/datasets/nvidia/PhysicalAI-SimReady-Warehouse-01 ; https://hyper.ai/en/datasets/nvidia-physical-ai-simready-warehouse-openusd ; https://developer.nvidia.com/blog/?p=106496
- Objaverse: https://huggingface.co/datasets/allenai/objaverse ; Objaverse-XL: https://huggingface.co/datasets/allenai/objaverse-xl
- glTF Sample Assets: https://github.com/KhronosGroup/glTF-Sample-Assets
- guc: https://github.com/pablode/guc ; Adobe plugins: https://github.com/adobe/USD-Fileformat-plugins
- ShapeNetCore: https://huggingface.co/datasets/ShapeNet/ShapeNetCore ; https://huggingface.co/datasets/ShapeNet/shapenetcore-glb
- 3D-FRONT: https://ar5iv.labs.arxiv.org/html/2011.09127 ; 3D-FUTURE terms: https://terms.aliyun.com/legal-agreement/terms/suit_bu1_ali_cloud/suit_bu1_ali_cloud202004171628_60052.html
- Hypersim: https://github.com/apple/ml-hypersim
- Infinigen Indoors: https://www.cgchannel.com/2025/06/open-source-tool-infinigen-indoors-generates-procedural-3d-interiors/
- OAIZIB-CM: https://huggingface.co/datasets/YongchengYAO/OAIZIB-CM ; https://www.research.ed.ac.uk/en/datasets/oaizib-cm-dataset-from-the-cartimorph-project/
- OAI: https://datacatalog.med.nyu.edu/dataset/10162
- SKI10 rules: https://ski10.grand-challenge.org/Rules/
- TotalSegmentator: https://zenodo.org/records/10047292 ; https://discourse.slicer.org/t/totalsegmentator-v2/32470
- fastMRI: https://datacollaboratives.org/cases/nyu-langone-fastmri-dataset.html
- RSNA knee challenge: https://www.rsna.org/news/2026/august/ai-challenge-knee-mri
- Tatarchenko F-score: https://ar5iv.arxiv.org/html/1905.03678
- 3DGen-Bench: https://arxiv.org/html/2503.21745v2
- Point-E (P-FID): https://arxiv.org/pdf/2212.08751
