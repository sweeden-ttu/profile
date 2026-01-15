---
title: "CS5368 Intelligent Systems – Project 3: Reinforcement Learning"
layout: project
---

## CS5368 Intelligent Systems – Project 3: Reinforcement Learning

> (Thanks to John DeNero and Dan Klein!)

- **Deadline**: Monday, November 17th, 2025  
  - Before class for 001  
  - End of the day for D01
- **Note**: Please review the “What to Submit” section before submitting.

Pacman seeks reward.  
Should he eat or should he run?  
When in doubt, Q-learn.

---

### Introduction

In this project, you will implement **Q-learning**. You will test your agents first on **Gridworld** (from class), then apply them to a simulated robot controller (**Crawler**) and **Pacman**.

You can download the code from Canvas. The code for this project contains the following files.

#### Files you will edit

- `qlearningAgents.py` – Q-learning agents for Gridworld, Crawler, and Pacman.  
- `analysis.py` – A file to put your answers to questions given in the project.

#### Files you should read but NOT edit

- `valueIterationAgents.py` – A value iteration agent for solving known MDPs.  
- `mdp.py` – Defines methods on general MDPs.  
- `learningAgents.py` – Defines the base classes `ValueEstimationAgent` and `QLearningAgent`.  
- `util.py` – Utilities, including `util.Counter`, which is particularly useful for Q-learners.  
- `gridworld.py` – The Gridworld implementation.  
- `featureExtractors.py` – Feature extractors for \((\text{state}, \text{action})\) pairs, used for approximate Q-learning.

#### Files you can ignore

- `environment.py` – Abstract class for general reinforcement learning environments (used by `gridworld.py`).  
- `graphicsGridworldDisplay.py` – Gridworld graphical display.  
- `graphicsUtils.py` – Graphics utilities.  
- `textGridworldDisplay.py` – Text interface for Gridworld.  
- `crawler.py` – The crawler code and test harness (run but do not edit).  
- `graphicsCrawlerDisplay.py` – GUI for the crawler robot.

---

### Evaluation

Your code will be autograded for **technical correctness**.

Please **do not** change the names of any provided functions or classes within the code, or you will break the autograder. If your code works correctly on one or two of the provided examples but doesn't get full credit from the autograder, you most likely have a subtle bug that breaks one of our more thorough test cases.

You may need to debug by reasoning about your code and constructing your own small examples. If you suspect an autograder bug, contact the staff.

---

### Academic Integrity

We will be checking your code against other submissions in the class for logical redundancy. If you copy someone else's code and submit it with minor changes, we will know.

Please submit your own work only; otherwise we may pursue the strongest available consequences.

---

### Getting Help

If you find yourself stuck:

- Use office hours, section, and Piazza.  
- If you can't make the scheduled office hours, let the staff know.

We want these projects to be rewarding and instructional, not frustrating.

---

### Q-Learning

#### Question 1: Q-learning (15 points)

You will write a Q-learning agent that learns by trial and error from interactions with the environment through its

\[
\text{update}(s,a,s',r)
\]

method.

A stub of a Q-learner is provided in `QLearningAgent` in `qlearningAgents.py`, and you can select it with `-a q`.

You must implement:

- `update`  
- `getValue`  
- `getQValue`  
- `getPolicy`

**Notes**:

- In `getPolicy`, break ties randomly (e.g. using `random.choice`).  
- Unseen actions start with Q-value \(0\). If all seen actions have negative Q-values, an unseen action may be optimal.  
- In `getValue` and `getPolicy`, access Q-values only via `getQValue`.

To observe learning:

```bash
python gridworld.py -a q -k 5 -m
```

The `-k` flag controls the number of training episodes. You can disable noise with `--noise 0.0` while debugging.

---

#### Question 2: Epsilon-Greedy (10 points)

Extend your Q-learning agent with **epsilon-greedy** action selection in `getAction`:

- With probability \(\varepsilon\), choose a random action.  
- With probability \(1-\varepsilon\), choose the action with the highest Q-value.

Example run:

```bash
python gridworld.py -a q -k 100
```

Your final Q-values should resemble those of a value iteration agent along well-traveled paths, though average returns will be lower due to exploration and early learning.

Hints:

- Use `random.choice` to pick uniformly from a list.  
- Use `util.flipCoin(p)` to simulate a Bernoulli variable with success probability \(p\).

---

#### Question 3: Bridge Crossing Revisited (5 points)

With no extra code, you should now be able to run:

```bash
python crawler.py
```

If this fails, your implementation is likely too specific to Gridworld; make it generic to all MDPs.

Experiment with:

- Simulation parameters (e.g. step delay).  
- Learning parameters (\(\alpha\), \(\varepsilon\)).  
- Discount factor \(\gamma\).

Grading: 1 point (but you are encouraged to explore).

---

### Approximate Q-Learning and State Abstraction

#### Question 4 (15 points)

Implement an approximate Q-learning agent that learns weights for **features of states and actions**.

Use the `ApproximateQAgent` class in `qlearningAgents.py` (a subclass of `PacmanQAgent`).

The approximate Q-function is:

\[
Q(s,a) = \sum_i w_i f_i(s,a),
\]

where:

- \(f_i(s,a)\) are features,  
- \(w_i\) are weights.

Feature functions in `featureExtractors.py` return `util.Counter` objects (sparse feature vectors).

Use the update:

\[
w_i \leftarrow w_i + \alpha \Big( r + \gamma \max_{a'} Q(s',a') - Q(s,a) \Big) f_i(s,a).
\]

By default, `ApproximateQAgent` uses `IdentityExtractor` (a single feature per \((s,a)\)), and should behave like `PacmanQAgent`.

Test:

```bash
python pacman.py -p ApproximateQAgent -x 2000 -n 2010 -l smallGrid
```

Then with `SimpleExtractor`:

```bash
python pacman.py -p ApproximateQAgent -a extractor=SimpleExtractor -x 50 -n 60 -l mediumGrid
python pacman.py -p ApproximateQAgent -a extractor=SimpleExtractor -x 50 -n 60 -l mediumClassic
```

Your agent should win almost every time after training.

---

### What to Submit

Submit to Canvas:

- `qlearningAgents.py`  
- `qlearningAgents.txt`  
- `partner.txt` (if you worked with a partner; include their name there)

Do **not** change or submit other distribution files.

