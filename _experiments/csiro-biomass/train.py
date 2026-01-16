"""
Training Script for CSIRO Biomass Prediction

DINOv2-based regression model training.
"""

import os
import sys
import argparse
import yaml
import json
import time
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR, OneCycleLR
from tqdm import tqdm

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from data.dataset import BiomassDataset, create_dataloaders, get_train_transforms, get_val_transforms
from models.regression import BiomassRegressor, BiomassRegressorWithAux


class Trainer:
    """
    Trainer class for biomass prediction model.
    """

    TARGET_NAMES = [
        'Dry_Clover_g',
        'Dry_Dead_g',
        'Dry_Green_g',
        'Dry_Total_g',
        'GDM_g'
    ]

    def __init__(
        self,
        model: nn.Module,
        train_loader,
        val_loader,
        config: dict,
        output_dir: str
    ):
        """
        Initialize trainer.

        Args:
            model: PyTorch model
            train_loader: Training dataloader
            val_loader: Validation dataloader
            config: Training configuration
            output_dir: Directory for outputs
        """
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.config = config
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Device
        self.device = model.device

        # Loss function
        loss_type = config.get('loss_type', 'huber')
        if loss_type == 'mse':
            self.criterion = nn.MSELoss()
        elif loss_type == 'mae':
            self.criterion = nn.L1Loss()
        elif loss_type == 'huber':
            self.criterion = nn.HuberLoss(delta=config.get('huber_delta', 1.0))
        else:
            raise ValueError(f"Unknown loss type: {loss_type}")

        # Optimizer
        self.optimizer = AdamW(
            filter(lambda p: p.requires_grad, model.parameters()),
            lr=config.get('learning_rate', 5e-4),
            weight_decay=config.get('weight_decay', 1e-4)
        )

        # Scheduler
        scheduler_type = config.get('scheduler', 'cosine')
        epochs = config.get('epochs', 100)

        if scheduler_type == 'cosine':
            self.scheduler = CosineAnnealingLR(
                self.optimizer,
                T_max=epochs,
                eta_min=1e-6
            )
        elif scheduler_type == 'onecycle':
            self.scheduler = OneCycleLR(
                self.optimizer,
                max_lr=config.get('learning_rate', 5e-4),
                epochs=epochs,
                steps_per_epoch=len(train_loader)
            )
        else:
            self.scheduler = None

        # Training state
        self.epoch = 0
        self.best_val_mae = float('inf')
        self.history = {
            'train_loss': [],
            'val_loss': [],
            'val_mae': [],
            'val_mae_per_target': [],
            'learning_rate': []
        }

    def train_epoch(self) -> float:
        """Train for one epoch."""
        self.model.train()
        total_loss = 0
        num_batches = 0

        pbar = tqdm(self.train_loader, desc=f"Epoch {self.epoch+1} [Train]")

        for batch in pbar:
            images = batch['image'].to(self.device)
            targets = batch['targets'].to(self.device)

            # Forward pass
            self.optimizer.zero_grad()
            predictions = self.model(images)

            # Compute loss
            loss = self.criterion(predictions, targets)

            # Backward pass
            loss.backward()
            self.optimizer.step()

            # Update scheduler if OneCycleLR
            if isinstance(self.scheduler, OneCycleLR):
                self.scheduler.step()

            total_loss += loss.item()
            num_batches += 1

            pbar.set_postfix({'loss': f'{loss.item():.4f}'})

        return total_loss / num_batches

    @torch.no_grad()
    def validate(self) -> dict:
        """Validate the model."""
        self.model.eval()
        total_loss = 0
        all_predictions = []
        all_targets = []

        pbar = tqdm(self.val_loader, desc=f"Epoch {self.epoch+1} [Val]")

        for batch in pbar:
            images = batch['image'].to(self.device)
            targets = batch['targets'].to(self.device)

            predictions = self.model(images)
            loss = self.criterion(predictions, targets)

            total_loss += loss.item()
            all_predictions.append(predictions.cpu())
            all_targets.append(targets.cpu())

        # Concatenate all predictions and targets
        all_predictions = torch.cat(all_predictions, dim=0).numpy()
        all_targets = torch.cat(all_targets, dim=0).numpy()

        # Calculate metrics
        avg_loss = total_loss / len(self.val_loader)
        mae = np.abs(all_predictions - all_targets).mean()

        # Per-target MAE
        mae_per_target = {}
        for i, name in enumerate(self.TARGET_NAMES):
            mae_per_target[name] = np.abs(
                all_predictions[:, i] - all_targets[:, i]
            ).mean()

        return {
            'loss': avg_loss,
            'mae': mae,
            'mae_per_target': mae_per_target,
            'predictions': all_predictions,
            'targets': all_targets
        }

    def train(self, epochs: int):
        """
        Full training loop.

        Args:
            epochs: Number of epochs to train
        """
        print(f"\n{'='*60}")
        print(f"Starting training for {epochs} epochs")
        print(f"Device: {self.device}")
        print(f"{'='*60}\n")

        for epoch in range(epochs):
            self.epoch = epoch
            start_time = time.time()

            # Train
            train_loss = self.train_epoch()

            # Validate
            val_results = self.validate()

            # Update cosine scheduler
            if isinstance(self.scheduler, CosineAnnealingLR):
                self.scheduler.step()

            # Get current learning rate
            current_lr = self.optimizer.param_groups[0]['lr']

            # Log history
            self.history['train_loss'].append(train_loss)
            self.history['val_loss'].append(val_results['loss'])
            self.history['val_mae'].append(val_results['mae'])
            self.history['val_mae_per_target'].append(val_results['mae_per_target'])
            self.history['learning_rate'].append(current_lr)

            # Check if best model
            is_best = val_results['mae'] < self.best_val_mae
            if is_best:
                self.best_val_mae = val_results['mae']
                self.save_checkpoint('best.pt')

            # Save latest checkpoint
            self.save_checkpoint('latest.pt')

            # Print epoch summary
            epoch_time = time.time() - start_time
            print(f"\nEpoch {epoch+1}/{epochs} ({epoch_time:.1f}s)")
            print(f"  Train Loss: {train_loss:.4f}")
            print(f"  Val Loss:   {val_results['loss']:.4f}")
            print(f"  Val MAE:    {val_results['mae']:.4f} {'(best)' if is_best else ''}")
            print(f"  LR:         {current_lr:.2e}")
            print("  Per-target MAE:")
            for name, mae in val_results['mae_per_target'].items():
                print(f"    {name}: {mae:.4f}")

        # Save final results
        self.save_history()
        print(f"\n{'='*60}")
        print(f"Training complete! Best Val MAE: {self.best_val_mae:.4f}")
        print(f"{'='*60}")

    def save_checkpoint(self, filename: str):
        """Save model checkpoint."""
        checkpoint = {
            'epoch': self.epoch,
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'best_val_mae': self.best_val_mae,
            'config': self.config
        }
        torch.save(checkpoint, self.output_dir / filename)

    def save_history(self):
        """Save training history."""
        # Convert mae_per_target to serializable format
        history_serializable = self.history.copy()
        history_serializable['val_mae_per_target'] = [
            {k: float(v) for k, v in d.items()}
            for d in self.history['val_mae_per_target']
        ]

        with open(self.output_dir / 'history.json', 'w') as f:
            json.dump(history_serializable, f, indent=2)


def main():
    """Main training function."""
    parser = argparse.ArgumentParser(description='Train Biomass Regressor')
    parser.add_argument('--config', type=str, default='configs/experiment.yaml',
                        help='Path to config file')
    parser.add_argument('--epochs', type=int, default=None,
                        help='Override epochs from config')
    parser.add_argument('--batch_size', type=int, default=None,
                        help='Override batch size from config')
    parser.add_argument('--lr', type=float, default=None,
                        help='Override learning rate from config')
    parser.add_argument('--output_dir', type=str, default='outputs/exp001',
                        help='Output directory')
    args = parser.parse_args()

    # Load config
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)

    # Override config with command line arguments
    training_config = config.get('training', {})
    if args.epochs:
        training_config['epochs'] = args.epochs
    if args.batch_size:
        training_config['batch_size'] = args.batch_size
    if args.lr:
        training_config['learning_rate'] = args.lr

    # Get data paths
    data_config = config.get('data', {})
    train_csv = data_config.get('train_csv', '../../_datasets/csiro-biomass/train.csv')
    test_csv = data_config.get('test_csv', '../../_datasets/csiro-biomass/test.csv')
    image_dir = os.path.dirname(train_csv)

    # For now, we'll split train into train/val
    # In production, use separate train/val CSVs

    print("Loading data...")
    model_config = config.get('model', {})
    input_size = model_config.get('input_size', 518)
    batch_size = training_config.get('batch_size', 16)

    # Create dataset with transforms
    full_dataset = BiomassDataset(
        csv_path=train_csv,
        image_dir=image_dir,
        transform=get_train_transforms(input_size),
        input_size=input_size
    )

    # Simple train/val split (80/20)
    n_total = len(full_dataset)
    n_train = int(0.8 * n_total)
    n_val = n_total - n_train

    train_dataset, val_dataset = torch.utils.data.random_split(
        full_dataset, [n_train, n_val],
        generator=torch.Generator().manual_seed(42)
    )

    # Update val dataset transform (no augmentation)
    val_dataset.dataset.transform = get_val_transforms(input_size)

    train_loader = torch.utils.data.DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=4,
        pin_memory=True
    )

    val_loader = torch.utils.data.DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=4,
        pin_memory=True
    )

    print(f"Train samples: {len(train_dataset)}")
    print(f"Val samples: {len(val_dataset)}")

    # Create model
    print("\nInitializing model...")
    model = BiomassRegressor(
        model_size=model_config.get('backbone', 'vit_base_patch14_dinov2').replace('vit_', '').replace('_patch14_dinov2', ''),
        hidden_dims=config.get('regression', {}).get('hidden_dims', [768, 384, 192]),
        output_dim=5,
        dropout=config.get('regression', {}).get('dropout', 0.2),
        freeze_backbone=model_config.get('freeze_backbone', True)
    )

    # Create trainer
    trainer = Trainer(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        config=training_config,
        output_dir=args.output_dir
    )

    # Train
    epochs = training_config.get('epochs', 100)
    trainer.train(epochs)

    print(f"\nResults saved to {args.output_dir}")


if __name__ == '__main__':
    main()
