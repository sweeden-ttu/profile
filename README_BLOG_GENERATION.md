# Blog Post Generation System - Overview

This directory contains a comprehensive system for generating high-quality, textbook-quality blog posts from lecture materials using a two-agent parallel workflow with iterative peer review.

## Quick Start

1. **Read the Instructions**: Start with `BLOG_POST_GENERATION_INSTRUCTIONS.md`
2. **Use Agent Prompts**: Reference `AGENT_PROMPTS.md` for structured prompts
3. **Follow Workflow**: See `WORKFLOW_DIAGRAM.md` for visual workflow
4. **Review Quality**: Use `QUALITY_CHECKLIST.md` for validation
5. **Conduct Reviews**: Use `REVIEW_TEMPLATE.md` for structured feedback

## System Architecture

### Two-Agent Design
- **Agent A**: CS-5384 Logic for Computer Scientists
- **Agent B**: CS-5368 Intelligent Systems

Both agents work **in parallel** on their respective courses, then **cross-review** each other's work iteratively.

### Core Workflow Phases

1. **Content Extraction** - Extract all information from PDFs, transcripts, metadata
2. **Lesson Plan Generation** - Create comprehensive lesson plan covering all topics
3. **Content Creation** - Generate complete blog post draft (15-minute reading time)
4. **Peer Review** - Cross-review each other's work for quality assurance
5. **Iterative Refinement** - Address feedback and improve iteratively
6. **Final Approval** - Both agents approve final version

## Key Documents

### `BLOG_POST_GENERATION_INSTRUCTIONS.md`
Comprehensive instructions covering:
- System architecture and work tree structure
- Detailed phase-by-phase instructions
- Quality standards and guidelines
- Course-specific requirements
- Error handling and recovery
- State tracking and reflection

### `AGENT_PROMPTS.md`
Structured prompts for each phase:
- Agent initialization
- Content extraction
- Lesson plan generation
- Content creation
- Peer review
- Iterative refinement
- Final approval
- Error recovery
- State management
- Reflection templates

### `WORKFLOW_DIAGRAM.md`
Visual representations of:
- System architecture
- Parallel processing flow
- Cross-review loop
- State transitions
- Iteration control
- Success criteria checkpoints
- Error handling

### `REVIEW_TEMPLATE.md`
Structured template for peer reviews covering:
- Overall assessment
- Accuracy review
- Completeness review
- Readability review
- Visual elements review
- Structure review
- Strengths and priority actions

### `QUALITY_CHECKLIST.md`
Comprehensive checklists for:
- Pre-draft validation
- Draft validation
- Post-review validation
- Final pre-publication validation
- Course-specific requirements

## Work Tree Structure

```
blog-generation-workspace/
├── cs5384-logic/
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
│   └── metadata.json
├── cs5368-intelligent-systems/
│   ├── lectures/
│   ├── assets/
│   └── metadata.json
└── shared/
    ├── review-templates/
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
- **Engagement**: Informative and valuable to readers

## Course-Specific Guidelines

### CS-5384: Logic for Computer Scientists
- Categorization: "Logic for Computer Scientists"
- Tags: Include `logic-for-computer-scientists`
- Focus: Formal logic systems, proof techniques, model theory
- Mathematical rigor: Precise definitions, formal proofs
- Examples: Computer science applications, algorithm verification

### CS-5368: Intelligent Systems
- Categorization: "Intelligent Systems"
- Tags: Include `intelligent-systems`
- Focus: Machine learning, probabilistic reasoning, Bayesian networks
- Mathematical rigor: Clear algorithm explanations, step-by-step derivations
- Examples: Real-world applications, implementation details

## Best Practices

### Agent Design Principles
1. **Clear, Small Goals** - Keep tasks specific and well-defined
2. **Think, Act, Observe Loop** - ReAct pattern for structured processing
3. **State Tracking** - Track progress and decisions throughout
4. **Self-Correction** - Build in reflection and adjustment mechanisms
5. **Explicit Success Conditions** - Clear definition of "done"
6. **Structured Prompting** - Use XML-style tags for guidance

### Content Creation Principles
1. **Accuracy First** - Verify all information against sources
2. **Completeness** - Cover all topics from lecture
3. **Clarity** - Explain concepts step-by-step
4. **Visual Support** - Use diagrams and tables effectively
5. **Examples** - Illustrate concepts with concrete examples
6. **External Resources** - Include authoritative references

### Review Principles
1. **Thorough** - Check all quality dimensions
2. **Specific** - Provide actionable feedback
3. **Prioritized** - Focus on critical issues first
4. **Constructive** - Identify strengths and improvements
5. **Verification** - Cross-reference with source materials

## Usage Workflow

### For Each Lecture

1. **Initialize Agent**
   - Use Agent Initialization Prompt
   - Identify lecture materials
   - Create processing queue

2. **Extract Content** (Phase 1)
   - Parse PDFs, JSON, transcripts
   - Extract topics, exercises, formulas
   - Create extracted-content.json

3. **Generate Lesson Plan** (Phase 2)
   - Analyze topic dependencies
   - Order topics logically
   - Estimate reading time
   - Create lesson-plan.md

4. **Create Draft** (Phase 3)
   - Write blog post content
   - Create diagrams and tables
   - Add examples and resources
   - Create draft-v1.md

5. **Peer Review** (Phase 4)
   - Other agent reviews draft
   - Generate review-feedback-v1.md
   - Check against quality checklist

6. **Refine Draft** (Phase 5)
   - Address feedback
   - Create draft-v2.md
   - Re-submit if needed

7. **Final Approval** (Phase 6)
   - Both agents approve
   - Create final-post.md
   - Ready for publication

### Parallel Processing

- Both agents work simultaneously
- Process multiple lectures in parallel
- Cross-review after each draft
- Iterate until quality standards met

## Success Metrics

### Per Lecture
- [ ] All topics covered
- [ ] Reading time: 15 minutes
- [ ] Word count: 2000-2500
- [ ] Diagrams present
- [ ] Examples clear
- [ ] External resources included
- [ ] Both agents approve

### Overall System
- [ ] All lectures processed
- [ ] Quality standards maintained
- [ ] Consistent style across posts
- [ ] All assets properly referenced
- [ ] Ready for publication

## Troubleshooting

### Common Issues

**Missing Source Materials**
- Document what's missing
- Use available materials
- Note gaps in content

**Unclear Lecture Content**
- Cross-reference textbooks
- Use multiple sources
- Document assumptions

**Technical Difficulties**
- Use alternative approaches
- Document failures
- Request assistance if blocked

**Quality Issues**
- Trigger self-correction
- Re-execute relevant phase
- Re-validate against criteria

## Next Steps

1. **Set Up Work Tree** - Create directory structure
2. **Initialize Agents** - Use initialization prompts
3. **Process First Lecture** - Follow workflow phases
4. **Establish Review Process** - Use review templates
5. **Iterate and Improve** - Refine based on experience

## Additional Resources

- `@math-rules.md` - Mathematical notation standards
- `@CLAUDE.md` - Site structure and design principles
- Existing blog posts - Style and format examples
- Course textbooks - Authoritative source material

## Support

For questions or issues:
1. Review relevant documentation
2. Check quality checklist
3. Consult workflow diagram
4. Reference example outputs

---

**Remember**: Quality over speed. Take time to ensure accuracy, completeness, and readability. The iterative review process is designed to catch issues early and improve quality continuously.
