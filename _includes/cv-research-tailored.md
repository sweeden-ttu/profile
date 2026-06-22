## Research Profile

Computer Science Master's student at Texas Tech University with **15+ years of enterprise and federal software engineering experience** (Department of Defense, U.S. Treasury, Fortune-500 supply-chain risk systems), now pivoting to research at the intersection of **reinforcement learning, interpretable AI, and formal verification of autonomous agents**. Looking for an NSF INTERN-supported summer research position with an industry or national-lab AI group, advised by a TTU CISE-funded faculty member.

## Research Interests

- **Reinforcement Learning & Intrinsic Motivation** — agents that learn without externally-defined reward, motivated by Tishby/Polani-lineage information-theoretic frameworks
- **Interpretable & Verifiable AI Systems** — applying software V&V and formal methods to RL agents
- **Adversarial Robustness & Agent Viability** — recovery from adverse events in autonomous systems
- **Information-Theoretic Foundations of Learning** — Information Bottleneck, empowerment, mutual-information objectives
- **Formal Methods for Autonomous Agents** — automata-theoretic models of agent state spaces

## Education

**Master of Computer Science** — *Texas Tech University*, March 2025 – Present
*Expected graduation:* 2027. Whitacre College of Engineering. Coursework annotated below for research relevance.

**Bachelor of Science, Computer Science** — *The Ohio State University*, 2000 – 2004

## Relevant Graduate Coursework

Each course below is annotated with how it maps to research in autonomous agents, robust intelligence, and interpretable AI.

### Spring 2026 — *In progress*

**Software Verification and Validation** &middot; CS-5374 &middot; Dr. Akbar Siami Namin
Formal methods, model checking, specification analysis, continuous verification.
→ **Research relevance:** Directly maps to the *interpretable framework* angle of NSF Robust Intelligence work — verifying behavioral properties of autonomous agents (e.g., viability invariants, safe-recovery guarantees) requires the same model-checking and specification toolkit.

**Cryptography** &middot; CS-6343
Symmetric/asymmetric encryption, hash functions, digital signatures, public-key cryptography, security protocols.
→ **Research relevance:** Information-theoretic foundations (entropy, mutual information, channel capacity) are shared with the Information Bottleneck and empowerment frameworks central to intrinsic-motivation RL research.

### Fall 2025 — *Completed*

**Intelligent Systems** &middot; CS-5368
Search, game playing, constraint satisfaction, Bayesian networks, probabilistic reasoning, **reinforcement learning**.
→ **Research relevance:** Foundational AI/ML coursework with explicit RL coverage — directly aligned with the **Reinforcement** axis of R3 Learning research (Robot / Reinforcement / Representation).

**Logic for Computer Scientists** &middot; CS-5384
Propositional logic, first-order logic, resolution, Herbrand semantics, automated reasoning, Prolog.
→ **Research relevance:** Formal-reasoning toolkit for specifying and proving properties of autonomous agents — applicable to interpretability and safe-RL research where agent decisions must be auditable.

**Theory of Automata** &middot; CS-5383
Finite automata, regular languages, context-free grammars, Turing machines, computational complexity.
→ **Research relevance:** Automata-theoretic models are the natural formalism for agent state spaces in dynamical-systems control. Computational-complexity background informs tractability analysis of RL algorithms.

### Summer 2025 — *Completed*

**Machine Learning Security** &middot; CS-5331
Adversarial attacks, model robustness, privacy-preserving ML.
→ **Research relevance:** Adversarial robustness directly parallels research on **agent viability** — an agent that recovers from adversarial perturbations is a robust agent. Both fields share threat models, certified-defense techniques, and evaluation methodology.

**Analysis of Algorithms** &middot; CS-5381
Complexity analysis, divide and conquer, dynamic programming, greedy algorithms, graph algorithms, NP-completeness.
→ **Research relevance:** Algorithmic foundations for RL (DP is the algorithmic core of value iteration / policy iteration; graph algorithms underpin MDP/POMDP solvers).

**Software Project Management** &middot; CS-5363
Planning, estimation, risk management, quality assurance.
→ **Research relevance:** Translates 15 years of industry project leadership into the language of academic research execution — useful for managing multi-track research deliverables and INTERN-funded externships.

## Notable Projects

**[Q-Learning Pac-Man Agent](/projects/qlearning-pacman/)** &middot; *Python, NumPy, RL* &middot; 2024
Implemented a Q-Learning agent on the **UC Berkeley CS188 Pac-Man framework** — the same Berkeley AI lineage as Pieter Abbeel's Robot Learning Lab. Feature-based state representation, ε-greedy exploration with decay schedule, reward shaping. Achieved 75% win rate (up from 10% baseline) over 1,000 training episodes. Code open-sourced; documented exploration/exploitation trade-off and reward-shaping experiments. **Direct lineage to intrinsic-motivation RL** — natural next step is replacing extrinsic reward with mutual-information / empowerment objectives.

**[Reinforcement Learning Video Series](/projects/reinforcement-learning-videos/)** &middot; *Educational content*
Curated explainers covering policy gradients, Q-learning, and RL evaluation. Demonstrates pedagogical command of the field's core algorithmic primitives.

**[Tor Network Puzzle Challenge](/projects/)** &middot; *Python, web scraping, network security*
Active project: navigating `.onion` sites and solving HTML-based puzzles with JavaScript disabled. Demonstrates security/network-research mindset and willingness to work under hard constraints.

**[Kaggle Competitions](/projects/kaggle-competitions/)** &middot; *Python, ML*
Hands-on practice with applied ML pipelines.

## Industry Experience (Research-Relevant Selection)

**Solutions Architect / Programmer III** &middot; *Jabil Inc.* &middot; April 2014 – February 2020
Built a **Risk Dashboard for the CFO** identifying risks in supplier and manufacturer contracts across global operations; ensured Conflict Mineral and OFAC Trade compliance. Promoted to Solutions Architect; participated in Architectural Review Board. **Research-relevant skill:** translating ill-specified objectives into measurable systems — the same skill-shape required for designing RL reward signals and evaluation harnesses.

**Lead Developer** &middot; *Computer Sciences Corporation (CSC)* &middot; March 2010 – September 2013
Lead developer on the **Joint Logistics Analysis Tool** for the Defense Logistics Agency / Department of Defense. Built dashboards for system resources at nuclear missile silos and SCIFs (top-secret research facilities). **Research-relevant skill:** federal R&D security clearance posture, suitable for **NSF-AFRL INTERN** and **NSF-DEVCOM INTERN** sub-program placements (Air Force Research Lab, Army Combat Capabilities Development Command).

**Software Engineer** &middot; *Primescape Solutions / U.S. Treasury* &middot; September 2007 – February 2010
Background services and APIs for U.S. Treasury debt-management systems. Yield curves, auction results, REST integrations with Federal Reserve and Bloomberg. **Research-relevant skill:** quantitative-systems work in regulated environments.

**IAM Developer** &middot; *ExecuSource @ Home Depot* &middot; July 2022 – February 2023
SSO authentication integration for Home Depot's M&A of Crown Bolt's California Supply Chain. **Research-relevant skill:** identity / credential systems familiar to security-research contexts.

*Full work history: [Online Résumé](/resume/) | [Profile.pdf](/Profile.pdf)*

## Technical Skills

**Machine Learning / RL:** Python, NumPy, PyTorch (in progress), Q-Learning, ε-greedy exploration, reward shaping, MDP/POMDP modeling
**Formal Methods:** Prolog, resolution, first-order logic, Herbrand semantics, automata theory, model checking, software V&V
**ML Security:** Adversarial attacks, model robustness, privacy-preserving ML
**Theory:** Algorithm analysis, computational complexity, information theory (cryptographic)
**Software Engineering:** 15+ years across enterprise (.NET, ASP.NET MVC, C#), database (Oracle, MSSQL, SQL tuning), cloud (Azure), federal (DoD, U.S. Treasury), version control (Git)
**Languages:** Python, C#, SQL, Prolog, JavaScript/TypeScript, Ruby (Jekyll)

## Research Fit Statement

I am specifically interested in joining **Dr. Stas Tiomkin's** research group at TTU CS. His CRII award *"Interpretable Framework and Transformative Applications for Viability in Autonomous Agents"* (NSF 2513350, 2025–2027) sits at the intersection of three areas I am actively studying:

1. The **interpretability and verification** angle of his Agent-Induced Lyapunov Exponents (AILE) framework parallels my Spring 2026 Software V&V coursework — model checking and specification analysis applied to learned policies.
2. His **information-theoretic, intrinsic-motivation** lineage (Tishby, Polani, Berkeley BAIR / Abbeel) connects to my cryptography and information-theory background.
3. His applications in **self-recovery of locomotion agents** and **adversarial robustness of dynamical systems** connect directly to my Q-Learning / RL practice and Machine Learning Security coursework.

I would welcome the opportunity to discuss an **NSF INTERN-funded summer placement** at an aligned industry or national-lab partner (UC Berkeley BAIR, NVIDIA Research, NREL/ORNL, Toyota Research Institute, or similar) under his advisement.

---

**Contact:** [scott.weeden@gmail.com](mailto:scott.weeden@gmail.com) &middot; [LinkedIn](https://www.linkedin.com/in/weedens) &middot; [GitHub](https://github.com/sweeden-ttu) &middot; Lubbock-Killeen, TX

*Last updated: May 2026.*
