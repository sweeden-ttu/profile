---
layout: post
title: "Negation and Non-Monotonic Reasoning: When New Information Invalidates Old Conclusions"
date: 2025-12-03
categories: [logic, computer-science]
tags: [logic-for-computer-scientists, non-monotonic-logic, negation-as-failure, stable-models, default-reasoning]
excerpt: "Explore non-monotonic reasoning systems where new information can invalidate previous conclusions, from the classic Tweety the bird example to stable models in logic programming."
reading_time: 14
course: "Logic for Computer Scientists"
---

# Negation and Non-Monotonic Reasoning: When New Information Invalidates Old Conclusions

Classical mathematical reasoning embodies a fundamental principle: **monotonicity**. If we can derive a conclusion from a set of premises, we can also derive it from any *larger* set of premises. More information never invalidates existing deductions.

Yet this principle, while essential to mathematics, is routinely violated in everyday reasoning and real-world knowledge systems. When we learn new facts, we often must **revise** or **retract** previous beliefs. This lecture explores **non-monotonic logic**, where reasoning is **defeasible**—conclusions drawn in the absence of contrary evidence may be overturned when new information arrives.

## The Tweety Paradox: A Motivating Example

Consider the following scenario, which illustrates the limitations of monotonic reasoning:

### Initial Knowledge Base
1. **Rule**: Generally, birds fly. ($\forall x (\text{Bird}(x) \to \text{Flies}(x))$)
2. **Fact**: Tweety is a bird. ($\text{Bird}(\text{Tweety})$)

**Conclusion**: Tweety flies.

### New Information
3. **Fact**: Tweety is a penguin. ($\text{Penguin}(\text{Tweety})$)
4. **Rule**: Penguins do not fly. ($\forall x (\text{Penguin}(x) \to \neg \text{Flies}(x))$)

**The Contradiction**:
In classical first-order logic, adding premises 3 and 4 leads to a contradiction. We derive both $\text{Flies}(\text{Tweety})$ (from 1 & 2) and $\neg \text{Flies}(\text{Tweety})$ (from 3 & 4). In classical logic, a contradiction allows us to derive *anything* (ex falso quodlibet), causing the system to collapse.

**The Human Response**:
We instinctively retract the conclusion "Tweety flies" because the rule "birds fly" is a *default* rule, subject to exceptions. We reason: "Tweety flies, unless I have evidence to the contrary." This is **non-monotonic reasoning**.

## Negation as Failure in Logic Programming

Logic programming languages like PROLOG implement a form of non-monotonic reasoning called **Negation as Failure** (NAF).

### The Closed World Assumption (CWA)

NAF relies on the **Closed World Assumption**: if a statement cannot be derived from the current knowledge base, it is assumed to be **false**.

**Syntax**: In PROLOG, `\+ P` or `not(P)` succeeds if `P` fails.

### Example: Flight Database

```prolog
flight(nyc, london).
flight(london, paris).

% Direct flight exists
direct_flight(X, Y) :- flight(X, Y).

% Indirect flight exists
connection(X, Y) :- flight(X, Z), flight(Z, Y).

% Check if no flight exists
no_flight(X, Y) :- \+ flight(X, Y).
```

**Query**: `?- no_flight(nyc, paris).`
**Result**: `true`.

**Reasoning**:
1. PROLOG tries to prove `flight(nyc, paris)`.
2. It checks the knowledge base. No fact matches.
3. The proof for `flight(nyc, paris)` **fails**.
4. Therefore, `\+ flight(nyc, paris)` **succeeds**.

**Non-Monotonicity**:
If we add `flight(nyc, paris)` to the database, the query `no_flight(nyc, paris)` which was previously true, now becomes false. Adding information invalidated a conclusion.

## Formalizing Non-Monotonic Logic: Default Logic

Reiter's **Default Logic** formalizes this reasoning using **default rules**. A default rule has the form:

$$ \frac{A : B}{C} $$

**Meaning**: If $A$ is known (Prerequisite), and it is **consistent to assume** $B$ (Justification), then infer $C$ (Consequent).

### Tweety in Default Logic

We can represent the bird rule as:

$$ \frac{\text{Bird}(x) : \text{Flies}(x)}{\text{Flies}(x)} $$

**Reading**: "If x is a bird, and it is consistent to assume x flies (i.e., we don't know x doesn't fly), then infer x flies."

**Scenario 1**: We only know $\text{Bird}(\text{Tweety})$.
- Prerequisite $\text{Bird}(\text{Tweety})$ is true.
- Is $\text{Flies}(\text{Tweety})$ consistent? Yes, we have no information to the contrary.
- **Conclusion**: $\text{Flies}(\text{Tweety})$.

**Scenario 2**: We know $\text{Bird}(\text{Tweety})$, $\text{Penguin}(\text{Tweety})$, and $\forall x (\text{Penguin}(x) \to \neg \text{Flies}(x))$.
- We derive $\neg \text{Flies}(\text{Tweety})$ strictly from classical logic (Penguin $\to$ not Fly).
- Now check the default rule:
  - Prerequisite $\text{Bird}(\text{Tweety})$ is true.
  - Is $\text{Flies}(\text{Tweety})$ consistent? **No**, because we have derived $\neg \text{Flies}(\text{Tweety})$.
  - The default rule is **blocked**.
- **Conclusion**: $\neg \text{Flies}(\text{Tweety})$.

## Stable Models and Answer Set Programming

In modern logic programming (Answer Set Programming), we define the semantics of negation using **Stable Models** (or Answer Sets). This approach handles cyclic dependencies and ensures grounded reasoning.

### The Gelfond-Lifschitz Reduct

Given a logic program $P$ with negation, and a candidate set of true atoms $S$, we define the **reduct** $P^S$ as follows:

1. **Remove** all rules with negative literals $\text{not } B$ where $B \in S$ (the rule is blocked because the condition fails).
2. **Remove** all negative literals $\text{not } B$ from the remaining rules (since $B \notin S$, the condition is satisfied).

This leaves a program $P^S$ without negation (a definite program). We then compute the **least model** (deductive closure) of $P^S$.

**Definition**: $S$ is a **Stable Model** of $P$ if $S$ is exactly the least model of $P^S$.

### Example: Stable Model Computation

**Program P**:
1. $p \leftarrow \text{not } q$
2. $q \leftarrow \text{not } p$
3. $r \leftarrow p$

**Candidate Set $S_1 = \{p, r\}$**:
- Check rule 1: $q \notin S_1$, so $\text{not } q$ is true. Keep rule as $p \leftarrow \text{true}$ ($p$).
- Check rule 2: $p \in S_1$, so $\text{not } p$ is false. Remove rule.
- Check rule 3: Keep $r \leftarrow p$.

**Reduct $P^{S_1}$**:
1. $p$
3. $r \leftarrow p$

**Least Model of $P^{S_1}$**: $\{p, r\}$.
**Conclusion**: Since $\{p, r\} = S_1$, **$S_1$ is a stable model**.

**Candidate Set $S_2 = \{q\}$**:
- Check rule 1: $q \in S_2$. Remove rule.
- Check rule 2: $p \notin S_2$. Keep rule as $q$.
- Check rule 3: Keep $r \leftarrow p$.

**Reduct $P^{S_2}$**:
2. $q$
3. $r \leftarrow p$

**Least Model of $P^{S_2}$**: $\{q\}$.
**Conclusion**: Since $\{q\} = S_2$, **$S_2$ is a stable model**.

This program has **two** stable models, representing two consistent worldviews.

## Practice Problems

### Problem 1: Default Logic
Given the default rules:
1. $\frac{\text{Quaker}(x) : \text{Pacifist}(x)}{\text{Pacifist}(x)}$
2. $\frac{\text{Republican}(x) : \neg \text{Pacifist}(x)}{\neg \text{Pacifist}(x)}$

And the facts:
- $\text{Quaker}(\text{Nixon})$
- $\text{Republican}(\text{Nixon})$

Does Nixon have a unique status regarding pacifism? What are the possible extensions?

### Problem 2: Stable Models
Find the stable model(s) for the following program:
1. $a \leftarrow \text{not } b$
2. $b \leftarrow \text{not } a$
3. $c \leftarrow a$
4. $c \leftarrow b$

### Problem 3: Negation as Failure
Given the PROLOG program:
```prolog
p :- \+ q.
q :- \+ r.
r :- \+ s.
```
What is the result of the query `?- p.`?

## Conclusion

Non-monotonic reasoning bridges the gap between the rigid certainty of mathematical logic and the flexible, adaptive nature of human reasoning.
- **Negation as Failure** allows systems to reason with incomplete information by assuming falsity by default.
- **Default Logic** formalizes the use of rules with exceptions.
- **Stable Model Semantics** provides a rigorous foundation for logic programs with negation, enabling powerful solvers like Clingo.

Understanding these concepts is crucial for building AI systems that can operate in dynamic environments where information is often partial or evolving.

## Further Reading

- *Nonmonotonic Reasoning* by Grigoris Antoniou - Comprehensive textbook.
- *Knowledge Representation, Reasoning, and the Design of Intelligent Agents* by Gelfond and Kahl - Deep dive into Answer Set Programming.
- [Stanford Encyclopedia of Philosophy: Non-monotonic Logic](https://plato.stanford.edu/entries/logic-nonmonotonic/) - Philosophical foundations.
- [Potassco (Potsdam Answer Set Solving Collection)](https://potassco.org/) - Tools for Answer Set Programming.

---

*This lecture explored negation and non-monotonic reasoning. Together with the previous lectures on Hilbert systems and Herbrand semantics, this completes our survey of foundational logic for computer science.*
