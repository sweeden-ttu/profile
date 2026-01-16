"""
PyTorch Dataset for CSIRO Biomass Prediction

Handles loading images and targets for training and inference.
"""

import os
import numpy as np
import pandas as pd
import cv2
import torch
from torch.utils.data import Dataset, DataLoader
from typing import Dict, Optional, Tuple, List, Callable
import albumentations as A
from albumentations.pytorch import ToTensorV2


class BiomassDataset(Dataset):
    """
    PyTorch Dataset for CSIRO Biomass images.

    Each image has 5 associated targets:
    - Dry_Clover_g
    - Dry_Dead_g
    - Dry_Green_g
    - Dry_Total_g
    - GDM_g
    """

    TARGET_COLUMNS = [
        'Dry_Clover_g',
        'Dry_Dead_g',
        'Dry_Green_g',
        'Dry_Total_g',
        'GDM_g'
    ]

    def __init__(
        self,
        csv_path: str,
        image_dir: str,
        transform: Optional[Callable] = None,
        input_size: int = 518,
        return_metadata: bool = False
    ):
        """
        Initialize dataset.

        Args:
            csv_path: Path to CSV file with annotations
            image_dir: Base directory containing images
            transform: Albumentations transform pipeline
            input_size: Target size for images (square)
            return_metadata: Whether to return metadata (State, Species, etc.)
        """
        self.csv_path = csv_path
        self.image_dir = image_dir
        self.input_size = input_size
        self.return_metadata = return_metadata

        # Load and process CSV
        self.df = pd.read_csv(csv_path)
        self._process_dataframe()

        # Set up transforms
        if transform is not None:
            self.transform = transform
        else:
            self.transform = self._get_default_transform()

        print(f"Loaded {len(self.images)} images from {csv_path}")

    def _process_dataframe(self):
        """Process dataframe to group targets by image."""
        # Pivot to get one row per image with all targets
        # First, get unique images
        self.images = self.df['image_path'].unique().tolist()

        # Create target lookup
        self.targets = {}
        self.metadata = {}

        for img_path in self.images:
            img_df = self.df[self.df['image_path'] == img_path]

            # Extract targets
            targets = np.zeros(len(self.TARGET_COLUMNS))
            for i, target_name in enumerate(self.TARGET_COLUMNS):
                target_row = img_df[img_df['target_name'] == target_name]
                if len(target_row) > 0:
                    targets[i] = target_row['target'].values[0]

            self.targets[img_path] = targets

            # Extract metadata (from first row)
            first_row = img_df.iloc[0]
            self.metadata[img_path] = {
                'state': first_row.get('State', 'Unknown'),
                'species': first_row.get('Species', 'Unknown'),
                'ndvi': first_row.get('Pre_GSHH_NDVI', 0.0),
                'height': first_row.get('Height_Ave_cm', 0.0),
            }

    def _get_default_transform(self) -> A.Compose:
        """Get default transform (resize and normalize)."""
        return A.Compose([
            A.Resize(self.input_size, self.input_size),
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
            ToTensorV2()
        ])

    def __len__(self) -> int:
        return len(self.images)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        """
        Get a single sample.

        Returns:
            Dictionary with:
            - 'image': Tensor of shape (3, H, W)
            - 'targets': Tensor of shape (5,)
            - 'image_path': Original image path
            - (optional) metadata fields
        """
        img_path = self.images[idx]
        full_path = os.path.join(self.image_dir, img_path)

        # Load image
        image = cv2.imread(full_path)
        if image is None:
            raise ValueError(f"Could not load image: {full_path}")
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Get targets
        targets = self.targets[img_path]

        # Apply transforms
        transformed = self.transform(image=image)
        image_tensor = transformed['image']

        result = {
            'image': image_tensor,
            'targets': torch.tensor(targets, dtype=torch.float32),
            'image_path': img_path
        }

        if self.return_metadata:
            meta = self.metadata[img_path]
            result['state'] = meta['state']
            result['species'] = meta['species']
            result['ndvi'] = torch.tensor(meta['ndvi'], dtype=torch.float32)
            result['height'] = torch.tensor(meta['height'], dtype=torch.float32)

        return result


class BiomassDatasetInference(Dataset):
    """
    Dataset for inference (no targets).
    """

    def __init__(
        self,
        csv_path: str,
        image_dir: str,
        transform: Optional[Callable] = None,
        input_size: int = 518
    ):
        self.csv_path = csv_path
        self.image_dir = image_dir
        self.input_size = input_size

        # Load CSV
        self.df = pd.read_csv(csv_path)
        self.images = self.df['image_path'].unique().tolist()

        # Transform
        if transform is not None:
            self.transform = transform
        else:
            self.transform = A.Compose([
                A.Resize(input_size, input_size),
                A.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                ),
                ToTensorV2()
            ])

    def __len__(self) -> int:
        return len(self.images)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        img_path = self.images[idx]
        full_path = os.path.join(self.image_dir, img_path)

        image = cv2.imread(full_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        transformed = self.transform(image=image)

        return {
            'image': transformed['image'],
            'image_path': img_path
        }


def get_train_transforms(input_size: int = 518) -> A.Compose:
    """Get training augmentations."""
    return A.Compose([
        A.Resize(input_size, input_size),
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.5),
        A.RandomRotate90(p=0.5),
        A.ShiftScaleRotate(
            shift_limit=0.1,
            scale_limit=0.1,
            rotate_limit=15,
            p=0.5
        ),
        A.ColorJitter(
            brightness=0.2,
            contrast=0.2,
            saturation=0.2,
            hue=0.1,
            p=0.5
        ),
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])


def get_val_transforms(input_size: int = 518) -> A.Compose:
    """Get validation transforms (no augmentation)."""
    return A.Compose([
        A.Resize(input_size, input_size),
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])


def create_dataloaders(
    train_csv: str,
    val_csv: str,
    image_dir: str,
    batch_size: int = 16,
    input_size: int = 518,
    num_workers: int = 4
) -> Tuple[DataLoader, DataLoader]:
    """
    Create training and validation dataloaders.

    Args:
        train_csv: Path to training CSV
        val_csv: Path to validation CSV
        image_dir: Base directory for images
        batch_size: Batch size
        input_size: Image input size
        num_workers: Number of data loading workers

    Returns:
        train_loader, val_loader
    """
    train_dataset = BiomassDataset(
        csv_path=train_csv,
        image_dir=image_dir,
        transform=get_train_transforms(input_size),
        input_size=input_size
    )

    val_dataset = BiomassDataset(
        csv_path=val_csv,
        image_dir=image_dir,
        transform=get_val_transforms(input_size),
        input_size=input_size
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
        drop_last=True
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True
    )

    return train_loader, val_loader


def test_dataset():
    """Test dataset loading."""
    print("\n" + "="*60)
    print("Testing Biomass Dataset")
    print("="*60 + "\n")

    # Paths (relative to experiment directory)
    csv_path = "../../_datasets/csiro-biomass/train.csv"
    image_dir = "../../_datasets/csiro-biomass"

    if not os.path.exists(csv_path):
        print(f"CSV not found at {csv_path}")
        print("Run this test from the _experiments/csiro-biomass directory")
        return

    # Create dataset
    dataset = BiomassDataset(
        csv_path=csv_path,
        image_dir=image_dir,
        input_size=518,
        return_metadata=True
    )

    print(f"Dataset size: {len(dataset)}")
    print(f"Targets: {BiomassDataset.TARGET_COLUMNS}")

    # Get a sample
    sample = dataset[0]
    print(f"\nSample keys: {sample.keys()}")
    print(f"Image shape: {sample['image'].shape}")
    print(f"Targets: {sample['targets']}")
    print(f"Image path: {sample['image_path']}")
    print(f"State: {sample['state']}")
    print(f"Species: {sample['species']}")

    # Test dataloader
    print("\n--- Testing DataLoader ---")
    loader = DataLoader(dataset, batch_size=4, shuffle=True)
    batch = next(iter(loader))
    print(f"Batch image shape: {batch['image'].shape}")
    print(f"Batch targets shape: {batch['targets'].shape}")

    print("\n✓ All tests passed!")


if __name__ == "__main__":
    test_dataset()
