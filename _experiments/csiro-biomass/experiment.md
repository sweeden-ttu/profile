# CSIRO Image2Biomass Prediction Experiment

## DINOv2 Vision Transformer Approach

**Competition:** [CSIRO - Image2Biomass Prediction](https://www.kaggle.com/competitions/csiro-biomass)
**Deadline:** January 28, 2026
**Author:** Scott Weeden
**Created:** January 16, 2026

---

## 1. Executive Summary

This experiment explores the use of **DINOv2 (Self-Distillation with No Labels v2)** vision transformers for predicting dry biomass from aerial pasture images. The approach leverages DINOv2's powerful self-supervised visual features combined with domain-specific vegetation indices to perform multi-target regression for biomass estimation.

### Key Objectives

1. Extract robust visual features using pre-trained DINOv2 models
2. Combine deep learning features with traditional vegetation indices
3. Predict five biomass targets: Dry_Clover, Dry_Dead, Dry_Green, Dry_Total, and GDM
4. Achieve competitive performance on the Kaggle leaderboard

---

## 2. Dataset Overview

### 2.1 Data Statistics

| Metric | Value |
|--------|-------|
| Training Images | 357 |
| Test Images | 1 |
| Image Resolution | ~3000 x 4000 pixels |
| Targets per Image | 5 |
| Total Training Samples | 1,785 |
| Geographic Regions | 4 (Tas, NSW, WA, Vic) |
| Plant Species | 15 |

### 2.2 Target Variables

| Target | Description | Mean (g) | Std (g) | Range (g) |
|--------|-------------|----------|---------|-----------|
| `Dry_Clover_g` | Dry weight of clover | 6.65 | 12.12 | 0 - 71.79 |
| `Dry_Dead_g` | Dry weight of dead matter | 12.04 | 12.40 | 0 - 83.84 |
| `Dry_Green_g` | Dry weight of green matter | 26.62 | 25.40 | 0 - 157.98 |
| `Dry_Total_g` | Total dry biomass | 45.32 | 27.98 | 1.04 - 185.70 |
| `GDM_g` | Green dry matter | 33.27 | 24.94 | 1.04 - 157.98 |

### 2.3 Available Features

- **Sampling_Date**: Date of image capture
- **State**: Australian state (Tas, NSW, WA, Vic)
- **Species**: Plant species composition (15 categories)
- **Pre_GSHH_NDVI**: Pre-computed NDVI value
- **Height_Ave_cm**: Average vegetation height in centimeters

### 2.4 Data Split Strategy

```
Training:   80% (286 images) - Stratified by State
Validation: 20% (71 images)  - Stratified by State
Test:       1 image (competition holdout)
```

---

## 3. DINOv2 Background

### 3.1 What is DINOv2?

DINOv2 is a self-supervised vision transformer developed by Meta AI that learns powerful visual representations without requiring labeled data. Key characteristics:

- **Self-supervised learning**: Trained on 142M images without labels
- **Vision Transformer architecture**: Uses ViT backbone with patch-based processing
- **Rich semantic features**: Captures both local texture and global context
- **Transfer learning ready**: Features transfer well to downstream tasks

### 3.2 Why DINOv2 for Biomass Prediction?

1. **Patch-level features**: DINOv2 extracts features from 14x14 pixel patches, enabling fine-grained analysis of vegetation patterns
2. **Semantic understanding**: Pre-trained features capture texture, color, and structural patterns relevant to plant health
3. **No domain-specific training needed**: Features generalize well without fine-tuning
4. **State-of-the-art performance**: Top Kaggle solutions use DINOv2 (42-43 votes)

### 3.3 Model Variants

| Model | Parameters | Patch Size | Feature Dim | Recommended Use |
|-------|------------|------------|-------------|-----------------|
| ViT-S/14 | 22M | 14x14 | 384 | Fast inference |
| ViT-B/14 | 86M | 14x14 | 768 | **Balanced (recommended)** |
| ViT-L/14 | 300M | 14x14 | 1024 | High accuracy |
| ViT-g/14 | 1.1B | 14x14 | 1536 | Maximum accuracy |

---

## 4. Experimental Methodology

### 4.1 Feature Extraction Pipeline

```
┌─────────────────┐
│  Input Image    │
│  (3000x4000)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Resize/Crop    │
│  (518x518)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌───────────────┐
│DINOv2 │  │ Traditional   │
│Features│  │ Features      │
└───┬───┘  └───────┬───────┘
    │              │
    │   ┌──────────┴──────────┐
    │   │                     │
    │   ▼                     ▼
    │ ┌─────────┐  ┌─────────────────┐
    │ │Vegetation│  │ Texture/Color   │
    │ │ Indices  │  │ Features        │
    │ └────┬────┘  └────────┬────────┘
    │      │                │
    └──────┼────────────────┘
           │
           ▼
    ┌──────────────┐
    │  Combined    │
    │  Features    │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Regression  │
    │  Head        │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Biomass     │
    │  Predictions │
    └──────────────┘
```

### 4.2 DINOv2 Feature Extraction

```python
import timm
import torch

class DINOv2FeatureExtractor:
    def __init__(self, model_name="vit_base_patch14_dinov2"):
        self.model = timm.create_model(
            model_name,
            pretrained=True,
            num_classes=0  # Remove classification head
        )
        self.model.eval()

    def extract(self, image):
        """
        Extract patch-level features from DINOv2.

        Args:
            image: Tensor of shape (B, 3, 518, 518)

        Returns:
            patch_features: Tensor of shape (B, N_patches, 768)
            cls_token: Tensor of shape (B, 768)
        """
        with torch.no_grad():
            features = self.model.forward_features(image)
            cls_token = features[:, 0, :]      # Global image feature
            patch_tokens = features[:, 1:, :]  # Patch-level features
        return patch_tokens, cls_token
```

### 4.3 Vegetation Indices

Traditional vegetation indices complement DINOv2 features by providing domain-specific information:

| Index | Formula | Purpose |
|-------|---------|---------|
| **ExG** (Excess Green) | `2G - R - B` | Green vegetation detection |
| **ExGR** (Excess Green-Red) | `ExG - (1.4R - G)` | Distinguish green from soil |
| **NGRDI** (Normalized Green-Red) | `(G - R) / (G + R)` | Vegetation vs non-vegetation |
| **GLI** (Green Leaf Index) | `(2G - R - B) / (2G + R + B)` | Leaf area estimation |
| **TGI** (Triangular Greenness) | `G - 0.39R - 0.61B` | Chlorophyll content |
| **VARI** (Visible Atmospherically Resistant) | `(G - R) / (G + R - B)` | Atmospheric correction |

### 4.4 Feature Combination Strategy

Based on top Kaggle solutions, optimal feature weights:

```python
FEATURE_WEIGHTS = {
    'dino_features': 0.4,      # DINOv2 patch embeddings
    'color_features': 0.3,     # HSV color statistics
    'vegetation_indices': 0.2, # ExG, TGI, NGRDI, etc.
    'texture_features': 0.1    # Edge, variance, Laplacian
}
```

### 4.5 Regression Approaches

#### Approach A: Direct Regression
- Use combined features with MLP head
- Predict all 5 targets simultaneously
- Loss: MSE or Huber loss

#### Approach B: Pseudo-Segmentation + Regression
- Cluster patches using K-Means (K=8)
- Classify clusters as: GREEN, DEAD, CLOVER, SOIL, SHADOW
- Estimate biomass from cluster proportions
- Top solution approach (40+ votes)

#### Approach C: Two-Stream Architecture
- Stream 1: Full image features (global context)
- Stream 2: Cropped region features (local detail)
- Fuse streams for final prediction
- Best performing approach (43 votes)

---

## 5. Experimental Design

### 5.1 Experiments to Run

| Exp ID | Description | Model | Features | Expected MAE |
|--------|-------------|-------|----------|--------------|
| E001 | Baseline - ResNet50 | ResNet50 | ImageNet features | ~15g |
| E002 | DINOv2-B only | ViT-B/14 | DINOv2 patches | ~10g |
| E003 | DINOv2-B + VegIdx | ViT-B/14 | Combined | ~8g |
| E004 | Pseudo-Segmentation | ViT-B/14 | Clustered | ~7g |
| E005 | Two-Stream | ViT-B/14 | Multi-scale | ~6g |
| E006 | Ensemble | Multiple | All | ~5g |

### 5.2 Hyperparameter Search

```yaml
model:
  backbone: [vit_small_patch14_dinov2, vit_base_patch14_dinov2, vit_large_patch14_dinov2]
  input_size: [448, 518, 560]

features:
  n_clusters: [6, 8, 10, 12]
  dino_weight: [0.3, 0.4, 0.5]
  upsample_factor: [2, 4, 8]

training:
  learning_rate: [1e-4, 5e-4, 1e-3]
  batch_size: [8, 16, 32]
  epochs: [50, 100, 200]
  weight_decay: [1e-4, 1e-5]

regression:
  hidden_dims: [[512, 256], [768, 384, 192], [1024, 512, 256]]
  dropout: [0.1, 0.2, 0.3]
```

### 5.3 Ablation Studies

1. **Feature ablation**: Measure contribution of each feature type
2. **Model size ablation**: Compare ViT-S vs ViT-B vs ViT-L
3. **Input resolution ablation**: Test different crop sizes
4. **Clustering ablation**: Vary K in K-Means segmentation
5. **Loss function ablation**: MSE vs Huber vs MAE

---

## 6. Evaluation Metrics

### 6.1 Primary Metric

**Mean Absolute Error (MAE)** - Competition metric

```python
MAE = (1/n) * Σ|y_pred - y_true|
```

### 6.2 Secondary Metrics

| Metric | Formula | Purpose |
|--------|---------|---------|
| RMSE | `sqrt(mean((y_pred - y_true)^2))` | Penalize large errors |
| R² | `1 - SS_res/SS_tot` | Variance explained |
| MAPE | `mean(abs((y_true - y_pred)/y_true))` | Relative error |

### 6.3 Per-Target Evaluation

Track metrics separately for each target to identify weaknesses:
- Dry_Clover_g (sparse, many zeros)
- Dry_Dead_g (moderate variance)
- Dry_Green_g (primary signal)
- Dry_Total_g (sum of components)
- GDM_g (green dry matter)

---

## 7. Implementation Plan

### 7.1 Phase 1: Setup (Day 1)

- [x] Create virtual environment
- [x] Download and preprocess dataset
- [ ] Install dependencies (torch, timm, opencv, pandas)
- [ ] Verify DINOv2 model loading
- [ ] Create data loaders

### 7.2 Phase 2: Baseline (Days 2-3)

- [ ] Implement DINOv2 feature extraction
- [ ] Build simple regression head
- [ ] Train baseline model (E001, E002)
- [ ] Establish baseline metrics

### 7.3 Phase 3: Enhanced Features (Days 4-5)

- [ ] Implement vegetation indices
- [ ] Add texture features
- [ ] Combine features with weighting
- [ ] Train enhanced model (E003)

### 7.4 Phase 4: Advanced Methods (Days 6-8)

- [ ] Implement pseudo-segmentation pipeline
- [ ] Build two-stream architecture
- [ ] Train advanced models (E004, E005)
- [ ] Compare approaches

### 7.5 Phase 5: Optimization (Days 9-11)

- [ ] Hyperparameter tuning
- [ ] Ensemble multiple models
- [ ] Post-processing and calibration
- [ ] Final submission preparation

---

## 8. Dependencies

### 8.1 requirements.txt

```
torch>=2.0.0
torchvision>=0.15.0
timm>=0.9.0
transformers>=4.30.0
opencv-python>=4.8.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
matplotlib>=3.7.0
seaborn>=0.12.0
albumentations>=1.3.0
tqdm>=4.65.0
wandb>=0.15.0
```

### 8.2 Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| GPU | GTX 1080 (8GB) | RTX 3090 (24GB) |
| RAM | 16GB | 32GB |
| Storage | 10GB | 50GB |
| CUDA | 11.7+ | 12.0+ |

---

## 9. Expected Results

### 9.1 Baseline Expectations

Based on top Kaggle solutions:
- Current leaderboard best: ~0.68 score
- DINOv2 + ensemble approach: 0.68-0.69
- Top solutions use ViT-B/14 DINOv2 with pseudo-segmentation

### 9.2 Target Performance

| Stage | Expected Score | Notes |
|-------|----------------|-------|
| Baseline | 0.50-0.55 | Simple DINOv2 features |
| Enhanced | 0.60-0.65 | + Vegetation indices |
| Advanced | 0.65-0.68 | Pseudo-segmentation |
| Optimized | 0.68-0.70 | Ensemble + tuning |

---

## 10. References

### 10.1 Papers

1. **DINOv2**: Oquab, M., et al. (2023). "DINOv2: Learning Robust Visual Features without Supervision"
2. **Vision Transformers**: Dosovitskiy, A., et al. (2020). "An Image is Worth 16x16 Words"
3. **Vegetation Indices**: Meyer, G.E., Neto, J.C. (2008). "Verification of color vegetation indices"

### 10.2 Code Resources

- [Official DINOv2 Repository](https://github.com/facebookresearch/dinov2)
- [Hugging Face DINOv2](https://huggingface.co/docs/transformers/en/model_doc/dinov2)
- [TIMM Library](https://github.com/huggingface/pytorch-image-models)

### 10.3 Top Kaggle Notebooks

1. **[Inference] Dinov2 - 2 streams** (43 votes) - simonedegasperis
2. **DinoV2 [training]** (42 votes) - simonedegasperis
3. **DINOv2 Pseudo-Segmentation** (40 votes) - giovannyrodrguez
4. **[0.68] CSIRO | 3-Model Ensemble + Post-process** (27 votes) - yunakam907

---

## 11. Directory Structure

```
_experiments/csiro-biomass/
├── venv/                    # Python virtual environment
├── experiment.md            # This document
├── notebooks/
│   ├── 01_eda.ipynb        # Exploratory data analysis
│   ├── 02_baseline.ipynb   # Baseline experiments
│   ├── 03_dinov2.ipynb     # DINOv2 feature extraction
│   ├── 04_segmentation.ipynb # Pseudo-segmentation
│   └── 05_ensemble.ipynb   # Final ensemble
├── src/
│   ├── models/
│   │   ├── dinov2.py       # DINOv2 wrapper
│   │   ├── regression.py   # Regression heads
│   │   └── ensemble.py     # Ensemble methods
│   ├── features/
│   │   ├── vegetation.py   # Vegetation indices
│   │   ├── texture.py      # Texture features
│   │   └── color.py        # Color features
│   ├── data/
│   │   ├── dataset.py      # PyTorch dataset
│   │   └── transforms.py   # Data augmentation
│   └── utils/
│       ├── metrics.py      # Evaluation metrics
│       └── visualization.py # Plotting utilities
├── configs/
│   └── experiment.yaml     # Experiment configurations
├── outputs/
│   ├── models/             # Saved model checkpoints
│   ├── logs/               # Training logs
│   └── submissions/        # Kaggle submissions
└── requirements.txt        # Python dependencies
```

---

## 12. Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-16 | 0.1.0 | Initial experiment design |

---

*Last updated: January 16, 2026*
