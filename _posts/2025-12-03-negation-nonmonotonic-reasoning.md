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

In the world of classical mathematics, reasoning is **monotonic**. This means that if a conclusion can be derived from a set of premises, it remains valid even if we add more premises. The accumulation of knowledge only ever *increases* the set of provable truths; it never shrinks it.

However, human reasoning and real-world knowledge systems rarely operate this way. We often draw conclusions based on incomplete information and standard assumptions, only to **revise** or **retract** those conclusions when new, contradictory information comes to light. This type of reasoning is called **non-monotonic**, and it is essential for building intelligent systems that can operate in dynamic environments.

This lecture explores the formalisms used to capture this flexible reasoning, including the Closed World Assumption, Negation as Failure, and Default Logic.

## The Tweety Paradox: A Motivating Example

To understand the necessity of non-monotonic logic, consider the classic "Tweety" example.

### Initial Knowledge Base
Suppose we know two things:
1.  **Rule**: Generally, birds fly. ($\forall x (\text{Bird}(x) \to \text{Flies}(x))$)
2.  **Fact**: Tweety is a bird. ($\text{Bird}(\text{Tweety})$)

Based on this, logic dictates a clear conclusion: **Tweety flies**.

### New Information
Now, suppose we learn more about Tweety:
3.  **Fact**: Tweety is a penguin. ($\text{Penguin}(\text{Tweety})$)
4.  **Rule**: Penguins do not fly. ($\forall x (\text{Penguin}(x) \to \neg \text{Flies}(x))$)

### The Contradiction
In classical first-order logic, adding these new premises creates a fatal contradiction. We can derive $\text{Flies}(\text{Tweety})$ from the first set and $\neg \text{Flies}(\text{Tweety})$ from the second. In classical systems, a contradiction allows you to prove *anything* (the principle of *ex falso quodlibet*), rendering the entire knowledge base useless.

**The Human Response**: Humans naturally resolve this by understanding that the rule "birds fly" is a *default*—it holds *unless* there is a specific exception. We implicitly reason: "Tweety flies, assuming there is no evidence to the contrary." When we learn Tweety is a penguin, we simply retract the default conclusion. This is the essence of **non-monotonic reasoning**.

## Negation as Failure in Logic Programming

One of the most practical implementations of non-monotonic reasoning is found in logic programming languages like PROLOG.

### The Closed World Assumption (CWA)
Standard logic makes an Open World Assumption: if a fact is not in the database, its truth is unknown. Logic programming, however, typically uses the **Closed World Assumption**: if a statement cannot be proven true from the current knowledge base, it is assumed to be **false**.

In PROLOG, this is implemented as **Negation as Failure** (NAF). The operator `\+` or `not` does not mean "logical negation" in the classical sense; it means "failure to prove."

### Example: Flight Database

Consider a database of flights:

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

If we query `?- no_flight(nyc, paris).`, PROLOG answers `true`.

**Reasoning Process**:
1.  PROLOG attempts to prove `flight(nyc, paris)`.
2.  It searches the knowledge base. No matching fact is found.
3.  The proof for `flight` **fails**.
4.  Therefore, the negation `\+ flight` **succeeds**.

**Non-Monotonicity**: If we were to update the database by adding `flight(nyc, paris)`, the query `no_flight(nyc, paris)` would suddenly switch from `true` to `false`. The addition of a fact invalidated a previous conclusion.

## Formalizing Non-Monotonic Logic: Default Logic

Reiter's **Default Logic** provides a formal mathematical structure for rules with exceptions. It extends classical logic by introducing **default rules**.

A default rule is written as:
$$ \frac{A : B}{C} $$

**Meaning**: If premise $A$ is known to be true, and it is **consistent to assume** $B$ (i.e., $\neg B$ is not provable), then we can infer conclusion $C$.

### Tweety in Default Logic

We can formalize the bird example properly using a default rule:

$$ \frac{\text{Bird}(x) : \text{Flies}(x)}{\text{Flies}(x)} $$

**Reading**: "If $x$ is a bird, and we have no proof that $x$ does *not* fly, then we infer $x$ flies."

**Scenario 1**: We only know $\text{Bird}(\text{Tweety})$.
*   Prerequisite $A$ ($\text{Bird}$) is true.
*   Is $\text{Flies}$ consistent? Yes, we have no conflicting information.
*   **Conclusion**: $\text{Flies}(\text{Tweety})$.

**Scenario 2**: We know $\text{Bird}(\text{Tweety})$, $\text{Penguin}(\text{Tweety})$, and Penguins don't fly.
*   From classical logic, we prove $\neg \text{Flies}(\text{Tweety})$ (because penguins strictly don't fly).
*   Now check the default rule:
    *   Prerequisite $A$ is true.
    *   Is $\text{Flies}$ consistent? **No**, because we have proven $\neg \text{Flies}$.
    *   The justification $B$ is blocked.
*   **Conclusion**: The default rule does not fire. We correctly conclude Tweety does not fly.

## Stable Models and Answer Set Programming

In modern Artificial Intelligence, particularly in the field of **Answer Set Programming (ASP)**, we define the semantics of negation using **Stable Models**. This approach is robust enough to handle cyclic dependencies and complex constraint satisfaction problems.

### The Gelfond-Lifschitz Reduct

How do we determine if a set of beliefs is "stable"? Given a logic program $P$ with negation and a candidate set of beliefs $S$, we calculate the **reduct** $P^S$:

1.  **Identify** all rules with negative literals ($\text{not } B$).
2.  **Remove** any rule where the negated part $\text{not } B$ is false (i.e., $B$ is in our belief set $S$). The rule is blocked.
3.  **Simplify** the remaining rules by removing the negative literals (since they are assumed true).

This leaves us with a simplified program $P^S$ that has no negation. We compute the **least model** (the necessary consequences) of $P^S$.

**Definition**: $S$ is a **Stable Model** if $S$ matches the least model of its own reduct $P^S$.

### Worked Example: Stable Model Computation

Consider the program $P$:
1.  $p \leftarrow \text{not } q$
2.  $q \leftarrow \text{not } p$
3.  $r \leftarrow p$

This program represents a choice: either assume $q$ is false (so $p$ is true), or assume $p$ is false (so $q$ is true).

**Test Candidate Set $S_1 = \{p, r\}$**:
*   **Rule 1**: $\text{not } q$. Is $q \in S_1$? No. So $\text{not } q$ is true. Keep rule as $p$.
*   **Rule 2**: $\text{not } p$. Is $p \in S_1$? Yes. So $\text{not } p$ is false. Remove rule.
*   **Rule 3**: $r \leftarrow p$. Keep.

**Reduct $P^{S_1}$**:
*   $p$
*   $r \leftarrow p$

**Least Model of $P^{S_1}$**: $\{p, r\}$.
**Conclusion**: The least model $\{p, r\}$ matches our candidate $S_1$. Therefore, **$\{p, r\}$ is a stable model**.

By symmetry, $\{q\}$ is also a stable model. This program has multiple stable models, corresponding to multiple valid worldviews.

## Practice Problems

### Problem 1: Default Logic
Given the default rules:
1.  $\frac{\text{Quaker}(x) : \text{Pacifist}(x)}{\text{Pacifist}(x)}$ (Quakers are typically pacifists)
2.  $\frac{\text{Republican}(x) : \neg \text{Pacifist}(x)}{\neg \text{Pacifist}(x)}$ (Republicans are typically not pacifists)

And the facts: $\text{Quaker}(\text{Nixon})$ and $\text{Republican}(\text{Nixon})$.
**Question**: What can we conclude about Nixon? Is he a pacifist? (This is known as the "Nixon Diamond").

### Problem 2: Stable Models
Find the stable model(s) for the following program:
1.  $a \leftarrow \text{not } b$
2.  $b \leftarrow \text{not } a$
3.  $c \leftarrow a$
4.  $c \leftarrow b$

### Problem 3: Negation as Failure
Given the PROLOG program:
```prolog
p :- \+ q.
q :- \+ r.
r :- \+ s.
```
**Question**: What is the result of the query `?- p.`? Trace the execution stack.

## Conclusion

Non-monotonic reasoning bridges the gap between the rigid certainty of mathematical logic and the adaptive nature of human intelligence.
*   **Negation as Failure** allows us to reason with incomplete information.
*   **Default Logic** provides a formal mechanism for rules with exceptions.
*   **Stable Model Semantics** gives us a rigorous way to solve complex combinatorial problems using logic.

These concepts form the foundation of modern logic programming and are critical for agents that must operate in the real world, where knowledge is often partial and evolving.

## Further Reading

*   **Nonmonotonic Reasoning** by Grigoris Antoniou - A comprehensive textbook.
*   **Knowledge Representation, Reasoning, and the Design of Intelligent Agents** by Gelfond and Kahl - The definitive guide to Answer Set Programming.
*   [Stanford Encyclopedia of Philosophy: Non-monotonic Logic](https://plato.stanford.edu/entries/logic-nonmonotonic/)
*   [Potassco](https://potassco.org/) - Tools for Answer Set Solving.

---

*This lecture explored negation and non-monotonic reasoning. Together with the previous lectures on Hilbert systems and Herbrand semantics, this completes our survey of foundational logic for computer science.*
