# Two-Agent Blog Post Generation Workflow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Blog Post Generation System                   │
│                                                                   │
│  ┌────────────────────────┐      ┌────────────────────────┐    │
│  │   Agent A              │      │   Agent B              │    │
│  │   CS-5384 Logic       │      │   CS-5368 Intelligent │    │
│  │   for CS              │      │   Systems             │    │
│  └────────────────────────┘      └────────────────────────┘    │
│           │                                │                     │
│           └────────────┬───────────────────┘                     │
│                        │                                         │
│                        ▼                                         │
│              ┌─────────────────────┐                            │
│              │  Cross-Review Loop  │                            │
│              └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## Parallel Processing Flow

```
Time →
│
├─ Agent A: Lecture 1 ──────────────┐
│                                    │
├─ Agent B: Lecture 1 ──────────────┤─── Parallel Processing
│                                    │
├─ Agent A: Lecture 2 ──────────────┤
│                                    │
├─ Agent B: Lecture 2 ──────────────┘
│
└─ Review Phase ──────────────────── Cross-Review
```

## Detailed Workflow

### Phase 1: Parallel Extraction & Planning

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent A (CS-5384)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Lecture Queue: [Lec1, Lec2, Lec3, ...]                    │
│                                                              │
│  For each lecture:                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 1. Extract Content                                │     │
│  │    - Parse PDF slides                             │     │
│  │    - Parse topics-and-exercises.json             │     │
│  │    - Parse transcripts (if available)             │     │
│  │    - Create extracted-content.json                │     │
│  └────────────────────────────────────────────────────┘     │
│                        │                                      │
│                        ▼                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 2. Generate Lesson Plan                           │     │
│  │    - Analyze topic dependencies                   │     │
│  │    - Order topics logically                       │     │
│  │    - Estimate reading time                        │     │
│  │    - Create lesson-plan.md                        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Agent B (CS-5368)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Lecture Queue: [Lec1, Lec2, Lec3, ...]                    │
│                                                              │
│  For each lecture:                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 1. Extract Content                                │     │
│  │    - Parse PDF slides                             │     │
│  │    - Parse summary PDFs                           │     │
│  │    - Parse video transcripts (if available)      │     │
│  │    - Create extracted-content.json                │     │
│  └────────────────────────────────────────────────────┘     │
│                        │                                      │
│                        ▼                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 2. Generate Lesson Plan                           │     │
│  │    - Analyze topic dependencies                   │     │
│  │    - Order topics logically                       │     │
│  │    - Estimate reading time                        │     │
│  │    - Create lesson-plan.md                        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Parallel Drafting

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent A (CS-5384)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  For each lecture:                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 3. Create Draft                                   │     │
│  │    - Write blog post content                     │     │
│  │    - Create diagrams                             │     │
│  │    - Format tables                               │     │
│  │    - Add examples                                │     │
│  │    - Include external resources                  │     │
│  │    - Create draft-v1.md                          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Agent B (CS-5368)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  For each lecture:                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 3. Create Draft                                   │     │
│  │    - Write blog post content                     │     │
│  │    - Create diagrams                             │     │
│  │    - Format tables                               │     │
│  │    - Add examples                                │     │
│  │    - Include external resources                  │     │
│  │    - Create draft-v1.md                          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Cross-Review Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    Review Cycle                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐     │
│  │  Agent A Draft      │      │  Agent B Draft      │     │
│  │  (CS-5384 Lec1)     │      │  (CS-5368 Lec1)      │     │
│  └──────────────────────┘      └──────────────────────┘     │
│           │                              │                     │
│           │                              │                     │
│           ▼                              ▼                     │
│  ┌──────────────────────┐      ┌──────────────────────┐     │
│  │  Agent B Reviews    │      │  Agent A Reviews     │     │
│  │  Agent A's Draft    │      │  Agent B's Draft     │     │
│  └──────────────────────┘      └──────────────────────┘     │
│           │                              │                     │
│           │                              │                     │
│           ▼                              ▼                     │
│  ┌──────────────────────┐      ┌──────────────────────┐     │
│  │  Review Feedback    │      │  Review Feedback     │     │
│  │  (review-feedback)  │      │  (review-feedback)   │     │
│  └──────────────────────┘      └──────────────────────┘     │
│           │                              │                     │
│           │                              │                     │
│           ▼                              ▼                     │
│  ┌──────────────────────┐      ┌──────────────────────┐     │
│  │  Agent A Refines    │      │  Agent B Refines     │     │
│  │  Creates draft-v2   │      │  Creates draft-v2    │     │
│  └──────────────────────┘      └──────────────────────┘     │
│           │                              │                     │
│           └──────────────┬───────────────┘                     │
│                          │                                     │
│                          ▼                                     │
│              ┌─────────────────────┐                            │
│              │  Quality Check     │                            │
│              │  All issues fixed? │                            │
│              └─────────────────────┘                            │
│                          │                                     │
│                    ┌─────┴─────┐                               │
│                    │           │                               │
│                   Yes         No                               │
│                    │           │                               │
│                    │           └───► Repeat Review            │
│                    │                                           │
│                    ▼                                           │
│            ┌───────────────┐                                   │
│            │  Finalize     │                                   │
│            │  Create final │                                   │
│            │  -post.md     │                                   │
│            └───────────────┘                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## State Transition Diagram

```
                    ┌─────────────┐
                    │  Initialize │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Extraction │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Planning   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Drafting   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Reviewing  │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │             │
                   Pass          Fail
                    │             │
                    │             ▼
                    │      ┌─────────────┐
                    │      │ Refining    │
                    │      └──────┬──────┘
                    │             │
                    │             └───┐
                    │                 │
                    ▼                 │
            ┌─────────────┐          │
            │ Finalizing  │◄──────────┘
            └──────┬──────┘
                   │
                   ▼
            ┌─────────────┐
            │  Complete   │
            └─────────────┘
```

## Iteration Control Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Review Iteration                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Iteration 1:                                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Draft v1 → Review → Feedback v1 → Draft v2        │    │
│  └────────────────────────────────────────────────────┘    │
│                        │                                      │
│                        ▼                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Quality Check: All critical issues resolved?       │    │
│  └────────────────────────────────────────────────────┘    │
│                        │                                      │
│              ┌─────────┴─────────┐                            │
│              │                   │                            │
│             Yes                 No                            │
│              │                   │                            │
│              │                   ▼                            │
│              │          Iteration 2:                          │
│              │          ┌──────────────────────────────────┐  │
│              │          │ Draft v2 → Review → Feedback v2  │  │
│              │          │ → Draft v3                       │  │
│              │          └──────────────────────────────────┘  │
│              │                   │                            │
│              │                   ▼                            │
│              │          ┌──────────────────────────────────┐  │
│              │          │ Quality Check: All issues        │  │
│              │          │ resolved?                         │  │
│              │          └──────────────────────────────────┘  │
│              │                   │                            │
│              │          ┌─────────┴─────────┐                │
│              │          │                   │                │
│              │         Yes                 No                │
│              │          │                   │                │
│              │          │                   └──► Continue    │
│              │          │                       iterations   │
│              │          │                                    │
│              │          ▼                                    │
│              │  ┌──────────────────────┐                    │
│              │  │ Final Approval       │                    │
│              │  └──────────────────────┘                    │
│              │                                              │
│              ▼                                              │
│  ┌──────────────────────┐                                  │
│  │ Create final-post.md  │                                  │
│  └──────────────────────┘                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Success Criteria Checkpoints

```
┌─────────────────────────────────────────────────────────────┐
│              Success Criteria Validation                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  After Extraction:                                           │
│  ✓ All content extracted                                     │
│  ✓ Topics identified                                         │
│  ✓ Exercises captured                                        │
│  ✓ Diagrams described                                        │
│                                                              │
│  After Planning:                                             │
│  ✓ All topics included                                       │
│  ✓ Logical progression                                       │
│  ✓ Reading time: 15 minutes                                  │
│                                                              │
│  After Drafting:                                             │
│  ✓ All sections written                                      │
│  ✓ Diagrams created                                          │
│  ✓ Examples included                                         │
│  ✓ Reading time: 15 minutes                                  │
│                                                              │
│  After Review:                                               │
│  ✓ Accuracy verified                                         │
│  ✓ Completeness confirmed                                    │
│  ✓ Readability assessed                                      │
│  ✓ Visual quality checked                                    │
│                                                              │
│  After Refinement:                                           │
│  ✓ All critical feedback addressed                           │
│  ✓ Quality maintained                                        │
│  ✓ Ready for approval                                        │
│                                                              │
│  Final Approval:                                             │
│  ✓ Both agents approve                                       │
│  ✓ All quality checks pass                                   │
│  ✓ Post ready for publication                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Parallel Processing Example

### Timeline: Processing 3 Lectures Each

```
Week 1:
├─ Day 1-2: Agent A extracts Lec1, Agent B extracts Lec1
├─ Day 3:   Agent A plans Lec1, Agent B plans Lec1
├─ Day 4-5: Agent A drafts Lec1, Agent B drafts Lec1
└─ Day 6-7: Cross-review Lec1

Week 2:
├─ Day 1-2: Agent A refines Lec1, Agent B refines Lec1
│           Agent A extracts Lec2, Agent B extracts Lec2
├─ Day 3:   Agent A finalizes Lec1, Agent B finalizes Lec1
│           Agent A plans Lec2, Agent B plans Lec2
├─ Day 4-5: Agent A drafts Lec2, Agent B drafts Lec2
└─ Day 6-7: Cross-review Lec2

Week 3:
├─ Day 1-2: Agent A refines Lec2, Agent B refines Lec2
│           Agent A extracts Lec3, Agent B extracts Lec3
├─ Day 3:   Agent A finalizes Lec2, Agent B finalizes Lec2
│           Agent A plans Lec3, Agent B plans Lec3
├─ Day 4-5: Agent A drafts Lec3, Agent B drafts Lec3
└─ Day 6-7: Cross-review Lec3
```

## Communication Protocol

```
┌─────────────────────────────────────────────────────────────┐
│              Agent Communication                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Agent A → Agent B:                                         │
│  "Draft ready for review: [lecture_id]"                    │
│                                                              │
│  Agent B → Agent A:                                         │
│  "Review complete: [lecture_id], feedback in [file]"        │
│                                                              │
│  Agent A → Agent B:                                         │
│  "Revision complete: [lecture_id], draft-v2 ready"         │
│                                                              │
│  Agent B → Agent A:                                         │
│  "Approved: [lecture_id], ready for finalization"          │
│                                                              │
│  Both Agents:                                                │
│  "Lecture [lecture_id] complete and published"              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Detection                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Error Types:                                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Missing Materials                                │    │
│  │    → Document gaps                                  │    │
│  │    → Use available materials                        │    │
│  │    → Continue with notes                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 2. Unclear Content                                 │    │
│  │    → Cross-reference textbooks                     │    │
│  │    → Research alternative sources                  │    │
│  │    → Document assumptions                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 3. Technical Issues                                │    │
│  │    → Use alternative tools                          │    │
│  │    → Document failures                             │    │
│  │    → Request assistance if blocked                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 4. Quality Issues                                   │    │
│  │    → Trigger self-correction                       │    │
│  │    → Re-execute relevant phase                     │    │
│  │    → Re-validate against criteria                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Principles

1. **Parallel Processing**: Both agents work simultaneously on their courses
2. **Cross-Review**: Each agent reviews the other's work
3. **Iterative Refinement**: Multiple review cycles until quality standards met
4. **State Tracking**: Maintain state throughout process
5. **Success Criteria**: Clear checkpoints at each phase
6. **Error Recovery**: Graceful handling of issues
7. **Quality First**: Never compromise on accuracy or completeness
