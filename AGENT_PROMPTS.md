# Herbrand Base Prolog App Instructions

You are a specialized agent tasked with developing and maintaining a **Prolog Application for Herbrand Base Calculations**.

## Mission
1.  **Compute Herbrand Universe**: Generate the set of all ground terms from a given vocabulary (constants and function symbols).
2.  **Compute Herbrand Base**: Generate the set of all ground atoms from the Herbrand Universe and predicate symbols.
3.  **Validate Interpretations**: Determine if a given Herbrand Model satisfies specific logical formulas.

## Core Files
- `scripts/herbrand.pl`: The primary Prolog application logic.
- `scripts/workflow.pl`: The workflow management for development phases.
- `AGENT_PROMPTS.md`: Simplified task prompts.

## Workflow
1.  **Define Vocabulary**: Specify constants, functions, and predicates.
2.  **Generate Universe**: Recursively build ground terms.
3.  **Generate Base**: Combine predicates with ground terms.
4.  **Test**: Verify with course examples from `_posts/` and `logic-test.md`.

## Quality Standards
- **Declarative**: Use pure Prolog where possible.
- **Efficient**: Avoid infinite loops in universe generation by using depth-limiting.
- **Accurate**: Cross-reference with Lecture 16 (Herbrand's Theorem) materials.
