## Feedback: Logic for Computer Scientists — Homework 3

### Files reviewed

- **Source PDF (problems)**: `../cs5384_2025_fall_homework3_111725-1.pdf`
- **Source PDF (solutions)**: `../cs5384_2025_fall_homework3_solution_111725-1.pdf` (also `../logic-homework3-solution.pdf`)
- **Questions markdown**: `../logic-homework3.md`
- **Solutions markdown**: `../logic-homework3-solutions.md`

### Factual accuracy vs PDF (questions)

- **High-confidence match**: The problem statements (Problems 1–5) align with the problems PDF, including the formula \(F\) in Problem 1 and the English arguments/statements in Problems 2–5.
- **Minor wording drift**: The markdown adds a suggested Mermaid “possible tree structure” for Problem 1. That’s fine as a helper, but it is **not explicitly present** in the PDF and should be labeled as “example / helper,” not as an official tree.

### KaTeX rendering (per `math-rules.md`)

- **Rendering issue observed**: On the built site, this page currently shows **no rendered KaTeX output** (no `.katex` elements) — the math appears to be left as plain text.
- **Likely cause**: The homework markdown uses `\(...\)` / `\[...\]` blocks, but in this site’s pipeline those delimiters are not reliably preserved through Markdown→HTML (kramdown appears to strip/alter them), so KaTeX auto-render never sees the delimiters.
- **Fix**: Convert all inline math to `$...$` and display math to `$$...$$` (matching `math-rules.md` and the site’s KaTeX delimiter configuration).

### Factual accuracy vs PDF (solutions)

- **Mostly consistent**: The solutions markdown tracks the solution PDF’s structure and major results (e.g., Problem 3 inference steps, Problem 4 CNF result).
- **Notable issues to consider**
  - **Problem 2(b)**: The markdown’s step list is a bit “meta” (it mixes an inference schema \((p \land (p\to q))\to q\) with the actual premises \(p\) and \(p\to q\)). Suggest rewriting it as a short numbered proof using Modus Ponens, since the homework instruction asks for “rules of inference.”
  - **Problem 5(c)**: The provided solution form
    \[
    \neg \forall x\Big(\big(LLL(x)\land LLLU(x)\land T(x)\big)\to F(x)\Big)
    \]
    is logically unusual for “Some …”. A more standard existential rendering would use \(\exists x\) directly (and likely include a Student predicate / domain restriction). Even if you’re matching the official PDF, it’s worth adding a note that this is equivalent to an existential of a negated implication and may not reflect the intended English meaning.

### Recommendations

- **Clarify “official vs helper” content**: Label any added Mermaid trees as “example” to avoid implying they are the unique/official answer.
- **Tighten proofs**: For Problems 2–3, present proofs as explicit premise lines + rule applications (Modus Ponens/Tollens, Addition, etc.) to match the assignment instruction style.

