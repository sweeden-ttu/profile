---
layout: default
title: Home
permalink: /
---

<div class="homepage">
  <section class="hero" aria-labelledby="hero-heading">
    <div class="hero__diagonal-accent" aria-hidden="true"></div>
    <div class="hero__container section__container">
      <div class="hero__content">
        <h1 id="hero-heading" class="hero__title">Scott Weeden</h1>
        <p class="hero__subtitle">Master of Computer Applications (MCA), Computer Science — Texas Tech University (March 2025)</p>
        <p class="hero__description">
          Making technology accessible. Based in Killeen, Texas. This site documents
          machine learning, cryptography, software verification, and related coursework.
        </p>
        <div class="hero__actions">
          <a href="/about/" class="btn btn--primary">About me</a>
          <a href="/research/" class="btn btn--secondary">Projects</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--featured-solutions" aria-labelledby="solutions-heading">
    <div class="section__container">
      <div class="section__header section__header--centered">
        <span class="section__label">Featured</span>
        <h2 id="solutions-heading" class="section__title">Recent assignment solutions</h2>
        <p class="section__description">Worked solutions with step-by-step explanations for recent coursework</p>
      </div>

      <div class="solutions-grid">
        <article class="solution-card">
          <header class="solution-card__header">
            <div class="solution-card__eyebrow">
              <span class="solution-card__eyebrow-icon" aria-hidden="true">📝</span>
              <span>Logic for Computer Scientists</span>
            </div>
            <h3 class="solution-card__title">Homework 3 solutions</h3>
          </header>
          <div class="solution-card__body">
            <ul class="solution-card__list">
              <li>Predicate logic trees and variable scoping</li>
              <li>Propositional proofs (Modus Ponens, Addition)</li>
              <li>CNF conversion with algebraic steps</li>
              <li>Predicate logic formalization</li>
            </ul>
            <div class="solution-card__actions">
              <a class="solution-card__btn solution-card__btn--primary" href="/assignments/logic-for-computer-scientists/homework3/logic-homework3-solutions">View solutions</a>
              <a class="solution-card__btn solution-card__btn--ghost" href="/assignments/logic-for-computer-scientists/homework3/logic-homework3">Problems</a>
            </div>
          </div>
        </article>

        <article class="solution-card">
          <header class="solution-card__header solution-card__header--alt">
            <div class="solution-card__eyebrow">
              <span class="solution-card__eyebrow-icon" aria-hidden="true">🧠</span>
              <span>Intelligent Systems</span>
            </div>
            <h3 class="solution-card__title">Assignment 4 solutions</h3>
          </header>
          <div class="solution-card__body">
            <ul class="solution-card__list">
              <li>Probability table sizes and sums</li>
              <li>Bayesian network representation</li>
              <li>D-separation and independence</li>
              <li>Variable elimination inference</li>
            </ul>
            <div class="solution-card__actions">
              <a class="solution-card__btn solution-card__btn--primary" href="/assignments/intelligent-systems/assignment4/intelligent-systems-assignment4-solutions">View solutions</a>
              <a class="solution-card__btn solution-card__btn--ghost" href="/assignments/intelligent-systems/assignment4/intelligent-systems-assignment4-problems">Problems</a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="quicklinks-heading">
    <div class="section__container">
      <div class="section__header section__header--centered">
        <span class="section__label">Explore</span>
        <h2 id="quicklinks-heading" class="section__title">Quick links</h2>
      </div>

      <div class="quick-links-grid">
        <a href="/courses/" class="quick-link-card">
          <h3>Courses</h3>
          <p>Course hubs for Cryptography, Software Verification, Logic, Intelligent Systems, and more.</p>
          <span class="quick-link-card__cta">View courses →</span>
        </a>

        <a href="/assignments/" class="quick-link-card">
          <h3>Assignments</h3>
          <p>Homework, assignments, and complete solutions with explanations.</p>
          <span class="quick-link-card__cta">View assignments →</span>
        </a>

        <a href="/blog/" class="quick-link-card">
          <h3>Blog</h3>
          <p>Technical notes on CS topics, course write-ups, and learning notes.</p>
          <span class="quick-link-card__cta">Read blog →</span>
        </a>
      </div>
    </div>
  </section>

  <section class="section section--surface-soft" aria-labelledby="courses-heading">
    <div class="section__container">
      <div class="section__header section__header--centered">
        <span class="section__label">Spring 2026</span>
        <h2 id="courses-heading" class="section__title">Current courses</h2>
        <p class="section__description">Active courses this semester with posts and assignments</p>
      </div>

      <div class="courses-preview-grid">
        <div class="course-preview-card">
          <h3>Cryptography</h3>
          <p>
            Advanced cryptographic systems, security protocols, and modern encryption techniques.
          </p>
          <div class="course-preview-card__links">
            <a href="/blog/?course=Cryptography">View posts</a>
            <a href="/courses/cryptography/">Course page</a>
          </div>
        </div>

        <div class="course-preview-card">
          <h3>Software Verification and Validation</h3>
          <p>
            Software testing, formal methods, model checking, and quality assurance.
          </p>
          <div class="course-preview-card__links">
            <a href="/blog/?course=Software%20Verification%20and%20Validation">View posts</a>
            <a href="/courses/software-verification/">Course page</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="posts-heading">
    <div class="section__container">
      <div class="section__header section__header--centered">
        <span class="section__label">Latest</span>
        <h2 id="posts-heading" class="section__title">Recent blog posts</h2>
        <p class="section__description">Articles on course topics, research, and technical notes</p>
      </div>

      {% assign recent_posts = site.posts | limit: 6 %}
      {% if recent_posts.size > 0 %}
        <div class="blog-preview-grid">
          {% for post in recent_posts %}
            <article class="blog-preview-card">
              <div class="blog-preview-card__meta">
                <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %d, %Y" }}</time>
                {% if post.course %}
                  <span class="blog-preview-card__badge">{{ post.course }}</span>
                {% endif %}
              </div>
              <h3>
                <a href="{{ post.url }}">{{ post.title }}</a>
              </h3>
              {% if post.excerpt %}
                <p>{{ post.excerpt | strip_html | truncatewords: 20 }}</p>
              {% endif %}
            </article>
          {% endfor %}
        </div>
        <div class="section__footer-actions">
          <a href="/blog/" class="btn btn--primary">View all posts →</a>
        </div>
      {% endif %}
    </div>
  </section>
</div>
