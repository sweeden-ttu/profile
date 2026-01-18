# Lecture and Course Notes (as a blog post)

This is an automated proof checking system that verifies notes taken during course lectures against textbook materials, institutional and foundational knowledge regarding the topic, and presents each lecture in a 15-30 minute blog post format that is geared towards graduate students who are researching advanced topics in computer science. Each blog entry performs a deep-dive into examples that are worked in class, presents the material using various markdown enhancements and extensions,  provides links to research articles, IEEE publications, and institutional publications related to the research of the professor instructing the course. Each course should have an introduction and about page of the instructor. The system integrates with Canvas LMS API 

## Quick Start

1. **Read the Instructions**: Start with `BLOG_POST_GENERATION_INSTRUCTIONS.md`
2. **Reference Course Data**: Use `_data/courses.yaml` for course metadata
3. **Follow Workflow**: Content extraction → Lesson plan → Drafting → Review
4. **Review Quality**: Use quality checklists for validation

## System Architecture

### Core Workflow

1. **Content Extraction** - Extract all information from PDFs, transcripts, metadata
2. **Lesson Plan Generation** - Create comprehensive lesson plan covering all topics
3. **Content Creation** - Generate complete blog post draft (15-minute reading time)
4. **Review** - Review work against quality checklists
5. **Refinement** - Address feedback and improve iteratively
6. **Publication** - Move from `_drafts/` to `_posts/`

## Key Documents

### `BLOG_POST_GENERATION_INSTRUCTIONS.md`
Comprehensive instructions covering:
- Course data reference (`_data/courses.yaml`)
- File naming convention: `YYYY-MM-DD-{course-slug}-{lecture-title}.md`  and the date should reflect date of the lecture which is being covered
- Content extraction guidelines
- Lesson plan generation
- Content creation standards
- Quality checklists
- Course-specific requirements

### `_data/courses.yaml`
Single source of truth for course metadata:
- Course display names (user-facing)
- Course slugs (for file names and URLs)
- Course numbers (internal/agent use only)
- Canvas IDs (for MCP lookups)
- Semester information

### `QUALITY_CHECKLIST.md`
Comprehensive checklists for:
- Accuracy validation
- Completeness validation
- Readability validation
- Visual elements validation
- Structure validation

## File Naming Convention

Blog posts follow this naming pattern:
```
YYYY-MM-DD-{course-slug}-{lecture-title}.md

Where there should be one blog post per lecture 
```

**Examples:**
- `2026-01-20-cryptography-symmetric-encryption-basics.md`
- `2025-12-01-logic-for-computer-scientists-temporal-logic-ltl.md`
- `2025-11-15-intelligent-systems-bayesian-networks.md`


blog-generation-workspace/
├── logic-for-computer-scientists/      # Uses course slug
│   ├── lectures/
│   │   ├── 2025-12-01-temporal-logic/
│   │   │   ├── extracted-content.json
│   │   │   ├── lesson-plan.md
│   │   │   ├── draft-v1.md
│   │   │   └── final-post.md
│   │   └── ...
│   ├── assets/
│   └── metadata.json
├── intelligent-systems/                 # Uses course slug
│   ├── lectures/
│   ├── assets/
│   └── metadata.json
├── cryptography/                        # Spring 2026
├── software-verification/               # Spring 2026
└── shared/
    └── quality-checklist.md
```

## Quality Standards

### Quantitative Targets
- **Reading Time**: 15 minutes (±2 minutes)
- **Word Count**: 2000-2500 words
- **Diagrams**: At least 1 per major topic
- **Examples**: At least 2-3 per major concept
- **External Resources**: 3-5 high-quality links

### Qualitative Standards
- **Accuracy**: All information verified against source materials
- **Completeness**: All topics from lecture covered
- **Readability**: Clear, logical flow, appropriate technical level
- **Visual Quality**: Diagrams and tables enhance understanding

## Course Reference

All course information is in `_data/courses.yaml`:

| Display Name | Slug | Semester |
|--------------|------|----------|
| Cryptography | cryptography | Spring 2026 |
| Software Verification and Validation | software-verification | Spring 2026 |
| Intelligent Systems | intelligent-systems | Fall 2025 |
| Logic for Computer Scientists | logic-for-computer-scientists | Fall 2025 |
| Theory of Automata | theory-of-automata | Fall 2025 |
| Analysis of Algorithms | analysis-of-algorithms | Summer 2025 |
| Software Project Management | software-project-management | Summer 2025 |
| Machine Learning Security | machine-learning-security | Summer 2025 |

## Usage

### Creating a New Blog Post

1. Reference `_data/courses.yaml` for course metadata
2. Extract content from lecture materials
3. Create lesson plan
4. Draft blog post following quality standards
5. Review against checklists
6. Name file: `YYYY-MM-DD-{course-slug}-{lecture-title}.md`
7. Place in `_drafts/` for review or `_posts/` for publication

### Front Matter Template

```yaml
---
layout: post
title: "Descriptive Title (no course numbers)"
date: YYYY-MM-DD
categories: [category1, category2]
tags: [tag1, tag2, tag3]
excerpt: "One-sentence summary (50-100 words)"
reading_time: 15
course: "Course Display Name"
course_slug: "course-slug"
---
```

## Best Practices

- Always use course display names in user-facing content
- Use course slugs for file names and URLs
- Reference `_data/courses.yaml` for course metadata
- Course numbers are for internal/agent use only
- Follow the established quality checklists
- Target 15-minute reading time (2000-2500 words)
- Include diagrams and examples to enhance understanding
