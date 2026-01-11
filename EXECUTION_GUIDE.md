# Multi-Agent Workflow Execution Guide

## Quick Start

### Check Current Status

```bash
# View both agents' status
python scripts/workflow_orchestrator.py --agent both --action status

# View specific agent
python scripts/workflow_orchestrator.py --agent a --action status
python scripts/workflow_orchestrator.py --agent b --action status
```

### Get Next Action

```bash
# Get next prompt for both agents
python scripts/workflow_orchestrator.py --agent both --action next

# Get next prompt for specific agent
python scripts/workflow_orchestrator.py --agent a --action next
```

---

## Execution Workflow

### Step 1: Initialize Agent Session

Start a new conversation with this initialization prompt:

```
I am initializing as Agent [A/B] for the blog post generation workflow.

**My Assignment:**
- Agent ID: [logic_agent_a / intelligence_agent_b]  
- Course: [CS-5384 Logic for Computer Scientists / CS-5368 Intelligent Systems]
- Course Path: [/Users/sdw/CS-5384-Logic-for-Computer-Scientists / /Users/sdw/CS-5368-Intelligent-Systems]

**Initialization Tasks:**
1. Read my agent state: agent_[a/b]_state/agent_[a/b]_state.json
2. Read lecture inventory: agent_[a/b]_state/lecture_inventory.json
3. Identify next lecture to process
4. Verify lecture materials exist

Please load my state and report readiness.
```

### Step 2: Execute Phases Sequentially

For each lecture, execute phases in order:

```
┌─────────────┐
│ EXTRACTION  │ ─── Extract content from PDFs, JSON, transcripts
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  PLANNING   │ ─── Create lesson plan (15-min reading time)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  DRAFTING   │ ─── Write complete blog post draft
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  REVIEWING  │ ─── Cross-review peer's draft
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  REFINING   │ ─── Address feedback, improve draft
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ FINALIZING  │ ─── Publish to _posts/
└─────────────┘
```

---

## Phase Execution Prompts

### Phase 1: Extraction

```
Execute Phase 1: EXTRACTION

**Current Lecture:** [from state file]
**Lecture Path:** [course_path]/Lectures/[folder]

**Tasks:**
1. List all files in the lecture folder
2. For each PDF:
   - Extract text content
   - Note slide titles/headings
   - Identify mathematical formulas
   - Describe diagrams
   - Extract tables
3. Parse JSON metadata (topics, exercises)
4. Parse transcripts if available
5. Create extraction document

**Output:** agent_[a/b]_state/extractions/[lecture_folder]_extracted.md

**Success Criteria:**
- [ ] All PDFs processed
- [ ] All topics identified
- [ ] Exercises captured
- [ ] Diagrams described
- [ ] Extraction file created

When complete, update state and proceed to Planning phase.
```

### Phase 2: Planning

```
Execute Phase 2: PLANNING

**Input:** agent_[a/b]_state/extractions/[lecture_folder]_extracted.md

**Tasks:**
1. Analyze topic dependencies
2. Order topics: foundational → advanced
3. Allocate reading time per section
4. Plan visual elements
5. Include exercises

**Output:** agent_[a/b]_state/plans/[lecture_folder]_lesson_plan.md

**Lesson Plan Structure:**
- Learning Objectives
- Prerequisites
- Section breakdown with reading times
- Visual element placements
- Exercises
- Total: 15 minutes (~2250 words)

When complete, proceed to Drafting phase.
```

### Phase 3: Drafting

```
Execute Phase 3: DRAFTING

**Inputs:**
- Lesson plan: agent_[a/b]_state/plans/[lecture_folder]_lesson_plan.md
- Extraction: agent_[a/b]_state/extractions/[lecture_folder]_extracted.md
- Math rules: @math-rules.md

**Tasks:**
1. Create Jekyll frontmatter
2. Write introduction (2-3 paragraphs)
3. Write main content sections
4. Create diagrams (Mermaid)
5. Add KaTeX math notation
6. Include exercises with solutions
7. Search and add external resources (3-5)
8. Write conclusion

**Output:** agent_[a/b]_state/drafts/[lecture_folder]_draft_v1.md

**Targets:**
- Word count: 2000-2500
- Reading time: 15 minutes
- Diagrams: 1+ per major topic
- External resources: 3-5

When complete, signal: "Draft ready for review: [lecture_folder]"
```

### Phase 4: Cross-Review

```
Execute Phase 4: CROSS-REVIEW

**I am reviewing:** Agent [B/A]'s draft
**Draft location:** agent_[b/a]_state/drafts/[lecture_folder]_draft_v1.md

**Review Checklist:**
□ Accuracy: Definitions, formulas, examples
□ Completeness: Topics, exercises covered
□ Readability: Flow, clarity, explanations
□ Visuals: Diagrams, tables, code
□ Structure: Frontmatter, headings

**Output:** agent_[a/b]_state/reviews/[lecture_folder]_review_v1.md

**Review Format:**
- Overall assessment and recommendation
- Critical issues (must fix)
- Moderate issues (should fix)
- Minor issues (nice to have)
- Strengths
- Priority actions

When complete, signal: "Review complete: [lecture_folder]"
```

### Phase 5: Refinement

```
Execute Phase 5: REFINEMENT

**Inputs:**
- My draft: agent_[a/b]_state/drafts/[lecture_folder]_draft_v[N].md
- Peer feedback: agent_[b/a]_state/reviews/[lecture_folder]_review_v[N].md

**Tasks:**
1. Read all feedback carefully
2. Prioritize fixes: critical → moderate → minor
3. Apply fixes systematically
4. Verify quality maintained
5. Create updated draft

**Output:** agent_[a/b]_state/drafts/[lecture_folder]_draft_v[N+1].md

**Decision Tree:**
- Critical issues remain? → Request re-review
- Only minor changes? → Proceed to finalization
- Iteration >= 3? → Finalize with notes

When complete, signal next action.
```

### Phase 6: Finalization

```
Execute Phase 6: FINALIZATION

**Final Draft:** agent_[a/b]_state/drafts/[lecture_folder]_draft_v[final].md

**Final Checks:**
□ Word count: 2000-2500
□ Reading time: 15 min ±2
□ Diagrams: Present
□ External resources: 3-5
□ Math notation: KaTeX
□ Peer review: Approved

**Tasks:**
1. Verify all quality standards
2. Format filename: YYYY-MM-DD-title-slug.md
3. Copy to _posts/ directory
4. Update agent state:
   - Move lecture to completed
   - Update progress counts
   - Set next lecture as current

**Output:** _posts/YYYY-MM-DD-title-slug.md

When complete, signal: "Lecture [folder] complete and published"
```

---

## Parallel Processing

Both agents work simultaneously. Here's the coordination pattern:

```
Time →
────────────────────────────────────────────────────────────

Agent A: [Extract] [Plan] [Draft] ──────┐
                                        │ Exchange
Agent B: [Extract] [Plan] [Draft] ──────┤ Drafts
                                        │
        ┌───────────────────────────────┘
        │
        ▼
Agent A: [Review B's Draft] ────────────┐
                                        │ Exchange
Agent B: [Review A's Draft] ────────────┤ Feedback
                                        │
        ┌───────────────────────────────┘
        │
        ▼
Agent A: [Refine] [Finalize] ──► Next Lecture
Agent B: [Refine] [Finalize] ──► Next Lecture
```

---

## State Management

### State File Locations

```
agent_a_state/
├── agent_a_state.json          # Agent A state
├── lecture_inventory.json      # Lecture list
├── extractions/                # Extracted content
├── plans/                      # Lesson plans
├── drafts/                     # Draft versions
└── reviews/                    # Reviews given

agent_b_state/
├── agent_b_state.json          # Agent B state
├── lecture_inventory.json      # Lecture list
├── extractions/                # Extracted content
├── plans/                      # Lesson plans
├── drafts/                     # Draft versions
└── reviews/                    # Reviews given
```

### State Fields to Update

After each phase, update your state file:

```json
{
  "status": "[current_phase]",
  "current_lecture": {
    "status": "[pending|in_progress|review_pending|revising|complete]",
    "iteration": [1|2|3],
    "peer_review_status": "[pending|received|addressed]"
  },
  "updated_at": "[ISO_TIMESTAMP]"
}
```

---

## Communication Signals

### Between Agents

| Signal | Meaning |
|--------|---------|
| `Draft ready for review: [id]` | Draft complete, peer can review |
| `Review complete: [id]` | Feedback available for author |
| `Revision complete: [id]` | Updated draft ready |
| `Approved: [id]` | Ready for finalization |
| `Published: [id]` | Lecture complete |

### Progress Updates

Update `pending_actions` in state file:
```json
{
  "pending_actions": [
    "Waiting for peer review from Agent B",
    "Ready to extract Lecture 5"
  ]
}
```

---

## Quality Gates

### Gate Checks

| Phase | Check |
|-------|-------|
| Extraction | All content captured, file created |
| Planning | All topics, 15-min reading time |
| Drafting | 2000-2500 words, diagrams, resources |
| Reviewing | All checklist items evaluated |
| Refining | Critical issues addressed |
| Finalizing | All standards met, peer approved |

### Quality Metrics Target

```json
{
  "word_count": "2000-2500",
  "reading_time": "15 ±2 minutes",
  "diagrams_count": "≥1 per major topic",
  "tables_count": "≥1",
  "external_refs": "3-5"
}
```

---

## Troubleshooting

### Issue: Missing lecture materials

```
Action:
1. Check lecture_inventory.json for file list
2. Verify files exist in course_path
3. If missing, document gap and proceed with available
4. Note limitation in extraction document
```

### Issue: Review disagreement

```
Action:
1. Cross-reference with source PDFs
2. Check against course textbooks
3. Apply authoritative source decision
4. Document resolution rationale
```

### Issue: Quality gate failure

```
Action:
1. Identify failed criteria
2. Determine root cause
3. Apply targeted fix
4. Re-run quality check
5. If 3 iterations exceeded, flag for manual review
```

### Issue: State file corruption

```
Action:
1. Check for JSON syntax errors
2. Restore from backup or reconstruct
3. Verify all required fields present
4. Resume from last known good state
```

---

## Command Reference

```bash
# Status commands
python scripts/workflow_orchestrator.py status          # Both agents
python scripts/workflow_orchestrator.py --agent a status
python scripts/workflow_orchestrator.py --agent b status

# Next action commands
python scripts/workflow_orchestrator.py next            # Both agents
python scripts/workflow_orchestrator.py --agent a next
python scripts/workflow_orchestrator.py --agent b next

# Phase prompts
python scripts/workflow_orchestrator.py --agent a prompt extraction
python scripts/workflow_orchestrator.py --agent a prompt planning
python scripts/workflow_orchestrator.py --agent a prompt drafting
python scripts/workflow_orchestrator.py --agent a prompt reviewing
python scripts/workflow_orchestrator.py --agent a prompt refining
python scripts/workflow_orchestrator.py --agent a prompt finalizing

# Advance phase
python scripts/workflow_orchestrator.py --agent a advance
python scripts/workflow_orchestrator.py --agent both advance
```

---

## File Naming Conventions

| File Type | Pattern | Example |
|-----------|---------|---------|
| Extraction | `[folder]_extracted.md` | `Lec_Oct03_extracted.md` |
| Lesson Plan | `[folder]_lesson_plan.md` | `Lec_Oct03_lesson_plan.md` |
| Draft | `[folder]_draft_v[N].md` | `Lec_Oct03_draft_v1.md` |
| Review | `[folder]_review_v[N].md` | `Lec_Oct03_review_v1.md` |
| Final Post | `YYYY-MM-DD-title-slug.md` | `2025-10-03-natural-deduction.md` |

---

## Summary Checklist

### Per Lecture

- [ ] Phase 1: Extraction complete
- [ ] Phase 2: Lesson plan created
- [ ] Phase 3: Draft written
- [ ] Phase 4: Peer review received
- [ ] Phase 5: Feedback addressed
- [ ] Phase 6: Published to _posts/
- [ ] State updated

### Per Session

- [ ] State file loaded
- [ ] Current lecture identified
- [ ] Phase determined
- [ ] Work completed
- [ ] State saved
- [ ] Next action signaled

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| `WORKFLOW_TREE.md` | Complete workflow tree and prompts |
| `AGENT_PROMPTS.md` | Structured prompts for each phase |
| `WORKFLOW_DIAGRAM.md` | Visual workflow diagrams |
| `REVIEW_TEMPLATE.md` | Peer review template |
| `QUALITY_CHECKLIST.md` | Quality validation checklist |
| `README_BLOG_GENERATION.md` | System overview |
| `QUICK_REFERENCE.md` | Quick reference card |
| `math-rules.md` | Mathematical notation standards |
| `CLAUDE.md` | Site structure and guidelines |

---

**Remember:** Quality over speed. Take time to ensure accuracy, completeness, and readability. The iterative review process catches issues early and improves quality continuously.
