## Feedback: Intelligent Systems — Assignment 4 (Problem Solving)

### Files reviewed

- **Source PDF**: `../CS5368_Fa25_Ass4_ProblemSolving-1.pdf`
- **Questions markdown**: `../intelligent-systems-assignment4-problems.md`
- **Solutions markdown**: `../intelligent-systems-assignment4-solutions.md`

### Factual accuracy vs PDF (questions)

- **Text + math**: Problem 1 (A/B/C) text and most formulas appear consistent with the PDF (noting the PDF extraction is garbled in places).
- **Diagrams/figures are not verifiable**: The PDF includes multiple **embedded Bayes net / DAG figures** that do not extract as text. The markdown currently **adds Mermaid graphs** (Problem 2A, 2B, 2C(ii/iii), 1E “six DAGs”, 3/4 diagrams, etc.). Because the original figures aren’t present in the extracted PDF text, these Mermaid diagrams should be treated as **potentially invented** and therefore **not “factually verified”**.
  - If the Mermaid diagrams are intended as faithful reproductions, the safest approach is to **embed screenshots** of the original figures (or explicitly label Mermaid diagrams as “reconstructions” and verify them against the PDF page images).

### KaTeX rendering (per `math-rules.md`)

- **Delimiter usage**: The questions use `$...$` and `$$...$$` and should render under the site’s KaTeX auto-render configuration.
- **Symbol correctness suggestion**: In Problem 1B(5), the denominator should use a dummy variable consistently (e.g., \(\sum_{c} P(c)\,P(B\mid c)\,P(D\mid c,B)\)). Right now the markdown mixes `C` and `c` in the summation in a way that can confuse readers (even if KaTeX renders).

### Solutions markdown — correctness issues (high priority)

#### Problem 1A (table sizes / sums)

The solutions file has multiple **likely incorrect** entries due to “size” ambiguity and conditional table normalization:

- **\(P(X,Z\mid Y)\)**:
  - **Total entries** in the full table (all \(x,z,y\)): \(3\times 4\times 3=36\).
  - **Sum over all entries**: \(3\) (because for each fixed \(y\), \(\sum_{x,z}P(x,z\mid y)=1\)).
  - The current solution says “12” and sum “1” (that’s only “per fixed \(y\)”).
- **\(P(z_1\mid X)\)**:
  - “Size = 3” is fine (one value per \(x\)), but the **sum is not determined** from the problem statement (it is not a distribution over \(x\)).
  - The current solution claims sum “1” (likely incorrect).

#### Problem 1B (True/False)

- **(3)** \(P(B,C)=\sum_{a\in A}P(B,C\mid A)\) is **False** as written; the law of total probability needs \(P(A=a)\):  
  \(\;\;P(B,C)=\sum_a P(B,C\mid A=a)\,P(A=a)\).

#### Problem 2C(ii) “less space than joint”

- The file mixes “entries” and “free parameters” and has an internal correction mid-answer. Recommend rewriting cleanly:
  - For binary variables, the full joint has \(2^4\) entries but \(2^4-1\) free parameters.
  - A BN with small indegree requires fewer free parameters; show that explicitly.

#### Problem 2D (missing factor)

The “exactly one more factor” answer should not depend on additional assumptions not given:

- **(i)** add **\(P(D)\)** so the product defines a joint over \(\{A,B,C,D,E\}\).
- **(ii)** add **\(P(A)\)** so the product defines a joint over \(\{A,B,C,D,E\}\).

#### Problem 4(a)(iii) \(P(A\mid S,B)\)

The provided expression is not consistent with the stated BN structure \(G\to A\), \(G\to B\), \((A,B)\to S\). A correct derivation should marginalize \(G\) explicitly and normalize:

\[
P(A\mid S,B)\propto \sum_g P(g)\,P(A\mid g)\,P(B\mid g)\,P(S\mid A,B).
\]

### Recommendations

- **Questions file**: Replace unverifiable Mermaid diagrams with either (a) embedded figure images from the PDF, or (b) a clearly-labeled “reconstruction” section that cites the PDF page/figure and notes it was manually recreated.
- **Solutions file**: Treat as **draft** until the above correctness issues are fixed; otherwise it can mislead readers who use it for verification.

