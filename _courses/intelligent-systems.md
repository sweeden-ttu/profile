---
layout: page
title: Intelligent Systems
course_slug: intelligent-systems
course_number: CS-5368
canvas_id: 58606
semester: Fall 2025
status: completed
enrollment_term_id: 134
tags:
  - artificial-intelligence
  - machine-learning
  - computer-science
  - fall-2025
permalink: /courses/intelligent-systems/
---

**Semester**: Fall 2025
**Status**: Completed

{% comment %} Course data from _data/courses.yaml {% endcomment %}
{% assign course_data = site.data.courses | where: "slug", "intelligent-systems" | first %}

## Course Information

- **Start Date**: August 25, 2025
- **End Date**: December 15, 2025
- **Time Zone**: America/Chicago
- **Syllabus**: [View on Canvas]({{ course_data.syllabus_url }})

## Description

Introduction to artificial intelligence including search algorithms, game playing, constraint satisfaction, Bayesian networks, probabilistic reasoning, and reinforcement learning.

## Topics

- Search algorithms and game playing
- Constraint satisfaction problems
- Probabilistic reasoning
- Bayesian networks
- Machine learning fundamentals
- Reinforcement learning

## Resources

- [Course Blog Posts](/blog/?course=Intelligent%20Systems)
- Canvas Course: Course ID 58606

---

## Assignments

{% assign course_assignments = site.assignments | where: "course_slug", "intelligent-systems" %}
{% if course_assignments.size > 0 %}
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1rem 0;">
{% for assignment in course_assignments %}
<a href="{{ assignment.url }}" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; background: #ffffff; text-decoration: none; color: inherit; display: block; transition: transform 0.2s, box-shadow 0.2s;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
    <span style="background: {% if assignment.is_solution %}#10b981{% else %}#3b82f6{% endif %}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
      {% if assignment.is_solution %}Solution{% else %}{{ assignment.assignment_type | default: "Assignment" | capitalize }}{% endif %}
    </span>
    {% if assignment.assignment_number %}
    <span style="color: #64748b; font-size: 0.875rem;">#{{ assignment.assignment_number }}</span>
    {% endif %}
  </div>
  <h4 style="margin: 0.5rem 0; color: #1e293b; font-size: 1rem;">{{ assignment.title }}</h4>
</a>
{% endfor %}
</div>
{% else %}
<p style="color: #64748b;">No assignments available for this course.</p>
{% endif %}

**PDF Materials:**
- [Assignment 3 Problems (PDF)](/assignments/intelligent-systems/assignment3/intelligent-systems-assignment3-problems.pdf)
- [Assignment 4 Problems (PDF)](/assignments/intelligent-systems/assignment4/CS5368_Fa25_Ass4_ProblemSolving-1.pdf)

---

## Related Content

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0;">

### Recent Drafts

{% assign course_drafts = site.drafts | where: "course", "Intelligent Systems" | sort: "date" | reverse | limit: 5 %}
{% if course_drafts.size > 0 %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff;">
    <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">Recent Drafts</h3>
    <ul style="list-style: none; padding: 0; margin: 1rem 0 0 0;">
      {% for draft in course_drafts %}
        <li style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9;">
          {% if draft.url %}
            <a href="{{ draft.url }}" style="color: #3b82f6; text-decoration: none; font-weight: 500; display: block;">
              {{ draft.title }}
            </a>
          {% else %}
            <span style="color: #1e293b; font-weight: 500; display: block;">{{ draft.title }}</span>
            <span style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 0.25rem;">(Draft)</span>
          {% endif %}
          {% if draft.date %}
            <time style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.25rem;">
              {{ draft.date | date: "%B %d, %Y" }}
            </time>
          {% endif %}
        </li>
      {% endfor %}
    </ul>
  </div>
{% else %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc; color: #64748b;">
    <h3 style="margin-top: 0; color: #1e293b;">Recent Drafts</h3>
    <p style="margin: 0;">No drafts available for this course.</p>
  </div>
{% endif %}

### Recent Projects

{% assign course_projects = site.projects | where: "course", "Intelligent Systems" | sort: "date" | reverse | limit: 5 %}
{% if course_projects.size > 0 %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff;">
    <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">Recent Projects</h3>
    <ul style="list-style: none; padding: 0; margin: 1rem 0 0 0;">
      {% for project in course_projects %}
        <li style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9;">
          <a href="{{ project.url }}" style="color: #3b82f6; text-decoration: none; font-weight: 500; display: block;">
            {{ project.title }}
          </a>
          {% if project.date %}
            <time style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.25rem;">
              {{ project.date | date: "%B %d, %Y" }}
            </time>
          {% endif %}
        </li>
      {% endfor %}
    </ul>
    <a href="/projects/" style="color: #3b82f6; text-decoration: none; font-size: 0.875rem; margin-top: 1rem; display: inline-block;">View All Projects →</a>
  </div>
{% else %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc; color: #64748b;">
    <h3 style="margin-top: 0; color: #1e293b;">Recent Projects</h3>
    <p style="margin: 0;">No projects available for this course.</p>
  </div>
{% endif %}

### Recent Posts

{% assign course_posts = site.posts | where: "course", "Intelligent Systems" | sort: "date" | reverse | limit: 5 %}
{% if course_posts.size > 0 %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff;">
    <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">Recent Posts</h3>
    <ul style="list-style: none; padding: 0; margin: 1rem 0 0 0;">
      {% for post in course_posts %}
        <li style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9;">
          <a href="{{ post.url }}" style="color: #3b82f6; text-decoration: none; font-weight: 500; display: block;">
            {{ post.title }}
          </a>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
            {% if post.date %}
              <time style="color: #64748b; font-size: 0.875rem;">
                {{ post.date | date: "%B %d, %Y" }}
              </time>
            {% endif %}
            {% if post.reading_time %}
              <span style="color: #64748b; font-size: 0.875rem;">{{ post.reading_time }} min read</span>
            {% endif %}
          </div>
          {% if post.excerpt %}
            <p style="color: #64748b; font-size: 0.875rem; margin: 0.5rem 0 0 0;">
              {{ post.excerpt | strip_html | truncatewords: 15 }}
            </p>
          {% endif %}
        </li>
      {% endfor %}
    </ul>
    <a href="/blog/?course=Intelligent%20Systems" style="color: #3b82f6; text-decoration: none; font-size: 0.875rem; margin-top: 1rem; display: inline-block;">View All Posts →</a>
  </div>
{% else %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc; color: #64748b;">
    <h3 style="margin-top: 0; color: #1e293b;">Recent Posts</h3>
    <p style="margin: 0;">No posts available for this course.</p>
  </div>
{% endif %}

</div>
