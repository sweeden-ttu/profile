---
layout: page
title: Projects & Research
description: Explore my technical projects, research implementations, and academic work in computer science
keywords: [projects, research, cryptography, machine learning, software verification]
---

<style>
  .projects-hero {
    background: var(--gradient-secondary);
    padding: var(--space-8) 0;
    margin: calc(-1 * var(--space-6)) 0;
    text-align: center;
  }
  
  .filter-container {
    margin: var(--space-8) 0;
    text-align: center;
  }
  
  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }
  
  .filter-btn {
    background: var(--color-gray-100);
    border: 2px solid var(--color-gray-200);
    color: var(--color-gray-700);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: var(--transition-all) var(--transition-normal);
  }
  
  .filter-btn:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
    color: var(--color-primary-dark);
  }
  
  .filter-btn.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-white);
  }
  
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-6);
    margin: var(--space-8) 0;
  }
  
  .project-card {
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: var(--transition-transform) var(--transition-normal),
                var(--transition-shadow) var(--transition-normal);
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
  }
  
  .project-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }
  
  .project-header {
    padding: var(--space-6);
    background: var(--color-gray-50);
    border-bottom: 1px solid var(--color-gray-200);
  }
  
  .project-status {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
    margin-bottom: var(--space-3);
  }
  
  .status-completed {
    background: var(--color-success);
    color: var(--color-white);
  }
  
  .status-in-progress {
    background: var(--color-warning);
    color: var(--color-white);
  }
  
  .status-planned {
    background: var(--color-gray-400);
    color: var(--color-white);
  }
  
  .project-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-800);
    margin-bottom: var(--space-2);
  }
  
  .project-meta {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
  }
  
  .project-tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: var(--space-3) 0;
  }
  
  .tech-tag {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  }
  
  .project-content {
    padding: var(--space-6);
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .project-excerpt {
    color: var(--color-gray-600);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-4);
    flex: 1;
  }
  
  .project-actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  
  .project-btn {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    text-decoration: none;
    transition: var(--transition-all) var(--transition-normal);
    border: 1px solid transparent;
  }
  
  .btn-primary {
    background: var(--color-primary);
    color: var(--color-white);
    border-color: var(--color-primary);
  }
  
  .btn-primary:hover {
    background: var(--color-primary-dark);
    transform: scale(1.05);
  }
  
  .btn-outline {
    background: transparent;
    color: var(--color-gray-600);
    border-color: var(--color-gray-300);
  }
  
  .btn-outline:hover {
    background: var(--color-gray-100);
    border-color: var(--color-gray-400);
  }
  
  .no-results {
    text-align: center;
    padding: var(--space-12);
    color: var(--color-gray-500);
  }
  
  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }
    
    .filter-buttons {
      justify-content: stretch;
    }
    
    .filter-btn {
      flex: 1;
      min-width: 120px;
    }
  }
</style>

<div class="projects-hero">
  <h1 class="text-4xl font-semibold mb-4">Projects & Research</h1>
  <p class="lead text-xl max-w-3xl mx-auto">
    Explore my technical implementations, research projects, and academic work across 
    cryptography, machine learning, formal verification, and theoretical computer science.
  </p>
</div>

<div class="container">
  <div class="filter-container">
    <h2 class="text-2xl font-semibold mb-2">Filter by Category</h2>
    <div class="filter-buttons">
      <button class="filter-btn active" data-filter="all">All Projects</button>
      <button class="filter-btn" data-filter="cryptography">Cryptography</button>
      <button class="filter-btn" data-filter="machine-learning">Machine Learning</button>
      <button class="filter-btn" data-filter="verification">Formal Verification</button>
      <button class="filter-btn" data-filter="algorithms">Algorithms</button>
      <button class="filter-btn" data-filter="theory">Theory</button>
    </div>
  </div>

  <div class="projects-grid" id="projects-grid">
    {% assign projects = site.projects | sort: 'date' | reverse %}
    {% for project in projects %}
      <div class="project-card" data-categories="{{ project.tags | join: ',' }}">
        <div class="project-header">
          {% if project.status %}
            {% if project.status == 'completed' %}
              <span class="project-status status-completed">Completed</span>
            {% elsif project.status == 'in-progress' %}
              <span class="project-status status-in-progress">In Progress</span>
            {% else %}
              <span class="project-status status-planned">Planned</span>
            {% endif %}
          {% endif %}
          
          <h3 class="project-title">{{ project.title }}</h3>
          
          <div class="project-meta">
            {% if project.date %}
              <span><i class="fas fa-calendar"></i> {{ project.date | date: "%B %Y" }}</span>
            {% endif %}
            {% if project.difficulty %}
              <span><i class="fas fa-signal"></i> {{ project.difficulty }}</span>
            {% endif %}
          </div>
        </div>
        
        <div class="project-content">
          {% if project.tech_stack %}
            <div class="project-tech-stack">
              {% for tech in project.tech_stack %}
                <span class="tech-tag">{{ tech }}</span>
              {% endfor %}
            </div>
          {% endif %}
          
          <div class="project-excerpt">
            {{ project.excerpt | default: project.description | strip_html }}
          </div>
          
          <div class="project-actions">
            {% if project.url %}
              <a href="{{ project.url }}" class="project-btn btn-primary">View Project</a>
            {% endif %}
            {% if project.github %}
              <a href="{{ project.github }}" class="project-btn btn-outline">
                <i class="fab fa-github"></i> Code
              </a>
            {% endif %}
            {% if project.demo %}
              <a href="{{ project.demo }}" class="project-btn btn-outline">
                <i class="fas fa-external-link-alt"></i> Demo
              </a>
            {% endif %}
            {% if project.paper %}
              <a href="{{ project.paper }}" class="project-btn btn-outline">
                <i class="fas fa-file-alt"></i> Paper
              </a>
            {% endif %}
          </div>
        </div>
      </div>
    {% endfor %}
  </div>

  <div class="no-results" id="no-results" style="display: none;">
    <h3 class="text-2xl font-semibold mb-2">No Projects Found</h3>
    <p>Try selecting a different category or view all projects.</p>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const noResults = document.getElementById('no-results');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filter = this.dataset.filter;
      
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Filter projects
      let visibleCount = 0;
      
      projectCards.forEach(card => {
        const categories = card.dataset.categories.toLowerCase();
        
        if (filter === 'all' || categories.includes(filter.toLowerCase())) {
          card.style.display = 'flex';
          visibleCount++;
          // Add fade-in animation
          card.classList.add('fade-in');
          setTimeout(() => card.classList.remove('fade-in'), 500);
        } else {
          card.style.display = 'none';
        }
      });
      
      // Show/hide no results message
      if (visibleCount === 0) {
        noResults.style.display = 'block';
      } else {
        noResults.style.display = 'none';
      }
    });
  });
  
  // Add hover effects to project cards
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover-lift');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover-lift');
    });
  });
});
</script>