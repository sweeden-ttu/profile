# Lecture 2 Extraction: Propositional Logic Basics

**Course**: CS 5384 - Logic for Computer Scientists  
**Lecture Date**: August 27, 2025  
**Instructor**: Muhammad Ikram, Ph.D., PE  
**Extraction Date**: 2025-01-10

---

## Main Topics

1. Propositional Variables
2. Logical Connectives
3. Truth Tables
4. Well-Formed Formulas (WFFs)

---

## Syntax vs Semantics

- **Syntax**: Words and sentences in grammatical format (e.g., "Argentina" is a proper noun)
- **Semantics**: Assigns meanings to expressions (e.g., "Argentina is a country in South America")

---

## Proposition vs Predicate

- **Proposition**: An argument that is either True or False
  - Example: "20+25=45" is True
  - Example: "England is in Europe"

- **Predicate**: A function that takes arguments; results in True/False when arguments are set
  - Example: "x+25=45" is a predicate (depends on x's value)

---

## Key Definitions

### Propositions
- A statement that is either True or False
- Examples: "You own a BMW", "17 > 15", "England is in Europe"
- **Atomic proposition**: Cannot be decomposed further

### Propositional Variables
- A, B, C, ..., X, Y, Z, ..., α, β, γ, ...
- Combined with parenthesis: ( , )

### Definition of Propositions (Recursive)
1. Propositional letters are propositions
2. If α and β are propositions, then (α∧β), (α∨β), (α→β), (¬α), and (α↔β) are also propositions
3. A string is a proposition iff it can be obtained by starting with propositional letters and repeatedly applying rule 2

---

## Logical Connectives

| Symbol | Name | Meaning |
|--------|------|---------|
| ∨ | OR (Disjunction) | At least one true |
| ∧ | AND (Conjunction) | Both true |
| ¬ | NOT (Negation) | Opposite truth value |
| → | Implication | If-then relationship |
| ↔ | Equivalence | Same truth value |

---

## Peter and John Example (Propositional Logic)

Given:
- F: Peter is the father of John
- M: Peter is the mother of John
- P: Peter is a parent of John

Propositions developed:
- p1: (F ∨ M) → P
- p2: F
- p3: P

Question: Is p3 a consequence of p1 and p2? YES

---

## Suggested Exercises

1. Construct truth tables for basic connectives (AND, OR, NOT, IMPLIES)
2. Identify propositional variables in given statements
3. Determine if given formulas are well-formed

---

## Visual Elements Identified

1. Truth table for connectives (needed)
2. WFF construction tree diagram (needed)
3. Peter example propositional flow (needed)

---

## External Resources (from topics-and-exercises.json)

- Logic for Applications: Section 1.2 (Pg 10-20)
- Introduction to Mathematical Logic: Chapter 1 (Pg 26-69)
- Language, Proof, and Logic: Sections 4.1-4.3 (Pg 108-127)
