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

  <!-- Tab Navigation -->
  <div class="research-tabs" role="tablist">
    <button class="research-tab active" data-tab="all" role="tab">All Publications</button>
    <button class="research-tab" data-tab="conference" role="tab">Conference Papers</button>
    <button class="research-tab" data-tab="journal" role="tab">Journal Articles</button>
    <button class="research-tab" data-tab="thesis" role="tab">Theses</button>
    <button class="research-tab" data-tab="preprint" role="tab">Preprints</button>
  </div>

  <!-- All Publications -->
  <div class="research-section" id="all-publications" role="tabpanel">
    {% assign all_publications = site.posts | where_exp: "post", "post.publication == true" | sort: 'date' | reverse %}
    
    {% if all_publications.size > 0 %}
      {% for post in all_publications %}
        <div class="publication-card" data-type="{{ post.publication_type | default: 'preprint' }}">
          <span class="publication-type type-{{ post.publication_type | default: 'preprint' }}">
            {{ post.publication_type | default: 'Preprint' }}
          </span>
          
          <h3 class="publication-title">{{ post.title }}</h3>
          
          <div class="publication-authors">
            {% if post.authors %}
              {{ post.authors }}
            {% else %}
              <strong>{{ post.author | default: site.author.name }}</strong>
            {% endif %}
          </div>
          
          {% if post.venue %}
            <div class="publication-venue">
              {{ post.venue }}{% if post.date %}, {{ post.date | date: "%B %Y" }}{% endif %}
            </div>
          {% endif %}
          
          {% if post.abstract %}
            <div class="publication-abstract">
              <strong>Abstract:</strong> {{ post.abstract | strip_html | truncatewords: 100 }}
            </div>
          {% endif %}
          
          <div class="publication-links">
            {% if post.url %}
              <a href="{{ post.url }}" class="publication-link link-primary">
                <i class="fas fa-file-pdf"></i> PDF
              </a>
            {% endif %}
            {% if post.arxiv %}
              <a href="{{ post.arxiv }}" class="publication-link link-outline">
                <i class="fas fa-external-link-alt"></i> arXiv
              </a>
            {% endif %}
            {% if post.github %}
              <a href="{{ post.github }}" class="publication-link link-outline">
                <i class="fab fa-github"></i> Code
              </a>
            {% endif %}
            {% if post.doi %}
              <a href="https://doi.org/{{ post.doi }}" class="publication-link link-outline">
                <i class="fas fa-external-link-alt"></i> DOI
              </a>
            {% endif %}
          </div>
        </div>
      {% endfor %}
    {% else %}
      <div class="no-content">
        <h3 class="text-2xl font-semibold mb-2">No Publications Yet</h3>
        <p>Research publications and papers will appear here as they are completed.</p>
      </div>
    {% endif %}
  </div>

  <!-- Research Projects Section -->
  <section class="research-section">
    <h2 class="text-3xl font-semibold mb-8">Research Projects</h2>
    
    <div class="publication-card">
      <span class="publication-type type-conference">Project</span>
      <h3 class="publication-title">Master's Theorem in Algorithm Analysis</h3>
      <div class="publication-authors"><strong>Scott Weeden</strong></div>
      <div class="publication-venue">Completed | Focus: Algorithm Complexity</div>
      <div class="publication-abstract">
        <strong>Abstract:</strong> Perfected the Master's theorem for analyzing divide-and-conquer algorithms, developing a comprehensive understanding of recursive algorithm complexity through rigorous mathematical proofs and practical applications.
      </div>
      <div class="publication-links">
        <a href="/projects/masters-theorem" class="publication-link link-primary">
          <i class="fas fa-external-link-alt"></i> View Project
        </a>
      </div>
    </div>
    
    <div class="publication-card">
      <span class="publication-type type-conference">Project</span>
      <h3 class="publication-title">Q-Learning Pac-Man Demonstration</h3>
      <div class="publication-authors"><strong>Scott Weeden</strong></div>
      <div class="publication-venue">Open Source | Reinforcement Learning</div>
      <div class="publication-abstract">
        <strong>Abstract:</strong> Implemented a reinforcement learning agent that learns to play Pac-Man using Q-Learning, demonstrating convergence and optimization in a classic game environment with epsilon-greedy exploration strategies.
      </div>
      <div class="publication-links">
        <a href="/projects/qlearning-pacman" class="publication-link link-primary">
          <i class="fas fa-external-link-alt"></i> View Project
        </a>
        <a href="https://github.com/sweeden-ttu/qlearning-pacman" class="publication-link link-outline">
          <i class="fab fa-github"></i> GitHub
        </a>
      </div>
    </div>
    
    <div class="publication-card">
      <span class="publication-type type-workshop">Kaggle</span>
      <h3 class="publication-title">Machine Learning Competitions</h3>
      <div class="publication-authors"><strong>Scott Weeden</strong></div>
      <div class="publication-venue">Ongoing | Active Participation</div>
      <div class="publication-abstract">
        <strong>Abstract:</strong> Active participation in Kaggle competitions applying machine learning techniques to diverse real-world datasets, developing skills in data preprocessing, model selection, hyperparameter tuning, and ensemble methods.
      </div>
      <div class="publication-links">
        <a href="/projects/kaggle-competitions" class="publication-link link-primary">
          <i class="fas fa-external-link-alt"></i> View Projects
        </a>
      </div>
    </div>
  </section>

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

<script>
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.research-tab');
  const publications = document.querySelectorAll('.publication-card');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const filter = this.dataset.tab;
      
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      publications.forEach(pub => {
        const type = pub.dataset.type;
        
        if (filter === 'all' || type === filter) {
          pub.style.display = 'block';
          pub.classList.add('fade-in');
          setTimeout(() => pub.classList.remove('fade-in'), 500);
        } else {
          pub.style.display = 'none';
        }
      });
    });
  });
  
  publications.forEach(pub => {
    pub.addEventListener('mouseenter', function() {
      this.classList.add('hover-lift');
    });
    
    pub.addEventListener('mouseleave', function() {
      this.classList.remove('hover-lift');
    });
  });
});
</script>