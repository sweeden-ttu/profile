# Blog Post Generation - Quick Reference

## System Overview

**Two-Agent Parallel Workflow:**
- Agent A: CS-5384 Logic for Computer Scientists
- Agent B: CS-5368 Intelligent Systems
- Both work in parallel, then cross-review

## Workflow Phases

1. **Extraction** → Extract content from PDFs, JSON, transcripts
2. **Planning** → Create lesson plan (15 min reading time)
3. **Drafting** → Write blog post with diagrams, examples, resources
4. **Reviewing** → Cross-review each other's work
5. **Refining** → Address feedback iteratively
6. **Finalizing** → Both agents approve, create final post

## Key Files

| File | Purpose |
|------|---------|
| `BLOG_POST_GENERATION_INSTRUCTIONS.md` | Complete instructions |
| `AGENT_PROMPTS.md` | Structured prompts for each phase |
| `WORKFLOW_DIAGRAM.md` | Visual workflow diagrams |
| `REVIEW_TEMPLATE.md` | Review feedback template |
| `QUALITY_CHECKLIST.md` | Quality validation checklist |
| `README_BLOG_GENERATION.md` | System overview |

## Quality Targets

- **Reading Time**: 15 minutes (±2 min)
- **Word Count**: 2000-2500 words
- **Diagrams**: 1+ per major topic
- **Examples**: 2-3 per major concept
- **Resources**: 3-5 external links

## Jekyll Frontmatter Template

```yaml
---
layout: post
title: "[Descriptive, SEO-friendly Title]"
date: YYYY-MM-DD
categories: [category1, category2]
tags: [tag1, tag2, tag3, tag4, tag5]
excerpt: "One-sentence summary (50-100 words)"
reading_time: 15
course: "Logic for Computer Scientists" | "Intelligent Systems"
---
```

## Success Criteria

### Extraction
- [ ] All PDF content extracted
- [ ] All topics identified
- [ ] All exercises captured
- [ ] Diagrams described

### Planning
- [ ] All topics included
- [ ] Logical progression
- [ ] Reading time: 15 minutes

### Drafting
- [ ] All sections written
- [ ] Diagrams created
- [ ] Examples included
- [ ] Resources added

### Review
- [ ] Accuracy verified
- [ ] Completeness confirmed
- [ ] Readability assessed
- [ ] Visual quality checked

### Final
- [ ] Both agents approve
- [ ] All checks pass
- [ ] Ready for publication

## Common Commands

```bash
# Initialize agent
# Use Agent Initialization Prompt from AGENT_PROMPTS.md

# Extract content
# Follow Phase 1 instructions

# Generate lesson plan
# Follow Phase 2 instructions

# Create draft
# Follow Phase 3 instructions

# Review draft
# Use REVIEW_TEMPLATE.md

# Refine draft
# Follow Phase 5 instructions

# Finalize
# Follow Phase 6 instructions
```

## Review Checklist (Quick)

- [ ] Accuracy: Definitions correct, formulas accurate
- [ ] Completeness: All topics covered, exercises addressed
- [ ] Readability: Clear flow, terms defined, examples clear
- [ ] Visuals: Diagrams accurate, tables formatted, code highlighted
- [ ] Structure: Frontmatter correct, headings logical, conclusion strong

## Course Tags

- CS-5384: `logic-for-computer-scientists`
- CS-5368: `intelligent-systems`

## File Naming

- Drafts: `draft-v1.md`, `draft-v2.md`, etc.
- Reviews: `review-feedback-v1.md`, etc.
- Final: `final-post.md`
- Published: `YYYY-MM-DD-title.md`

## State Tracking

```json
{
  "phase": "extraction|planning|drafting|reviewing|refining|finalizing",
  "iteration": 1,
  "success_criteria": {
    "extraction_complete": false,
    "lesson_plan_complete": false,
    "draft_complete": false,
    "review_passed": false,
    "final_approved": false
  }
}
```

## Error Recovery

1. **Document** the issue
2. **Assess** impact
3. **Take action** (alternatives, research, assumptions)
4. **Resume** workflow
5. **Note** gaps/limitations

## Reflection Template

```xml
<reflection>
  <progress>Current state and progress</progress>
  <issues>Problems or concerns</issues>
  <next_steps>What to do next</next_steps>
  <success_check>Criteria met?</success_check>
</reflection>
```

## Tips

1. **Start Small**: Process one lecture completely before moving to next
2. **Quality First**: Don't rush - accuracy and completeness matter
3. **Use Templates**: Follow templates for consistency
4. **Track State**: Maintain state throughout process
5. **Iterate**: Multiple review cycles improve quality
6. **Document**: Note decisions, assumptions, gaps

## Quick Links

- Full Instructions: `BLOG_POST_GENERATION_INSTRUCTIONS.md`
- Agent Prompts: `AGENT_PROMPTS.md`
- Workflow: `WORKFLOW_DIAGRAM.md`
- Review: `REVIEW_TEMPLATE.md`
- Quality: `QUALITY_CHECKLIST.md`

---

**Remember**: Follow the structured workflow, use the templates, and prioritize quality over speed.
