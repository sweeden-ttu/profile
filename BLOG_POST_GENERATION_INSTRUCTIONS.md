# Blog Post Generation Instructions for LLM Agents

## Overview

This document provides comprehensive instructions for LLM agents tasked with converting lecture materials into high-quality, textbook-quality blog posts.

---

## Course Data Reference (`_data/courses.yaml`)

**IMPORTANT**: All course information is stored in `_data/courses.yaml`. This file is the **single source of truth** for course metadata and **rarely changes throughout the semester**.

### Using Course Data

Always reference `_data/courses.yaml` for:
- Course display names (user-facing)
- Course numbers (internal/agent use only)
- Canvas IDs (for MCP lookups)
- Semester information
- Course descriptions

### Course Naming Convention

**CRITICAL**: Course numbers (CS-5384, CS-6343, etc.) must **NEVER** appear in:
- Blog post titles
- File names
- Page headers
- User-facing content

**Always use the `display_name` from courses.yaml:**

| Display Name | Course Number | Slug |
|--------------|---------------|------|
| Cryptography | CS-6343 | cryptography |
| Software Verification and Validation | CS-5374 | software-verification |
| Intelligent Systems | CS-5368 | intelligent-systems |
| Logic for Computer Scientists | CS-5384 | logic-for-computer-scientists |
| Theory of Automata | CS-5383 | theory-of-automata |
| Analysis of Algorithms | CS-5381 | analysis-of-algorithms |
| Software Project Management | CS-5363 | software-project-management |
| Machine Learning Security | CS-5331 | machine-learning-security |

### File Naming Convention

Blog post files **MUST** follow this naming pattern:

```
YYYY-MM-DD-{course-display-name}-{lecture-title}.md
```

**Examples:**
- `2026-01-20-cryptography-symmetric-encryption-basics.md`
- `2026-01-22-software-verification-introduction-to-testing.md`
- `2025-12-01-logic-for-computer-scientists-temporal-logic-ltl.md`
- `2025-11-15-intelligent-systems-bayesian-networks.md`

**Rules:**
1. Date in `YYYY-MM-DD` format (lecture date)
2. Course display name in lowercase with hyphens (from `courses.yaml` slug)
3. Lecture title in lowercase with hyphens
4. All lowercase, no course numbers, no special characters

### Course Landing Pages

Each course has a landing page at `_courses/{course-slug}.md`. These pages:
- Display course information from `_data/courses.yaml`
- Show related drafts, projects, and posts
- Link to the course syllabus on Canvas

---

## Content Extraction

### Goal
Extract all relevant information from lecture materials (PDFs, transcripts, JSON metadata, summary files).

### Checklist
- [ ] All PDF slides processed and key content extracted
- [ ] Transcript/JSON data parsed and structured
- [ ] Topics and exercises identified
- [ ] Textbook references mapped
- [ ] All mathematical notation preserved
- [ ] All diagrams/figures identified for recreation

### Instructions

**Step 1: Identify Lecture Materials**
- Scan lecture directory for:
  - PDF files (lecture slides, summaries)
  - JSON files (transcripts, topics-and-exercises.json)
  - Video files (if transcripts available)
  - Any supplementary materials

**Step 2: Extract PDF Content**
- Use PDF parsing tools to extract:
  - Slide titles and headings
  - Bullet points and key concepts
  - Mathematical formulas (preserve LaTeX notation)
  - Diagrams (describe structure for recreation)
  - Code examples
  - Tables and structured data

**Step 3: Parse Structured Data**
- Extract from `topics-and-exercises.json`:
  - Main topics list
  - Exercise descriptions
  - Textbook references (sections, page numbers)
  - Index keys for cross-referencing

**Step 4: Extract Transcript Content** (if available)
- Parse JSON transcripts:
  - Key explanations and definitions
  - Examples discussed
  - Important clarifications
  - Student questions and answers

**Step 5: Create Extraction Summary**
```json
{
  "lecture_id": "Lec_Dec01",
  "date": "2025-12-01",
  "title": "Temporal Logic - LTL",
  "extracted_topics": [...],
  "key_definitions": [...],
  "mathematical_formulas": [...],
  "diagrams_to_create": [...],
  "tables_to_create": [...],
  "examples": [...],
  "exercises": [...],
  "textbook_references": [...],
  "external_resources": []
}
```

---

## Lesson Plan Generation

### Goal
Create a comprehensive lesson plan that covers all topics from the lecture in a logical, pedagogical order.

### Checklist
- [ ] All main topics from lecture included
- [ ] Logical progression from basic to advanced concepts
- [ ] Prerequisites identified
- [ ] Learning objectives defined
- [ ] Estimated reading time: 15 minutes
- [ ] Structure suitable for blog post format

### Instructions

**Step 1: Analyze Topic Dependencies**
- Identify prerequisite concepts
- Order topics from foundational to advanced
- Group related topics into sections

**Step 2: Create Lesson Plan Structure**
```markdown
# Lesson Plan: [Lecture Title]

## Learning Objectives
- [Objective 1]
- [Objective 2]
- [Objective 3]

## Prerequisites
- [Concept 1]
- [Concept 2]

## Lesson Structure

### Section 1: [Topic Name]
- Subtopics:
  - [Subtopic 1]
  - [Subtopic 2]
- Key concepts:
  - [Concept 1]
  - [Concept 2]
- Examples: [Number]
- Diagrams: [Number]
- Reading time: [X] minutes

### Section 2: [Topic Name]
...

## Exercises and Practice
- [Exercise 1]
- [Exercise 2]

## External Resources
- [Resource 1]
- [Resource 2]

## Estimated Total Reading Time: 15 minutes
```

**Step 3: Validate Completeness**
- Cross-reference with extracted content
- Ensure all topics from `topics-and-exercises.json` are covered
- Verify all exercises are addressed

---

## Content Creation

### Goal
Generate a complete, readable blog post draft with all required elements.

### Checklist
- [ ] Follows Jekyll frontmatter format
- [ ] All sections from lesson plan included
- [ ] Mathematical notation properly formatted (KaTeX)
- [ ] Diagrams created/described
- [ ] Tables formatted correctly
- [ ] Code examples syntax-highlighted
- [ ] Examples are clear and illustrative
- [ ] Reading time approximately 15 minutes
- [ ] External references included

### Instructions

**Step 1: Create Jekyll Frontmatter**

Reference `_data/courses.yaml` for the correct course `display_name`:

```yaml
---
layout: post
title: "[Descriptive, SEO-friendly Title - NO course numbers]"
date: YYYY-MM-DD
categories: [category1, category2]
tags: [tag1, tag2, tag3, tag4, tag5]
excerpt: "One-sentence summary that captures the essence (50-100 words)"
reading_time: 15
course: "[Course display_name from courses.yaml]"
course_slug: "[Course slug from courses.yaml]"
---
```

**Valid course values** (from `_data/courses.yaml`):
- `"Cryptography"` (Spring 2026)
- `"Software Verification and Validation"` (Spring 2026)
- `"Intelligent Systems"` (Fall 2025)
- `"Logic for Computer Scientists"` (Fall 2025)
- `"Theory of Automata"` (Fall 2025)
- `"Analysis of Algorithms"` (Summer 2025)
- `"Software Project Management"` (Summer 2025)
- `"Machine Learning Security"` (Summer 2025)
- `"General"` (for non-course-specific posts)

**INCORRECT:**
```yaml
course: "CS-6343 Cryptography"  # NEVER include course numbers
```

**Step 2: Write Introduction**
- Hook: Why is this topic important?
- Context: How does it fit into the broader course?
- Preview: What will readers learn?
- **Length**: 2-3 paragraphs

**Step 3: Write Main Content Sections**

For each section in the lesson plan:

**Structure:**
```markdown
## [Section Title]

[Opening paragraph explaining the concept and its importance]

### [Subsection Title]

[Detailed explanation with:
- Clear definitions
- Step-by-step reasoning
- Examples with explanations
- Visual aids (diagrams, tables)
- Mathematical notation where appropriate
]

### Example: [Example Name]

[Concrete example with:
- Problem statement
- Step-by-step solution
- Explanation of each step
- Key takeaways
]
```

**Content Guidelines:**

1. **Mathematical Notation**
   - Inline math: `$formula$`
   - Display math: `$$formula$$`
   - Always explain notation before using it
   - Reference `@math-rules.md` for formatting standards

2. **Diagrams**
   - Create diagrams using Mermaid, Graphviz, or describe for manual creation
   - Include alt text descriptions
   - Reference diagrams in text: "As shown in Figure 1..."

3. **Tables**
   - Use Markdown table syntax
   - Include headers and clear labels
   - Explain table content in surrounding text

4. **Code Examples**
   - Use syntax highlighting: ` ```language`
   - Include comments explaining key steps
   - Provide context for code usage

5. **Step-by-Step Instructions**
   - Number steps clearly
   - Explain reasoning at each step
   - Use explicit rules/axioms when applying logical equivalencies
   - Show intermediate results

6. **Examples**
   - Start with simple examples
   - Progress to more complex scenarios
   - Include both positive and negative examples
   - Explain why examples are illustrative

**Step 4: Add Visual Elements**

**Diagrams:**
- Create using tools or describe structure:
  ```mermaid
  graph TD
      A[Concept A] --> B[Concept B]
      B --> C[Concept C]
  ```
- Or describe for manual creation:
  ```
  Diagram Description:
  - Node A (top-left): [description]
  - Node B (center): [description]
  - Arrow A->B: [meaning]
  ```

**Tables:**
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
```

**Step 5: Add Exercises Section**
- Include exercises from lecture
- Provide solutions or solution approaches
- Link to practice problems if available

**Step 6: Add External Resources**
- Search for relevant papers, articles, tutorials
- Include authoritative sources
- Format as bulleted list with descriptions

**Step 7: Write Conclusion**
- Summarize key concepts
- Connect to broader course themes
- Suggest next steps or related topics
- **Length**: 1-2 paragraphs

**Step 8: Validate Reading Time**
- Target: 15 minutes (approximately 2000-2500 words)
- Adjust content if significantly over/under

---

## Review and Quality Checklist

Before finalizing any blog post, review against these checklists:

### Accuracy Checklist
- [ ] All definitions match lecture content
- [ ] Mathematical formulas are correct
- [ ] Examples are accurate and illustrative
- [ ] Step-by-step solutions are correct
- [ ] No factual errors or misrepresentations
- [ ] Terminology is consistent with course materials

### Completeness Checklist
- [ ] All topics from lesson plan are covered
- [ ] All exercises are addressed
- [ ] Prerequisites are mentioned or explained
- [ ] Key concepts are fully explained
- [ ] Examples cover different aspects of the topic
- [ ] External resources are relevant and high-quality

### Readability Checklist
- [ ] Introduction clearly sets context
- [ ] Logical flow from section to section
- [ ] Concepts build on each other appropriately
- [ ] Technical terms are defined before use
- [ ] Examples are clear and well-explained
- [ ] Mathematical notation is explained
- [ ] Paragraphs are appropriately sized (3-5 sentences)
- [ ] Reading time matches target (15 minutes)

### Visual Elements Checklist
- [ ] Diagrams are accurate and clear
- [ ] Tables are well-formatted and readable
- [ ] Code examples are syntax-highlighted
- [ ] Visual aids support the text
- [ ] All diagrams/tables are referenced in text
- [ ] Alt text provided for accessibility

### Structure Checklist
- [ ] Jekyll frontmatter is complete and correct
- [ ] Headings follow logical hierarchy (H2 → H3 → H4)
- [ ] Sections are appropriately sized
- [ ] Conclusion ties everything together
- [ ] External resources section is present

---

## Quality Standards

### Writing Style

**Tone:**
- Professional but approachable
- Technical precision without jargon overload
- First-person acceptable for personal insights
- Active voice preferred

**Clarity:**
- One idea per paragraph
- Short, clear sentences
- Define technical terms before use
- Use examples to illustrate abstract concepts

**Structure:**
- Clear introduction with hook
- Logical progression of ideas
- Smooth transitions between sections
- Strong conclusion that synthesizes key points

### Mathematical Content

**Notation:**
- Always explain notation before first use
- Use standard mathematical notation
- Format using KaTeX: `$inline$` or `$$display$$`
- Reference `@math-rules.md` for specific formatting rules

**Reasoning:**
- Provide step-by-step explanations
- Explicitly state rules/axioms used
- Show intermediate steps
- Explain why each step is valid

**Examples:**
- Start simple, progress to complex
- Include worked solutions
- Explain reasoning, not just steps

### Visual Elements

**Diagrams:**
- Clear, uncluttered design
- Proper labels and annotations
- Consistent style across all diagrams
- Support the text, don't duplicate it

**Tables:**
- Clear headers
- Organized logically
- Properly formatted
- Explained in surrounding text

**Code:**
- Syntax-highlighted
- Well-commented
- Context provided
- Complete, runnable examples when possible

### External Resources

**Selection Criteria:**
- Authoritative sources (textbooks, papers, official docs)
- Relevant to topic
- High quality and well-regarded
- Accessible (not behind paywalls when possible)

**Format:**
- Descriptive link text
- Brief annotation explaining relevance
- Organized by category (papers, tutorials, tools, etc.)

---

## Course-Specific Guidelines

**Note**: All course information is stored in `_data/courses.yaml`. Reference this file for course metadata. Each course has a landing page at `_courses/{slug}.md`.

### Cryptography (Spring 2026)

**Front matter**: `course: "Cryptography"`  
**Tags**: `cryptography`, `security`, `encryption`

**Content Focus:**
- Symmetric and asymmetric encryption
- Hash functions and digital signatures
- Public key cryptography
- Number theory foundations
- Attack models and security goals

### Software Verification and Validation (Spring 2026)

**Front matter**: `course: "Software Verification and Validation"`  
**Tags**: `software-verification`, `testing`, `formal-methods`

**Content Focus:**
- Software testing strategies
- Formal methods and model checking
- Specification and requirements analysis
- Continuous verification
- Quality assurance

### Intelligent Systems (Fall 2025)

**Front matter**: `course: "Intelligent Systems"`  
**Tags**: `artificial-intelligence`, `machine-learning`

**Content Focus:**
- Machine learning algorithms
- Probabilistic reasoning
- Bayesian networks
- Classification and regression
- Neural networks

### Logic for Computer Scientists (Fall 2025)

**Front matter**: `course: "Logic for Computer Scientists"`  
**Tags**: `logic`, `formal-methods`, `prolog`

**Content Focus:**
- Formal logic systems
- Proof techniques
- Model theory
- Automated theorem proving
- Temporal and modal logics

### Theory of Automata (Fall 2025)

**Front matter**: `course: "Theory of Automata"`  
**Tags**: `automata`, `formal-languages`, `computation`

**Content Focus:**
- Finite automata
- Regular languages
- Context-free grammars
- Turing machines
- Computational complexity

### Analysis of Algorithms (Summer 2025)

**Front matter**: `course: "Analysis of Algorithms"`  
**Tags**: `algorithms`, `complexity`

**Content Focus:**
- Algorithm design techniques
- Complexity analysis
- Divide and conquer
- Dynamic programming
- Graph algorithms

### Software Project Management (Summer 2025)

**Front matter**: `course: "Software Project Management"`  
**Tags**: `project-management`, `software-engineering`

**Content Focus:**
- Project planning and estimation
- Risk management
- Team coordination
- Quality assurance processes
- Agile methodologies

### Machine Learning Security (Summer 2025)

**Front matter**: `course: "Machine Learning Security"`  
**Tags**: `machine-learning`, `security`

**Content Focus:**
- Adversarial attacks
- Model robustness
- Privacy-preserving ML
- Security applications
- Threat modeling

---

## Tools and Resources

### Available Tools

**Content Extraction:**
- PDF parsing tools
- JSON parsing
- Text extraction from images (OCR)

**Content Creation:**
- Markdown editor
- Diagram generation (Mermaid, Graphviz)
- LaTeX/KaTeX rendering
- Code syntax highlighting

**Review:**
- Spell/grammar checking
- Mathematical notation validation
- Link checking
- Reading time estimation

### Reference Documents

- `_data/courses.yaml` - **Official course data dictionary** (display names, slugs, Canvas IDs)
- `.cursor/rules/course-naming-convention.mdc` - Course naming convention rules
- `@math-rules.md` - Mathematical notation standards
- `@CLAUDE.md` - Site structure and design principles
- `@AGENTS.md` - Agent workflow and course information
- Existing blog posts - Style and format examples
- Course textbooks - Authoritative source material

---

## Success Metrics

### Quantitative Metrics
- Reading time: 15 minutes (±2 minutes)
- Word count: 2000-2500 words
- Diagrams: At least 1 per major topic
- Examples: At least 2-3 per major concept
- External resources: 3-5 high-quality links

### Qualitative Metrics
- Accuracy: All information verified against source materials
- Completeness: All topics from lecture covered
- Readability: Clear, logical flow, appropriate technical level
- Visual quality: Diagrams and tables enhance understanding
- Engagement: Post is informative and valuable to readers

---

## Error Handling

### Common Issues

**Issue: Missing or Incomplete Source Materials**
- Document what's missing
- Use available materials to fullest extent
- Note gaps in content
- Request clarification if critical information missing

**Issue: Unclear Lecture Content**
- Cross-reference with textbooks
- Use multiple sources to clarify
- Document assumptions made
- Flag for review if significant uncertainty

**Issue: Conflicting Information**
- Prioritize lecture materials
- Note conflicts in review feedback
- Research to resolve conflicts
- Document resolution approach

**Issue: Technical Difficulties**
- Document tool failures
- Use alternative approaches
- Request assistance if blocked
- Maintain progress on other tasks

---

## Final Output

### File Structure

Each completed lecture should produce:

```
lecture-directory/
├── extracted-content.json          # Extraction output
├── lesson-plan.md                  # Lesson plan
├── draft-v1.md                     # Initial draft
├── draft-v2.md                     # Revised draft (if needed)
├── final-post.md                   # Final version
├── assets/
│   ├── diagram-1.svg               # Generated diagrams
│   ├── table-1.md                  # Table definitions
│   └── screenshot-1.png            # Slide screenshots
└── metadata.json                   # Final metadata
```

### Final Post Requirements

The `final-post.md` file should:
- Be ready for direct use in Jekyll `_posts/` directory
- Follow naming convention: `YYYY-MM-DD-{course-display-name}-{lecture-title}.md`
  - Example: `2026-01-20-cryptography-symmetric-encryption-basics.md`
  - Example: `2025-12-01-logic-for-computer-scientists-temporal-logic-ltl.md`
- **NEVER include course numbers** (CS-5384, CS-6343, etc.) in filenames or titles
- Include all required frontmatter with `course` set to display name from `_data/courses.yaml`
- Have all diagrams/tables properly referenced
- Pass all quality checks

---

## Summary

**Key Principles:**
1. **Course data from `_data/courses.yaml`** - Single source of truth for course information
2. **No course numbers in user-facing content** - Use display names only
3. **File naming: `YYYY-MM-DD-{slug}-{title}.md`** - Consistent, clean URLs
4. **Quality standards enforced** - Use checklists before finalizing
5. **15-minute reading time target** - 2000-2500 words per post

Follow these instructions systematically, and the resulting blog posts will be textbook-quality, informative, and valuable resources for readers.
