---
layout: page
title: Assignments
permalink: /assignments/
---

# Course Assignments

Browse assignments organized by course.

---

{% for course in site.data.courses %}
{% unless course.slug == "general" %}
{% assign course_assignments = site.assignments | where: "course_slug", course.slug %}
{% if course_assignments.size > 0 %}

## {{ course.display_name }}

**Semester**: {{ course.semester }}

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1rem 0 2rem 0;">
{% for assignment in course_assignments %}
<a href="{{ assignment.url }}" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; background: #ffffff; text-decoration: none; color: inherit; display: block;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
    <span style="background: {% if assignment.is_solution %}#10b981{% else %}#3b82f6{% endif %}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
      {% if assignment.is_solution %}Solution{% else %}{{ assignment.assignment_type | default: "Assignment" | capitalize }}{% endif %}
    </span>
    {% if assignment.assignment_number %}
    <span style="color: #64748b; font-size: 0.875rem;">#{{ assignment.assignment_number }}</span>
    {% endif %}
  </div>
  <h4 style="margin: 0.5rem 0; color: #1e293b; font-size: 1rem;">{{ assignment.title | remove: course.display_name | remove: " – " | remove: " - " }}</h4>
</a>
{% endfor %}
</div>

{% endif %}
{% endunless %}
{% endfor %}

---

## Browse by Course

{% for course in site.data.courses %}
{% unless course.slug == "general" %}
- [{{ course.display_name }}](/courses/{{ course.slug }}/) ({{ course.semester }})
{% endunless %}
{% endfor %}
