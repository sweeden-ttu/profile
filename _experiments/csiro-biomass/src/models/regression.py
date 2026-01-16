"""
Regression Models for Biomass Prediction

Combines DINOv2 features with regression heads for multi-target prediction.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional, Tuple
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.dinov2 import DINOv2FeatureExtractor


class RegressionHead(nn.Module):
    """
    MLP regression head for biomass prediction.
    """

    def __init__(
        self,
        input_dim: int,
        hidden_dims: List[int] = [512, 256],
        output_dim: int = 5,
        dropout: float = 0.2,
        activation: str = 'relu'
    ):
        """
        Initialize regression head.

        Args:
            input_dim: Input feature dimension
            hidden_dims: List of hidden layer dimensions
            output_dim: Number of output targets
            dropout: Dropout probability
            activation: Activation function ('relu', 'gelu', 'leaky_relu')
        """
        super().__init__()

        self.input_dim = input_dim
        self.output_dim = output_dim

        # Activation function
        if activation == 'relu':
            act_fn = nn.ReLU
        elif activation == 'gelu':
            act_fn = nn.GELU
        elif activation == 'leaky_relu':
            act_fn = nn.LeakyReLU
        else:
            raise ValueError(f"Unknown activation: {activation}")

        # Build MLP layers
        layers = []
        in_dim = input_dim

        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(in_dim, hidden_dim),
                nn.LayerNorm(hidden_dim),  # LayerNorm works with batch_size=1
                act_fn(),
                nn.Dropout(dropout)
            ])
            in_dim = hidden_dim

        # Output layer
        layers.append(nn.Linear(in_dim, output_dim))

        self.mlp = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.

        Args:
            x: Input features of shape (B, input_dim)

        Returns:
            Predictions of shape (B, output_dim)
        """
        return self.mlp(x)


class BiomassRegressor(nn.Module):
    """
    Full biomass regression model combining DINOv2 with regression head.
    """

    def __init__(
        self,
        model_size: str = 'base',
        hidden_dims: List[int] = [768, 384, 192],
        output_dim: int = 5,
        dropout: float = 0.2,
        freeze_backbone: bool = True,
        use_cls_token: bool = True,
        use_patch_pooling: bool = True,
        device: Optional[str] = None
    ):
        """
        Initialize biomass regressor.

        Args:
            model_size: DINOv2 model size ('small', 'base', 'large', 'giant')
            hidden_dims: Hidden layer dimensions for regression head
            output_dim: Number of output targets (5 for biomass)
            dropout: Dropout probability
            freeze_backbone: Whether to freeze DINOv2 backbone
            use_cls_token: Whether to use CLS token features
            use_patch_pooling: Whether to pool patch features
            device: Device to run on
        """
        super().__init__()

        self.use_cls_token = use_cls_token
        self.use_patch_pooling = use_patch_pooling

        # Initialize DINOv2 backbone
        self.backbone = DINOv2FeatureExtractor(
            model_size=model_size,
            pretrained=True,
            freeze=freeze_backbone,
            device=device
        )

        # Calculate input dimension for regression head
        embed_dim = self.backbone.embed_dim
        input_dim = 0

        if use_cls_token:
            input_dim += embed_dim
        if use_patch_pooling:
            input_dim += embed_dim  # Mean pooled patches

        if input_dim == 0:
            raise ValueError("Must use at least one of cls_token or patch_pooling")

        # Regression head
        self.head = RegressionHead(
            input_dim=input_dim,
            hidden_dims=hidden_dims,
            output_dim=output_dim,
            dropout=dropout
        )

        # Move head to same device as backbone
        self.head.to(self.backbone.device)
        self.device = self.backbone.device

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.

        Args:
            x: Input images of shape (B, 3, H, W)

        Returns:
            Predictions of shape (B, output_dim)
        """
        # Extract features from backbone
        features = self.backbone(
            x,
            return_cls=self.use_cls_token,
            return_patches=self.use_patch_pooling
        )

        # Combine features
        feature_list = []

        if self.use_cls_token:
            feature_list.append(features['cls'])

        if self.use_patch_pooling:
            # Mean pool over patches
            patch_pooled = features['patches'].mean(dim=1)
            feature_list.append(patch_pooled)

        # Concatenate features
        combined = torch.cat(feature_list, dim=1)

        # Pass through regression head
        predictions = self.head(combined)

        return predictions

    def get_features(self, x: torch.Tensor) -> torch.Tensor:
        """
        Extract features without regression head.

        Args:
            x: Input images of shape (B, 3, H, W)

        Returns:
            Combined features
        """
        features = self.backbone(
            x,
            return_cls=self.use_cls_token,
            return_patches=self.use_patch_pooling
        )

        feature_list = []

        if self.use_cls_token:
            feature_list.append(features['cls'])

        if self.use_patch_pooling:
            patch_pooled = features['patches'].mean(dim=1)
            feature_list.append(patch_pooled)

        return torch.cat(feature_list, dim=1)


class BiomassRegressorWithAux(nn.Module):
    """
    Biomass regressor with auxiliary features (NDVI, Height, etc.)
    """

    def __init__(
        self,
        model_size: str = 'base',
        hidden_dims: List[int] = [768, 384, 192],
        output_dim: int = 5,
        aux_dim: int = 2,  # NDVI + Height
        dropout: float = 0.2,
        freeze_backbone: bool = True,
        device: Optional[str] = None
    ):
        super().__init__()

        # DINOv2 backbone
        self.backbone = DINOv2FeatureExtractor(
            model_size=model_size,
            pretrained=True,
            freeze=freeze_backbone,
            device=device
        )

        embed_dim = self.backbone.embed_dim

        # Feature dimension: CLS + mean pooled patches + aux
        input_dim = embed_dim * 2 + aux_dim

        # Regression head
        self.head = RegressionHead(
            input_dim=input_dim,
            hidden_dims=hidden_dims,
            output_dim=output_dim,
            dropout=dropout
        )

        self.head.to(self.backbone.device)
        self.device = self.backbone.device

    def forward(
        self,
        x: torch.Tensor,
        aux: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        """
        Forward pass.

        Args:
            x: Input images (B, 3, H, W)
            aux: Auxiliary features (B, aux_dim)

        Returns:
            Predictions (B, output_dim)
        """
        features = self.backbone(x, return_cls=True, return_patches=True)

        # Combine DINOv2 features
        cls_feat = features['cls']
        patch_pooled = features['patches'].mean(dim=1)
        combined = torch.cat([cls_feat, patch_pooled], dim=1)

        # Add auxiliary features if provided
        if aux is not None:
            aux = aux.to(self.device)
            combined = torch.cat([combined, aux], dim=1)

        return self.head(combined)


class TwoStreamBiomassRegressor(nn.Module):
    """
    Two-stream architecture: processes full image and cropped regions.

    This is the approach used by the top Kaggle solution (43 votes).
    """

    def __init__(
        self,
        model_size: str = 'base',
        hidden_dims: List[int] = [1024, 512, 256],
        output_dim: int = 5,
        dropout: float = 0.2,
        freeze_backbone: bool = True,
        device: Optional[str] = None
    ):
        super().__init__()

        # Single backbone shared between streams
        self.backbone = DINOv2FeatureExtractor(
            model_size=model_size,
            pretrained=True,
            freeze=freeze_backbone,
            device=device
        )

        embed_dim = self.backbone.embed_dim

        # Two streams: full image + crop
        # Each contributes: CLS + mean pooled patches
        input_dim = embed_dim * 4  # 2 streams x 2 features

        # Fusion and regression
        self.head = RegressionHead(
            input_dim=input_dim,
            hidden_dims=hidden_dims,
            output_dim=output_dim,
            dropout=dropout
        )

        self.head.to(self.backbone.device)
        self.device = self.backbone.device

    def forward(
        self,
        x_full: torch.Tensor,
        x_crop: torch.Tensor
    ) -> torch.Tensor:
        """
        Forward pass with two input streams.

        Args:
            x_full: Full images (B, 3, H, W)
            x_crop: Cropped regions (B, 3, H, W)

        Returns:
            Predictions (B, output_dim)
        """
        # Stream 1: Full image
        feat_full = self.backbone(x_full, return_cls=True, return_patches=True)
        full_combined = torch.cat([
            feat_full['cls'],
            feat_full['patches'].mean(dim=1)
        ], dim=1)

        # Stream 2: Cropped region
        feat_crop = self.backbone(x_crop, return_cls=True, return_patches=True)
        crop_combined = torch.cat([
            feat_crop['cls'],
            feat_crop['patches'].mean(dim=1)
        ], dim=1)

        # Fuse streams
        fused = torch.cat([full_combined, crop_combined], dim=1)

        return self.head(fused)


def test_models():
    """Test regression models."""
    print("\n" + "="*60)
    print("Testing Regression Models")
    print("="*60 + "\n")

    # Test basic regressor
    print("--- Testing BiomassRegressor ---")
    model = BiomassRegressor(
        model_size='base',
        hidden_dims=[768, 384, 192],
        output_dim=5,
        freeze_backbone=True
    )

    # Dummy input
    x = torch.randn(2, 3, 518, 518)
    output = model(x)
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {output.shape}")
    print(f"Output: {output}")

    # Test features extraction
    features = model.get_features(x)
    print(f"Features shape: {features.shape}")

    # Test with auxiliary features
    print("\n--- Testing BiomassRegressorWithAux ---")
    model_aux = BiomassRegressorWithAux(
        model_size='base',
        aux_dim=2
    )

    aux = torch.randn(2, 2)  # NDVI, Height
    output_aux = model_aux(x, aux)
    print(f"Output with aux shape: {output_aux.shape}")

    print("\n✓ All tests passed!")


if __name__ == "__main__":
    test_models()
