## Feedback: Logic for Computer Scientists — Homework 3

### Files reviewed

- **Source PDF (problems)**: `cs5384_2025_fall_homework3_111725-1.pdf`
- **Source PDF (solutions)**: `cs5384_2025_fall_homework3_solution_111725-1.pdf` (also `logic-homework3-solution.pdf`)
- **Questions markdown**: `logic-homework3.md`
- **Solutions markdown**: `logic-homework3-solutions.md`

### Factual accuracy vs PDF (questions)

- **High-confidence match**: Problem statements 1–5 match the problems PDF content (including the formula \(F\) in Problem 1 and the English prompts in Problems 2–5).
- **Added content**: The markdown includes a Mermaid “possible tree structure” for Problem 1. That is not verbatim from the PDF and should be labeled as an *example/helper*, not “the” official tree.

### KaTeX rendering (per `math-rules.md`)

- **Rendering issue observed**: When rendered on the site, this homework page currently shows **no KaTeX output** (no `.katex` nodes). The visible math appears as plain text.
- **Likely cause**: The markdown uses `\(...\)` / `\[...\]` delimiters; in this site’s Markdown pipeline those delimiters are not reliably preserved, so KaTeX auto-render never sees them.
- **Fix**: Convert all inline math to `$...$` and display math to `$$...$$` (matching `math-rules.md`).

### Factual accuracy vs PDF (solutions)

- **Mostly consistent**: The solutions markdown aligns with the solution PDF’s structure and main results (Problem 3’s inference chain; Problem 4’s CNF form).
- **Quality/correctness notes**
  - **Problem 2(b)**: The proof presentation is partly “meta” (it cites an implication schema) rather than a clean line-by-line Modus Ponens derivation from the stated English premises.
  - **Problem 5(c)**: The solution’s quantifier form is logically unusual for “Some …”. A standard rendering would use \(\exists x\) directly (and ideally a Student predicate / domain restriction). If noted as “matches official solution PDF,” consider adding a one-line remark that it’s equivalent to an existential form but may not match the intended English as closely.

### Recommendations

- **Rendering**: Switch all math delimiters to `$` / `$$` so the published page actually renders formulas.
- **Clarity**: Mark helper Mermaid trees explicitly as “example,” and present proofs as numbered lines + rule names (Modus Ponens/Tollens, Addition, etc.).

