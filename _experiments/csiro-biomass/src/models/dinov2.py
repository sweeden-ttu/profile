"""
DINOv2 Feature Extractor Module

Extracts patch-level and global features from images using pre-trained DINOv2 models.
"""

import torch
import torch.nn as nn
import timm
import numpy as np
from typing import Tuple, Optional, Dict


class DINOv2FeatureExtractor(nn.Module):
    """
    DINOv2 Vision Transformer feature extractor.

    Supports multiple model sizes:
    - vit_small_patch14_dinov2 (22M params)
    - vit_base_patch14_dinov2 (86M params)
    - vit_large_patch14_dinov2 (300M params)
    - vit_giant_patch14_dinov2 (1.1B params)
    """

    MODEL_CONFIGS = {
        'small': {'name': 'vit_small_patch14_dinov2', 'embed_dim': 384},
        'base': {'name': 'vit_base_patch14_dinov2', 'embed_dim': 768},
        'large': {'name': 'vit_large_patch14_dinov2', 'embed_dim': 1024},
        'giant': {'name': 'vit_giant_patch14_dinov2', 'embed_dim': 1536},
    }

    def __init__(
        self,
        model_size: str = 'base',
        pretrained: bool = True,
        freeze: bool = True,
        device: Optional[str] = None
    ):
        """
        Initialize DINOv2 feature extractor.

        Args:
            model_size: One of 'small', 'base', 'large', 'giant'
            pretrained: Whether to load pretrained weights
            freeze: Whether to freeze the backbone
            device: Device to run on ('cuda', 'mps', 'cpu', or None for auto)
        """
        super().__init__()

        if model_size not in self.MODEL_CONFIGS:
            raise ValueError(f"model_size must be one of {list(self.MODEL_CONFIGS.keys())}")

        self.model_size = model_size
        self.config = self.MODEL_CONFIGS[model_size]
        self.embed_dim = self.config['embed_dim']
        self.patch_size = 14

        # Auto-detect device
        if device is None:
            if torch.cuda.is_available():
                device = 'cuda'
            elif torch.backends.mps.is_available():
                device = 'mps'
            else:
                device = 'cpu'
        self.device = device

        # Load model
        print(f"Loading DINOv2 {model_size} ({self.config['name']})...")
        self.model = timm.create_model(
            self.config['name'],
            pretrained=pretrained,
            num_classes=0,  # Remove classification head
        )

        if freeze:
            self._freeze_backbone()

        self.model.to(self.device)
        self.model.eval()

        print(f"DINOv2 loaded | embed_dim={self.embed_dim} | device={self.device}")

    def _freeze_backbone(self):
        """Freeze all backbone parameters."""
        for param in self.model.parameters():
            param.requires_grad = False

    def unfreeze_backbone(self, unfreeze_layers: int = 2):
        """
        Unfreeze the last N transformer blocks for fine-tuning.

        Args:
            unfreeze_layers: Number of transformer blocks to unfreeze
        """
        # Unfreeze last N blocks
        for block in self.model.blocks[-unfreeze_layers:]:
            for param in block.parameters():
                param.requires_grad = True

    @torch.no_grad()
    def forward(
        self,
        x: torch.Tensor,
        return_cls: bool = True,
        return_patches: bool = True
    ) -> Dict[str, torch.Tensor]:
        """
        Extract features from input images.

        Args:
            x: Input tensor of shape (B, 3, H, W)
            return_cls: Whether to return CLS token features
            return_patches: Whether to return patch features

        Returns:
            Dictionary containing:
            - 'cls': CLS token features (B, embed_dim) if return_cls=True
            - 'patches': Patch features (B, N_patches, embed_dim) if return_patches=True
            - 'grid_size': Tuple of (H_patches, W_patches)
        """
        x = x.to(self.device)

        # Forward through model
        features = self.model.forward_features(x)

        # Extract CLS token and patch tokens
        cls_token = features[:, 0, :]  # (B, embed_dim)
        patch_tokens = features[:, 1:, :]  # (B, N_patches, embed_dim)

        # Calculate grid size
        B, N, D = patch_tokens.shape
        grid_size = int(np.sqrt(N))

        result = {'grid_size': (grid_size, grid_size)}

        if return_cls:
            result['cls'] = cls_token
        if return_patches:
            result['patches'] = patch_tokens

        return result

    def extract_patch_features(
        self,
        x: torch.Tensor
    ) -> Tuple[torch.Tensor, Tuple[int, int]]:
        """
        Convenience method to extract just patch features.

        Args:
            x: Input tensor of shape (B, 3, H, W)

        Returns:
            patch_features: Tensor of shape (B, N_patches, embed_dim)
            grid_size: Tuple of (H_patches, W_patches)
        """
        result = self.forward(x, return_cls=False, return_patches=True)
        return result['patches'], result['grid_size']

    def extract_global_features(self, x: torch.Tensor) -> torch.Tensor:
        """
        Convenience method to extract just global (CLS) features.

        Args:
            x: Input tensor of shape (B, 3, H, W)

        Returns:
            global_features: Tensor of shape (B, embed_dim)
        """
        result = self.forward(x, return_cls=True, return_patches=False)
        return result['cls']

    def get_patch_embeddings_2d(
        self,
        x: torch.Tensor
    ) -> torch.Tensor:
        """
        Extract patch features and reshape to 2D spatial layout.

        Args:
            x: Input tensor of shape (B, 3, H, W)

        Returns:
            patch_features_2d: Tensor of shape (B, embed_dim, H_patches, W_patches)
        """
        patches, (gh, gw) = self.extract_patch_features(x)
        B, N, D = patches.shape

        # Reshape to 2D
        patches_2d = patches.permute(0, 2, 1).reshape(B, D, gh, gw)

        return patches_2d


class DINOv2WithProjection(nn.Module):
    """
    DINOv2 with optional projection head for dimensionality reduction.
    """

    def __init__(
        self,
        model_size: str = 'base',
        projection_dim: int = 256,
        pretrained: bool = True,
        freeze: bool = True,
        device: Optional[str] = None
    ):
        super().__init__()

        self.backbone = DINOv2FeatureExtractor(
            model_size=model_size,
            pretrained=pretrained,
            freeze=freeze,
            device=device
        )

        self.embed_dim = self.backbone.embed_dim
        self.projection_dim = projection_dim

        # Projection head
        self.projection = nn.Sequential(
            nn.Linear(self.embed_dim, self.embed_dim),
            nn.GELU(),
            nn.Linear(self.embed_dim, projection_dim),
            nn.LayerNorm(projection_dim)
        ).to(self.backbone.device)

    def forward(self, x: torch.Tensor) -> Dict[str, torch.Tensor]:
        """
        Extract and project features.

        Args:
            x: Input tensor of shape (B, 3, H, W)

        Returns:
            Dictionary with projected 'cls' and 'patches' features
        """
        result = self.backbone(x, return_cls=True, return_patches=True)

        # Project features
        result['cls'] = self.projection(result['cls'])

        B, N, D = result['patches'].shape
        patches_flat = result['patches'].reshape(-1, D)
        patches_proj = self.projection(patches_flat)
        result['patches'] = patches_proj.reshape(B, N, self.projection_dim)

        return result


def test_dinov2():
    """Test DINOv2 feature extraction."""
    print("\n" + "="*60)
    print("Testing DINOv2 Feature Extractor")
    print("="*60 + "\n")

    # Create extractor
    extractor = DINOv2FeatureExtractor(model_size='base', freeze=True)

    # Create dummy input (batch of 2 images, 518x518)
    x = torch.randn(2, 3, 518, 518)

    # Extract features
    result = extractor(x)

    print(f"Input shape: {x.shape}")
    print(f"CLS features shape: {result['cls'].shape}")
    print(f"Patch features shape: {result['patches'].shape}")
    print(f"Grid size: {result['grid_size']}")

    # Test 2D patches
    patches_2d = extractor.get_patch_embeddings_2d(x)
    print(f"2D patch features shape: {patches_2d.shape}")

    print("\n✓ All tests passed!")


if __name__ == "__main__":
    test_dinov2()
