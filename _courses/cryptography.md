---
layout: page
title: Cryptography
course_slug: cryptography
course_number: CS-6343
canvas_id: 70714
semester: Spring 2026
status: active
enrollment_term_id: 140
tags:
  - cryptography
  - security
  - encryption
  - computer-science
  - spring-2026
permalink: /courses/cryptography/
---

**Semester**: Spring 2026  
**Status**: Active

{% comment %} Course data from _data/courses.yaml {% endcomment %}
{% assign course_data = site.data.courses | where: "slug", "cryptography" | first %}

## Course Information

- **Start Date**: January 14, 2026
- **End Date**: May 15, 2026
- **Time Zone**: America/Chicago
- **Syllabus**: [View on Canvas]({{ course_data.syllabus_url }})

## Description

Advanced study of cryptographic systems, security protocols, and modern encryption techniques.

## Topics

- Symmetric and asymmetric encryption
- Hash functions and digital signatures
- Public key cryptography (RSA, Diffie-Hellman)
- Number theory foundations
- Attack models and security goals
- Block ciphers and modes of operation

## Resources

- [Course blog — filtered by Cryptography](/blog/?course=Cryptography)
- [Latest cryptography posts on this page](#cryptography-course-posts) (below)
- Canvas Course: Course ID 70714

## External Resources – Textbooks

See course draft posts for recommended textbooks and reference materials.

---

## Student Planner

### Past Week & Upcoming Lectures

| Lecture # | Date | Title | Notes | Slides | Transcript | Media | Additional Resources |
|-----------|------|-------|-------|--------|------------|-------|---------------------|
| 1 | 2026-01-15 | Introduction to Cryptography | | | | | |
| 2 | 2026-01-22 | Number Theory Foundations | | | | | |
| **Upcoming** | 2026-01-29 | Symmetric Encryption | | | | | |
| **Upcoming** | 2026-02-05 | Public Key Encryption / RSA | | | | | |

### Course Materials Location

All materials are organized in: `/coursework/Spring2026/cryptography/`

- **Syllabus**: `syllabus.yaml`
- **Agent Instructions**: `AGENT_INSTRUCTIONS.md`
- **Lecture Materials**: `_lectures/lecture-XX/`

### Canvas & Media Links

- **Canvas Course**: [View on Canvas](https://texastech.instructure.com/courses/70714)
- **Syllabus**: [View Syllabus]({{ course_data.syllabus_url }})
- **Calendar Feed**: [iCal Feed]({{ course_data.calendar_ics }})

---

## Related Content

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0;">

{% comment %}Cryptography posts: site.posts is newest-first; where preserves order{% endcomment %}
{% assign course_posts = site.posts | where: "course", "Cryptography" | limit: 15 %}
{% if course_posts.size > 0 %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff;">
    <h3 id="cryptography-course-posts" style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">Latest cryptography blog posts</h3>
    <ul style="list-style: none; padding: 0; margin: 1rem 0 0 0;">
      {% for post in course_posts %}
        <li style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9;">
          <a href="{{ post.url }}" style="color: #3b82f6; text-decoration: none; font-weight: 500; display: block;">
            {{ post.title }}
          </a>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
            {% if post.date %}
              <time datetime="{{ post.date | date_to_xmlschema }}" style="color: #64748b; font-size: 0.875rem;">
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
    <a href="/blog/?course=Cryptography" style="color: #3b82f6; text-decoration: none; font-size: 0.875rem; margin-top: 1rem; display: inline-block;">View all Cryptography posts on the blog →</a>
  </div>
{% else %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc; color: #64748b;">
    <h3 id="cryptography-course-posts" style="margin-top: 0; color: #1e293b;">Latest cryptography blog posts</h3>
    <p style="margin: 0;">No posts available for this course.</p>
  </div>
{% endif %}

### Recent Drafts

{% assign course_drafts = site.drafts | where: "course", "Cryptography" | sort: "date" | reverse | limit: 5 %}
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

{% assign course_projects = site.projects | where: "course", "Cryptography" | sort: "date" | reverse | limit: 5 %}
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

</div>
