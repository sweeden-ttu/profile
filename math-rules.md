---
layout: page
title: "Math Rendering Rules"
permalink: /math-rules/
description: "Verification page for inline and display LaTeX rendering via KaTeX."
---

# Math Rendering Rules

This page exercises inline math, display math, and common LaTeX constructs to verify KaTeX rendering in markdown.

## Inline Variables and Fonts
<p data-test-id="inline-vars">
  <span>$a$</span>,
  <span>$x$</span>,
  <span>$y$</span>,
  <span>$\mathcal{R}$</span>,
  <span>$\mathcal{S}$</span>,
  <span>$\mathbb{N}$</span>,
  <span>$\mathbb{Z}$</span>,
  <span>$\mathbb{Q}$</span>,
  <span>$\mathbb{R}$</span>
</p>

## Multiplication, Logs, Trig
<p data-test-id="multiplication">
  $2x$, $x \cdot y$, $x \times y$, $\log x$, $\sin x$, $\cos x$
</p>

## Percentages and Fractions
<p data-test-id="fraction">
  $x\% = \frac{x}{100} = x/100$
</p>

## Floor, Ceil, Absolute Value, Factorial
<p data-test-id="floor-ceil-abs">
  $\lfloor 3.7 \rfloor = 3$, $\left\lceil \frac{x}{2}\right\rceil$, $\lvert -2 \rvert = 2$, $n!$
</p>

## Sets, Intervals, Binomial
<p data-test-id="sets">
  $\{1,2,3\}$, $[0,1]$, $\mathbb{Z}_{\geq 5}$, $\binom{5}{2} = 10$
</p>

## Display Equations and Environments
<div data-test-id="display-equation">
$$
2x + 3y = 7
$$
</div>

<div data-test-id="equation-environment">
$$
\left \lceil \frac{x}{2} \right \rceil + \left\lfloor \frac{x}{2} \right\rfloor = x
$$
</div>

## Overlines and Sequences
<p data-test-id="overline">
  $\overline{12} = 12$, $\overline{ab} = 12$, $a \neq 0$, $b=2$
</p>

## Lists with Math
- $\angle ABC = 60^\circ$ and $\triangle ABC$ use standard geometry notation.
- $x \in [0,1]$ chosen uniformly at random.
- Empty set operations: $\sum_{\emptyset} 0 = 0$, $\prod_{\emptyset} 1 = 1$.

## Power Towers and Binomials
<p data-test-id="power-tower">
  $2^{3^2} = 512$
</p>

<p data-test-id="binomial-zero">
  $\binom{0}{0} = 1$, $\binom{3}{5} = 0$
</p>

## Propositional Logic - Quantifiers
<p data-test-id="quantifiers">
  Universal: $\forall x$, $\forall x \forall y P(x,y)$<br>
  Existential: $\exists x$, $\exists y Q(y)$<br>
  Mixed: $\forall x \exists y R(x,y)$
</p>

## Logical Connectives
<p data-test-id="logical-connectives">
  $P \land Q$ (and), $P \lor Q$ (or), $P \to Q$ (implies), $\neg P$ (not), $P \leftrightarrow Q$ (iff)
</p>

## Predicates and Relations
<p data-test-id="predicates">
  Unary: $P(x)$, $Q(a)$<br>
  Binary: $R(x,y)$, $S(a,b)$<br>
  Ternary: $T(x,y,z)$
</p>

## Proof Notation
<p data-test-id="proof-notation">
  Entailment: $\Gamma \vdash \phi$ (from $\Gamma$, we derive $\phi$)<br>
  Skolem constants: $c, d, a, b$
</p>

## Herbrand Sets
<p data-test-id="herbrand-sets">
  Base: $\{p(a), p(b), q(a,a), q(a,b)\}$<br>
  Model: $\{p(a), q(b,a)\} \subseteq \text{Base}$
</p>

## Tree Rendering with Mermaid
<div data-test-id="mermaid-tree" markdown="1">

```mermaid
graph TD
    A["∀x(P(x)→Q(x))"] --> B["P(a)→Q(a)"]
    B --> C["¬P(a)"]
    B --> D["Q(a)"]
```

</div>