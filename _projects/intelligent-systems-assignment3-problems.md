---
title: "CS5368 Intelligent Systems – Assignment 3 Problem Solving"
layout: project
---

## CS5368 Intelligent Systems – Assignment 3 Problem Solving

- **Course**: CS5368 Intelligent Systems  
- **Assignment**: 3 – Problem Solving  
- **Due date**: November 17th  
  - Before class for 001  
  - By the end of the day for D01  
- **Max grade**: 40 points

Please answer the following questions and submit them through Canvas. Be sure to submit to the **Assignment 3 problem-solving** link.

---

### Problem 1 [20 pts]: Model-Based, TD, and Direct Evaluation RL

An agent interacts with an environment with three states: \(S_1, S_2, S_3\) (with \(S_3\) terminal). It can take two actions: \(a_1\) and \(a_2\).

During exploration, the agent observes the following transitions:

| From | Action | To | Reward | Count |
|------|--------|----|--------|-------|
| \(S_1\) | \(a_1\) | \(S_2\) | 2 | 7 |
| \(S_1\) | \(a_1\) | \(S_1\) | 0 | 3 |
| \(S_1\) | \(a_2\) | \(S_2\) | 2 | 4 |
| \(S_1\) | \(a_2\) | \(S_3\) | 5 | 6 |
| \(S_2\) | \(a_1\) | \(S_1\) | 1 | 5 |
| \(S_2\) | \(a_1\) | \(S_3\) | 5 | 5 |
| \(S_2\) | \(a_2\) | \(S_2\) | 0 | 8 |
| \(S_2\) | \(a_2\) | \(S_3\) | 5 | 2 |

Parameters:

1. Discount factor: \(\gamma = 0.9\)  
2. Learning rate: \(\alpha = 0.5\)  
3. Initial values: \(V(S_1) = V(S_2) = 0\), \(V(S_3) = 0\) (terminal state)

#### (a) [6 pts] Model estimation

Compute the estimated model by computing \(T\) and \(R\):

\[
T(s,a,s') = \Pr(s' \mid s,a), \qquad R(s,a,s') = \mathbb{E}[r \mid s,a,s'].
\]

Fill in:

| \(s\) | \(a\) | \(s'\) | \(T(s,a,s')\) | \(R(s,a,s')\) |
|-------|------|--------|---------------|----------------|
| \(S_1\) | \(a_1\) | \(S_2\) | ? | ? |
| \(S_1\) | \(a_1\) | \(S_1\) | ? | ? |
| \(S_1\) | \(a_2\) | \(S_2\) | ? | ? |
| \(S_1\) | \(a_2\) | \(S_3\) | ? | ? |
| \(S_2\) | \(a_1\) | \(S_1\) | ? | ? |
| \(S_2\) | \(a_1\) | \(S_3\) | ? | ? |
| \(S_2\) | \(a_2\) | \(S_2\) | ? | ? |
| \(S_2\) | \(a_2\) | \(S_3\) | ? | ? |

#### (b) [4 pts] Direct Evaluation

Using the sequence of transitions as an episode:

\[
[(S_1, a_1, S_2, 2),\ (S_2, a_2, S_3, 5)]
\]

Compute the return and estimated value for each visited state \(S_1\) and \(S_2\) using **Direct Evaluation**.

#### (c) [10 pts] Temporal Difference Updates

Using the following sequence of transitions \((s,a,s',r)\), perform TD updates for \(V(S_1)\) and \(V(S_2)\) with the given \(\gamma, \alpha\), and initial values:

\[
[(S_1, a_1, S_2, 2),\ (S_1, a_2, S_3, 5),\ (S_2, a_1, S_1, 1),\ (S_2, a_2, S_3, 5)].
\]

Use the standard TD(0) update:

\[
V(s) \leftarrow V(s) + \alpha \big( r + \gamma V(s') - V(s) \big).
\]

---

### Problem 2 [20 pts]: Feature-Based Representation

Consider the following **feature-based representation** of a Q-function:

\[
Q(s,a) = w_1 f_1(s,a) + w_2 f_2(s,a) + \dots
\]

#### (a) [8 pts] Computing Q-values

Initially, assume:

\[
w_1 = 1, \qquad w_2 = 10.
\]

For the state \(s\) shown in the assignment handout (Pac-Man grid), compute:

- [3 pts] \(Q(s, \text{South})\)  
- [3 pts] \(Q(s, \text{West})\)

Assume the red and blue ghosts are both sitting on top of a dot.

Use:

\[
Q(s,a) = w_1 f_1(s,a) + w_2 f_2(s,a).
\]

- [2 pts] Based on this approximate Q-function, which action would be chosen? Justify your answer.

#### (b) [6 pts] Next state and sample

Assume Pac-Man moves West, resulting in a new state \(s'\). Pac-Man receives reward:

\[
r = 9
\]

(10 for eating a dot, \(-1\) living penalty).

Compute:

- [2 pts] \(Q(s', \text{East})\)  
- [2 pts] \(Q(s', \text{West})\)  
- [2 pts] The sample value with \(\gamma = 1\):

\[
\text{sample} = r + \gamma \max_{a'} Q(s', a').
\]

#### (c) [6 pts] Weight updates

Let \(\alpha = 0.5\).

Compute:

- [2 pts]
  \[
  \text{difference} = \big[ r + \gamma \max_{a'} Q(s', a') \big] - Q(s,a).
  \]
- [2 pts]
  \[
  w_1 \leftarrow w_1 + \alpha \cdot \text{difference} \cdot f_1(s,a).
  \]
- [2 pts]
  \[
  w_2 \leftarrow w_2 + \alpha \cdot \text{difference} \cdot f_2(s,a).
  \]

