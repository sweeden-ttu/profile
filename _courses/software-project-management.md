---
layout: page
title: Software Project Management
course_slug: software-project-management
course_number: CS-5363
canvas_id: 37196
semester: Summer 2025
status: completed
enrollment_term_id: 131
tags:
  - project-management
  - software-engineering
  - computer-science
  - summer-2025
permalink: /courses/software-project-management/
---

**Semester**: Summer 2025  
**Status**: Completed

{% comment %} Course data from _data/courses.yaml {% endcomment %}
{% assign course_data = site.data.courses | where: "slug", "software-project-management" | first %}

## Course Information

- **Start Date**: July 8, 2025
- **End Date**: August 8, 2025
- **Time Zone**: America/Chicago
- **Syllabus**: [View on Canvas]({{ course_data.syllabus_url }})

## Description

Principles and practices of software project management including planning, estimation, risk management, quality assurance, and team coordination.

## Topics

- Project planning and scheduling
- Effort estimation techniques
- Risk management
- Quality assurance processes
- Team coordination and communication
- Agile and traditional methodologies
- Project tracking and control

## Resources

- [Course Blog Posts](/blog/?course=Software%20Project%20Management)
- Canvas Course: Course ID 37196

---

## Related Content

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0;">

### Recent Drafts

{% assign course_drafts = site.drafts | where: "course", "Software Project Management" | sort: "date" | reverse | limit: 5 %}
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

{% assign course_projects = site.projects | where: "course", "Software Project Management" | sort: "date" | reverse | limit: 5 %}
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

{% assign course_posts = site.posts | where: "course", "Software Project Management" | sort: "date" | reverse | limit: 5 %}
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
    <a href="/blog/?course=Software%20Project%20Management" style="color: #3b82f6; text-decoration: none; font-size: 0.875rem; margin-top: 1rem; display: inline-block;">View All Posts →</a>
  </div>
{% else %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc; color: #64748b;">
    <h3 style="margin-top: 0; color: #1e293b;">Recent Posts</h3>
    <p style="margin: 0;">No posts available for this course.</p>
  </div>
{% endif %}

</div>
