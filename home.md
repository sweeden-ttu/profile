---
layout: default
title: Home
permalink: /
---

<div class="homepage">
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero__container section__container">
      <div class="hero__content">
        <h1 class="hero__title">Scott Weeden</h1>
        <p class="hero__subtitle">Computer Science Student & ML Researcher</p>
        <p class="hero__description">
          Master's student at Texas Tech University exploring machine learning, 
          cryptography, and software verification. Documenting my academic journey 
          through research, projects, and course work.
        </p>
        <div class="hero__actions">
          <a href="/about/" class="button button--primary">About Me</a>
          <a href="/research/" class="button button--secondary">Projects</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Quick Links Section -->
  <section class="section">
    <div class="section__container">
      <div class="section__header section__header--centered">
        <span class="section__label">Explore</span>
        <h2 class="section__title">Quick Links</h2>
      </div>

      <div class="quick-links-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 3rem;">
        <a href="/courses/" class="quick-link-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 2rem; background: #ffffff; text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s; display: block;">
          <h3 style="margin-top: 0; color: #1e293b;">📚 Courses</h3>
          <p style="color: #64748b; margin: 0.5rem 0 0 0;">View all courses including Cryptography, Software Verification, Logic, and Intelligent Systems</p>
          <span style="color: #3b82f6; font-weight: 500; margin-top: 1rem; display: inline-block;">View Courses →</span>
        </a>

        <a href="/research/" class="quick-link-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 2rem; background: #ffffff; text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s; display: block;">
          <h3 style="margin-top: 0; color: #1e293b;">🔬 Projects & Assignments</h3>
          <p style="color: #64748b; margin: 0.5rem 0 0 0;">Browse academic projects, assignments, and research work</p>
          <span style="color: #3b82f6; font-weight: 500; margin-top: 1rem; display: inline-block;">View Projects →</span>
        </a>

        <a href="/blog/" class="quick-link-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 2rem; background: #ffffff; text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s; display: block;">
          <h3 style="margin-top: 0; color: #1e293b;">📝 Blog</h3>
          <p style="color: #64748b; margin: 0.5rem 0 0 0;">Technical articles on CS topics, course notes, and learning insights</p>
          <span style="color: #3b82f6; font-weight: 500; margin-top: 1rem; display: inline-block;">Read Blog →</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Current Courses Section -->
  <section class="section" style="background: #f8fafc;">
    <div class="section__container">
      <div class="section__header section__header--centered">
        <span class="section__label">Spring 2026</span>
        <h2 class="section__title">Current Courses</h2>
        <p class="section__description">Active courses this semester with blog posts and assignments</p>
      </div>

      <div class="courses-preview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem;">
        
        <div class="course-preview-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 2rem; background: #ffffff;">
          <h3 style="margin-top: 0; color: #1e293b;">CS-6343 Cryptography</h3>
          <p style="color: #64748b; font-size: 0.95rem; margin: 0.5rem 0 1rem 0;">
            Advanced cryptographic systems, security protocols, and modern encryption techniques.
          </p>
          <div style="margin: 1rem 0;">
            <a href="/blog/?course=CS-6343%20Cryptography" style="color: #3b82f6; text-decoration: none; font-weight: 500; margin-right: 1rem;">View Posts →</a>
            <a href="/courses/#cs-6343" style="color: #64748b; text-decoration: none;">Course Details →</a>
          </div>
        </div>

        <div class="course-preview-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 2rem; background: #ffffff;">
          <h3 style="margin-top: 0; color: #1e293b;">CS-5374 Software Verification</h3>
          <p style="color: #64748b; font-size: 0.95rem; margin: 0.5rem 0 1rem 0;">
            Software testing, formal methods, model checking, and quality assurance.
          </p>
          <div style="margin: 1rem 0;">
            <a href="/blog/?course=CS-5374%20Software%20Verification%20and%20Validation" style="color: #3b82f6; text-decoration: none; font-weight: 500; margin-right: 1rem;">View Posts →</a>
            <a href="/courses/#cs-5374" style="color: #64748b; text-decoration: none;">Course Details →</a>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Recent Assignments Section -->
  <section class="section">
    <div class="section__container">
      <div class="section__header">
        <span class="section__label">Academic Work</span>
        <h2 class="section__title">Recent Assignments & Projects</h2>
        <p class="section__description">Latest problem sets, homework solutions, and course projects</p>
      </div>

      <div class="assignments-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
        
        <a href="/projects/intelligent-systems-assignment4-problems" class="assignment-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff; text-decoration: none; color: inherit; display: block; transition: transform 0.2s, box-shadow 0.2s;">
          <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-right: 0.75rem;">CS-5368</span>
            <span style="color: #64748b; font-size: 0.875rem;">Assignment 4</span>
          </div>
          <h4 style="margin: 0.5rem 0; color: #1e293b;">Problem Solving</h4>
          <p style="color: #64748b; font-size: 0.9rem; margin: 0;">Probabilities, Bayesian Networks, and Inference</p>
        </a>

        <a href="/projects/intelligent-systems-assignment4-solutions" class="assignment-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff; text-decoration: none; color: inherit; display: block; transition: transform 0.2s, box-shadow 0.2s;">
          <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
            <span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-right: 0.75rem;">CS-5368</span>
            <span style="color: #64748b; font-size: 0.875rem;">Solutions</span>
          </div>
          <h4 style="margin: 0.5rem 0; color: #1e293b;">Assignment 4 Solutions</h4>
          <p style="color: #64748b; font-size: 0.9rem; margin: 0;">Complete solutions with explanations</p>
        </a>

        <a href="/projects/logic-homework3" class="assignment-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff; text-decoration: none; color: inherit; display: block; transition: transform 0.2s, box-shadow 0.2s;">
          <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
            <span style="background: #8b5cf6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-right: 0.75rem;">CS-5384</span>
            <span style="color: #64748b; font-size: 0.875rem;">Homework 3</span>
          </div>
          <h4 style="margin: 0.5rem 0; color: #1e293b;">Logic Problems</h4>
          <p style="color: #64748b; font-size: 0.9rem; margin: 0;">Propositional logic and Herbrand semantics</p>
        </a>

        <a href="/projects/intelligent-systems-assignment3-problems" class="assignment-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff; text-decoration: none; color: inherit; display: block; transition: transform 0.2s, box-shadow 0.2s;">
          <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-right: 0.75rem;">CS-5368</span>
            <span style="color: #64748b; font-size: 0.875rem;">Assignment 3</span>
          </div>
          <h4 style="margin: 0.5rem 0; color: #1e293b;">Problem Solving</h4>
          <p style="color: #64748b; font-size: 0.9rem; margin: 0;">RL, TD learning, and Q-learning</p>
        </a>

      </div>

      <div style="text-align: center; margin-top: 2rem;">
        <a href="/research/" class="button button--secondary">View All Projects →</a>
      </div>
    </div>
  </section>

  <!-- Recent Blog Posts Section -->
  <section class="section" style="background: #f8fafc;">
    <div class="section__container">
      <div class="section__header section__header--centered">
        <span class="section__label">Latest</span>
        <h2 class="section__title">Recent Blog Posts</h2>
        <p class="section__description">Latest articles on course topics, research, and technical insights</p>
      </div>

      {% assign recent_posts = site.posts | limit: 6 %}
      {% if recent_posts.size > 0 %}
        <div class="blog-preview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem;">
          {% for post in recent_posts %}
            <article class="blog-preview-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 0.875rem; color: #64748b;">
                <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %d, %Y" }}</time>
                {% if post.course %}
                  <span style="background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 4px;">{{ post.course }}</span>
                {% endif %}
              </div>
              <h3 style="margin: 0 0 0.5rem 0;">
                <a href="{{ post.url }}" style="color: #1e293b; text-decoration: none;">{{ post.title }}</a>
              </h3>
              {% if post.excerpt %}
                <p style="color: #64748b; font-size: 0.9rem; margin: 0;">{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
              {% endif %}
            </article>
          {% endfor %}
        </div>
        <div style="text-align: center; margin-top: 2rem;">
          <a href="/blog/" class="button button--primary">View All Posts →</a>
        </div>
      {% endif %}
    </div>
  </section>
</div>
