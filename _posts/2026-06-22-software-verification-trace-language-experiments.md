---
layout: post
title: "Agent Trace Language Experiments & AAAI Submission"
date: 2026-06-22
categories: [software-verification, formal-methods, aaai]
tags: [software-verification, formal-methods, agent-verification, aaai, trace-language]
author: "Scott Weeden"
---

# A Trace-Language Framework for Agent Verification

We've finalized the experiments and used `docling` to generate the HTML outputs, alongside the camera-ready double-blind PDF for our upcoming AAAI conference submission: *"A Trace-Language Framework for Agent Verification"*. 

The core thesis of our research demonstrates that **agent behavior can be modeled as a trace language**. By restricting a highly expressive generative model $\mathcal{G}$ (like an LLM) with a regular (Type-3) verifier $\mathcal{V}$ (like an Aho-Corasick DFA), we can achieve rigorous constraints over the agent's operations while keeping the system computationally tractable.

## Formal Verification Model

We establish the agent as an automaton that emits a string of symbols at each operational step. Formally, a **run** of an agent $\mathcal{A}$ is a sequence:
$$ \rho = ((q_0, w_0), (q_1, w_1), \dots, (q_n, w_n)) $$

The **trace** of that run is the concatenation of all emitted symbols over its alphabet $\Sigma_\mathcal{A}$:
$$ \tau(\rho) = w_0 \cdot w_1 \cdots w_n \in \Sigma_\mathcal{A}^* $$

The **trace language** $L(\mathcal{A})$ is the set of all possible accepting traces:
$$ L(\mathcal{A}) = \{ \tau(\rho) : \rho \text{ is an accepting run of } \mathcal{A} \} \subseteq \Sigma_\mathcal{A}^* $$

From this, we define **trace equivalence** ($\mathcal{A}_1 \equiv_\tau \mathcal{A}_2 \iff L(\mathcal{A}_1) = L(\mathcal{A}_2)$), positing that an agent *is* its trace language, regardless of its internal neural or hard-coded architecture.

The mathematical pivot of the paper is **Verifier Closure** (Theorem 2). When a generator $\mathcal{G}$ in Chomsky class $\mathcal{L}_i$ is bound by a Type-3 regular verifier $\mathcal{V}$, the resulting verified composition is:
$$ L(\mathcal{G} \Vert \mathcal{V}) = L(\mathcal{G}) \cap L(\mathcal{V}) \in \mathcal{L}_i $$

This proves that the verification budget remains linear ($O(n)$ time, $O(1)$ space) without inflating the complexity class of the original generator.

## The Six Trace Language Experiments

To prove our framework's viability, we conducted 6 structured experiments spanning controlled ablation, Chomsky classification, and live competitive deployments:

1. **Verifier Ablation Study:** We proved that a deterministic finite automaton (DFA) verifier improves task success from 35.2% to 57.8% across ML generation tasks, intercepting zero-day trace faults faster and more consistently than an LLM-based judge.
2. **Chomsky Class Compression:** By analyzing ReAct, Tree Search, and Planner-Executor architectures, we demonstrated that projecting agent execution traces onto a shared alphabet forces diverse architectures to collapse into structurally equivalent trace languages.
3. **Emergent Sub-Agent Discovery:** K-Means clustering on transition-count matrices across 100 simulations revealed the spontaneous emergence of sub-agent roles—without the need for hardcoded instructions.
4. **Trace-Language Verification Analyzer:** We developed an execution trace analyzer that extracts alphabet size, stack nesting depth, and cycle counts to heuristically classify the agent's Chomsky hierarchy class.
5. **Safety-Critical Verification:** A custom safety DFA effectively intercepted 100% of malicious or forbidden sequences (`drop_table`, `send_money`) before execution.
6. **NeuroGolf 2026 (Live Competition Deployment):** We embedded our DFA verifier directly into the [NeuroGolf 2026 Kaggle Championship](https://www.kaggle.com/competitions/neurogolf-2026) notebook generation pipeline. By analyzing the execution pipelines of top-tier submissions, our DFA enforced strict architectural routing for baseline optimization—yielding a **50% improvement** in our competition score (climbing from 2739 to 4127).

## Resources & Documentation

We have published the full open-source Trace-Language Verification (TLV) framework on GitHub, and the paper has been compiled to HTML using Docling. You can explore the methodology, experiment scripts, and mathematical proofs via our GitHub Pages documentation:

🔗 **[Agent Trace Language Documentation Site](https://sweeden-ttu.github.io/agent-trace-language/)**

### Competition Links
Our live-testing environment spans international AI conferences and data science platforms:
- **[AAAI 2026 Conference Competitions](https://aaai.org/)**: The premier international AI conference platform where our Trace Language architecture is slated for presentation.
- **[IJCAI 2026 Competitions](https://2026.ijcai.org/competitions/)**: The official host of the Abstraction and Reasoning Corpus (ARC-AGI) competitions.
- **[Kaggle: The 2026 NeuroGolf Championship](https://www.kaggle.com/competitions/neurogolf-2026)**: The live leaderboard where our DFA verifier pushed our solution into the top decile of submissions.

---
*The double-blind `main.pdf` is now compiled and prepped in the repository for submission. Good luck on the AAAI review cycle!*
