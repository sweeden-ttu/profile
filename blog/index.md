---
layout: articles
title: Blog
description: Technical articles, research insights, and academic notes on computer science topics
keywords: [blog, technical articles, research, cryptography, machine learning, computer science]
---

<style>
  .blog-hero {
    background: var(--gradient-accent);
    padding: var(--space-8) 0;
    margin: calc(-1 * var(--space-6)) 0;
    text-align: center;
    color: white;
  }
  
  .blog-controls {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-6);
    align-items: center;
    margin: var(--space-8) 0;
  }
  
  .category-filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  
  .category-btn {
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
  
  .category-btn:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
    color: var(--color-primary-dark);
  }
  
  .category-btn.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-white);
  }
  
  .search-container {
    position: relative;
    min-width: 300px;
  }
  
  .search-input {
    width: 100%;
    padding: var(--space-3) var(--space-4) var(--space-3) var(--space-10);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    transition: var(--transition-all) var(--transition-normal);
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(230, 230, 250, 0.1);
  }
  
  .search-icon {
    position: absolute;
    left: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-gray-400);
  }
  
  .blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-6);
    margin: var(--space-8) 0;
  }
  
  .blog-card {
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
  
  .blog-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }
  
  .blog-image {
    width: 100%;
    height: 200px;
    background: var(--color-gray-100);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-gray-400);
    font-size: var(--font-size-sm);
    position: relative;
    overflow: hidden;
  }
  
  .blog-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .blog-content {
    padding: var(--space-6);
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .blog-meta {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
    font-size: var(--font-size-xs);
    color: var(--color-gray-500);
  }
  
  .blog-category {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
  }
  
  .blog-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-800);
    margin-bottom: var(--space-3);
    line-height: var(--line-height-tight);
  }
  
  .blog-excerpt {
    color: var(--color-gray-600);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-4);
    flex: 1;
  }
  
  .blog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-gray-100);
  }
  
  .read-time {
    font-size: var(--font-size-xs);
    color: var(--color-gray-500);
  }
  
  .read-link {
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
    text-decoration: none;
    transition: var(--transition-colors) var(--transition-normal);
  }
  
  .read-link:hover {
    color: var(--color-primary-dark);
    text-decoration: underline;
  }
  
  .stats-section {
    background: var(--color-gray-50);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    margin: var(--space-8) 0;
    text-align: center;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-6);
    margin-top: var(--space-4);
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-number {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary);
  }
  
  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    margin-top: var(--space-1);
  }
  
  .no-posts {
    text-align: center;
    padding: var(--space-12);
    color: var(--color-gray-500);
  }
  
  @media (max-width: 768px) {
    .blog-controls {
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }
    
    .search-container {
      min-width: auto;
    }
    
    .blog-grid {
      grid-template-columns: 1fr;
    }
    
    .category-filters {
      justify-content: stretch;
    }
    
    .category-btn {
      flex: 1;
      min-width: 100px;
    }
  }
</style>

<div class="blog-hero">
  <h1 class="text-4xl font-semibold mb-4">Technical Blog</h1>
  <p class="lead text-xl max-w-3xl mx-auto">
    Deep-dive articles exploring advanced computer science concepts, research findings, 
    and practical implementations across cryptography, machine learning, and formal methods.
  </p>
</div>

<div class="container">
  <div class="blog-controls">
    <div class="category-filters">
      <button class="category-btn active" data-category="all">All Posts</button>
      <button class="category-btn" data-category="cryptography">Cryptography</button>
      <button class="category-btn" data-category="machine-learning">Machine Learning</button>
      <button class="category-btn" data-category="verification">Software Verification</button>
      <button class="category-btn" data-category="theory">Theory</button>
      <button class="category-btn" data-category="algorithms">Algorithms</button>
    </div>
    
    <div class="search-container">
      <i class="fas fa-search search-icon"></i>
      <input type="text" class="search-input" placeholder="Search articles..." id="search-input">
    </div>
  </div>

  <div class="stats-section">
    <h2 class="text-2xl font-semibold mb-2">Blog Statistics</h2>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number" id="total-posts">{{ site.posts | size }}</div>
        <div class="stat-label">Total Posts</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="total-categories">6</div>
        <div class="stat-label">Categories</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="total-words">{{ site.posts | map: 'content' | join: ' ' | size | divided_by: 5 }}</div>
        <div class="stat-label">Word Count</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="latest-update">{{ site.posts | sort: 'date' | reverse | first | date: "%b %Y" }}</div>
        <div class="stat-label">Latest Update</div>
      </div>
    </div>
  </div>

  <div class="blog-grid" id="blog-grid">
    {% assign posts = site.posts | sort: 'date' | reverse %}
    {% for post in posts %}
      {% assign categories = post.tags | join: ',' | downcase %}
      <div class="blog-card" data-categories="{{ categories }}" data-title="{{ post.title | downcase }}" data-content="{{ post.content | strip_html | downcase }}">
        {% if post.image %}
          <div class="blog-image">
            <img src="{{ post.image }}" alt="{{ post.title }}" loading="lazy">
          </div>
        {% else %}
          <div class="blog-image">
            <i class="fas fa-file-alt fa-3x"></i>
          </div>
        {% endif %}
        
        <div class="blog-content">
          <div class="blog-meta">
            {% if post.tags.size > 0 %}
              <span class="blog-category">{{ post.tags[0] }}</span>
            {% endif %}
            <span><i class="fas fa-calendar"></i> {{ post.date | date: "%B %d, %Y" }}</span>
          </div>
          
          <h3 class="blog-title">
            <a href="{{ post.url }}" class="read-link">{{ post.title }}</a>
          </h3>
          
          <div class="blog-excerpt">
            {{ post.excerpt | strip_html | truncatewords: 30 }}
          </div>
          
          <div class="blog-footer">
            <span class="read-time">
              <i class="fas fa-clock"></i> 
              {{ post.content | number_of_words | divided_by: 200 | round }} min read
            </span>
            <a href="{{ post.url }}" class="read-link">Read More →</a>
          </div>
        </div>
      </div>
    {% endfor %}
  </div>

  <div class="no-posts" id="no-posts" style="display: none;">
    <h3 class="text-2xl font-semibold mb-2">No Posts Found</h3>
    <p>Try a different search term or category filter.</p>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  const searchInput = document.getElementById('search-input');
  const blogCards = document.querySelectorAll('.blog-card');
  const noPosts = document.getElementById('no-posts');
  const blogGrid = document.getElementById('blog-grid');
  
  let currentCategory = 'all';
  let currentSearch = '';
  
  function filterPosts() {
    let visibleCount = 0;
    
    blogCards.forEach(card => {
      const categories = card.dataset.categories;
      const title = card.dataset.title;
      const content = card.dataset.content;
      
      const categoryMatch = currentCategory === 'all' || categories.includes(currentCategory);
      const searchMatch = currentSearch === '' || 
                        title.includes(currentSearch) || 
                        content.includes(currentSearch);
      
      if (categoryMatch && searchMatch) {
        card.style.display = 'flex';
        visibleCount++;
        card.classList.add('fade-in');
        setTimeout(() => card.classList.remove('fade-in'), 500);
      } else {
        card.style.display = 'none';
      }
    });
    
    noPosts.style.display = visibleCount === 0 ? 'block' : 'none';
  }
  
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentCategory = this.dataset.category.toLowerCase();
      filterPosts();
    });
  });
  
  searchInput.addEventListener('input', function(e) {
    currentSearch = e.target.value.toLowerCase();
    filterPosts();
  });
  
  // Add hover effects
  blogCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover-lift');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover-lift');
    });
  });
});
</script>