# Software Verification
---
layout: page
title: Software Verification and Validation
course_slug: software-verification
course_number: CS-5374
canvas_id: 70713
semester: Spring 2026
status: active
enrollment_term_id: 140
tags:
  - software-verification
  - software-engineering
  - testing
  - formal-methods
  - validation
  - computer-science
  - spring-2026
permalink: /courses/software-verification/
---

**Semester**: Spring 2026
**Status**: Active

{% comment %} Course data from _data/courses.yaml {% endcomment %}
{% assign course_data = site.data.courses | where: "slug", "software-verification" | first %}

## Course Information

- **Start Date**: January 14, 2026
- **End Date**: May 15, 2026
- **Time Zone**: America/Chicago
- **Syllabus**: [View on Canvas]({{ course_data.syllabus_url }})

## Description

Methods and techniques for verifying and validating software systems, including testing, formal methods, and quality assurance.

## Topics

- Software testing strategies
- Formal methods and model checking
- Specification and requirements analysis
- Continuous verification
- LangSmith and observability tools
- Integration testing
- Unit testing strategies
- Open source tools for testing/debugging AI/LLM/RL

## Resources

- [Course Blog Posts](/blog/?course=CS-5374%20Software%20Verification%20and%20Validation)
- Canvas Course: Course ID 70713

### LangSmith & Observability Tools

- **LangSmith**: [Official Website](https://www.langchain.com/langsmith) - LLM application observability and monitoring platform
- **LangSmith Documentation**: [Setup Instructions](https://docs.smith.langchain.com/) - Complete guide for getting started
- **LangSmith Setup Guide**: Available in course materials (`v0.1_LangSmith_Setup_Instructions-v1.pdf`)
- **LangSmith Hands-On Materials**: Download from Canvas module "LangSmith Tutorial + Hands-On Experiences"

### Open Source Testing Tools

- **Collection of Frameworks & Tools**: Available in course materials (`Collection_of_frameworks_tools_projects.pdf`)
- Covers tools for testing, debugging, and validating AI/LLM/RL systems
- Includes frameworks for unit testing, integration testing, and continuous verification

## External Resources – Textbooks

See course draft posts for recommended textbooks and reference materials.

---

## Student Planner

### Past Week & Upcoming Lectures

| Lecture # | Date | Title | Notes | Slides | Transcript | Media | Additional Resources |
|-----------|------|-------|-------|--------|------------|-------|---------------------|
| 1 | 2026-01-14 | Course Setup & Resources | ✓ | ✓ | | | [Syllabus PDF](https://texastech.instructure.com/courses/70713), [Mediasite Guide](https://texastech.instructure.com/courses/70713) |
| 2 | 2026-01-15 | Introduction to Software Testing | ✓ | ✓ | | | [Testing PDF](https://texastech.instructure.com/courses/70713/files/11826183) |
| 3 | 2026-01-17 | Open Source Tools for AI/LLM/RL | ✓ | ✓ | | | [Tools Collection PDF](https://texastech.instructure.com/courses/70713/files/11855957) |
| **Upcoming** | 2026-01-19 | TBD | | | | | |
| **Upcoming** | 2026-01-21 | TBD | | | | | |
| **Upcoming** | 2026-01-23 | TBD | | | | | |

### LangSmith Tutorial Materials

- **Setup Instructions**: `v0.1_LangSmith_Setup_Instructions-v1.pdf` (Downloaded)
- **Hands-On Code**: `langsmith.zip` (Downloaded)
- **External Links**:
  - [LangSmith Platform](https://www.langchain.com/langsmith)
  - [LangSmith Documentation](https://docs.smith.langchain.com/)

### Course Materials Location

All materials are organized in: `/coursework/Spring2026/software-verification/`

- **Syllabus**: `syllabus.yaml`
- **Agent Instructions**: `AGENT_INSTRUCTIONS.md`
- **Lecture Materials**: `_lectures/lecture-XX/`

### Canvas & Media Links

- **Canvas Course**: [View on Canvas](https://texastech.instructure.com/courses/70713)
- **Syllabus**: [View Syllabus]({{ course_data.syllabus_url }})
- **Media Site**: [Mediasite Channel](https://engrmediacast.ttu.edu/Mediasite/Channel/96542-cs5374-d01-namin-spring-2026)
- **Calendar Feed**: [iCal Feed]({{ course_data.calendar_ics }})

### Instructors

- **Primary Instructor**: Akbar Siami Namin
- **Co-Instructor**: Hasan Al-Qudah

---

## Related Content

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0;">

### Recent Drafts

{% assign course_drafts = site.drafts | where: "course", "Software Verification and Validation" | sort: "date" | reverse | limit: 5 %}
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

{% assign course_projects = site.projects | where: "course", "Software Verification and Validation" | sort: "date" | reverse | limit: 5 %}
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

{% assign course_posts = site.posts | where: "course", "Software Verification and Validation" | sort: "date" | reverse | limit: 5 %}
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
    <a href="/blog/?course=Software%20Verification%20and%20Validation" style="color: #3b82f6; text-decoration: none; font-size: 0.875rem; margin-top: 1rem; display: inline-block;">View All Posts →</a>
  </div>
{% else %}
  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #f8fafc; color: #64748b;">
    <h3 style="margin-top: 0; color: #1e293b;">Recent Posts</h3>
    <p style="margin: 0;">No posts available for this course.</p>
  </div>
{% endif %}

</div>
