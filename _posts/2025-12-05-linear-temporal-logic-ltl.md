---
layout: post
title: "Linear Temporal Logic: Specification and Verification of Reactive Systems"
date: 2025-12-05
categories: [logic, computer-science]
tags: [logic-for-computer-scientists, temporal-logic, ltl, model-checking, safety, liveness]
excerpt: "Master Linear Temporal Logic (LTL) for specifying and verifying time-dependent properties of reactive systems, from safety invariants to liveness guarantees."
reading_time: 15
course: "CS-5384 Logic for Computer Scientists"
---

# Linear Temporal Logic: Specification and Verification of Reactive Systems

Classical propositional and first-order logic are excellent for reasoning about **static properties**—statements that are either true or false at a single point in time. However, computer systems are fundamentally **dynamic**: they evolve over time, respond to inputs, and exhibit behaviors across sequences of states.

**Linear Temporal Logic (LTL)** extends propositional logic with **temporal operators** that allow us to express properties about **sequences of states**—traces of system execution. LTL is the foundation of **model checking**, a powerful technique for automatically verifying that systems satisfy specifications.

This lecture introduces LTL syntax and semantics, the four fundamental temporal operators, and the critical distinction between **safety** and **liveness** properties.

## Why Temporal Logic?

Consider trying to specify the following properties of a traffic light controller using classical logic:
1. "The light is never both red and green simultaneously"
2. "If the light is red, it will eventually turn green"
3. "The light alternates between red and green infinitely"

**Problem**: Classical logic has no notion of "eventually," "always," "next," or "until."
**Solution**: Temporal logic introduces operators that quantify over **time** (or, more precisely, over **sequences of states**).

## Temporal Logic: Linear vs. Branching

There are two major families of temporal logic:

1. **Linear Temporal Logic (LTL)**: Time is a **linear sequence** of states (a single trace)
   - Models: Infinite sequences $s_0, s_1, s_2, \ldots$
   - Suitable for: Verifying individual executions, specifying behaviors

2. **Computation Tree Logic (CTL)**: Time is a **branching tree** of possible futures
   - Models: Trees of states representing all possible executions
   - Suitable for: Reasoning about all possible behaviors, non-determinism

**This lecture focuses on LTL**, which is more intuitive for specifying individual execution traces.

## LTL Syntax: The Four Fundamental Operators

LTL extends propositional logic with four temporal operators:

### 1. **X** (Next)
**Notation**: $X \phi$
**Meaning**: $\phi$ holds in the **next state**.
**Read as**: "Next $\phi$"
**Example**: $X(\text{light} = \text{green})$ - "In the next state, the light is green"

### 2. **F** (Eventually / Finally)
**Notation**: $F \phi$
**Meaning**: $\phi$ holds **sometime in the future** (at some state in the trace).
**Read as**: "Eventually $\phi$" or "Finally $\phi$"
**Example**: $F(\text{request} \to \text{granted})$ - "Eventually, if a request was made, it will be granted"

### 3. **G** (Globally / Always)
**Notation**: $G \phi$
**Meaning**: $\phi$ holds **at all states** in the trace (now and forever).
**Read as**: "Globally $\phi$" or "Always $\phi$"
**Example**: $G(\neg (\text{red} \land \text{green}))$ - "Always, the light is not both red and green"

### 4. **U** (Until)
**Notation**: $\phi \, U \, \psi$
**Meaning**: $\phi$ holds **until** $\psi$ becomes true. Specifically:
- $\psi$ **must eventually** become true
- $\phi$ holds at **all states before** $\psi$ becomes true
- Once $\psi$ becomes true, $\phi$ need not hold anymore
**Read as**: "$\phi$ until $\psi$"
**Example**: $\text{red} \, U \, \text{green}$ - "The light stays red until it becomes green"

### Summary Table

| Operator | Symbol | Meaning | Example |
|----------|--------|---------|---------|
| Next | $X \phi$ | $\phi$ holds in next state | $X \text{running}$ |
| Eventually | $F \phi$ | $\phi$ holds sometime in the future | $F \text{done}$ |
| Globally | $G \phi$ | $\phi$ holds at all future states | $G \text{safe}$ |
| Until | $\phi \, U \, \psi$ | $\phi$ holds until $\psi$ becomes true | $\text{wait} \, U \, \text{signal}$ |

## LTL Semantics: Traces and Satisfaction

### Traces (Paths)
A **trace** (or **path**) is an infinite sequence of states:
$$\pi = s_0, s_1, s_2, s_3, \ldots$$

Each state $s_i$ is a valuation of propositional variables. For instance:
- $s_0 = \{\text{red}, \neg \text{green}, \neg \text{yellow}\}$
- $s_1 = \{\neg \text{red}, \text{green}, \neg \text{yellow}\}$

**Notation**: $\pi^i$ denotes the suffix of $\pi$ starting at state $i$:
$$\pi^i = s_i, s_{i+1}, s_{i+2}, \ldots$$

### Satisfaction Relation
We write $\pi \models \phi$ to mean "trace $\pi$ satisfies formula $\phi$."

**Definition** (inductively on formula structure):

- **Propositional Atom**: $\pi \models p$ iff $p$ is true in the first state $s_0$
- **Boolean Connectives**:
  - $\pi \models \neg \phi$ iff $\pi \not\models \phi$
  - $\pi \models \phi \land \psi$ iff $\pi \models \phi$ and $\pi \models \psi$
  - $\pi \models \phi \lor \psi$ iff $\pi \models \phi$ or $\pi \models \psi$
  - $\pi \models \phi \to \psi$ iff $\pi \models \psi$ whenever $\pi \models \phi$

**Temporal Operators**:
- **Next**: $\pi \models X \phi$ iff $\pi^1 \models \phi$
- **Eventually**: $\pi \models F \phi$ iff there exists $i \geq 0$ such that $\pi^i \models \phi$
- **Globally**: $\pi \models G \phi$ iff for all $i \geq 0$, $\pi^i \models \phi$
- **Until**: $\pi \models \phi \, U \, \psi$ iff there exists $j \geq 0$ such that:
  - $\pi^j \models \psi$ (eventually $\psi$ holds)
  - For all $0 \leq i < j$, $\pi^i \models \phi$ ($\phi$ holds at all states before $\psi$)

## Worked Examples: Evaluating LTL Formulas on Traces

### Example 1: Traffic Light Trace
**Trace**:
$$\pi = \{r\}, \{r\}, \{g\}, \{g\}, \{y\}, \{r\}, \{r\}, \{g\}, \ldots$$
where $r$ = red, $g$ = green, $y$ = yellow.

1. $\pi \models X r$? **True** (red is true in $s_1$)
2. $\pi \models F g$? **True** (green is true at $s_2$)
3. $\pi \models G \neg(r \land g)$? **True** (assuming never true simultaneously)
4. $\pi \models r \, U \, g$? **True** (red holds at $s_0, s_1$ until green at $s_2$)

## Safety vs. Liveness Properties

LTL formulas are often classified into two fundamental categories:

### Safety Properties
**Informal Definition**: "Something bad never happens."
**Formal Characterization**: $G \neg \text{bad}$ or $G \text{invariant}$.
**Key Insight**: A safety violation can be detected in **finite time** (by observing a finite prefix of the trace).
**Examples**:
1. **Mutual Exclusion**: $G \neg(\text{p1\_in\_CS} \land \text{p2\_in\_CS})$
2. **No Deadlock**: $G(\text{enabled}(p1) \lor \text{enabled}(p2))$

### Liveness Properties
**Informal Definition**: "Something good eventually happens."
**Formal Characterization**: $F \text{good}$ or $G(\text{request} \to F \text{response})$.
**Key Insight**: A liveness violation **cannot** be detected in finite time (you must observe the entire infinite trace).
**Examples**:
1. **Termination**: $F \text{done}$
2. **Fairness**: $G F \text{scheduled}$

## Practice Problems

### Problem 1: Evaluate on Trace
**Trace**: $\pi = \{p\}, \{p,q\}, \{q\}, \{q\}, \{\}, \{p\}, \ldots$
Evaluate:
1. $\pi \models X q$
2. $\pi \models F (p \land q)$
3. $\pi \models G(p \to X q)$
4. $\pi \models p \, U \, q$

### Problem 2: Express in LTL
Translate to LTL:
1. "The system eventually reaches a stable state and remains stable forever"
2. "If an error occurs, the system resets within 2 time steps"

### Problem 3: Safety or Liveness?
Classify each property:
1. $G(p \to \neg q)$
2. $G F p$
3. $F G p$

---

### Exercise Solutions

**Problem 1: Evaluation**
1. **True**: $s_1$ contains $q$.
2. **True**: $s_1$ contains both $p$ and $q$.
3. **True**: Whenever $p$ is true ($s_0, s_1, s_5$), the *next* state ($s_1, s_2$) contains $q$. (Assuming $s_6$ contains $q$ if $p$ is true in $s_5$).
4. **True**: $p$ holds ($s_0$) until $q$ becomes true ($s_1$). Note: $p$ can also be true in $s_1$.

**Problem 2: Translation**
1. $F G \text{stable}$
2. $G(\text{error} \to (X \text{reset} \lor X X \text{reset}))$

**Problem 3: Classification**
1. **Safety**: "Something bad ($p \land q$) never happens."
2. **Liveness**: "Something good ($p$) happens infinitely often."
3. **Liveness**: "Eventually something stays good forever." (Strictly speaking, $F G$ is a liveness property because no finite prefix can disprove it).

## Conclusion

Linear Temporal Logic provides a powerful framework for specifying and verifying time-dependent properties of reactive systems. By using operators like $X, F, G, U$, we can precisely define what it means for a system to be safe and live. These specifications form the input to automated model checking tools like SPIN and NuSMV, which ensure that our systems behave correctly under all possible executions.

## Further Reading

- *Principles of Model Checking* by Baier and Katoen
- *Logic in Computer Science* by Huth and Ryan
- [SPIN Model Checker](https://spinroot.com/)
- [CMU 15-414: Bug Catching](https://www.cs.cmu.edu/~15414/)

---

*This lecture introduced Linear Temporal Logic. Next, we will see how these concepts are applied in automated Model Checking.*
