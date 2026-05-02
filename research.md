---
layout: page
title: Research & Publications
description: Academic publications, research papers, and scholarly contributions in computer science
keywords: [research, publications, papers, academic, computer science, cryptography, machine learning]
---

<style>
  .research-hero {
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent-green) 100%);
    padding: var(--space-12) 0;
    margin: calc(-1 * var(--space-6)) 0 var(--space-8) 0;
    text-align: center;
    color: white;
  }
  
  .research-tabs {
    display: flex;
    gap: var(--space-2);
    margin: var(--space-8) 0;
    border-bottom: 2px solid var(--color-gray-200);
    overflow-x: auto;
  }
  
  .research-tab {
    background: transparent;
    border: none;
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-gray-600);
    cursor: pointer;
    white-space: nowrap;
    transition: var(--transition-colors) var(--transition-normal);
    position: relative;
  }
  
  .research-tab:hover {
    color: var(--color-primary);
  }
  
  .research-tab.active {
    color: var(--color-primary);
  }
  
  .research-tab.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-primary);
  }
  
  .research-section {
    margin: var(--space-12) 0;
  }
  
  .publication-card {
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    margin-bottom: var(--space-4);
    transition: var(--transition-transform) var(--transition-normal),
                var(--transition-shadow) var(--transition-normal);
    box-shadow: var(--shadow-sm);
  }
  
  .publication-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  .publication-type {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
    margin-bottom: var(--space-3);
  }
  
  .type-conference {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
  }
  
  .type-journal {
    background: var(--color-accent-green-light);
    color: var(--color-white);
  }
  
  .type-workshop {
    background: var(--color-warning);
    color: var(--color-white);
  }
  
  .type-thesis {
    background: var(--color-secondary);
    color: var(--color-white);
  }
  
  .type-preprint {
    background: var(--color-gray-400);
    color: var(--color-white);
  }
  
  .publication-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-800);
    margin-bottom: var(--space-3);
    line-height: var(--line-height-tight);
  }
  
  .publication-authors {
    font-size: var(--font-size-base);
    color: var(--color-gray-600);
    margin-bottom: var(--space-2);
  }
  
  .publication-authors strong {
    color: var(--color-gray-800);
  }
  
  .publication-venue {
    font-size: var(--font-size-sm);
    color: var(--color-gray-500);
    margin-bottom: var(--space-3);
    font-style: italic;
  }
  
  .publication-abstract {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-4);
    padding: var(--space-4);
    background: var(--color-gray-50);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-primary);
  }
  
  .publication-links {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  
  .publication-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    text-decoration: none;
    transition: var(--transition-all) var(--transition-normal);
  }
  
  .link-primary {
    background: var(--color-primary);
    color: var(--color-white);
  }
  
  .link-primary:hover {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
  }
  
  .link-outline {
    background: transparent;
    color: var(--color-gray-600);
    border: 1px solid var(--color-gray-300);
  }
  
  .link-outline:hover {
    background: var(--color-gray-100);
    border-color: var(--color-gray-400);
  }
  
  .research-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-4);
    margin: var(--space-8) 0;
    padding: var(--space-6);
    background: var(--color-gray-50);
    border-radius: var(--radius-lg);
  }
  
  .stat-box {
    text-align: center;
    padding: var(--space-4);
  }
  
  .stat-value {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary);
    line-height: 1;
  }
  
  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    margin-top: var(--space-2);
  }
  
  .topic-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: var(--space-6) 0;
  }
  
  .topic-tag {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: var(--transition-all) var(--transition-normal);
  }
  
  .topic-tag:hover {
    background: var(--color-primary);
    color: var(--color-white);
    transform: translateY(-1px);
  }
  
  .citation-format {
    margin-top: var(--space-4);
    padding: var(--space-4);
    background: var(--color-gray-50);
    border-radius: var(--radius-md);
  }
  
  .citation-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
    color: var(--color-gray-500);
    margin-bottom: var(--space-2);
  }
  
  .citation-text {
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    font-family: var(--font-mono);
    line-height: var(--line-height-relaxed);
  }
  
  .no-content {
    text-align: center;
    padding: var(--space-12);
    color: var(--color-gray-500);
  }
  
  @media (max-width: 768px) {
    .research-tabs {
      flex-wrap: nowrap;
      padding-bottom: var(--space-2);
    }
    
    .publication-card {
      padding: var(--space-4);
    }
    
    .publication-links {
      flex-direction: column;
    }
    
    .publication-link {
      justify-content: center;
    }
  }
</style>

<div class="research-hero">
  <h1 class="text-4xl font-semibold mb-4">Research & Publications</h1>
  <p class="lead text-xl max-w-3xl mx-auto">
    Academic contributions exploring cryptography, machine learning security, formal verification, 
    and theoretical computer science.
  </p>
</div>

<div class="container">
  <!-- Research Statistics -->
  <div class="research-stats">
    <div class="stat-box">
      <div class="stat-value">{{ site.posts | size }}+</div>
      <div class="stat-label">Publications</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">4</div>
      <div class="stat-label">Research Areas</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">2</div>
      <div class="stat-label">Collaborations</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">2024</div>
      <div class="stat-label">Since</div>
    </div>
  </div>

  <!-- Research Topics -->
  <h2 class="text-2xl font-semibold mb-4">Research Focus Areas</h2>
  <div class="topic-cloud">
    <span class="topic-tag">Cryptographic Protocols</span>
    <span class="topic-tag">Post-Quantum Cryptography</span>
    <span class="topic-tag">Machine Learning Security</span>
    <span class="topic-tag">Adversarial Robustness</span>
    <span class="topic-tag">Formal Verification</span>
    <span class="topic-tag">Automated Theorem Proving</span>
    <span class="topic-tag">Differential Privacy</span>
    <span class="topic-tag">Secure Multi-Party Computation</span>
    <span class="topic-tag">Zero-Knowledge Proofs</span>
    <span class="topic-tag">Program Synthesis</span>
    <span class="topic-tag">Model Checking</span>
    <span class="topic-tag">Computational Complexity</span>
  </div>

### Peer review exercise (Microsoft Research publication)
**Type**: Academic peer review (course exercise)

Authored a structured review of a Microsoft Research publication, focusing on experimental design, methodology, and claims—part of graduate coursework rather than a standalone IEEE publication.

**Key contributions**:
- Critical analysis of ML research methodologies as presented in the paper
- Evaluation of experimental design and statistical framing
- Recommendations for clearer reporting and follow-on work

  <!-- Academic Assignments Section -->
  <section class="research-section">
    <h2 class="text-3xl font-semibold mb-8">Course Assignments & Technical Work</h2>
    
    <div class="publication-card">
      <span class="publication-type type-thesis">Intelligent Systems</span>
      <h3 class="publication-title">Model-based RL, TD learning, and Feature-based Q-learning</h3>
      <div class="publication-authors"><strong>Scott Weeden</strong></div>
      <div class="publication-venue">Course Assignment | Fall 2025</div>
      <div class="publication-links">
        <a href="/assignments/intelligent-systems/assignment3/intelligent-systems-assignment3-problems" class="publication-link link-primary">
          <i class="fas fa-external-link-alt"></i> View Assignment
        </a>
      </div>
    </div>
    
    <div class="publication-card">
      <span class="publication-type type-thesis">Logic for Computer Scientists</span>
      <h3 class="publication-title">Propositional Logic, Herbrand Semantics, and CNF</h3>
      <div class="publication-authors"><strong>Scott Weeden</strong></div>
      <div class="publication-venue">Course Assignment | Fall 2025</div>
      <div class="publication-links">
        <a href="/assignments/logic-for-computer-scientists/logic-homework3" class="publication-link link-primary">
          <i class="fas fa-external-link-alt"></i> View Homework
        </a>
      </div>
    </div>
  </section>

  <!-- Collaboration Section -->
  <section class="research-section text-center py-12">
    <h2 class="text-3xl font-semibold mb-4">Collaboration & Contact</h2>
    <p class="text-lg mb-6">
      I'm always interested in discussing research ideas, potential collaborations, and opportunities 
      to apply machine learning and cryptography to meaningful problems.
    </p>
    <div class="flex justify-center gap-4">
      <a href="mailto:sweeden@ttu.edu" class="publication-link link-primary">
        <i class="fas fa-envelope"></i> Email Me
      </a>
      <a href="https://github.com/sweeden-ttu" class="publication-link link-outline">
        <i class="fab fa-github"></i> GitHub
      </a>
      <a href="https://linkedin.com/in/weedens" class="publication-link link-outline">
        <i class="fab fa-linkedin"></i> LinkedIn
      </a>
    </div>
  </section>
</div>

## Academic Projects & Assignments

### Course Assignments

#### Intelligent Systems
- [Assignment 3: Problem Solving](/assignments/intelligent-systems/assignment3/intelligent-systems-assignment3-problems) - Model-based RL, TD learning, and feature-based Q-learning
- [Assignment 4: Problem Solving](/assignments/intelligent-systems/assignment4/intelligent-systems-assignment4-problems) - Probabilities, Bayesian Networks, and Inference
- [Assignment 3: Reinforcement Learning](/assignments/intelligent-systems/assignment3/intelligent-systems-assignment3-rl) - Q-Learning and RL applications

#### Logic for Computer Scientists
- [Homework 3: Logic Problems](/assignments/logic-for-computer-scientists/logic-homework3) - Propositional logic, Herbrand semantics, and CNF
- [Homework 3: Solutions](/assignments/logic-for-computer-scientists/logic-homework3-solutions) - Complete solutions with explanations

### Research Projects

### Master's Theorem in Algorithm Analysis
**Status**: Completed | **Focus**: Algorithm Complexity

Perfected the Master's theorem for analyzing divide-and-conquer algorithms, developing a comprehensive understanding of recursive algorithm complexity.

**Achievements**:
- Rigorous mathematical proofs and derivations
- Practical applications to common algorithms (merge sort, binary search, Strassen's algorithm)
- Educational materials for teaching complexity analysis
- Case studies demonstrating theorem application

**Technical Skills**: Algorithm Analysis, Computational Complexity, Mathematical Proof

[View Project Details](/projects/masters-theorem)

---

### Q-Learning Pac-Man Demonstration
**Platform**: GitHub | **Status**: Open Source

Implemented a reinforcement learning agent that learns to play Pac-Man using Q-Learning, demonstrating convergence and optimization in a classic game environment.

**Technical Implementation**:
- Q-Learning algorithm with epsilon-greedy exploration
- State space representation and feature engineering
- Reward shaping for efficient learning
- Visualization of learning progress and policy evolution

**Results**:
- Agent successfully learns optimal navigation strategies
- Demonstrated balance between exploration and exploitation
- Published with comprehensive documentation and tutorials

**Technologies**: Python, Reinforcement Learning, Q-Learning, Game AI

[GitHub profile — code and coursework](https://github.com/sweeden-ttu)

---

## Kaggle Competition Participation

### Machine Learning Competitions
**Platform**: Kaggle | **Status**: Ongoing

Active participation in Kaggle competitions, applying machine learning techniques to diverse real-world datasets.

**Competitions & Approaches**:
- Data preprocessing and feature engineering
- Model selection and hyperparameter tuning
- Ensemble methods and stacking
- Cross-validation and performance optimization

**Skills Developed**:
- End-to-end ML pipeline development
- Working with messy, real-world data
- Model interpretability and evaluation
- Collaborative problem-solving

[View Projects](/projects/kaggle-competitions)

---

## Educational & Outreach

### Reinforcement Learning Video Series
**Platform**: YouTube | **Format**: Educational Shorts

Created a series of video shorts explaining reinforcement learning concepts in accessible, intuitive ways.

**Topics Covered**:
- Q-Learning fundamentals
- Exploration vs. exploitation trade-off
- Temporal difference learning
- Deep Q-Networks (DQN)
- Practical RL applications

**Impact**: Making complex AI concepts accessible to broader audiences, supporting self-directed learners

Educational shorts cover Q-learning basics through DQN-style ideas; links to the channel can be shared on request for courses and collaborators.

---

## Software Development

### Propositional Logic Chrome Extension
**Platform**: Chrome Web Store | **Status**: Published

Developed a browser utility for working with propositional logic, bridging formal logic with practical web development.

**Features**:
- Truth table generation
- Logical equivalence checking
- Formula simplification
- CNF/DNF conversion
- Interactive logic gate visualization

**Use Cases**: Logic education, formal verification, discrete mathematics coursework

**Technologies**: JavaScript, Chrome Extension API, Logic Programming

The extension was published for logic coursework; store listing and updates are maintained as the tool evolves.

---

## Research Interests

### Current Focus Areas

**Machine Learning Applications**
- Reinforcement learning in complex environments
- Transfer learning and domain adaptation
- Interpretable AI and explainability

**Social & Environmental Impact**
- ML for social good and community development
- Environmental monitoring and sustainability
- Healthcare accessibility and outcome prediction

**Algorithmic Foundations**
- Complexity theory and optimization
- Algorithm design for resource-constrained environments
- Theoretical guarantees in machine learning

### Future Directions

**Study Abroad Research (Australia)**
- International collaboration opportunities
- Cross-cultural perspectives on AI ethics
- Environmental ML applications in unique ecosystems

**Open Questions**
- How can we make ML more accessible and interpretable?
- What are the most pressing social challenges that ML can address?
- How do we ensure AI systems are fair, transparent, and beneficial?

---

## Collaboration & Contact

I'm always interested in discussing research ideas, potential collaborations, and opportunities to apply machine learning to meaningful problems.

**Areas of Interest for Collaboration**:
- Machine learning for social impact
- Environmental sustainability applications
- Healthcare ML research
- Algorithm analysis and optimization
- International research partnerships

**Email**: [scott.weeden@gmail.com](mailto:scott.weeden@gmail.com)  
**GitHub**: [github.com/sweeden-ttu](https://github.com/sweeden-ttu)  
**LinkedIn**: [linkedin.com/in/weedens](https://www.linkedin.com/in/weedens/)

---

*For coursework, projects, and code samples, see repositories on [GitHub](https://github.com/sweeden-ttu) and the [Projects](/research/) section of this site.*