---
layout: post
title: "Routing in Modern AI Systems: A Multi-Level Perspective Across Language and Vision Models"
date: 2026-10-26 00:05:00 -0500
categories: [machine-learning, seminar]
tags: [mixture-of-experts, llm-routing, diffusion, efficiency, seminar]
author: "Scott Weeden"
description: "Dr. Shangqian Gao's CS Graduate Seminar talk on using embeddings to route inputs at the token, prompt, model and timestep levels, covering ToMoE, prompt-based routing for text-to-image diffusion, cost-aware contrastive routing across LLMs, and ALTER."
image: /assets/images/seminars/routing/g2_tomoe.png
speaker: "Dr. Shangqian Gao"
speaker_affiliation: "Florida State University"
seminar_date: 2026-09-15
image_alt: "Bar chart redrawn from the presenter's slide: zero-shot accuracy of ToMoE and structured-pruning baselines on LLaMA-3 8B"
summary: "The talk presents embedding-based routing at three levels: converting dense LLMs into mixture-of-experts models, routing prompts to sub-networks of a diffusion model or to models in an LLM pool, and routing diffusion timesteps to layer-pruned experts."
---

*Dr. Shangqian Gao, Florida State University. "Routing in Modern AI Systems: A Multi-Level Perspective Across Language and Vision Models," Texas Tech CS Graduate Seminar (CS 5120), 15 September 2026.*

## Abstract

This work uses embeddings of inputs as the signal for routing: deciding, per input, which part of a model, or which model from a pool, should process it, to reach a better trade-off between performance and cost. At the token level, ToMoE converts dense large language models into mixture-of-experts models through dynamic structural pruning; without fine-tuning, LLaMA-3 8B at 70% active parameters keeps an average zero-shot score of 66.67, against at most 63.96 for structured-pruning baselines at 75%. At the prompt or sentence level, "Not All Prompts Are Made Equal" routes each prompt to a learned sub-network of a text-to-image diffusion model under a utilization budget, and Cost-Aware Contrastive Routing (CSCR) picks a model from a pool of white-box and black-box LLMs with a 22-million-parameter router, giving the highest area under the deferral curve among the compared routers on three benchmarks. At the temporal level, ALTER routes each denoising timestep to an expert that removes U-Net layers, cutting Stable Diffusion 2.1 latency on CC3M from 4.0 s to 2.1 s per image at an FID of 17.14 (17.08 for the original).

*This article is a journal-style write-up of the seminar as delivered. Its content, claims and results are the presenter's; the wording is an adaptation of the recorded talk and slides.*

## 1. Introduction

Since late 2022 and early 2023, many companies have released large language models, often in several generations, and some are trained for specific domains such as math. Hundreds or even thousands of models are now available.

Inside a single model there can also exist many circuits specialized in different tasks: a sparse circuit kept after removing connections still represents specific meanings, and embeddings can be used to find the circuit for an input, reducing computational cost.

The general idea of routing with embeddings is as follows. Inputs, for example A and B, are converted into (usually text) embeddings. In one path, the embedding decides which model from a pool, for example LLaMA, Qwen and Phi, processes each input. In the other, embeddings are used within a single model to discover paths through it, and similar inputs should ideally use similar paths. Both give a chance to find a better trade-off between performance and efficiency, or cost.

The talk is organized in three parts:

1. **Token-level routing**, towards mixture-of-experts models (ToMoE).
2. **Prompt/sentence-level routing**: Not All Prompts Are Made Equal, and Cost-Aware Contrastive Routing for LLMs.
3. **Temporal routing**: ALTER.

## 2. Background

### 2.1 Embeddings are foundations for modern AI

Embeddings transform raw input into compact, meaningful vectors; in a t-SNE visualization of MNIST, similar digits cluster together. Such features are obtained with autoencoders, variational autoencoders and semi-supervised methods for vision; word2vec, Sentence-BERT and the Qwen3 embedding model for language; and positional encoding for temporal data. The talk focuses on language and vision.

**word2vec** turns a word into a continuous vector in which arithmetic carries semantic meaning: subtracting the vector of "man" from "king" and adding "woman" gives something close to the vector of "queen"; subtracting "France" from "Paris" and adding "Italy" gives something close to "Rome".

**Sentence-BERT** converts a whole sentence into a vector, so that relationships between sentences can be studied. Two sentences are encoded, and a softmax classifier pushes them together if they are similar and apart if not; in a visualization of emotion-labelled sentences, sentences with similar emotions form clusters.

The **Qwen3 embedding model** takes an instruction followed by a query or documents and uses the embedding at the end-of-sentence token. It and the Qwen3 reranker are trained in three stages: weakly supervised pretraining on large-scale synthetic pair data, supervised fine-tuning, and model merging of different checkpoints.

### 2.2 Positional encoding

Positional encoding maps a timestep to a vector, vector = f(timestep), so that close timesteps ideally get close vectors. The values depend on the input dimension and the index in the position vector, using the sine and cosine encoding introduced in "Attention Is All You Need" [1].

![Sinusoidal positional encoding](/assets/images/seminars/routing/g1_positional_encoding.png)
*Figure 1. Redrawn from the presenter's slide on positional encoding (slide 7): the sine and cosine positional encoding of the cited Transformer paper, computed here for d = 128.*

### 2.3 Classical applications for learned embeddings

Before large language models became popular, text embeddings were used for classification, retrieval and natural language inference, and visual embeddings for reconstruction, image retrieval and object detection, for example locating a car in an image.

### 2.4 Mixture-of-experts models

DeepSeek-V3 and DeepSeek-R1 [2, 3] achieve strong performance compared to commercial models such as OpenAI-o1, and DeepSeek-R1 is much more cost-effective, about 25× cheaper than OpenAI-o1. The underlying reason is that these models use a mixture-of-experts (MoE) structure.

An MoE layer is a drop-in replacement for the MLP (FFN) layers in a transformer. A router assigns each token to a number of active experts out of the total number of experts, and the layer's output is the weighted sum of the outputs of the selected experts. Each expert is itself an MLP layer.

Because only a fixed amount of parameters is active, MoE models scale to extremely large sizes without a proportional increase in computation. Previous work shows that MoE models are usually better than dense models with the same number of active parameters and can often compete with models with the same total number of parameters.

However, MoE models are very hard to train, and efficient training involves heavy work such as custom CUDA kernels and other hardware and software optimizations. Not every dense model has an MoE counterpart. The solution proposed here is to convert dense models into MoE models.

## 3. Methods

### 3.1 Token-level routing: ToMoE

ToMoE, "Converting Dense Large Language Models to Mixture-of-Experts through Dynamic Structural Pruning" [4], uses top-1 routing for the MLP layers and static and dynamic pruning for the self-attention (MHA) layers. The key contribution is the MLP-to-MoE construction. We extract meaningful subsets of the weights of the original model's MLP layers, that is, of the up-projection and down-projection, and we find these subsets from data, by clustering according to the input tokens' hidden states. After training on datasets, these subsets of the MLP weights become different experts, constructed from the original dense model. Because the method is related to pruning, but the selected structure depends on the input, we do not perform static structural pruning; we perform dynamic structural pruning.

### 3.2 Prompt/sentence-level routing within a model: Not All Prompts Are Made Equal

"Not All Prompts Are Made Equal" [5] addresses a similar problem for a text-to-image diffusion model: finding sub-architectures, or sparse circuits, suited to different kinds or difficulties of task. We again start with a dense model and convert it into different experts, but the signal used to construct the experts is no longer individual tokens. Instead, construction is guided by the input sentences: a prompt router routes each prompt to a different architecture, or sub-network, of the dense model.

Each expert is represented by an architecture code learned during training; a finite set of codes gives a finite set of experts. The prompt router uses Sentence-BERT as the text encoder, so prompts with similar meaning receive similar vectors. The training objective includes a budget that controls the average resource use, or cost, of the samples in each batch. Each expert is treated as an individual model, which supports scaling the system's overall capacity.

The word "task" can have a broader meaning here: inputs of the same difficulty can also be regarded as the same task.

### 3.3 Prompt/sentence-level routing across models: Cost-Aware Contrastive Routing for LLMs

Model-level routing sends each query to one model in a pool, since models differ in what they are good at, such as math or medical questions, with the best trade-off between performance and the cost of calling the model. OpenRouter is an example: a router underneath the website sends each query to a suitable model, aiming for lower cost.

Previous model-routing methods do not learn the trade-off between performance and cost. Most focus only on correctness, so the router may select more expensive models to be sure of a correct answer, ignoring smaller models that could also solve the problem. The slide's example is a multiple-choice math question. A vanilla contrastive router sends it to a 0.5B-parameter model, which is cheap but gives an incorrect answer. A baseline router sends it to LLaMA-3 8B, which answers correctly but is more expensive. Our method also answers correctly, using DeepSeek-Math-7B, which is smaller than LLaMA-3 8B and therefore cheaper.

We achieve this with contrastive learning [6]. The query encoder is all-MiniLM, a compressed sentence transformer with 22 million parameters; the router is kept small because it is called for every query and should not add much cost.

The core of LLM routing is describing each LLM as a continuous vector in a latent space. We use a unified approach for white-box and black-box models:

- **White-box models.** The output probabilities are accessible, so we accumulate the softmax output at k selected vocabulary positions across samples, giving a vector of size k.
- **Black-box (API-only) models.** Only output tokens are accessible, so we use a perplexity fingerprint: the perplexity of the generated tokens under GPT-2, as a proxy model, on n samples, normalized into an n-dimensional vector.

Setting n = k gives white-box and black-box LLMs representations of the same dimension, unifying the embedding space of the model pool. At inference time, we compute the similarity between the router's embedding of the query and each model vector, and then select the model with the lowest cost.

### 3.4 Temporal routing: ALTER

ALTER, "All-in-One Layer Pruning and Temporal Expert Routing for Efficient Diffusion Generation" [7], also targets a text-to-image diffusion model. In "Not All Prompts Are Made Equal", sample-wise dynamic pruning, each prompt activates only a subset of the parameters. In ALTER, different subsets are activated as well, but across the denoising timesteps all of the model's parameters are used.

The major contribution is to use the temporal (timestep) embedding as the signal that routes the model to a specific sub-network. The timestep embedding is built with the sinusoidal embedding of the original transformer paper [1]. It is the input to a temporal router, which selects one of a set of experts; the selected expert is applied to the original dense model and tells it which sub-network to use at that timestep. The structural pruning space is simplified so that the method only removes layers, which makes it practical for actual acceleration of diffusion generation.

## 4. Results

### 4.1 ToMoE

Without fine-tuning, ToMoE achieves a higher average zero-shot score than structured pruning methods across models and compression rates. For LLaMA-3 8B, the dense model averages 72.75; at 75% of parameters, ShortGPT averages 43.24, SliceGPT 46.17 and ModeGPT 63.96; ToMoE averages 66.67 at 70% and 62.17 at 60%. For Qwen-2.5 7B (dense 71.77), ToMoE with 8, 16 or 24 experts averages 57.53 to 59.90 at 50%, against 53.69 for DISP-LLM.

![ToMoE on LLaMA-3 8B](/assets/images/seminars/routing/g2_tomoe.svg)
*Figure 2. Redrawn from the presenter's slide on ToMoE (slide 17): zero-shot performance of LLaMA-3 8B compressed with ToMoE and with structured-pruning baselines, without fine-tuning.*

For the top-1 ToMoE LLaMA-3 8B model, the token allocation across experts, collected on a wiki-text dataset, is near uniform in most layers and concentrated on specific experts in some, probably because certain semantic meanings trigger them there. Coloring tokens by assigned expert, for LLaMA converted with 50% active parameters, shows no clear semantic relationship in earlier layers; in later layers, such as the 32nd MLP layer, experts usually correspond to semantic concepts.

### 4.2 Not All Prompts Are Made Equal

The method easily outperforms static pruning baselines, which demonstrates the importance of having different experts focus on specific tasks. On CC3M (slide 23), the method (APTP) at 0.85 reaches an FID of 36.77 at 3.4 s per sample, against 75.81 to 141.04 for the static baselines Norm, SP and BKSDM at 3.3 to 3.5 s; the original Stable Diffusion 2.1 has an FID of 32.08 at 4.0 s.

Generation results on two datasets, labelled with the index of the expert that produced each image, show that different experts focus on semantically different generations. A summary of high-frequency words in the prompts assigned to each expert shows similarities within each expert.

Figure 3 shows how CC3M samples are distributed over the 16 experts. Because of the budget, different portions of samples go to different experts. Expert 1 retains nearly all of the model (utilization 0.99) and receives the largest share; others are around 0.80, meaning about 20% of the operations are removed, and the lowest is 0.72 (expert 16). Both the highest- and lowest-capacity experts process a large portion of the samples. With a target of 80%, the weighted average utilization is close to 0.80:

$$
\bar u = \sum_{i=1}^{16} \pi_i\, u_i \approx 0.80,
$$

where $$\pi_i$$ is the share of samples routed to expert $$i$$ and $$u_i$$ is its utilization.

![Prompts routed to 16 experts](/assets/images/seminars/routing/g3_expert_usage.svg)
*Figure 3. Redrawn from the presenter's slide on the number of CC3M samples mapped to each expert (slide 26); values read off the chart, with utilization shown where legible.*

### 4.3 Cost-Aware Contrastive Routing

Evaluation uses binary accuracy on EmbedLLM and RouterBench and BERTScore on Mix-Instruct. A larger area under the accuracy-versus-cost curve means a higher accuracy for a given budget; the main metric is this area under the deferral curve (AUDC). The table also reports a cost measure (QNC) related to model size, and a peak score. CSCR performs better than or on par with previous methods and has the highest AUDC among the routers on all three benchmarks: 0.541 on EmbedLLM, 0.051 on Mix-Instruct and 0.711 on RouterBench. The oracle upper bound is 0.960, 0.079 and 0.891 respectively.

![CSCR AUDC on three benchmarks](/assets/images/seminars/routing/g4_cscr_audc.svg)
*Figure 4. Redrawn from the presenter's slide on Cost-Aware Contrastive Routing for LLMs (slide 35): area under the deferral curve for each router on EmbedLLM, Mix-Instruct and RouterBench, with the oracle as upper bound.*

### 4.4 ALTER

At similar cost, ALTER achieves much lower latency while maintaining high generation quality, measured by FID, CLIP score and CMMD. On CC3M, Stable Diffusion 2.1 at 25 steps takes 4.0 s per image with an FID of 17.08. ALTER at 65% utilization takes 2.6 s with FID 16.74 at 25 steps, and 2.1 s with FID 17.14 at 20 steps. BK-SDM-v2 takes 2.5 s with FIDs of 17.53 (Base) and 18.78 (Small).

![ALTER latency vs FID](/assets/images/seminars/routing/g5_alter.svg)
*Figure 5. Redrawn from the presenter's slide comparing ALTER with other generation methods (slide 39, CC3M columns): latency per image against FID.*

Images generated by ALTER are very similar to those of the original Stable Diffusion 2.1, while images generated by BK-SDM-v2 differ considerably from the original model's output. A visualization of the discovered experts shows that different timesteps remove different layers of the model; most experts remove certain layers, but they still keep their own expert-dependent layers, so they can carry different information at a specific generation step. A plot of expert index against denoising timestep shows that neighboring timesteps are usually allocated to similar experts. The router thus learns the adjacency of timesteps, discovering automatically that they are close.

## 5. Discussion and limitations

The token-to-expert visualizations of ToMoE show semantic specialization in the later layers, "but this kind of observation is also not very consistent"; it is a trend in the later layers of the model.

Routing trades accuracy against cost. In the CSCR results the oracle, which knows which model is best for each question, is an upper bound; every routing method obtains only a trade-off that is still far from it, and the purpose of the work is to find the balance (see the questions below).

## 6. Conclusion

Embeddings of tokens, sentences and timesteps serve as routing signals at three levels: the token level within an LLM (ToMoE), the prompt or sentence level within a diffusion model ("Not All Prompts Are Made Equal") and across a pool of LLMs (Cost-Aware Contrastive Routing), and the temporal level within a diffusion model (ALTER). In each case, routing seeks a better trade-off between performance and efficiency or cost.

## Questions from the seminar

**Where do sparse LLMs come into routing, compared with MoE?** A student contrasted MoE, a training-time design, with sparsity applied to dense models at inference, and asked on what basis weights or attention layers are dropped. Gao took the question as one about sparse versus dense MoE. In recent MoE development, he said, sparse MoE is "the only design choice": dense MoE, which activates all experts, is too expensive at the current scale, so current large models use sparse MoE. His work converts a dense model into a sparse MoE architecture.

**Do these approaches lose correctness compared with large commercial models?** The host, Dr. Wei Wang, noted that ChatGPT and Gemini also use MoE-type techniques but must consider correctness, and asked whether the lower cost comes at a loss in correctness. Gao answered that there is definitely a trade-off. Returning to the CSCR table, he explained that the oracle knows which model is best for each question; any routing method gives a cost-accuracy trade-off that is still far from the oracle, and the work aims to find the balance.

**Would a feedback module after the LLM's output help, or create a chicken-and-egg problem?** Dr. Wang asked whether a module that checks the answer and triggers reselection would help, given that it must know the answer is wrong. Gao answered that commercial models such as ChatGPT and Claude already apply post-verification for some tasks: for coding questions they test whether the code compiles and gives correct answers, and if not, the model keeps thinking. A verifiable task can be tested in a non-parametric environment; otherwise a model can be trained to tell the main model whether to regenerate or switch models, but such a parametric feedback module "will give you additional errors".

**Does adding a new model require retraining the router?** A student asked whether the router must be retrained when a new model is introduced. Gao answered that the router does not need to be retrained: the new model's embedding is extracted and placed into the embedding space.

## References

1. Vaswani, A., et al. "Attention is all you need." *Advances in Neural Information Processing Systems* 30 (2017).
2. DeepSeek-AI. "DeepSeek-V3 technical report." arXiv preprint arXiv:2412.19437 (2024).
3. DeepSeek-AI. "DeepSeek-R1: Incentivizing reasoning capability in LLMs via reinforcement learning." arXiv preprint arXiv:2501.12948 (2025).
4. ToMoE: Converting Dense Large Language Models to Mixture-of-Experts through Dynamic Structural Pruning.
5. Not All Prompts Are Made Equal.
6. Cost-Aware Contrastive Routing for LLMs.
7. ALTER: All-in-One Layer Pruning and Temporal Expert Routing for Efficient Diffusion Generation.
8. Positional-encoding figure source: erdem.pl, "Understanding positional encoding in transformers" (2021/05).
9. Baselines on the slides: ShortGPT (Men et al., 2024), SliceGPT (Ashkboos et al., 2024), ModeGPT (Lin et al., 2024), DISP-LLM (Gao et al., 2024), Norm (Li et al., 2017), SP (Fang et al., 2023), BKSDM (Kim et al., 2023), BK-SDM-v2, and the routers UMR, Thompson, Soft-MoE, Parametric and Pareto-Random.
10. Models, systems and datasets named in the talk: word2vec, Sentence-BERT, Qwen3 Embedding and Reranker, all-MiniLM, GPT-2, OpenRouter, LLaMA-3 8B, Qwen-2.5 7B, DeepSeek-Math-7B, Stable Diffusion 2.1, MNIST, CC3M, MS-COCO, EmbedLLM, Mix-Instruct and RouterBench.
