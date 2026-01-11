# Blog Post Generation Instructions for LLM Agents

## Overview

This document provides comprehensive instructions for LLM agents tasked with converting lecture materials into high-quality, textbook-quality blog posts. The system uses a **two-agent parallel workflow** with iterative peer review to ensure accuracy, completeness, and readability.

## System Architecture

### Two-Agent Design

- **Agent A**: CS-5384 Logic for Computer Scientists
- **Agent B**: CS-5368 Intelligent Systems

Both agents work **in parallel** on their respective courses, then **cross-review** each other's work iteratively.

### Work Tree Structure

```
blog-generation-workspace/
├── cs5384-logic/
│   ├── lectures/
│   │   ├── Lec_Aug25/
│   │   │   ├── extracted-content.json
│   │   │   ├── lesson-plan.md
│   │   │   ├── draft-v1.md
│   │   │   ├── review-feedback-v1.md
│   │   │   ├── draft-v2.md
│   │   │   └── final-post.md
│   │   └── ...
│   ├── assets/
│   │   ├── diagrams/
│   │   ├── tables/
│   │   └── screenshots/
│   └── metadata.json
├── cs5368-intelligent-systems/
│   ├── lectures/
│   │   ├── Lec_Dec01/
│   │   │   ├── extracted-content.json
│   │   │   ├── lesson-plan.md
│   │   │   ├── draft-v1.md
│   │   │   ├── review-feedback-v1.md
│   │   │   ├── draft-v2.md
│   │   │   └── final-post.md
│   │   └── ...
│   ├── assets/
│   │   ├── diagrams/
│   │   ├── tables/
│   │   └── screenshots/
│   └── metadata.json
└── shared/
    ├── review-templates/
    └── quality-checklist.md
```

---

## Agent Workflow: ReAct Pattern with State Tracking

### Core Loop Structure

Each agent follows a **Think → Act → Observe → Reflect** cycle:

```
<state>
  current_lecture: "Lec_Dec01"
  phase: "extraction" | "planning" | "drafting" | "reviewing" | "finalizing"
  iteration: 1
  success_criteria: {...}
</state>

<reasoning>
  [Agent analyzes current state and determines next action]
</reasoning>

<action>
  [Agent performs specific task using available tools]
</action>

<observation>
  [Agent evaluates result of action]
</observation>

<reflection>
  [Agent checks if success criteria met, adjusts plan if needed]
</reflection>
```

---

## Phase 1: Content Extraction

### Goal
Extract all relevant information from lecture materials (PDFs, transcripts, JSON metadata, summary files).

### Success Criteria
- [ ] All PDF slides processed and key content extracted
- [ ] Transcript/JSON data parsed and structured
- [ ] Topics and exercises identified
- [ ] Textbook references mapped
- [ ] All mathematical notation preserved
- [ ] All diagrams/figures identified for recreation

### Instructions

**Step 1: Identify Lecture Materials**
```xml
<task>
  Scan lecture directory for:
  - PDF files (lecture slides, summaries)
  - JSON files (transcripts, topics-and-exercises.json)
  - Video files (if transcripts available)
  - Any supplementary materials
</task>
```

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

## Phase 2: Lesson Plan Generation

### Goal
Create a comprehensive lesson plan that covers all topics from the lecture in a logical, pedagogical order.

### Success Criteria
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

## Phase 3: Content Creation

### Goal
Generate a complete, readable blog post draft with all required elements.

### Success Criteria
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
```yaml
---
layout: post
title: "[Descriptive, SEO-friendly Title]"
date: YYYY-MM-DD
categories: [category1, category2]
tags: [tag1, tag2, tag3, tag4, tag5]
excerpt: "One-sentence summary that captures the essence (50-100 words)"
reading_time: 15
course: "Logic for Computer Scientists" | "Intelligent Systems"
---
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

## Phase 4: Peer Review

### Goal
Each agent reviews the other agent's work to ensure quality, accuracy, and completeness.

### Success Criteria
- [ ] Review covers all checklist items
- [ ] Specific, actionable feedback provided
- [ ] Accuracy verified against source materials
- [ ] Readability assessed
- [ ] Visual elements evaluated

### Instructions

**Step 1: Initial Review Pass**

Review the draft blog post against this checklist:

**Accuracy Checklist:**
- [ ] All definitions match lecture content
- [ ] Mathematical formulas are correct
- [ ] Examples are accurate and illustrative
- [ ] Step-by-step solutions are correct
- [ ] No factual errors or misrepresentations
- [ ] Terminology is consistent with course materials

**Completeness Checklist:**
- [ ] All topics from lesson plan are covered
- [ ] All exercises are addressed
- [ ] Prerequisites are mentioned or explained
- [ ] Key concepts are fully explained
- [ ] Examples cover different aspects of the topic
- [ ] External resources are relevant and high-quality

**Readability Checklist:**
- [ ] Introduction clearly sets context
- [ ] Logical flow from section to section
- [ ] Concepts build on each other appropriately
- [ ] Technical terms are defined before use
- [ ] Examples are clear and well-explained
- [ ] Mathematical notation is explained
- [ ] Paragraphs are appropriately sized (3-5 sentences)
- [ ] Reading time matches target (15 minutes)

**Visual Elements Checklist:**
- [ ] Diagrams are accurate and clear
- [ ] Tables are well-formatted and readable
- [ ] Code examples are syntax-highlighted
- [ ] Visual aids support the text
- [ ] All diagrams/tables are referenced in text
- [ ] Alt text provided for accessibility

**Structure Checklist:**
- [ ] Jekyll frontmatter is complete and correct
- [ ] Headings follow logical hierarchy (H2 → H3 → H4)
- [ ] Sections are appropriately sized
- [ ] Conclusion ties everything together
- [ ] External resources section is present

**Step 2: Generate Review Feedback**

Create a structured feedback document:

```markdown
# Review Feedback: [Lecture Title]

## Reviewer: [Agent Name]
## Review Date: [Date]
## Draft Version: v[Number]

## Overall Assessment
[Brief summary of quality and any major issues]

## Accuracy Issues
### Critical
- [Issue 1]: [Description] - [Location] - [Suggested fix]

### Minor
- [Issue 2]: [Description] - [Location] - [Suggested fix]

## Completeness Issues
- [Missing topic/concept]: [Description] - [Where it should be added]

## Readability Issues
- [Issue]: [Description] - [Location] - [Suggested improvement]

## Visual Elements Issues
- [Diagram/Table issue]: [Description] - [Location] - [Suggested fix]

## Structure Issues
- [Issue]: [Description] - [Location] - [Suggested fix]

## Strengths
- [What works well]

## Priority Actions
1. [High priority fix]
2. [Medium priority fix]
3. [Low priority fix]
```

**Step 3: Cross-Reference with Source Materials**
- Verify claims against PDF slides
- Check mathematical formulas against lecture notes
- Confirm examples match lecture content
- Validate external resources are appropriate

---

## Phase 5: Iterative Refinement

### Goal
Address review feedback and improve the blog post iteratively.

### Success Criteria
- [ ] All critical feedback addressed
- [ ] All high-priority issues resolved
- [ ] Post meets quality standards
- [ ] Reviewers approve final version

### Instructions

**Step 1: Prioritize Feedback**
- Address critical accuracy issues first
- Then completeness issues
- Then readability improvements
- Finally, polish and structure

**Step 2: Revise Draft**
- Make changes based on feedback
- Track which feedback items are addressed
- Maintain version control (v1, v2, v3...)

**Step 3: Re-submit for Review**
- If significant changes made, request re-review
- If minor changes, self-validate against checklist

**Step 4: Final Approval**
- Both agents approve final version
- All checklist items pass
- Post is ready for publication

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

### CS-5384: Logic for Computer Scientists

**Categorization:**
- All posts must be categorized under: "Logic for Computer Scientists"
- Tags should include: `logic-for-computer-scientists`

**Content Focus:**
- Formal logic systems
- Proof techniques
- Model theory
- Automated theorem proving
- Temporal and modal logics

**Mathematical Rigor:**
- Precise definitions
- Formal proofs when appropriate
- Clear distinction between syntax and semantics
- Proper use of logical notation

**Examples:**
- Computer science applications
- Algorithm verification
- System specification
- Formal methods

### CS-5368: Intelligent Systems

**Categorization:**
- All posts must be categorized under: "Intelligent Systems"
- Tags should include: `intelligent-systems`

**Content Focus:**
- Machine learning algorithms
- Probabilistic reasoning
- Bayesian networks
- Classification and regression
- Neural networks

**Mathematical Rigor:**
- Clear explanations of algorithms
- Step-by-step derivations
- Intuitive explanations alongside formal math
- Practical implementation considerations

**Examples:**
- Real-world applications
- Dataset examples
- Implementation details
- Performance considerations

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

- `@math-rules.md` - Mathematical notation standards
- `@CLAUDE.md` - Site structure and design principles
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

## Error Handling and Recovery

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

## State Tracking

### State Variables

```json
{
  "agent_id": "A" | "B",
  "course": "CS-5384" | "CS-5368",
  "current_lecture": "Lec_Dec01",
  "phase": "extraction" | "planning" | "drafting" | "reviewing" | "finalizing",
  "iteration": 1,
  "lectures_completed": [],
  "lectures_in_progress": [],
  "lectures_pending": [],
  "current_draft_version": 1,
  "review_feedback_received": false,
  "success_criteria": {
    "extraction_complete": false,
    "lesson_plan_complete": false,
    "draft_complete": false,
    "review_passed": false,
    "final_approved": false
  }
}
```

### State Transitions

```
extraction → planning → drafting → reviewing → finalizing
                                    ↓
                              [feedback received]
                                    ↓
                              [refinement]
                                    ↓
                              reviewing (repeat until approved)
```

---

## Reflection and Self-Correction

### Reflection Checkpoints

After each phase, agent should reflect:

```xml
<reflection>
  <current_state>
    [Describe current state]
  </current_state>
  
  <progress_assessment>
    [Evaluate progress against success criteria]
  </progress_assessment>
  
  <issues_identified>
    [List any problems or concerns]
  </issues_identified>
  
  <next_steps>
    [Determine what to do next]
  </next_steps>
  
  <success_criteria_check>
    [Verify if success criteria met]
  </success_criteria_check>
</reflection>
```

### Self-Correction Triggers

Agent should trigger self-correction when:
- Success criteria not met after action
- Review feedback indicates significant issues
- Quality metrics below thresholds
- Inconsistencies detected in content
- Missing critical information

### Correction Actions

1. **Identify root cause** of issue
2. **Adjust plan** to address issue
3. **Re-execute** relevant phase
4. **Re-validate** against success criteria
5. **Document** correction for future reference

---

## Final Output Format

### File Structure

Each completed lecture should produce:

```
lecture-directory/
├── extracted-content.json          # Phase 1 output
├── lesson-plan.md                  # Phase 2 output
├── draft-v1.md                     # Phase 3 initial draft
├── review-feedback-v1.md           # Phase 4 feedback
├── draft-v2.md                     # Phase 5 revised draft
├── review-feedback-v2.md           # Phase 4 second review (if needed)
├── draft-v3.md                     # Phase 5 final draft
├── final-post.md                   # Approved final version
├── assets/
│   ├── diagram-1.svg               # Generated diagrams
│   ├── table-1.md                  # Table definitions
│   └── screenshot-1.png            # Slide screenshots
└── metadata.json                   # Final metadata
```

### Final Post Requirements

The `final-post.md` file should:
- Be ready for direct use in Jekyll `_posts/` directory
- Follow naming convention: `YYYY-MM-DD-title.md`
- Include all required frontmatter
- Have all diagrams/tables properly referenced
- Pass all quality checks
- Be approved by both agents

---

## Example Workflow Execution

### Agent A: CS-5384 Lecture Processing

```
<state>
  agent_id: "A"
  course: "CS-5384"
  current_lecture: "Lec_Dec01"
  phase: "extraction"
  iteration: 1
</state>

<reasoning>
  I need to extract all content from Lec_Dec01. Let me identify what files are available:
  - cs5384_2025_fall_lecture30.pdf
  - 2025-12-01_Ikram_Temporal_Logic_LTL.json (transcript)
  - topics-and-exercises.json
  
  I'll start by parsing the topics-and-exercises.json to understand the structure, then extract PDF content, then parse the transcript.
</reasoning>

<action>
  [Agent reads and parses topics-and-exercises.json]
  [Agent extracts PDF content using PDF parser]
  [Agent parses JSON transcript]
  [Agent creates extracted-content.json]
</action>

<observation>
  Successfully extracted:
  - 4 main topics identified
  - 3 exercises found
  - Multiple textbook references mapped
  - Transcript contains detailed explanations
  
  Missing: Some diagrams from PDF need to be recreated
</observation>

<reflection>
  Extraction phase mostly complete. Need to describe diagrams for recreation.
  Success criteria: extraction_complete = true (pending diagram descriptions)
  Next: Move to planning phase
</reflection>
```

[Continue through all phases...]

---

## Conclusion

These instructions provide a comprehensive framework for generating high-quality blog posts from lecture materials. The two-agent system with iterative peer review ensures accuracy, completeness, and readability while maintaining consistency with existing blog post standards.

**Key Principles:**
1. **Clear goals** at each phase
2. **Structured workflow** with state tracking
3. **Iterative refinement** through peer review
4. **Quality standards** enforced throughout
5. **Self-correction** mechanisms built in

Follow these instructions systematically, and the resulting blog posts will be textbook-quality, informative, and valuable resources for readers.
