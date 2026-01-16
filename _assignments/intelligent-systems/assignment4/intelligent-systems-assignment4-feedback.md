## Feedback: Intelligent Systems — Assignment 4 (Problem Solving)

### Files reviewed

- **Source PDF**: `CS5368_Fa25_Ass4_ProblemSolving-1.pdf`
- **Questions markdown**: `intelligent-systems-assignment4-problems.md`
- **Solutions markdown**: `intelligent-systems-assignment4-solutions.md`

### Factual accuracy vs PDF (questions)

- **Text/math (verifiable)**: Problem 1 A/B/C text and the probability expressions visible in the PDF text extraction are broadly consistent with the markdown.
- **Figures/diagrams (not verifiable from extracted PDF text)**: The PDF contains multiple Bayes net / DAG figures that did not survive text extraction. The markdown includes many Mermaid diagrams (Problem 2A/B/C, Problem 1E “six DAGs”, Problem 3/4 graphs). Without the original figure images (or page-noted reconstructions), these should be treated as **not factually verified** against the PDF.
- **Missing content red flag**: In Problem 1E, the markdown includes “Graph 1..6” but leaves “Questions” as a TODO block. If the PDF contains specific questions tied to those graphs, they are currently **missing** from the markdown.

### KaTeX rendering (per `math-rules.md`)

- **Delimiter usage**: Uses `$...$` and `$$...$$`, which matches your KaTeX rules and is the safest syntax for this site.
- **Notation clarity**: In Problem 1B(5), ensure the summation uses a consistent dummy variable, e.g. \(\sum_c P(c)\,P(B\mid c)\,P(D\mid c,B)\).

### Solutions markdown — correctness issues (high priority)

#### Problem 1A (table sizes / sums): ambiguity + incorrect sums

Several entries conflate “table size” with “slice size” and treat non-distributions as if they sum to 1.

- **\(P(X,Z\mid Y)\)**:
  - Full table entries: \(3\cdot 4\cdot 3 = 36\) (for all \(x,z,y\)).
  - Sum over all entries: \(3\) (one per \(y\) slice).
  - Current solution “12”/“1” is only true **per fixed \(y\)**.
- **\(P(z_1\mid X)\)**:
  - Size “3” is fine (one value per \(x\)).
  - The sum over \(x\) is **not determined** by normalization (it’s not a distribution over \(x\)), so “1” is not justified.

#### Problem 1B (True/False): at least one marked incorrectly

- **(3)** \(P(B,C)=\sum_{a\in A}P(B,C\mid A)\) is **False** as written; law of total probability requires \(P(A=a)\):  
  \[
  P(B,C)=\sum_a P(B,C\mid A=a)\,P(A=a).
  \]

#### Problem 2C(ii)/(iii) space: mixes “entries” vs “free parameters”

The current solution corrects itself midstream. Recommend rewriting using one consistent measure:

- For \(N\) binary variables, the full joint has \(2^N\) entries but \(2^N-1\) free parameters.
- A BN’s parameter count depends on parent set sizes; show a clean comparison.

#### Problem 2D (“one more factor”): avoid conditional assumptions

Answers should not rely on extra independence assumptions not given:

- **(i)** add \(P(D)\) to cover variable \(D\).
- **(ii)** add \(P(A)\) to cover variable \(A\).

#### Problem 4(a)(iii) \(P(A\mid S,B)\): inconsistent with BN structure

Given BN \(G\to A\), \(G\to B\), \((A,B)\to S\), a correct form is:

\[
P(A\mid S,B)\propto \sum_g P(g)\,P(A\mid g)\,P(B\mid g)\,P(S\mid A,B),
\]

then normalize over \(A\).

### Recommendations

- **Questions file**: Replace Mermaid figures with embedded images from the PDF, or label them “reconstructions” and cite the PDF page/figure number used.
- **Solutions file**: Treat as a draft until the correctness issues above (especially Problem 1A/1B and Problem 4) are fixed.

