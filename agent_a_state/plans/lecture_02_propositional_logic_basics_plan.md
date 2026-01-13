# Lesson Plan: Propositional Logic Basics

**Course**: CS 5384 - Logic for Computer Scientists
**Lecture**: 2 - Propositional Logic Basics
**Date**: August 27, 2025
**Instructor**: Muhammad Ikram, Ph.D., PE

---

## Learning Objectives

By the end of this lesson, students will be able to:
1. Distinguish between syntax and semantics in logical systems
2. Define propositions and identify atomic propositions
3. Understand propositional variables and their notation
4. Apply recursive definition of well-formed formulas (WFFs)
5. Construct and interpret truth tables for logical connectives
6. Use logical connectives to build complex propositions

---

## Prerequisites

- Basic understanding of mathematical statements (true/false)
- Familiarity with set notation (optional but helpful)
- No prior logic coursework required

---

## Lesson Structure

### Section 1: Introduction to Propositional Logic (300 words, ~3 min)
- Why propositional logic matters in computer science
- The role of logic in reasoning, verification, and computation
- Overview of what we'll cover in this lecture

### Section 2: Syntax vs. Semantics (350 words, ~3 min)
- Definition of syntax: grammatical structure of expressions
- Definition of semantics: meaning/interpretation of expressions
- Analogy with natural language (proper nouns, statements)
- Importance of this distinction in formal systems

### Section 3: Propositions and Propositional Variables (400 words, ~3 min)
- Definition of a proposition
- Properties: must be either true or false
- Atomic propositions vs. compound propositions
- Propositional variables: A, B, C, ..., X, Y, Z, ..., α, β, γ, ...
- Parentheses notation: (α ∧ β)

### Section 4: Recursive Definition of Well-Formed Formulas (450 words, ~4 min)
- Base case: propositional letters are WFFs
- Inductive step: if α and β are WFFs, then (α∧β), (α∨β), (α→β), (¬α), (α↔β) are WFFs
- Closure: a string is a WFF iff it can be constructed this way
- Examples of WFFs and non-WFFs
- Visual: WFF construction tree diagram

### Section 5: Logical Connectives and Truth Tables (500 words, ~4 min)
- Five connectives: ∧, ∨, ¬, →, ↔
- Truth table construction
- AND (conjunction): both true
- OR (disjunction): at least one true
- NOT (negation): opposite truth value
- IMPLIES (implication): only false when antecedent true and consequent false
- EQUIVALENCE: same truth values
- Visual: Truth table for all connectives

### Section 6: Worked Example - Peter and John (350 words, ~3 min)
- Problem setup: F, M, P propositions
- Building compound propositions: p1, p2, p3
- Logical consequence: Does p3 follow from p1 and p2?
- Step-by-step reasoning

### Section 7: Exercises (150 words, ~1 min)
- Construct truth tables
- Identify propositional variables
- Verify WFF status

### Section 8: Conclusion and Next Steps (100 words, ~1 min)
- Summary of key concepts
- Connection to next lecture (truth tables and formation trees)
- External resources for further study

---

## Reading Time Breakdown

| Section | Words | Reading Time |
|---------|-------|--------------|
| Introduction | 300 | ~3 min |
| Syntax vs. Semantics | 350 | ~3 min |
| Propositions | 400 | ~3 min |
| WFFs | 450 | ~4 min |
| Connectives & Truth Tables | 500 | ~4 min |
| Worked Example | 350 | ~3 min |
| Exercises | 150 | ~1 min |
| Conclusion | 100 | ~1 min |
| **Total** | **2,600** | **~22 min** |

---

## Visual Elements to Create

1. **Syntax vs Semantics Comparison Table**
2. **WFF Construction Tree Diagram** (Mermaid)
3. **Logical Connectives Truth Table**
4. **Peter and John Propositional Flow** (Mermaid)

---

## External Resources

1. Logic for Applications: Section 1.2 (Pages 10-20)
2. Introduction to Mathematical Logic: Chapter 1 (Pages 26-69)
3. Language, Proof, and Logic: Sections 4.1-4.3 (Pages 108-127)

---

## Assessment

- Self-check: Can you identify whether a string is a WFF?
- Practice: Construct truth tables for compound propositions
- Application: Translate natural language statements into propositional logic

---

## Notes for Instructor

- Emphasize the recursive nature of WFF definition
- Use the Peter and John example to show practical application
- Connectives have specific precedence rules (covered in Lecture 3)
