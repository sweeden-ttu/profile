---
layout: project
title: "vLLM HPCC Simulation & NeuroGolf ONNX Optimization"
date: 2026-06-22
tech_stack: [Python, SimPy, vLLM, PyTorch, SLURM, ONNX, DeepSeek]
status: in-progress
difficulty: Advanced
subtitle: "From Microarchitectural Simulation to HPCC Deployment and Kaggle Optimization"
tags: [high-performance-computing, simulation, vllm, kaggle, onnx]
outcomes:
  - "Custom SimPy simulator for TLB thrashing and Interconnect latency"
  - "Split Matador/Toreador SLURM deployment pipelines on TTU HPCC"
  - "Programmatic ONNX generator for Kaggle's NeuroGolf 2026 Championship"
description: "A comprehensive hardware-software co-design project that simulates vLLM microarchitectural bottlenecks (KV cache, TLB) and applies those findings to real-world HPCC deployments and highly compressed ONNX models for the NeuroGolf 2026 Kaggle competition."
---

# vLLM HPCC Simulation & NeuroGolf ONNX Optimization

This project bridges the gap between microarchitectural simulation and real-world high-performance computing (HPC) deployment. Born out of CS-5365 (Multi-Processor Systems), the research evaluates large language model (LLM) serving bottlenecks, optimizes SLURM scheduling, and synthesizes ultra-lightweight ONNX graphs for the competitive Kaggle NeuroGolf 2026 Championship.

## 1. The Proposal: Simulating Microarchitectural Bottlenecks

Large Language Model inference is frequently gated by hardware bottlenecks invisible to software developers. The core proposal investigates:
- **Memory Management (TLB Thrashing):** How vLLM's PagedAttention interacts with the Translation Lookaside Buffer (TLB) when retrieving Key-Value (KV) cache blocks.
- **Interconnect Latency:** How multi-GPU tensor parallelism scales over PCIe Gen4 versus NVLink v2.

Rather than relying on heavy cycle-accurate emulators like Gem5, we built a custom macroscopic **SimPy-based simulator** to quickly iterate over microarchitectural constraints and derive optimization configurations.

### Key Simulation Findings
1. **TLB Thrashing Mitigation:** Transitioning from default 4KB OS memory pages to 2MB superpages reduced TLB miss rates in PagedAttention workloads from ~99.1% down to ~12.8% (an 87% improvement).
2. **Interconnect Bottlenecks:** Simulating multi-GPU tensor parallelism demonstrated that NVLink is approximately 18.6x faster than PCIe for model weight synchronization, making TP=2 and TP=4 highly efficient on specialized hardware.

## 2. HPCC Resources & Deployments

To validate the simulation predictions, the project utilizes the **Texas Tech University (TTU) RedRaider HPCC Cluster**. Because modern LLMs require drastically different software dependencies and architectural optimizations, we established two isolated deployment pipelines:

### The Matador Path (Validation & Benchmarking)
- **Hardware:** Dual NVIDIA V100 16GB GPUs (Volta architecture).
- **Workload:** `meta-llama/Llama-2-7b-chat-hf` via `vLLM 0.4.0` (CUDA 12.1).
- **Purpose:** Validates the SimPy simulation predictions on established architectures, verifying correlation coefficients (Target r > 0.8) between simulated throughput and physical GPU executions.

### The Toreador Path (State-of-the-Art & Competition)
- **Hardware:** Triple NVIDIA A100 GPUs (Ampere architecture) per node.
- **Workload:** `deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct` via `vLLM >= 0.9.1` (CUDA 12.4).
- **Purpose:** Leverages advanced Multi-Head Latent Attention (MLA) and Mixture-of-Experts (MoE) kernels. The SLURM job allocation was explicitly tuned to 10 CPUs and 120GB RAM, preventing entire compute nodes from being locked and allowing optimal multi-tenant GPU utilization. 

To ensure stability across both paths, all SLURM jobs implement dynamic ephemeral loopback port binding (`127.0.0.1:<port>`) and rigorous `trap` cleanup functions to prevent zombie processes from crashing shared HPCC resources.

## 3. The Kaggle Challenge: NeuroGolf 2026 Championship

The second half of the project leverages the Toreador deployment to act as a programmatic baseline generator for the **2026 NeuroGolf Championship** (featured at IJCAI-ECAI 2026). The competition requires solving Abstraction and Reasoning Corpus (ARC-AGI) tasks.

### The Objective
Competitors must generate functionally correct, static-shaped **ONNX model files** for 400 ARC-AGI tasks, bounded by a strict 1.44 MB file limit. 

The evaluation backend employs a highly non-linear, logarithmic scoring metric that rewards extreme architectural compression and parameter-free logic:
$$ S_i = \max(1, 25 - \ln(\text{Params}_i + \text{Memory}_i + \text{MACs}_i)) $$

### ONNX Task Cost Optimization
Because the cost function aggressively penalizes parameters and Multiply-Accumulate (MAC) operations, standard dense convolutional neural networks quickly hit a score ceiling. Top-tier leaderboard strategies have shifted toward:

1. **Rule-Based ONNX Solvers:** Abandoning floating-point weights entirely. We synthesize handcrafted, parameter-free logical graphs using nested `Where`, `ScatterND`, `ReduceMin`, and topological shifting operations.
2. **Static Shape Constraints:** Bypassing dynamic memory allocation penalties by explicitly defining node shapes prior to inference.
3. **Solo-Probing Validation:** Mitigating the massive risk of overfitting (where a single incorrect pixel on the hidden evaluation set yields zero points) by running single-task probes on the server.

By executing the `DeepSeek-Coder-V2-Lite` model on the Toreador HPCC partition, we programmatically analyze procedural rules and synthesize these ultra-lightweight ONNX execution graphs to aggressively optimize our Kaggle leaderboard position.
