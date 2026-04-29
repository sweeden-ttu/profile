# AES Cryptanalysis Research Hypotheses

## Overview
This document outlines hypotheses for the AES cryptanalysis experiments from the CS 6343 coursework, examining AES internal dynamics including avalanche effect, ShiftRows, MixColumns, and block cipher modes of operation.

---

## Hypothesis 1: AES Avalanche Effect (Part A)

### Hypothesis
The AES algorithm should exhibit the avalanche property, where a single bit change in plaintext results in approximately 50% of output bits changing after each round. This is achieved through the combination of SubBytes (non-linear), ShiftRows (permutation), and MixColumns (linear diffusion) operations.

### Predictions
1. Round 0 (AddRoundKey): ~1 bit changed (minimal diffusion)
2. Round 1: ~12-25% bits changed (SubBytes begins diffusion)
3. Round 2-4: Progressive increase toward 50%
4. Round 5-10: Should stabilize near 50% (complete avalanche)
5. Byte-level Hamming distance should be ~8-12 bytes at round 5+
6. Bit-level Hamming distance should be ~32-64 bits at round 5+

### Rationale
- SubBytes provides non-linear substitution (S-box)
- ShiftRows permutes bytes within rows (diffusion within rows)
- MixColumns mixes bytes across columns (diffusion across columns)
- The combination ensures each bit affects many output bits progressively

---

## Hypothesis 2: ShiftRows Impact (Part B)

### Hypothesis
Disabling ShiftRows will significantly reduce diffusion, particularly in the byte-level Hamming distance. Without ShiftRows, bytes only diffuse within their original column via MixColumns, rather than across the entire state.

### Predictions
1. Without ShiftRows, the avalanche effect will be severely impaired
2. Byte Hamming distance will remain low (confined to same column)
3. The modified AES will NOT achieve ~50% bit change even at round 10
4. Expected maximum: ~25% bits changed even at final rounds

### Rationale
- ShiftRows moves bytes from one column to three different columns
- Without it, MixColumns can only affect 4 bytes (one column) from a single byte change
- The column-wise diffusion alone is insufficient for full avalanche

---

## Hypothesis 3: Modified MixColumns Impact (Part C)

### Hypothesis
Using the weaker matrix M_new will reduce diffusion strength. The new matrix has fewer non-zero coefficients (sparse), reducing the linear mixing property.

### Predictions
1. Diffusion will still occur but more slowly
2. Byte Hamming distance will be lower than standard MixColumns
3. Round 10 may not reach full avalanche (50%)
4. The sparse matrix provides less mixing per round

### Rationale
- Standard MixColumns: each byte contributes to all 4 bytes in column
- New matrix: each byte contributes to only 2-3 bytes
- Reduced coefficients = less propagation of changes

---

## Hypothesis 4: Key Bit Flip vs Plaintext Bit Flip (Part D)

### Hypothesis
Key bit flips and plaintext bit flips should produce similar avalanche characteristics due to symmetry in AddRoundKey operation.

### Predictions
1. Same round-by-round diffusion patterns
2. Similar Hamming distances at equivalent rounds
3. Both should approach ~50% bit change by round 5-10

### Rationale
- AddRoundKey XORs either key or plaintext with state
- The XOR operation is symmetric
- Both start with uniform diffusion from AddRoundKey

---

## Hypothesis 5: ECB vs CBC Mode Visual Comparison

### Hypothesis
ECB mode preserves patterns in the plaintext visually in the ciphertext, while CBC mode randomizes patterns across blocks.

### Predictions
1. ECB-encrypted image will show ghost outlines/patterns
2. CBC-encrypted image will appear as random noise
3. After fixing BMP header: ECB image shows recognizable patterns, CBC appears random

### Rationale
- ECB encrypts each 16-byte block independently
- Identical plaintext blocks produce identical ciphertext blocks
- CBC XORs previous ciphertext with plaintext before encryption, providing semantic security

---

## Hypothesis 6: CBC Header Preservation

### Hypothesis
Both ECB and CBC will corrupt the BMP header (first 54 bytes), making images unviewable. After copying the original header to encrypted files, CBC will produce a viewable (though still encrypted-looking) image.

### Predictions
1. Original encrypted files: Neither viewable due to header corruption
2. With original header copied:
   - ECB: Visible patterns from repeated blocks
   - CBC: Appears as random noise (proper encryption)

### Rationale
- BMP header contains file format information
- XOR/encryption destroys the magic bytes and metadata
- CBC mode propagates header corruption across all blocks

---

## Research Summary Table

| Experiment | Expected Outcome | Key Metric |
|------------|------------------|------------|
| Part A (Standard AES) | Full avalanche by round 5+ | ~50% bits flipped |
| Part B (No ShiftRows) | Weak avalanche | ~25% max bits flipped |
| Part C (Modified MixColumns) | Slower diffusion | ~35-40% at round 10 |
| Part D (Key flip) | Similar to Part A | ~50% at round 5+ |
| ECB mode | Pattern preservation | Visual patterns visible |
| CBC mode | Random output | No visible patterns |
