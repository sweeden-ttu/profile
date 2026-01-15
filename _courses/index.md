---
layout: page
title: Courses
permalink: /courses/
---

# Courses

An overview of all courses I'm taking or have taken, organized by semester and topic.

{% comment %} Course data from _data/courses.yaml {% endcomment %}

---

## Current Courses (Spring 2026)

{% assign current_courses = site.data.courses | where: "status", "active" %}
<div class="courses-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
{% for course in current_courses %}
{% unless course.slug == "general" %}
<div class="course-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff; transition: transform 0.2s, box-shadow 0.2s;">
  <h3 style="margin-top: 0; color: #1e293b;">{{ course.display_name }}</h3>
  <p style="color: #64748b; font-size: 0.9rem; margin: 0.5rem 0;">{{ course.semester }}</p>
  <p style="color: #475569; font-size: 0.95rem;">{{ course.description | truncatewords: 15 }}</p>
  <div style="display: flex; gap: 1rem; margin-top: 1rem;">
    <a href="/courses/{{ course.slug }}/" style="color: #3b82f6; text-decoration: none; font-weight: 500;">Course Page →</a>
    <a href="/blog/?course={{ course.display_name | url_encode }}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">Posts →</a>
  </div>
</div>
{% endunless %}
{% endfor %}
</div>

---

## Previous Courses

### Fall 2025

{% assign fall_2025_courses = site.data.courses | where: "semester", "Fall 2025" %}
<div class="courses-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
{% for course in fall_2025_courses %}
<div class="course-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff; transition: transform 0.2s, box-shadow 0.2s;">
  <h3 style="margin-top: 0; color: #1e293b;">{{ course.display_name }}</h3>
  <p style="color: #64748b; font-size: 0.9rem; margin: 0.5rem 0;">{{ course.semester }} <span style="background: #10b981; color: white; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">Completed</span></p>
  <p style="color: #475569; font-size: 0.95rem;">{{ course.description | truncatewords: 15 }}</p>
  <a href="/blog/?course={{ course.display_name | url_encode }}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">View Posts →</a>
</div>
{% endfor %}
</div>

### Summer 2025

{% assign summer_2025_courses = site.data.courses | where: "semester", "Summer 2025" %}
<div class="courses-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
{% for course in summer_2025_courses %}
<div class="course-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: #ffffff; transition: transform 0.2s, box-shadow 0.2s;">
  <h3 style="margin-top: 0; color: #1e293b;">{{ course.display_name }}</h3>
  <p style="color: #64748b; font-size: 0.9rem; margin: 0.5rem 0;">{{ course.semester }} <span style="background: #10b981; color: white; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">Completed</span></p>
  <p style="color: #475569; font-size: 0.95rem;">{{ course.description | truncatewords: 15 }}</p>
  <a href="/blog/?course={{ course.display_name | url_encode }}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">View Posts →</a>
</div>
{% endfor %}
</div>

---

## All Courses

<div style="overflow-x: auto; margin: 2rem 0;">
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background: #f8fafc;">
      <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0;">Course</th>
      <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0;">Semester</th>
      <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0;">Status</th>
      <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0;">Links</th>
    </tr>
  </thead>
  <tbody>
    {% for course in site.data.courses %}
    {% unless course.slug == "general" %}
    <tr>
      <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0;">{{ course.display_name }}</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0;">{{ course.semester }}</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0;">
        {% if course.completed %}
        <span style="background: #10b981; color: white; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Completed</span>
        {% else %}
        <span style="background: #3b82f6; color: white; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Active</span>
        {% endif %}
      </td>
      <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0;">
        <a href="/blog/?course={{ course.display_name | url_encode }}" style="color: #3b82f6; text-decoration: none;">Blog Posts</a>
        {% if course.syllabus_url %}
        | <a href="{{ course.syllabus_url }}" style="color: #3b82f6; text-decoration: none;">Syllabus</a>
        {% endif %}
      </td>
    </tr>
    {% endunless %}
    {% endfor %}
  </tbody>
</table>
</div>

---

## Notes

- Course materials and assignments are organized by semester
- Blog posts for each course can be filtered using the course filter on the [Blog](/blog/) page
- All course data is stored in `_data/courses.yaml`
