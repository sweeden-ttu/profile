---
layout: post
title: "Naive Bayes Classification: From Bayesian Networks to Supervised Learning"
date: 2025-11-24
categories: [artificial-intelligence, machine-learning]
tags: [intelligent-systems, naive-bayes, supervised-learning, classification, machine-learning]
excerpt: "Learn how Naive Bayes bridges probabilistic reasoning and machine learning, using conditional independence assumptions to build powerful classifiers for spam detection, digit recognition, and more."
reading_time: 14
course: "Intelligent Systems"
---

# Naive Bayes Classification: From Bayesian Networks to Supervised Learning

Throughout our study of intelligent systems, we have focused on **inference**: given a probabilistic model, how do we use it to make optimal decisions? We now shift our focus to a more fundamental question: **How do we acquire these models from data?**

This marks our transition into **machine learning**—the study of algorithms that improve their performance through experience. We begin with **Naive Bayes**, a classification algorithm that beautifully bridges the gap between the probabilistic reasoning of Bayesian networks and the data-driven approach of machine learning. Despite its simplicity and its "naive" assumption of independence, it remains one of the most effective and widely used classifiers in the world.

## From Inference to Learning

### The Machine Learning Paradigm

In our previous work with Bayesian networks, we assumed the network structure and probability tables were given. For example, we might ask $P(\text{Burglary} \mid \text{Alarm} = \text{true})$ assuming we already knew the probability of a burglary and how reliable the alarm was.

In machine learning, the problem is inverted. We are given **data**—such as thousands of emails labeled "spam" or "ham"—and our goal is to **learn** the probability model $P(\text{spam} \mid \text{features})$ that best explains this data.

Machine learning is broadly categorized into three types:
1.  **Supervised Learning**: The algorithm learns from labeled examples (e.g., classification, regression).
2.  **Unsupervised Learning**: The algorithm finds hidden patterns in unlabeled data (e.g., clustering).
3.  **Reinforcement Learning**: The algorithm learns strategies by interacting with an environment and receiving rewards.

This lecture focuses on **supervised classification**, the most commercially significant area of machine learning.

## The Classification Problem

### Problem Definition

Formalizing the classification problem helps us understand exactly what we are trying to solve.

**Given**: A training dataset $\mathcal{D} = \{(x^{(1)}, y^{(1)}), (x^{(2)}, y^{(2)}), \ldots, (x^{(n)}, y^{(n)})\}$ where:
*   $x^{(i)}$ is an input vector of features (e.g., word counts, pixel values).
*   $y^{(i)}$ is a discrete class label (e.g., "spam", "digit 0").

**Goal**: Learn a function $f: X \to Y$ that accurately predicts the label $y$ for a new, unseen input $x$.

### Real-World Example 1: Spam Filtering

Consider building a spam filter.
*   **Input**: An email message.
*   **Output**: Label $Y \in \{\text{spam}, \text{ham}\}$.
*   **Features**: We convert the raw text into a feature vector.
    *   $F_1$: Does the email contain "FREE"? (0 or 1)
    *   $F_2$: Is the sender in my contacts? (0 or 1)
    *   $F_3$: Number of exclamation marks.

**Table 1: Example Feature Vector**

| Feature | Value | Meaning |
|---------|-------|---------|
| $F_1$ (sender_known) | 0 | Unknown sender |
| $F_2$ (has_free) | 1 | Contains "FREE" |
| $F_3$ (caps_lock) | 1 | Subject is ALL CAPS |

If our model predicts $P(\text{spam} \mid F_1=0, F_2=1, F_3=1) = 0.95$, we classify it as spam.

### Real-World Example 2: Digit Recognition (MNIST)

*   **Input**: A 28x28 pixel grayscale image of a handwritten digit.
*   **Output**: Label $Y \in \{0, 1, \ldots, 9\}$.
*   **Features**: 784 individual pixel intensity values.

This problem is the "Hello World" of computer vision, yet it presents significant challenges due to the variation in handwriting styles.

## Model-Based Classification with Bayesian Networks

### The Generative Approach

Naive Bayes is a **generative model**. Instead of directly trying to find a boundary between classes (discriminative), it models the underlying process that generates the data. We model the joint distribution $P(Y, F_1, \ldots, F_n)$ using a Bayesian network.

**Figure 1: Naive Bayes Network Structure**

```
       Y (Class Label)
      /      |      \
     /       |       \
    v        v        v
   F₁       F₂       Fₙ
(Feature 1) (Feature 2) (Feature n)
```

The structure implies that the **class label causes the features**. For example, the fact that an email is spam *causes* the appearance of the word "viagra"; the fact that a digit is a '0' *causes* the pixels in the center to be black.

### Training: Parameter Estimation

To train this model, we need to estimate two types of probability distributions from our training data:

1.  **The Prior $P(Y)$**: How common is each class?
    $$P(Y = y) = \frac{\text{Count}(Y = y)}{N}$$
    If 30% of our training emails are spam, our prior for spam is 0.3.

2.  **The Likelihoods $P(F_i \mid Y)$**: Given a class, what is the probability of observing a specific feature?
    $$P(F_i = f \mid Y = y) = \frac{\text{Count}(F_i = f \text{ and } Y = y)}{\text{Count}(Y = y)}$$
    This answers: "Of all the spam emails, what fraction contain the word 'FREE'?"

### Inference: Making Predictions

Once we have trained our model (estimated the parameters), classifying a new instance is simply an application of Bayes' Rule.

**Query**: Given features $f_1, \ldots, f_n$, what is the most probable class $y$?

$$P(Y \mid f_1, \ldots, f_n) = \frac{P(f_1, \ldots, f_n \mid Y) P(Y)}{P(f_1, \ldots, f_n)}$$

Since the denominator $P(f_1, \ldots, f_n)$ is constant for all classes, we can ignore it for the purpose of prediction:

$$\hat{y} = \mathop{\mathrm{argmax}}_y P(f_1, \ldots, f_n \mid Y = y) P(Y = y)$$

## The Naive Bayes Assumption

### Why "Naive"?

The calculation above requires $P(f_1, \ldots, f_n \mid Y)$, the joint probability of all features given the class. With 100 features, this table would be astronomically large.

To make this tractable, we make the **Naive Bayes Assumption**:
**Features are conditionally independent given the class label.**

$$P(f_1, \ldots, f_n \mid Y) \approx \prod_{i=1}^n P(f_i \mid Y)$$

**Meaning**: Once we know an email is spam, knowing it contains "FREE" tells us nothing extra about whether it contains "Click Here".

### Why It Works
This assumption is almost always false in reality. Words in a sentence are correlated; pixels in an image are correlated. However, Naive Bayes often performs remarkably well because:
1.  **Classification Ranking**: We only need the *correct class* to have the highest probability, not the *exact* probability.
2.  **Variance Reduction**: By ignoring correlations, we reduce the number of parameters significantly, preventing overfitting on small datasets.

### Complexity Comparison

**Full Joint Model**:
*   Parameters: $O(2^n \cdot |Y|)$
*   For 100 features, this is impossible ($2^{100}$).

**Naive Bayes**:
*   Parameters: $O(n \cdot |Y|)$
*   For 100 features and 2 classes: $100 \times 2 = 200$ parameters.
*   **Linear scaling** makes it extremely efficient.

## Example: Digit Recognition with Naive Bayes

Let's apply this to the MNIST digit recognition task.

**Setup**:
*   **Input**: 28x28 images.
*   **Features**: We threshold pixels to be 0 (black) or 1 (white). $F_{i,j}$ corresponds to the pixel at row $i$, column $j$.
*   **Model**:
    $$P(Y=d \mid \text{image}) \propto P(Y=d) \prod_{i,j} P(F_{i,j} \mid Y=d)$$

**Visualization**:
If we visualize the learned likelihoods $P(F_{i,j}=1 \mid Y=d)$ as a heatmap, we see the "average" shape of each digit.
*   **Digit 0**: A bright ring with a dark center.
*   **Digit 1**: A bright vertical stroke.
*   **Digit 8**: Two stacked bright loops.

This confirms that the model is learning meaningful prototypes for each class. While simple, this method achieves ~84% accuracy on MNIST.

## Practical Implementation

### Handling Underflow with Logarithms

Multiplying hundreds of small probabilities (e.g., $0.01 \times 0.05 \times \ldots$) results in numbers so small that computers round them to zero (underflow). To solve this, we work in **log-space**.

Instead of maximizing the product, we maximize the sum of logs:

$$\log P(Y \mid f) \propto \log P(Y) + \sum_{i=1}^n \log P(f_i \mid Y)$$

This simple transformation is numerically stable and computationally faster (addition is cheaper than multiplication).

### The Zero-Frequency Problem

What if a feature value never occurs in the training data for a specific class?
*   Example: A spam email with the word "bacon" appears, but no spam email in our training set contained "bacon".
*   Result: $P(\text{bacon} \mid \text{spam}) = 0$.
*   Consequence: The entire probability product becomes 0, regardless of other strong evidence.

We will address this critical issue in the next lecture using **Laplace Smoothing**.

## Conclusion

Naive Bayes is a foundational algorithm in machine learning that:
1.  **Leverages Probabilistic Structure**: It uses a specific Bayesian network topology to simplify complex joint distributions.
2.  **Scales Efficiently**: Its linear complexity allows it to handle thousands of features and millions of examples.
3.  **Performs Robustly**: Despite its "naive" independence assumption, it is a competitive baseline for text classification, medical diagnosis, and real-time systems.

In our next session, we will refine this model with smoothing techniques and explore how to measure the performance of our classifiers using accuracy, precision, and recall.

## Further Reading

*   **Pattern Recognition and Machine Learning** by Bishop (Chapter 8) - A rigorous mathematical treatment.
*   **Machine Learning: A Probabilistic Perspective** by Murphy (Chapter 3) - Covers generative models in depth.
*   [Scikit-Learn Documentation](https://scikit-learn.org/stable/modules/naive_bayes.html) - Excellent practical guide and Python implementation.
*   **Artificial Intelligence: A Modern Approach** by Russell and Norvig (Chapter 20) - Contextualizes Naive Bayes within AI agents.

---

*This lecture introduced the principles of supervised learning and the Naive Bayes classifier. Next, we will explore parameter estimation techniques and evaluation metrics.*
