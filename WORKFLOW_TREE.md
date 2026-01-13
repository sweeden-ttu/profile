# Multi-Agent Workflow Execution Tree

## Overview

This document defines the executable workflow tree for the two-agent blog post generation system. It provides step-by-step orchestration for Agent A (Logic) and Agent B (Intelligence) with cross-review mechanisms.

---

## System State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW EXECUTION TREE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐                                                            │
│  │   START     │                                                            │
│  └──────┬──────┘                                                            │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │  PHASE 0: INITIALIZATION                                     │           │
│  │  ├── Load agent state files                                  │           │
│  │  ├── Validate lecture inventories                            │           │
│  │  └── Determine next lecture for each agent                  │           │
│  └──────────────────────────┬──────────────────────────────────┘           │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │  PARALLEL EXECUTION LOOP                                     │           │
│  │  ┌───────────────────┬───────────────────┐                  │           │
│  │  │   AGENT A         │   AGENT B         │                  │           │
│  │  │   (CS-5384)       │   (CS-5368)       │                  │           │
│  │  └─────────┬─────────┴─────────┬─────────┘                  │           │
│  │            │                   │                             │           │
│  │            ▼                   ▼                             │           │
│  │  ┌──────────────┐   ┌──────────────┐                        │           │
│  │  │ EXTRACTION   │   │ EXTRACTION   │  ◄── Phase 1          │           │
│  │  └──────┬───────┘   └──────┬───────┘                        │           │
│  │         │                  │                                 │           │
│  │         ▼                  ▼                                 │           │
│  │  ┌──────────────┐   ┌──────────────┐                        │           │
│  │  │ PLANNING     │   │ PLANNING     │  ◄── Phase 2          │           │
│  │  └──────┬───────┘   └──────┬───────┘                        │           │
│  │         │                  │                                 │           │
│  │         ▼                  ▼                                 │           │
│  │  ┌──────────────┐   ┌──────────────┐                        │           │
│  │  │ DRAFTING     │   │ DRAFTING     │  ◄── Phase 3          │           │
│  │  └──────┬───────┘   └──────┬───────┘                        │           │
│  │         │                  │                                 │           │
│  │         └────────┬─────────┘                                │           │
│  │                  │                                          │           │
│  │                  ▼                                          │           │
│  │  ┌─────────────────────────────────────────────────┐       │           │
│  │  │           CROSS-REVIEW EXCHANGE                  │       │           │
│  │  │  ┌────────────────┬────────────────┐            │       │           │
│  │  │  │ A reviews B's  │ B reviews A's  │  ◄── Phase 4       │           │
│  │  │  │ draft          │ draft          │            │       │           │
│  │  │  └───────┬────────┴────────┬───────┘            │       │           │
│  │  │          │                 │                    │       │           │
│  │  │          ▼                 ▼                    │       │           │
│  │  │  ┌──────────────┐   ┌──────────────┐           │       │           │
│  │  │  │ Feedback     │   │ Feedback     │           │       │           │
│  │  │  │ for B        │   │ for A        │           │       │           │
│  │  │  └──────────────┘   └──────────────┘           │       │           │
│  │  └─────────────────────────────────────────────────┘       │           │
│  │                  │                                          │           │
│  │                  ▼                                          │           │
│  │  ┌─────────────────────────────────────────────────┐       │           │
│  │  │           REFINEMENT (Phase 5)                   │       │           │
│  │  │  ┌───────────────────┬───────────────────┐      │       │           │
│  │  │  │ A addresses       │ B addresses       │      │       │           │
│  │  │  │ B's feedback      │ A's feedback      │      │       │           │
│  │  │  └─────────┬─────────┴─────────┬─────────┘      │       │           │
│  │  │            │                   │                │       │           │
│  │  └────────────┼───────────────────┼────────────────┘       │           │
│  │               │                   │                         │           │
│  │               ▼                   ▼                         │           │
│  │  ┌──────────────────────────────────────────┐              │           │
│  │  │         QUALITY GATE CHECK               │              │           │
│  │  │  ┌─────────────────────────────────┐    │              │           │
│  │  │  │ All critical issues resolved?   │    │              │           │
│  │  │  └─────────────┬───────────────────┘    │              │           │
│  │  │                │                        │              │           │
│  │  │        ┌───────┴───────┐               │              │           │
│  │  │        │               │               │              │           │
│  │  │       YES             NO               │              │           │
│  │  │        │               │               │              │           │
│  │  │        │               └──► ITERATE    │              │           │
│  │  │        │                   (max 3x)    │              │           │
│  │  └────────┼───────────────────────────────┘              │           │
│  │           │                                               │           │
│  │           ▼                                               │           │
│  │  ┌──────────────────────────────────────────┐            │           │
│  │  │         FINALIZATION (Phase 6)           │            │           │
│  │  │  ├── Both agents approve                 │            │           │
│  │  │  ├── Create final post files             │            │           │
│  │  │  ├── Update state to "complete"          │            │           │
│  │  │  └── Move to _posts/ directory           │            │           │
│  │  └──────────────────────────────────────────┘            │           │
│  │           │                                               │           │
│  │           ▼                                               │           │
│  │  ┌──────────────────────────────────────────┐            │           │
│  │  │  MORE LECTURES?                          │            │           │
│  │  │  ├── YES: Return to EXTRACTION           │            │           │
│  │  │  └── NO:  Proceed to COMPLETION          │            │           │
│  │  └──────────────────────────────────────────┘            │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────┐                                                            │
│  │   COMPLETE  │                                                            │
│  └─────────────┘                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Execution Commands

### 1. Initialize System

Before starting any agent, run the initialization check:

```bash
# Check agent states
cat agent_a_state/agent_a_state.json | jq '.current_lecture'
cat agent_b_state/agent_b_state.json | jq '.current_lecture'
```

---

## Phase-by-Phase Execution Prompts

### PHASE 0: INITIALIZATION

**Prompt for Agent Initialization:**

```
You are initializing as [AGENT_A/AGENT_B] for the blog post generation workflow.

**Your Assignment:**
- Agent ID: [logic_agent_a / intelligence_agent_b]
- Course: [CS-5384 Logic for Computer Scientists / CS-5368 Intelligent Systems]
- Course Path: [/Users/sdw/CS-5384-Logic-for-Computer-Scientists / /Users/sdw/CS-5368-Intelligent-Systems]

**Initialization Tasks:**
1. Read your agent state file: agent_[a/b]_state/agent_[a/b]_state.json
2. Read your lecture inventory: agent_[a/b]_state/lecture_inventory.json
3. Identify the next lecture to process based on `current_lecture` field
4. Verify lecture materials exist in the course path

**State Check:**
- Current lecture number: [from state file]
- Current lecture title: [from state file]
- Current phase: [from state file]
- Lectures completed: [count from state file]
- Lectures remaining: [count from state file]

**Output:**
Report your readiness status and confirm the next lecture to process.

**Success Criteria:**
- State file loaded successfully
- Lecture materials identified
- Ready to proceed to Phase 1 (Extraction)
```

---

### PHASE 1: CONTENT EXTRACTION

**Prompt for Content Extraction:**

```xml
<phase>EXTRACTION</phase>
<agent>[AGENT_A/AGENT_B]</agent>
<lecture>
  <id>[LECTURE_FOLDER]</id>
  <title>[LECTURE_TITLE]</title>
  <path>[FULL_PATH_TO_LECTURE_FOLDER]</path>
</lecture>

<task>
Extract all content from the lecture materials for blog post generation.

**Source Materials to Process:**
1. PDF slides: [list from lecture_inventory.json]
2. JSON metadata: [topics-and-exercises.json or other JSON files]
3. Transcripts: [.txt files if available]
4. Supplementary: [additional PDFs]

**Extraction Process:**

<step number="1" name="List Materials">
List all files in the lecture folder and categorize by type.
</step>

<step number="2" name="Parse PDFs">
For each PDF:
- Extract text content from all slides
- Note slide titles and headings
- Identify mathematical formulas (preserve LaTeX)
- Describe diagrams and figures
- Extract code examples
- Identify tables
</step>

<step number="3" name="Parse JSON Metadata">
Extract:
- Main topics and subtopics
- Exercises and problems
- Textbook references
- Learning objectives
</step>

<step number="4" name="Parse Transcripts">
If transcript available:
- Extract key explanations
- Note verbal examples
- Capture clarifications
</step>

<step number="5" name="Create Extraction Output">
Save to: agent_[a/b]_state/extractions/[lecture_id]_extracted.md

Include:
- All extracted topics
- Key definitions
- Mathematical formulas
- Diagram descriptions
- Tables content
- Examples
- Exercises
- References
</step>
</task>

<success_criteria>
- [ ] All PDF slides processed
- [ ] All topics identified
- [ ] All exercises captured
- [ ] Mathematical notation preserved
- [ ] Diagrams described for recreation
- [ ] Tables content extracted
- [ ] Extraction file created
</success_criteria>

<output_file>
agent_[a/b]_state/extractions/[lecture_id]_extracted.md
</output_file>

<next_phase>
After successful extraction, proceed to Phase 2: Planning
</next_phase>
```

---

### PHASE 2: LESSON PLAN GENERATION

**Prompt for Lesson Plan Creation:**

```xml
<phase>PLANNING</phase>
<agent>[AGENT_A/AGENT_B]</agent>
<lecture>
  <id>[LECTURE_FOLDER]</id>
  <title>[LECTURE_TITLE]</title>
</lecture>

<input>
- Extracted content: agent_[a/b]_state/extractions/[lecture_id]_extracted.md
- Course context from previous lectures
</input>

<task>
Create a comprehensive lesson plan for a 15-minute reading time blog post.

<step number="1" name="Analyze Topics">
Review extracted content and identify:
- Main topics and subtopics
- Topic dependencies (what must be explained first)
- Prerequisite knowledge required
</step>

<step number="2" name="Order Topics">
Arrange topics in pedagogical order:
- Foundational concepts first
- Build complexity gradually
- Group related topics into sections
</step>

<step number="3" name="Estimate Reading Time">
Allocate time per section:
- Introduction: 2 minutes (300 words)
- Each main section: 2-4 minutes (300-600 words)
- Conclusion: 1-2 minutes (150-300 words)
- Total: 15 minutes (~2250 words)
</step>

<step number="4" name="Plan Visual Elements">
For each section, identify:
- Diagrams needed
- Tables to create
- Code examples to include
- Mathematical formulas to render
</step>

<step number="5" name="Create Lesson Plan">
Save to: agent_[a/b]_state/plans/[lecture_id]_lesson_plan.md

Structure:
```markdown
# Lesson Plan: [Lecture Title]

## Learning Objectives
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

## Prerequisites
- [Prerequisite 1]
- [Prerequisite 2]

## Lesson Structure

### Introduction (2 min, ~300 words)
- Hook: Why this topic matters
- Context: How it fits in the course
- Preview: What readers will learn

### Section 1: [Topic] (X min, ~Y words)
- Subtopics: [list]
- Visual: [diagram/table needed]
- Example: [planned example]

### Section 2: [Topic] (X min, ~Y words)
...

### Exercises Section (2 min)
- Exercise 1: [brief description]
- Exercise 2: [brief description]

### Conclusion (1-2 min, ~200 words)
- Key takeaways
- Connection to next topics

## External Resources to Research
1. [Topic for web search]
2. [Topic for web search]
3. [Topic for web search]

## Total Estimated Reading Time: 15 minutes
## Total Estimated Word Count: 2250 words
```
</step>
</task>

<success_criteria>
- [ ] All main topics included
- [ ] Logical progression from basic to advanced
- [ ] Prerequisites identified
- [ ] Reading time estimated at 15 minutes
- [ ] Visual elements planned
- [ ] Exercises included
- [ ] Lesson plan file created
</success_criteria>

<output_file>
agent_[a/b]_state/plans/[lecture_id]_lesson_plan.md
</output_file>

<next_phase>
After successful planning, proceed to Phase 3: Drafting
</next_phase>
```

---

### PHASE 3: CONTENT DRAFTING

**Prompt for Blog Post Drafting:**

```xml
<phase>DRAFTING</phase>
<agent>[AGENT_A/AGENT_B]</agent>
<lecture>
  <id>[LECTURE_FOLDER]</id>
  <title>[LECTURE_TITLE]</title>
  <date>[YYYY-MM-DD from lecture folder name]</date>
</lecture>

<input>
- Lesson plan: agent_[a/b]_state/plans/[lecture_id]_lesson_plan.md
- Extracted content: agent_[a/b]_state/extractions/[lecture_id]_extracted.md
- Math rules: @math-rules.md
- Site guidelines: @CLAUDE.md
</input>

<task>
Generate a complete, publication-ready blog post following the lesson plan.

<step number="1" name="Create Frontmatter">
```yaml
---
layout: post
title: "[SEO-friendly descriptive title, 50-70 chars]"
date: [YYYY-MM-DD]
categories:
  - "[Logic for Computer Scientists / Intelligent Systems]"
tags:
  - [tag1]
  - [tag2]
  - [tag3]
  - [tag4]
  - [course-specific-tag]
excerpt: "[Compelling 1-2 sentence summary, 50-100 words]"
reading_time: 15
course: "[Logic for Computer Scientists / Intelligent Systems]"
---
```
</step>

<step number="2" name="Write Introduction">
Write 2-3 paragraphs covering:
- Hook: Why is this topic important in computer science?
- Context: How does it fit in the course curriculum?
- Preview: What will readers learn by the end?
</step>

<step number="3" name="Write Main Content Sections">
For each section in the lesson plan:
- Write clear explanations using active voice
- Define technical terms before using them
- Include step-by-step reasoning for complex topics
- Use KaTeX for math: `$inline$` and `$$display$$`
- Create diagrams using Mermaid or describe for manual creation
- Format tables in Markdown
- Include syntax-highlighted code examples
- Provide concrete examples with solutions
</step>

<step number="4" name="Write Exercises Section">
Include exercises from the lecture:
- Present problem statement clearly
- Provide solution or solution approach
- Include step-by-step walkthrough
</step>

<step number="5" name="Search External Resources">
Search for 3-5 high-quality external resources:
- Academic papers or textbooks
- Tutorial websites
- Official documentation
- Video explanations

Format as:
## External Resources

1. **[Resource Title](URL)** - Brief description of what it covers
2. **[Resource Title](URL)** - Brief description of what it covers
3. **[Resource Title](URL)** - Brief description of what it covers
</step>

<step number="6" name="Write Conclusion">
Write 1-2 paragraphs:
- Summarize key concepts learned
- Connect to broader course themes
- Suggest next steps for continued learning
</step>

<step number="7" name="Self-Review">
Before saving, verify:
- [ ] All sections from lesson plan included
- [ ] Word count: 2000-2500 words
- [ ] Reading time: ~15 minutes
- [ ] At least 1 diagram per major topic
- [ ] At least 2-3 examples per concept
- [ ] 3-5 external resources included
- [ ] Math notation uses KaTeX syntax
- [ ] Code examples are syntax-highlighted
- [ ] No undefined technical terms
</step>
</task>

<writing_guidelines>
- Tone: Professional but approachable
- Voice: Second person ("you") for engagement
- Sentences: Clear, varied, average 15-20 words
- Paragraphs: 3-5 sentences maximum
- Technical terms: Define on first use
- Math: Always explain notation before use
- Examples: Concrete before abstract
</writing_guidelines>

<success_criteria>
- [ ] Frontmatter complete and correct
- [ ] All sections written
- [ ] Word count in range (2000-2500)
- [ ] Reading time ~15 minutes
- [ ] Diagrams created or described
- [ ] Tables formatted correctly
- [ ] Code syntax-highlighted
- [ ] External resources included
- [ ] Math notation correct (KaTeX)
- [ ] Self-review checklist passed
</success_criteria>

<output_file>
agent_[a/b]_state/drafts/[lecture_id]_draft_v1.md
</output_file>

<next_phase>
After draft complete, proceed to Phase 4: Cross-Review
Signal readiness: "Draft ready for review: [lecture_id]"
</next_phase>
```

---

### PHASE 4: CROSS-REVIEW

**Prompt for Peer Review:**

```xml
<phase>CROSS-REVIEW</phase>
<reviewer>[AGENT_A/AGENT_B]</reviewer>
<author>[AGENT_B/AGENT_A]</author>
<draft>
  <lecture_id>[LECTURE_FOLDER]</lecture_id>
  <path>agent_[b/a]_state/drafts/[lecture_id]_draft_v1.md</path>
</draft>

<task>
Review the peer agent's blog post draft for quality, accuracy, and completeness.

<review_process>

<step number="1" name="Read Draft Completely">
Read the entire draft to understand content and flow.
</step>

<step number="2" name="Accuracy Review">
Verify against source materials:
- [ ] Definitions match lecture content
- [ ] Mathematical formulas are correct
- [ ] Examples are accurate
- [ ] Step-by-step solutions are valid
- [ ] Terminology consistent with course
- [ ] No factual errors

**Critical Issues Found:**
[List any accuracy issues with location and suggested fix]

**Minor Issues Found:**
[List any minor issues]
</step>

<step number="3" name="Completeness Review">
Check coverage:
- [ ] All topics from lesson plan covered
- [ ] All exercises addressed
- [ ] Prerequisites mentioned/explained
- [ ] Key concepts fully explained
- [ ] Examples cover different aspects
- [ ] External resources relevant

**Missing Content:**
[List any missing content with suggested additions]
</step>

<step number="4" name="Readability Review">
Assess clarity and flow:
- [ ] Introduction sets context clearly
- [ ] Logical flow between sections
- [ ] Concepts build appropriately
- [ ] Technical terms defined before use
- [ ] Examples clear and explained
- [ ] Mathematical notation explained
- [ ] Paragraphs appropriately sized

**Readability Issues:**
[List issues with location and improvement suggestions]
</step>

<step number="5" name="Visual Elements Review">
Check diagrams, tables, code:
- [ ] Diagrams accurate and clear
- [ ] Tables well-formatted
- [ ] Code syntax-highlighted
- [ ] Visuals support text
- [ ] Diagrams/tables referenced in text

**Visual Issues:**
[List issues with suggested fixes]
</step>

<step number="6" name="Structure Review">
Verify organization:
- [ ] Frontmatter complete and correct
- [ ] Single H1 (title)
- [ ] H2 for main sections
- [ ] H3 for subsections
- [ ] Sections appropriately sized
- [ ] Conclusion synthesizes key points

**Structure Issues:**
[List issues with suggested fixes]
</step>

<step number="7" name="Generate Review Feedback">
Create structured feedback using REVIEW_TEMPLATE.md format.
</step>

</review_process>
</task>

<output_format>
Save review to: agent_[a/b]_state/reviews/[lecture_id]_review_v1.md

Use this structure:
```markdown
# Peer Review: [Draft Title]

**Reviewer:** [Agent ID]
**Review Date:** [YYYY-MM-DD]
**Draft Version:** v1
**Lecture:** [Lecture ID] - [Lecture Title]

## Overall Assessment

**Quality Rating:** [Excellent / Good / Needs Improvement / Poor]

**Summary:**
[2-3 sentence summary of quality, strengths, concerns]

**Recommendation:** [Approve / Approve with Minor Changes / Needs Major Revision]

## Critical Issues (Must Fix)

1. **[Issue Title]**
   - Location: [Section/paragraph]
   - Issue: [Description]
   - Impact: [Why critical]
   - Fix: [Specific recommendation]

## Moderate Issues (Should Fix)

1. **[Issue Title]**
   - Location: [Section/paragraph]
   - Issue: [Description]
   - Fix: [Recommendation]

## Minor Issues (Nice to Have)

1. **[Issue Title]**
   - Location: [Section/paragraph]
   - Issue: [Description]
   - Fix: [Recommendation]

## Strengths

1. [Strength 1]
2. [Strength 2]
3. [Strength 3]

## Priority Actions

1. [Action 1] - [Estimated effort]
2. [Action 2] - [Estimated effort]
3. [Action 3] - [Estimated effort]

## Approval Status

- [ ] Approved
- [ ] Approved with Minor Changes
- [ ] Needs Major Revision

**Reviewer:** [Agent ID]
**Date:** [YYYY-MM-DD]
```
</output_format>

<success_criteria>
- [ ] All review categories evaluated
- [ ] Specific, actionable feedback provided
- [ ] Issues prioritized correctly
- [ ] Strengths acknowledged
- [ ] Review file created
</success_criteria>

<output_file>
agent_[a/b]_state/reviews/[lecture_id]_review_v1.md
</output_file>

<next_phase>
After review complete, signal:
"Review complete: [lecture_id], feedback in agent_[a/b]_state/reviews/[lecture_id]_review_v1.md"

Peer agent proceeds to Phase 5: Refinement
</next_phase>
```

---

### PHASE 5: ITERATIVE REFINEMENT

**Prompt for Refinement:**

```xml
<phase>REFINEMENT</phase>
<agent>[AGENT_A/AGENT_B]</agent>
<iteration>[1/2/3]</iteration>
<lecture>
  <id>[LECTURE_FOLDER]</id>
  <title>[LECTURE_TITLE]</title>
</lecture>

<input>
- Current draft: agent_[a/b]_state/drafts/[lecture_id]_draft_v[N].md
- Review feedback: agent_[b/a]_state/reviews/[lecture_id]_review_v[N].md
</input>

<task>
Address review feedback and create improved draft.

<step number="1" name="Read Review Feedback">
Carefully read all feedback, noting:
- Critical issues (must fix)
- Moderate issues (should fix)
- Minor issues (nice to have)
- Priority actions
</step>

<step number="2" name="Prioritize Fixes">
Order by importance:
1. Critical accuracy issues
2. Completeness gaps
3. Readability improvements
4. Visual element fixes
5. Structure/polish
</step>

<step number="3" name="Apply Fixes">
For each issue:
- Locate the problem in the draft
- Apply the recommended fix
- Verify the fix is correct
- Mark issue as addressed
</step>

<step number="4" name="Self-Validate">
After all fixes:
- Re-read entire draft
- Verify quality maintained
- Check word count still in range
- Confirm reading time appropriate
</step>

<step number="5" name="Create Updated Draft">
Save to: agent_[a/b]_state/drafts/[lecture_id]_draft_v[N+1].md
</step>

<step number="6" name="Determine Next Action">
If critical issues remain or major changes made:
  → Request re-review
If only minor changes made:
  → Move to finalization
If max iterations (3) reached:
  → Move to finalization with notes
</step>
</task>

<success_criteria>
- [ ] All critical feedback addressed
- [ ] All moderate issues resolved
- [ ] Quality maintained or improved
- [ ] Word count in range
- [ ] Reading time appropriate
- [ ] Updated draft created
</success_criteria>

<output_file>
agent_[a/b]_state/drafts/[lecture_id]_draft_v[N+1].md
</output_file>

<next_phase>
If re-review needed:
  → Return to Phase 4 with new draft
If finalization ready:
  → Proceed to Phase 6
</next_phase>
```

---

### PHASE 6: FINALIZATION

**Prompt for Finalization:**

```xml
<phase>FINALIZATION</phase>
<agent>[AGENT_A/AGENT_B]</agent>
<lecture>
  <id>[LECTURE_FOLDER]</id>
  <title>[LECTURE_TITLE]</title>
  <date>[YYYY-MM-DD]</date>
</lecture>

<input>
- Final draft: agent_[a/b]_state/drafts/[lecture_id]_draft_v[final].md
- Approval status from peer review
</input>

<task>
Finalize the blog post for publication.

<step number="1" name="Final Quality Check">
Verify all quality standards met:
- [ ] Word count: 2000-2500 ✓
- [ ] Reading time: 15 minutes ±2 ✓
- [ ] Diagrams: 1+ per major topic ✓
- [ ] Examples: 2-3 per concept ✓
- [ ] External resources: 3-5 links ✓
- [ ] Math notation: KaTeX syntax ✓
- [ ] Peer review: Approved ✓
</step>

<step number="2" name="Verify Frontmatter">
Ensure frontmatter is complete:
```yaml
---
layout: post
title: "[Final title]"
date: [YYYY-MM-DD]
categories:
  - "[Course category]"
tags:
  - [5 relevant tags]
excerpt: "[Compelling excerpt]"
reading_time: 15
course: "[Course name]"
---
```
</step>

<step number="3" name="Format for Publication">
- Verify file naming: YYYY-MM-DD-title-slug.md
- Ensure all asset paths are correct
- Remove any draft markers or comments
- Validate Markdown syntax
</step>

<step number="4" name="Create Final Post">
Copy to: _posts/[YYYY-MM-DD]-[title-slug].md
</step>

<step number="5" name="Update Agent State">
Update agent_[a/b]_state/agent_[a/b]_state.json:
- Move lecture from current to completed
- Update progress counts
- Set next lecture as current
- Log completion timestamp
</step>

<step number="6" name="Archive Working Files">
Keep extraction, plan, drafts, and reviews in agent state folder for reference.
</step>
</task>

<success_criteria>
- [ ] All quality checks passed
- [ ] Frontmatter complete and correct
- [ ] File copied to _posts/
- [ ] State file updated
- [ ] Working files archived
- [ ] Lecture marked complete
</success_criteria>

<output_file>
_posts/[YYYY-MM-DD]-[title-slug].md
</output_file>

<next_action>
If more lectures pending:
  → Return to Phase 1 for next lecture
If all lectures complete:
  → Generate completion report
</next_action>
```

---

## Execution Coordination

### Parallel Processing Protocol

```
STEP 1: Initialize Both Agents
├── Agent A: Load state, identify next Logic lecture
└── Agent B: Load state, identify next Intelligent Systems lecture

STEP 2: Parallel Extraction
├── Agent A: Extract content from Logic lecture
└── Agent B: Extract content from IS lecture
[Both work simultaneously]

STEP 3: Parallel Planning
├── Agent A: Create lesson plan for Logic lecture
└── Agent B: Create lesson plan for IS lecture
[Both work simultaneously]

STEP 4: Parallel Drafting
├── Agent A: Write Logic blog post draft
└── Agent B: Write IS blog post draft
[Both work simultaneously]

STEP 5: Cross-Review Exchange
├── Agent A: Review Agent B's IS draft
└── Agent B: Review Agent A's Logic draft
[Exchange feedback documents]

STEP 6: Parallel Refinement
├── Agent A: Address B's feedback, improve Logic draft
└── Agent B: Address A's feedback, improve IS draft
[Iterate until quality standards met]

STEP 7: Parallel Finalization
├── Agent A: Finalize and publish Logic post
└── Agent B: Finalize and publish IS post
[Update states, advance to next lectures]

STEP 8: Repeat or Complete
├── If more lectures: Return to STEP 2
└── If all complete: Generate summary report
```

### Communication Protocol

```
Agent A → Agent B:
  "Draft ready for review: [lecture_id]"
  
Agent B → Agent A:
  "Review complete: [lecture_id], feedback in [path]"
  
Agent A → Agent B:
  "Revision complete: [lecture_id], draft v[N] ready"
  
Both Agents:
  "Lecture [lecture_id] complete and published"
```

---

## State Tracking

### Agent State Schema

```json
{
  "agent_id": "string",
  "course": "string",
  "course_path": "string",
  "status": "initializing|extracting|planning|drafting|reviewing|refining|finalizing|complete",
  "current_lecture": {
    "number": "integer",
    "title": "string",
    "folder": "string",
    "status": "pending|in_progress|review_pending|revising|complete",
    "iteration": "integer",
    "peer_review_score": "number|null",
    "peer_review_status": "pending|received|addressed"
  },
  "progress": {
    "total_lectures": "integer",
    "completed": "integer",
    "current_index": "integer",
    "pending_lectures": "integer"
  },
  "batch_config": {
    "mode": "continuous|single",
    "auto_advance": "boolean",
    "peer_review_wait": "integer",
    "max_iterations": "integer"
  },
  "quality_metrics": {
    "word_count": "integer",
    "reading_time": "integer",
    "diagrams_count": "integer",
    "tables_count": "integer",
    "external_refs": "integer"
  },
  "completed_lectures": [],
  "lecture_queue": [],
  "pending_actions": [],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Update State After Each Phase

```javascript
// After Extraction
state.status = "planning"
state.current_lecture.status = "in_progress"
state.updated_at = new Date().toISOString()

// After Planning
state.status = "drafting"
state.updated_at = new Date().toISOString()

// After Drafting
state.status = "reviewing"
state.current_lecture.status = "review_pending"
state.updated_at = new Date().toISOString()

// After Review Received
state.status = "refining"
state.current_lecture.status = "revising"
state.current_lecture.peer_review_status = "received"
state.current_lecture.iteration += 1
state.updated_at = new Date().toISOString()

// After Finalization
state.status = "complete"
state.current_lecture.status = "complete"
state.completed_lectures.push(current_lecture)
state.progress.completed += 1
state.progress.current_index += 1
// Set next lecture as current
state.current_lecture = state.lecture_queue[next_index]
state.updated_at = new Date().toISOString()
```

---

## Quality Gates

### Gate 1: Extraction Complete
```
- [ ] All PDF content extracted
- [ ] All topics identified
- [ ] All exercises captured
- [ ] Diagrams described
- [ ] Extraction file exists
```

### Gate 2: Plan Complete
```
- [ ] All topics included
- [ ] Logical progression
- [ ] Reading time: 15 minutes
- [ ] Plan file exists
```

### Gate 3: Draft Complete
```
- [ ] All sections written
- [ ] Word count: 2000-2500
- [ ] Diagrams created
- [ ] Examples included
- [ ] External resources added
- [ ] Draft file exists
```

### Gate 4: Review Complete
```
- [ ] All categories reviewed
- [ ] Issues prioritized
- [ ] Actionable feedback provided
- [ ] Review file exists
```

### Gate 5: Refinement Complete
```
- [ ] All critical issues addressed
- [ ] Quality maintained
- [ ] Updated draft exists
- [ ] Max iterations not exceeded
```

### Gate 6: Final Approval
```
- [ ] Peer review passed
- [ ] All quality standards met
- [ ] Frontmatter complete
- [ ] Published to _posts/
- [ ] State updated
```

---

## Error Recovery

### Missing Materials
```xml
<error type="missing_materials">
  <action>
    1. Document what's missing
    2. Use available materials
    3. Note gaps in extraction
    4. Continue with limitations documented
  </action>
</error>
```

### Quality Gate Failure
```xml
<error type="quality_gate_failure">
  <action>
    1. Identify which criteria failed
    2. Determine root cause
    3. Apply targeted fix
    4. Re-run quality check
    5. If 3 iterations exceeded, flag for manual review
  </action>
</error>
```

### Review Disagreement
```xml
<error type="review_disagreement">
  <action>
    1. Document disagreement
    2. Cross-reference with source materials
    3. Apply authoritative source decision
    4. Document resolution rationale
  </action>
</error>
```

---

## Quick Start Commands

### Start Agent A (Logic)
```
Initialize as Agent A for CS-5384 Logic for Computer Scientists.
Load state from agent_a_state/agent_a_state.json.
Begin Phase 1: Extraction for current lecture.
```

### Start Agent B (Intelligent Systems)
```
Initialize as Agent B for CS-5368 Intelligent Systems.
Load state from agent_b_state/agent_b_state.json.
Begin Phase 1: Extraction for current lecture.
```

### Resume After Interruption
```
Load agent state from agent_[a/b]_state/agent_[a/b]_state.json.
Identify current phase from state.status field.
Resume from current phase for current_lecture.
```

---

## Summary

This workflow tree provides:

1. **Clear phase definitions** - Each phase has explicit inputs, outputs, and success criteria
2. **Parallel execution** - Both agents can work simultaneously
3. **Cross-review mechanism** - Quality assurance through peer review
4. **Iterative refinement** - Up to 3 iterations per lecture
5. **State tracking** - Persistent state for resume capability
6. **Quality gates** - Checkpoints at each phase transition
7. **Error recovery** - Defined procedures for common issues

Execute phases sequentially for each lecture, with parallel processing between agents.
