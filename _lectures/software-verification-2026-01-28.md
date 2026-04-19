---
layout: page
title: "OpenSource Tools for Testing/Debugging AI/LLM/RL"
course: "Software Verification and Validation"
course_slug: "software-verification"
course_number: "CS-5374"
date: 2026-01-28
lecture_number: 3
permalink: /lectures/software-verification/2026-01-28/
tags:
  - software-verification
  - spring-2026
---

{% comment %} Load course and lecture data from YAML {% endcomment %}
{% assign course_data = site.data.courses | where: "slug", page.course_slug | first %}
{% assign lecture_data = site.data.lectures.lectures | where: "course", page.course_slug | where: "date", page.date | first %}

# OpenSource Tools for Testing/Debugging AI/LLM/RL

**Course**: Software Verification and Validation (CS-5374)  
**Date**: January 28, 2026  
**Lecture Number**: 3

{% if lecture_data %}
## Lecture Information

**Status**: {{ lecture_data.status | capitalize }}  
{% if lecture_data.module_name %}**Module**: {{ lecture_data.module_name }}{% endif %}

### Topics Covered

{% for topic in lecture_data.topics %}
- {{ topic }}
{% endfor %}

## Materials

### Slides and Notes

{% if lecture_data.files.size > 0 %}
{% for file in lecture_data.files %}
- **[[{{ file.filename }}]({{ file.local_path }})]**
  - Type: {{ file.type | capitalize }}
  - [View on Canvas]({{ file.canvas_url }})
{% endfor %}
{% else %}
*No files available yet.*
{% endif %}

### Video

{% if lecture_data.video.available %}
- [Watch Video]({{ lecture_data.video.url }})
- Local: {{ lecture_data.video.local_path }}
{% else %}
*Video not available.*
{% endif %}

### Transcript

{% if lecture_data.transcript.available %}
- [View Transcript]({{ lecture_data.transcript.local_path }})
{% else %}
*Transcript not available.*
{% endif %}

## Course Links

- [Canvas Course]({{ course_data.canvas_url }})
- [Syllabus]({{ course_data.syllabus_url }})
{% if course_data.media_site_url %}
- [Media Site]({{ course_data.media_site_url }})
{% endif %}
- [Course Page]({{ course_data.landing_pages.course_page }})

{% else %}
## Lecture Information

*Lecture data is being processed. Please check back soon.*

## Course Links

- [Canvas Course]({{ course_data.canvas_url }})
- [Syllabus]({{ course_data.syllabus_url }})
- [Course Page]({{ course_data.landing_pages.course_page }})
{% endif %}

---

## Notes

This lecture page is automatically generated from YAML data files. The content is updated when agents download materials from Canvas LMS.

**Data Sources**:
- Course info: `coursework/Spring2026/software-verification/_data/course_info.yaml`
- Lecture data: `coursework/Spring2026/software-verification/_data/lectures.yaml`
