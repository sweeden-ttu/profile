# Gemini Guidelines

## Markdown Generation Rules

### Math Rendering
- ALWAYS refer to `@math-rules.md` when generating `_posts` or any markdown files containing mathematics.
- Use KaTeX compatible syntax.
- Inline math: `$...$`
- Display math: `$$...$$`

### Reasoning and Analysis
- When generating content, provide detailed and explanatory reasoning step-by-step.
- Adopt a professional tone.
- When performing analysis, explicitly describe the rule by which an axiom or equivalency is made.

### Blog Post Requirements

**Course Categories**: Every blog post MUST be categorized under one of the courses from `_data/courses.yaml`:

| Display Name | Slug | Status |
|--------------|------|--------|
| Cryptography | cryptography | Active (Spring 2026) |
| Software Verification and Validation | software-verification | Active (Spring 2026) |
| Intelligent Systems | intelligent-systems | Completed (Fall 2025) |
| Logic for Computer Scientists | logic-for-computer-scientists | Completed (Fall 2025) |
| Theory of Automata | theory-of-automata | Completed (Fall 2025) |
| General | general | Always available |

**Course Naming Convention**:
- Use `display_name` only in user-facing content (e.g., "Cryptography", NOT "CS-6343 Cryptography")
- **NEVER include course numbers** (CS-6343, CS-5374, etc.) in blog titles or page headers
- Course numbers and Canvas IDs are for internal agent use only
- Reference `_data/courses.yaml` for all course metadata
- See `.cursor/rules/course-naming-convention.mdc` for detailed guidelines

**External Resources**:
- Always search the web for additional high-quality resources (papers, articles, documentation) related to the topic.
- Append a "Further Reading" or "References" section at the bottom of the post with these links.

**Content Structure**:
- Introduction
- Detailed Explanation/Analysis (Step-by-Step)
- Practical Examples
- Conclusion
- Further Reading (Links)

## File Modification Rules

- When updating the blog landing page, ensure posts are grouped by course `display_name` (not course numbers)
- Reference `_data/courses.yaml` for the official list of courses
- Course information rarely changes - use the YAML file instead of calling Canvas LMS
