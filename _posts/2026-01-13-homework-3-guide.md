---
layout: post
title: "Homework 3 Guide: Quantifier Scope, Proofs, and CNF"
date: 2026-01-13
categories: [logic, computer-science]
tags: [homework3, herbrand, propositional-logic, cnf]
excerpt: "Worked guide for Logic for Computer Scientists Homework 3: scoping, inference proofs, CNF transformations, and predicate encodings."
reading_time: 8
course: "Logic for Computer Scientists"
---

# Homework 3 Guide: Quantifier Scope, Proofs, and CNF

This post summarizes the Logic for Computer Scientists Homework 3 questions and worked solutions, focusing on quantifier scoping, propositional inference, CNF rewriting, and predicate encodings for everyday statements. Source PDFs: [Homework 3][^hw] and [Homework 3 Solution][^sol].

## Problem 1 — Quantifier Scope and Bound/Free Variables

**Original question**: Draw a predicate logic tree of $F$, determine bound vs. free variables, and show variable scopes.

$$
F = \forall z \exists x \big( P(x, y, z) \land \exists z\, R(y, z) \land (\forall x \forall y (\neg Q(x, y) \lor P(x, y))) \big).
$$

- **Bound variables**: outer $z$, outer $x$, inner $z$, and the $x,y$ inside the universal block.  
- **Free variable**: the $y$ in $P(x, y, z)$ and $R(y, z)$ (not captured by any quantifier).  
- **Tree sketch**: root $\forall z$ → child $\exists x$ → conjunction of three children: $P(x, y, z)$, $\exists z\, R(y, z)$, and $\forall x \forall y (\neg Q(x, y) \lor P(x, y))$. Color or annotate to show the shadowed $z$ and the universal $x,y$ scopes.

## Problem 2 — Propositional Inference Patterns

**Original questions**:  
(b) Joshua is an excellent runner. If Joshua is an excellent runner, then he can work as a running coach. Prove Joshua can work as a running coach.  
(c) Jessica will work at a hair salon during summer. Prove that during the summer Jessica will work at a hair salon, or she will stay home.  
(d) The weather is over 100 degrees or there will be a kids baseball game. The temperature does not reach 100 degrees; prove there will be a kids baseball game.

Treat each statement as an atomic proposition and show the rule applications.

- **(b)** Let $p$: “Joshua is an excellent runner”; $q$: “Joshua can work as a running coach.”  
  1. $p$ (premise)  
  2. $p \to q$ (premise)  
  3. $q$ (1,2 Modus Ponens)

- **(c)** Let $p$: “Jessica will work at a hair salon during summer”; $q$: “Jessica will stay home during summer.”  
  1. $p$ (premise)  
  2. $p \lor q$ (1 Addition)  
  3. Therefore $p \lor q$ (goal)

- **(d)** Let $p$: “The weather is over 100 degrees”; $q$: “There will be a kids baseball game.”  
  1. $p \lor q$ (premise)  
  2. $\neg p$ (premise)  
  3. $q$ (1,2 Disjunctive Syllogism)

## Problem 3 — Rain/Thunder Scenario (Inference Chain)

**Original question**: “If it does not rain or if there is no thunder then the swimming classes will be held, and the lifesaving demonstrations will take place. If swimming classes are held, then students will learn a new swimming stroke. A new swimming stroke was not learned. Prove that it rained.”

Atoms: $p$: rains, $q$: thunder, $r$: swimming classes held, $s$: lifesaving demos, $t$: students learn new stroke.  
Premises: $(\neg p \lor \neg q) \to (r \land s)$; $r \to t$; $\neg t$.

Derivation (rules only):  
1. $\neg t$ (premise)  
2. $r \to t$ (premise)  
3. $\neg r$ (1,2 Modus Tollens)  
4. $\neg r \lor \neg s$ (3 Addition)  
5. $\neg(r \land s)$ (4 De Morgan)  
6. $(\neg p \lor \neg q) \to (r \land s)$ (premise)  
7. $\neg(\neg p \lor \neg q)$ (5,6 Modus Tollens)  
8. $p \land q$ (7 De Morgan + Double Negation)  
9. $p$ (8 Simplification) — it rained.

## Problem 4 — CNF with ≤3 Atoms

**Original question**: “Mark plays golf and is happy or Mark is unhappy and he sleeps.” Express in CNF using at most three atomic propositions.

Let $G$: Mark plays golf; $H$: Mark is happy; $S$: Mark sleeps.  
Original: $(G \land H) \lor (\neg H \land S)$.  
CNF: $(G \lor \neg H) \land (H \lor S)$.

## Problem 5 — Predicate Logic Encodings

**Original questions**:  
(a) Every CS5384 student sleeps late on weekends.  
(b) CS5384 students who wake up early on weekdays stay fresh throughout the day.  
(c) Some CS5384 students who sleep late all week stay fresh throughout the day if they play tennis in the afternoon.  
(d) All CS5384 students sleep at 10pm every day.

Domain: CS5384 students. Predicates: $LWE(x)$ — sleeps late on weekends; $UWD(x)$ — wakes early on weekdays; $LWD(x)$ — sleeps late on weekdays; $F(x)$ — fresh all day; $T(x)$ — plays tennis in the afternoon; $S(x)$ — sleeps at 10pm every day.

- (a) $\forall x\, LWE(x)$  
- (b) $\forall x\, (UWD(x) \to F(x))$  
- (c) $\exists x\, \big((LWE(x) \land LWD(x) \land T(x)) \to F(x)\big)$  
- (d) $\forall x\, S(x)$

---

[^hw]: [Homework 3 PDF](/assignments/logic-for-computer-scientists/cs5384_2025_fall_homework3_111725-1.pdf)
[^sol]: [Homework 3 Solution PDF](/assignments/logic-for-computer-scientists/cs5384_2025_fall_homework3_solution_111725-1.pdf)
