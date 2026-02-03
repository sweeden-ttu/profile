---
layout: page
title: About Scott Weeden
description: Learn about my academic journey, research interests, and passion for theoretical computer science
keywords: [Scott Weeden, computer science, cryptography, machine learning, software verification, academic portfolio]
---

<style>
  .about-hero {
    background: var(--gradient-primary);
    color: white;
    padding: var(--space-12) 0;
    margin: calc(-1 * var(--space-8)) 0;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  
  .about-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
  
  .about-hero-content {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 var(--space-6);
  }
  
  .profile-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-8);
    align-items: center;
    margin: var(--space-12) 0;
  }
  
  .profile-image {
    text-align: center;
  }
  
  .profile-image img {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-xl);
    transition: var(--transition-transform) var(--transition-normal);
  }
  
  .profile-image img:hover {
    transform: scale(1.05);
  }
  
  .interests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-6);
    margin: var(--space-8) 0;
  }
  
  .interest-card {
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    transition: var(--transition-transform) var(--transition-normal),
                var(--transition-shadow) var(--transition-normal);
    box-shadow: var(--shadow-md);
  }
  
  .interest-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }
  
  .interest-icon {
    font-size: 2rem;
    color: var(--color-primary);
    margin-bottom: var(--space-3);
  }
  
  .timeline {
    position: relative;
    margin: var(--space-8) 0;
    padding-left: var(--space-6);
  }
  
  .timeline::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--color-primary);
  }
  
  .timeline-item {
    position: relative;
    margin-bottom: var(--space-6);
    padding-left: var(--space-8);
  }
  
  .timeline-item::before {
    content: '';
    position: absolute;
    left: -7px;
    top: var(--space-2);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 3px solid var(--color-white);
    box-shadow: var(--shadow-md);
  }
  
  .skills-container {
    margin: var(--space-8) 0;
  }
  
  .skill-category {
    margin-bottom: var(--space-6);
  }
  
  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }
  
  .skill-tag {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: var(--transition-colors) var(--transition-normal);
  }
  
  .skill-tag:hover {
    background: var(--color-primary);
    color: var(--color-white);
  }
  
  @media (max-width: 768px) {
    .profile-section {
      grid-template-columns: 1fr;
      text-align: center;
    }
    
    .timeline {
      padding-left: var(--space-4);
    }
    
    .timeline-item {
      padding-left: var(--space-6);
    }
    
    .timeline-item::before {
      left: -5px;
      width: 12px;
      height: 12px;
    }
  }
</style>

<div class="about-hero">
  <div class="about-hero-content">
    <h1 class="font-display text-5xl mb-6">Hello, I'm Scott Weeden</h1>
    <p class="lead text-xl mb-6">
      Master's student at Texas Tech University passionate about the elegant intersection of cryptography, 
      machine learning, and formal verification methods.
    </p>
    <div class="flex justify-center gap-4">
      <a href="/projects/" class="btn btn-primary hover-lift">View My Work</a>
      <a href="/blog/" class="btn btn-outline-light hover-lift">Read My Blog</a>
    </div>
  </div>
</div>

<div class="container">
  <section class="profile-section">
    <div class="profile-image">
      <img src="/assets/images/profile.jpg" alt="Scott Weeden" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23e6e6fa\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'system-ui\' font-size=\'16\' fill=\'%23667eea\'%3EScott Weeden%3C/text%3E%3C/svg%3E'">
    </div>
    <div>
      <h2 class="text-3xl font-semibold mb-4">Academic Journey</h2>
      <p class="text-lg mb-4">
        I'm currently pursuing my Master's degree in Computer Science at Texas Tech University, 
        focusing on the theoretical foundations that underpin modern computing systems. My academic 
        journey is driven by a deep fascination with mathematical elegance and its practical 
        applications in creating secure, intelligent, and reliable software systems.
      </p>
      <p class="text-lg">
        My research interests span cryptographic protocols, machine learning security, and formal 
        verification techniques. I believe that understanding the mathematical foundations of these 
        areas is crucial for building the next generation of trustworthy AI systems and secure 
        digital infrastructure.
      </p>
    </div>
  </section>

  <section>
    <h2 class="text-3xl font-semibold text-center mb-8">Research Interests</h2>
    <div class="interests-grid">
      <div class="interest-card">
        <div class="interest-icon">
          <i class="fas fa-shield-alt"></i>
        </div>
        <h3 class="text-xl font-semibold mb-3">Cryptography</h3>
        <p>
          Post-quantum cryptography, zero-knowledge proofs, secure multi-party computation, 
          and cryptographic protocols for privacy-preserving machine learning.
        </p>
      </div>
      
      <div class="interest-card">
        <div class="interest-icon">
          <i class="fas fa-brain"></i>
        </div>
        <h3 class="text-xl font-semibold mb-3">Machine Learning Security</h3>
        <p>
          Adversarial robustness, privacy-preserving ML, differential privacy, and the intersection 
          of cryptography with machine learning systems.
        </p>
      </div>
      
      <div class="interest-card">
        <div class="interest-icon">
          <i class="fas fa-cogs"></i>
        </div>
        <h3 class="text-xl font-semibold mb-3">Formal Verification</h3>
        <p>
          Automated theorem proving, model checking, program synthesis, and formal methods for 
          ensuring software correctness and security.
        </p>
      </div>
      
      <div class="interest-card">
        <div class="interest-icon">
          <i class="fas fa-code-branch"></i>
        </div>
        <h3 class="text-xl font-semibold mb-3">Theoretical CS</h3>
        <p>
          Computational complexity, algorithm design, formal logic, and the mathematical 
          foundations of computer science.
        </p>
      </div>
    </div>
  </section>

  <section class="skills-container">
    <h2 class="text-3xl font-semibold text-center mb-8">Technical Skills</h2>
    
    <div class="skill-category">
      <h3 class="text-xl font-semibold mb-3">
        <i class="fas fa-code"></i> Programming Languages
      </h3>
      <div class="skill-tags">
        <span class="skill-tag">Python</span>
        <span class="skill-tag">JavaScript/TypeScript</span>
        <span class="skill-tag">Java</span>
        <span class="skill-tag">C++</span>
        <span class="skill-tag">Rust</span>
        <span class="skill-tag">Prolog</span>
        <span class="skill-tag">Haskell</span>
        <span class="skill-tag">LaTeX</span>
      </div>
    </div>
    
    <div class="skill-category">
      <h3 class="text-xl font-semibold mb-3">
        <i class="fas fa-database"></i> Technologies & Tools
      </h3>
      <div class="skill-tags">
        <span class="skill-tag">Git</span>
        <span class="skill-tag">Docker</span>
        <span class="skill-tag">TensorFlow</span>
        <span class="skill-tag">PyTorch</span>
        <span class="skill-tag">Scikit-learn</span>
        <span class="skill-tag">Jupyter</span>
        <span class="skill-tag">VS Code</span>
        <span class="skill-tag">Linux</span>
      </div>
    </div>
    
    <div class="skill-category">
      <h3 class="text-xl font-semibold mb-3">
        <i class="fas fa-calculator"></i> Mathematical Expertise
      </h3>
      <div class="skill-tags">
        <span class="skill-tag">Linear Algebra</span>
        <span class="skill-tag">Discrete Mathematics</span>
        <span class="skill-tag">Probability Theory</span>
        <span class="skill-tag">Number Theory</span>
        <span class="skill-tag">Graph Theory</span>
        <span class="skill-tag">Optimization</span>
        <span class="skill-tag">Formal Logic</span>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-3xl font-semibold text-center mb-8">Academic Timeline</h2>
    <div class="timeline">
      <div class="timeline-item">
        <h3 class="text-xl font-semibold">Current</h3>
        <p class="text-gray-600">Spring 2026</p>
        <p>
          <strong>Master's Candidate, Computer Science</strong> - Texas Tech University<br>
          Focus: Cryptography and Software Verification
        </p>
      </div>
      
      <div class="timeline-item">
        <h3 class="text-xl font-semibold">Graduate Studies</h3>
        <p class="text-gray-600">Fall 2025</p>
        <p>
          <strong>Intelligent Systems</strong> - Advanced AI and ML<br>
          <strong>Logic for Computer Scientists</strong> - Formal Methods
        </p>
      </div>
      
      <div class="timeline-item">
        <h3 class="text-xl font-semibold">Summer 2025</h3>
        <p class="text-gray-600">Intensive Coursework</p>
        <p>
          <strong>Analysis of Algorithms</strong> - Advanced algorithmic techniques<br>
          <strong>Machine Learning Security</strong> - Adversarial ML and privacy
        </p>
      </div>
      
      <div class="timeline-item">
        <h3 class="text-xl font-semibold">Research Assistant</h3>
        <p class="text-gray-600">2024-2025</p>
        <p>
          Contributed to research in formal verification and automated theorem proving. 
          Developed tools for program analysis and verification.
        </p>
      </div>
    </div>
  </section>

  <section class="text-center py-12">
    <h2 class="text-3xl font-semibold mb-6">Let's Connect</h2>
    <p class="text-lg mb-8">
      I'm always interested in discussing research collaborations, academic opportunities, 
      and challenging problems in theoretical computer science.
    </p>
    <div class="flex justify-center gap-4">
      <a href="mailto:sweeden@ttu.edu" class="btn btn-primary hover-lift">
        <i class="fas fa-envelope"></i> Email Me
      </a>
      <a href="https://github.com/sweeden-ttu" class="btn btn-outline-primary hover-lift">
        <i class="fab fa-github"></i> GitHub
      </a>
      <a href="https://linkedin.com/in/weedens" class="btn btn-outline-primary hover-lift">
        <i class="fab fa-linkedin"></i> LinkedIn
      </a>
      <a href="/blog/" class="btn btn-outline-primary hover-lift">
        <i class="fas fa-blog"></i> Blog
      </a>
    </div>
  </section>
</div>