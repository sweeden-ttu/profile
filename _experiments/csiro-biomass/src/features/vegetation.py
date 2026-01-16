"""
Vegetation Indices Module

Computes various vegetation indices from RGB images for biomass estimation.
"""

import numpy as np
import torch
import cv2
from typing import Dict, Optional, Union, Tuple


class VegetationIndices:
    """
    Compute vegetation indices from RGB images.

    Supports both numpy arrays and torch tensors.
    """

    EPS = 1e-6  # Small constant to avoid division by zero

    @staticmethod
    def normalize_rgb(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Normalize RGB image to [0, 1] range and extract channels.

        Args:
            image: RGB image of shape (H, W, 3) with values in [0, 255]

        Returns:
            R, G, B channels normalized to [0, 1]
        """
        img = image.astype(np.float32) / 255.0
        R, G, B = img[:, :, 0], img[:, :, 1], img[:, :, 2]
        return R, G, B

    @classmethod
    def excess_green(cls, image: np.ndarray) -> np.ndarray:
        """
        Excess Green Index (ExG).

        ExG = 2G - R - B

        Range: approximately [-2, +2] for RGB in [0, 1]
        Higher values indicate more green vegetation.

        Args:
            image: RGB image (H, W, 3)

        Returns:
            ExG index map (H, W)
        """
        R, G, B = cls.normalize_rgb(image)
        return 2 * G - R - B

    @classmethod
    def excess_green_red(cls, image: np.ndarray) -> np.ndarray:
        """
        Excess Green minus Excess Red (ExGR).

        ExGR = ExG - ExR = (2G - R - B) - (1.4R - G)

        Helps distinguish vegetation from soil better than ExG alone.

        Args:
            image: RGB image (H, W, 3)

        Returns:
            ExGR index map (H, W)
        """
        R, G, B = cls.normalize_rgb(image)
        ExG = 2 * G - R - B
        ExR = 1.4 * R - G
        return ExG - ExR

    @classmethod
    def normalized_green_red_difference(cls, image: np.ndarray) -> np.ndarray:
        """
        Normalized Green-Red Difference Index (NGRDI).

        NGRDI = (G - R) / (G + R)

        Range: [-1, 1]
        Values > 0 indicate vegetation, < 0 indicate non-vegetation.

        Args:
            image: RGB image (H, W, 3)

        Returns:
            NGRDI index map (H, W)
        """
        R, G, B = cls.normalize_rgb(image)
        return (G - R) / (G + R + cls.EPS)

    @classmethod
    def green_leaf_index(cls, image: np.ndarray) -> np.ndarray:
        """
        Green Leaf Index (GLI).

        GLI = (2G - R - B) / (2G + R + B)

        Range: [-1, 1]
        Good for estimating leaf area.

        Args:
            image: RGB image (H, W, 3)

        Returns:
            GLI index map (H, W)
        """
        R, G, B = cls.normalize_rgb(image)
        return (2 * G - R - B) / (2 * G + R + B + cls.EPS)

    @classmethod
    def triangular_greenness_index(cls, image: np.ndarray) -> np.ndarray:
        """
        Triangular Greenness Index (TGI).

        TGI = G - 0.39R - 0.61B

        Range: approximately [-0.6, +0.6]
        Correlates with chlorophyll content.

        Args:
            image: RGB image (H, W, 3)

        Returns:
            TGI index map (H, W)
        """
        R, G, B = cls.normalize_rgb(image)
        return G - 0.39 * R - 0.61 * B

    @classmethod
    def visible_atmospherically_resistant_index(cls, image: np.ndarray) -> np.ndarray:
        """
        Visible Atmospherically Resistant Index (VARI).

        VARI = (G - R) / (G + R - B)

        Designed to be resistant to atmospheric effects.

        Args:
            image: RGB image (H, W, 3)

        Returns:
            VARI index map (H, W)
        """
        R, G, B = cls.normalize_rgb(image)
        denominator = G + R - B + cls.EPS
        # Clip to avoid extreme values
        return np.clip((G - R) / denominator, -5, 5)

    @classmethod
    def color_index_vegetation(cls, image: np.ndarray) -> np.ndarray:
        """
        Color Index of Vegetation (CIVE).

        CIVE = 0.441R - 0.811G + 0.385B + 18.78745

        Range: approximately [0, 50]
        Lower values indicate more vegetation.

        Args:
            image: RGB image (H, W, 3)

        Returns:
            CIVE index map (H, W)
        """
        R, G, B = cls.normalize_rgb(image)
        return 0.441 * R - 0.811 * G + 0.385 * B + 18.78745

    @classmethod
    def compute_all(cls, image: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Compute all vegetation indices.

        Args:
            image: RGB image (H, W, 3)

        Returns:
            Dictionary of index name -> index map
        """
        return {
            'ExG': cls.excess_green(image),
            'ExGR': cls.excess_green_red(image),
            'NGRDI': cls.normalized_green_red_difference(image),
            'GLI': cls.green_leaf_index(image),
            'TGI': cls.triangular_greenness_index(image),
            'VARI': cls.visible_atmospherically_resistant_index(image),
            'CIVE': cls.color_index_vegetation(image),
        }


class TextureFeatures:
    """
    Compute texture features from images.
    """

    @staticmethod
    def to_grayscale(image: np.ndarray) -> np.ndarray:
        """Convert RGB to grayscale."""
        if len(image.shape) == 3:
            return cv2.cvtColor(image, cv2.COLOR_RGB2GRAY).astype(np.float32)
        return image.astype(np.float32)

    @classmethod
    def local_variance(cls, image: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """
        Compute local variance (texture measure).

        Args:
            image: Input image (grayscale or RGB)
            kernel_size: Size of the local window

        Returns:
            Local variance map
        """
        gray = cls.to_grayscale(image)
        mean = cv2.blur(gray, (kernel_size, kernel_size))
        sqr_mean = cv2.blur(gray ** 2, (kernel_size, kernel_size))
        variance = sqr_mean - mean ** 2
        return np.maximum(variance, 0)  # Ensure non-negative

    @classmethod
    def edge_magnitude(cls, image: np.ndarray) -> np.ndarray:
        """
        Compute edge magnitude using Sobel operators.

        Args:
            image: Input image (grayscale or RGB)

        Returns:
            Edge magnitude map
        """
        gray = cls.to_grayscale(image)
        sobelx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
        return np.sqrt(sobelx ** 2 + sobely ** 2)

    @classmethod
    def laplacian(cls, image: np.ndarray) -> np.ndarray:
        """
        Compute absolute Laplacian (texture/edge measure).

        Args:
            image: Input image (grayscale or RGB)

        Returns:
            Absolute Laplacian map
        """
        gray = cls.to_grayscale(image)
        return np.abs(cv2.Laplacian(gray, cv2.CV_32F))

    @classmethod
    def compute_all(cls, image: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Compute all texture features.

        Args:
            image: Input image (H, W, 3) or (H, W)

        Returns:
            Dictionary of feature name -> feature map
        """
        return {
            'variance': cls.local_variance(image),
            'edge_mag': cls.edge_magnitude(image),
            'laplacian': cls.laplacian(image),
        }


class ColorFeatures:
    """
    Compute color-based features from images.
    """

    @staticmethod
    def rgb_to_hsv(image: np.ndarray) -> np.ndarray:
        """
        Convert RGB to HSV color space.

        Args:
            image: RGB image (H, W, 3) in [0, 255]

        Returns:
            HSV image (H, W, 3)
        """
        return cv2.cvtColor(image, cv2.COLOR_RGB2HSV)

    @classmethod
    def compute_hsv_statistics(
        cls,
        image: np.ndarray,
        patch_size: Optional[int] = None
    ) -> Dict[str, np.ndarray]:
        """
        Compute HSV statistics.

        Args:
            image: RGB image (H, W, 3)
            patch_size: If provided, compute statistics per patch

        Returns:
            Dictionary with HSV statistics
        """
        hsv = cls.rgb_to_hsv(image)
        H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

        if patch_size is None:
            return {
                'H_mean': H.mean(),
                'H_std': H.std(),
                'S_mean': S.mean(),
                'S_std': S.std(),
                'V_mean': V.mean(),
                'V_std': V.std(),
            }
        else:
            # Compute per-patch statistics
            h, w = H.shape
            gh, gw = h // patch_size, w // patch_size

            stats = {
                'H_mean': np.zeros((gh, gw)),
                'S_mean': np.zeros((gh, gw)),
                'V_mean': np.zeros((gh, gw)),
            }

            for i in range(gh):
                for j in range(gw):
                    y1, y2 = i * patch_size, (i + 1) * patch_size
                    x1, x2 = j * patch_size, (j + 1) * patch_size

                    stats['H_mean'][i, j] = H[y1:y2, x1:x2].mean()
                    stats['S_mean'][i, j] = S[y1:y2, x1:x2].mean()
                    stats['V_mean'][i, j] = V[y1:y2, x1:x2].mean()

            return stats

    @classmethod
    def green_ratio(cls, image: np.ndarray) -> np.ndarray:
        """
        Compute ratio of green pixels based on HSV hue.

        Green hue is typically in range [40, 85] in OpenCV's HSV.

        Args:
            image: RGB image (H, W, 3)

        Returns:
            Binary mask where green pixels = 1
        """
        hsv = cls.rgb_to_hsv(image)
        H = hsv[:, :, 0]
        S = hsv[:, :, 1]

        # Green hue range and minimum saturation
        green_mask = (H >= 35) & (H <= 85) & (S > 30)
        return green_mask.astype(np.float32)

    @classmethod
    def dead_ratio(cls, image: np.ndarray) -> np.ndarray:
        """
        Compute ratio of dead/yellow vegetation based on HSV.

        Dead vegetation has hue in range [15, 40] (yellow-brown).

        Args:
            image: RGB image (H, W, 3)

        Returns:
            Binary mask where dead pixels = 1
        """
        hsv = cls.rgb_to_hsv(image)
        H = hsv[:, :, 0]
        S = hsv[:, :, 1]

        # Yellow-brown hue range
        dead_mask = (H >= 15) & (H <= 40) & (S > 20)
        return dead_mask.astype(np.float32)


class CombinedFeatureExtractor:
    """
    Combined feature extractor for vegetation, texture, and color features.
    """

    def __init__(
        self,
        use_vegetation: bool = True,
        use_texture: bool = True,
        use_color: bool = True,
        vegetation_indices: Optional[list] = None
    ):
        """
        Initialize combined feature extractor.

        Args:
            use_vegetation: Whether to compute vegetation indices
            use_texture: Whether to compute texture features
            use_color: Whether to compute color features
            vegetation_indices: List of vegetation indices to compute
                              (default: all)
        """
        self.use_vegetation = use_vegetation
        self.use_texture = use_texture
        self.use_color = use_color

        self.vegetation_indices = vegetation_indices or [
            'ExG', 'ExGR', 'NGRDI', 'GLI', 'TGI', 'VARI'
        ]

    def extract(self, image: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Extract all features from an image.

        Args:
            image: RGB image (H, W, 3) in [0, 255]

        Returns:
            Dictionary of feature name -> feature map
        """
        features = {}

        if self.use_vegetation:
            all_veg = VegetationIndices.compute_all(image)
            for name in self.vegetation_indices:
                if name in all_veg:
                    features[name] = all_veg[name]

        if self.use_texture:
            texture = TextureFeatures.compute_all(image)
            features.update(texture)

        if self.use_color:
            features['green_ratio'] = ColorFeatures.green_ratio(image)
            features['dead_ratio'] = ColorFeatures.dead_ratio(image)

        return features

    def extract_patch_features(
        self,
        image: np.ndarray,
        grid_size: Tuple[int, int]
    ) -> np.ndarray:
        """
        Extract features aggregated per patch.

        Args:
            image: RGB image (H, W, 3)
            grid_size: (grid_height, grid_width) for patches

        Returns:
            Feature array of shape (grid_h * grid_w, num_features)
        """
        features = self.extract(image)
        gh, gw = grid_size
        h, w = image.shape[:2]

        patch_h = h // gh
        patch_w = w // gw

        # Aggregate features per patch
        num_features = len(features) * 2  # mean and std per feature
        patch_features = []

        for i in range(gh):
            for j in range(gw):
                y1, y2 = i * patch_h, (i + 1) * patch_h
                x1, x2 = j * patch_w, (j + 1) * patch_w

                patch_feat = []
                for name, feat_map in features.items():
                    patch = feat_map[y1:y2, x1:x2]
                    patch_feat.extend([patch.mean(), patch.std()])

                patch_features.append(patch_feat)

        return np.array(patch_features)


def test_vegetation_indices():
    """Test vegetation indices computation."""
    print("\n" + "="*60)
    print("Testing Vegetation Indices")
    print("="*60 + "\n")

    # Create dummy image
    image = np.random.randint(0, 256, (256, 256, 3), dtype=np.uint8)

    # Test all indices
    indices = VegetationIndices.compute_all(image)

    for name, idx_map in indices.items():
        print(f"{name}: shape={idx_map.shape}, "
              f"min={idx_map.min():.3f}, max={idx_map.max():.3f}, "
              f"mean={idx_map.mean():.3f}")

    # Test combined extractor
    print("\n--- Combined Features ---")
    extractor = CombinedFeatureExtractor()
    features = extractor.extract(image)

    for name, feat_map in features.items():
        print(f"{name}: shape={feat_map.shape}")

    # Test patch features
    print("\n--- Patch Features ---")
    patch_features = extractor.extract_patch_features(image, (16, 16))
    print(f"Patch features shape: {patch_features.shape}")

    print("\n✓ All tests passed!")


if __name__ == "__main__":
    test_vegetation_indices()
