---


layout: post


title: "The Perceptron Algorithm: Introduction to Linear Classifiers and Neural Networks"


date: 2025-12-03


categories: [artificial-intelligence, machine-learning]


tags: [intelligent-systems, perceptron, linear-classifiers, neural-networks, gradient-descent, supervised-learning]


excerpt: "Transition from probabilistic to discriminative models with the Perceptron algorithm, learning how linear classifiers use weighted features to make predictions and laying the foundation for neural networks."


reading_time: 13


course: "Intelligent Systems"


---


 


# The Perceptron Algorithm: Introduction to Linear Classifiers and Neural Networks


 


We've explored **generative models** like Naive Bayes, which learn the full joint distribution $P(X, Y)$ to make predictions. Now we shift to **discriminative models**, which learn the decision boundary directly without modeling how data is generated.


 


The **Perceptron** is one of the oldest and most influential machine learning algorithms, introduced by Frank Rosenblatt in 1957. Despite its simplicity, it laid the foundation for modern neural networks and deep learning. This lecture explores how the Perceptron works, how it learns from mistakes, and its connection to the neural networks that power today's AI systems.


 


## From Probabilistic to Discriminative Models


 


### Two Approaches to Classification


 


**Generative Models** (e.g., Naive Bayes):


- **Learn**: $P(X \mid Y)$ and $P(Y)$ (full joint distribution)


- **Predict**: Use Bayes' rule to compute $P(Y \mid X)$


- **Advantage**: Can generate new samples, handle missing features


- **Disadvantage**: Makes assumptions about data distribution


 


**Discriminative Models** (e.g., Perceptron, Logistic Regression):


- **Learn**: Decision boundary directly (or $P(Y \mid X)$ directly)


- **Predict**: Apply learned function to features


- **Advantage**: Often more accurate, fewer assumptions


- **Disadvantage**: Can't generate samples, requires complete features


 


**Analogy**:


- **Generative**: Learn how to draw cats and dogs, then classify by asking "which drawing does this look more like?"


- **Discriminative**: Learn to distinguish cats from dogs directly


 


## Linear Classifiers: The Foundation


 


### The Linear Model


 


A **linear classifier** makes predictions using a weighted sum of features:


 


$$f(x) = w_0 + w_1 x_1 + w_2 x_2 + \cdots + w_n x_n = w_0 + \sum_{i=1}^n w_i x_i$$


 


**Components**:


- $x_i$: Feature values (inputs)


- $w_i$: Weights (learned parameters)


- $w_0$: Bias term (intercept)


 


**Prediction**:


- If $f(x) > 0$: Predict class **+1** (positive)


- If $f(x) < 0$: Predict class **-1** (negative)


- If $f(x) = 0$: On decision boundary (ambiguous)


 


**Geometric Interpretation**: $f(x) = 0$ defines a **hyperplane** that separates the two classes.


 


### Example: Spam Classification


 


**Features**:


- $x_1 = 1$ if email contains "free", else 0


- $x_2 = 1$ if email from unknown sender, else 0


- $x_3 = $ number of links in email


 


**Learned Weights**:


- $w_0 = -2$ (bias)


- $w_1 = 3$ (weight for "free")


- $w_2 = 2$ (weight for unknown sender)


- $w_3 = 0.5$ (weight per link)


 


**Classification Function**:


$$f(x) = -2 + 3x_1 + 2x_2 + 0.5x_3$$


 


**Example Email**: Contains "free", unknown sender, 10 links


$$f(x) = -2 + 3(1) + 2(1) + 0.5(10) = -2 + 3 + 2 + 5 = 8 > 0$$


 


**Prediction**: **Spam** (+1 class)


 


**Interpretation**:


- Positive weights: Features that suggest spam


- Negative weights: Features that suggest ham


- Magnitude: Importance of feature


 


### The Bias Term


 


**Bias $w_0$**: Shifts the decision boundary


 


**Without bias**: Decision boundary must pass through origin


**With bias**: Decision boundary can be anywhere


 


**Example**: Suppose all spam emails have at least 5 links


- Without bias: Can't separate if no other features distinguish them


- With bias: $w_0 = -2.5, w_3 = 0.5$ gives $f(x) = -2.5 + 0.5x_3$


- Decision boundary: $x_3 = 5$ (perfect separation!)


 


**Common Trick**: Absorb bias into weights by adding a constant feature $x_0 = 1$:


$$f(x) = w_0 \cdot 1 + w_1 x_1 + \cdots + w_n x_n = \mathbf{w} \cdot \mathbf{x}$$


 


where $\mathbf{w} = [w_0, w_1, \ldots, w_n]$ and $\mathbf{x} = [1, x_1, \ldots, x_n]$.


 


## The Perceptron Algorithm


 


### The Learning Problem


 


**Given**: Training data $\{(\mathbf{x}^{(i)}, y^{(i)})\}_{i=1}^N$ where $y^{(i)} \in \{-1, +1\}$


 


**Goal**: Find weights $\mathbf{w}$ such that:


- $\mathbf{w} \cdot \mathbf{x}^{(i)} > 0$ when $y^{(i)} = +1$


- $\mathbf{w} \cdot \mathbf{x}^{(i)} < 0$ when $y^{(i)} = -1$


 


**Equivalently**: $y^{(i)} (\mathbf{w} \cdot \mathbf{x}^{(i)}) > 0$ for all $i$ (correct classification)


 


### The Perceptron Update Rule


 


**Algorithm**: Iterate through training examples, updating weights when mistakes occur.


 


**Initialization**: $\mathbf{w} = \mathbf{0}$ (or small random values)


 


**For each training example** $(\mathbf{x}, y)$:


 


1. **Compute prediction**: $\hat{y} = \text{sign}(\mathbf{w} \cdot \mathbf{x})$


 


2. **If correct** ($\hat{y} = y$): Do nothing


 


3. **If incorrect** ($\hat{y} \neq y$): Update weights


   $$\mathbf{w} \leftarrow \mathbf{w} + y \cdot \mathbf{x}$$


 


**Repeat** until convergence (no mistakes on training set) or maximum iterations reached.


 


### Why Does This Work?


 


**Intuition**: Move the decision boundary toward the misclassified point.


 


**Case 1**: True label $y = +1$, but $\mathbf{w} \cdot \mathbf{x} < 0$ (predicted -1)


- Update: $\mathbf{w} \leftarrow \mathbf{w} + \mathbf{x}$


- New prediction: $\mathbf{w}_{\text{new}} \cdot \mathbf{x} = (\mathbf{w} + \mathbf{x}) \cdot \mathbf{x} = \mathbf{w} \cdot \mathbf{x} + \|\mathbf{x}\|^2$


- **Increased** by $\|\mathbf{x}\|^2 > 0$ → moves toward positive prediction ✓


 


**Case 2**: True label $y = -1$, but $\mathbf{w} \cdot \mathbf{x} > 0$ (predicted +1)


- Update: $\mathbf{w} \leftarrow \mathbf{w} - \mathbf{x}$


- New prediction: $\mathbf{w}_{\text{new}} \cdot \mathbf{x} = (\mathbf{w} - \mathbf{x}) \cdot \mathbf{x} = \mathbf{w} \cdot \mathbf{x} - \|\mathbf{x}\|^2$


- **Decreased** by $\|\mathbf{x}\|^2 > 0$ → moves toward negative prediction ✓


 


**Geometric View**: The update rotates the weight vector toward (or away from) the misclassified point.


 


## Worked Example: Simple 2D Classification


 


### Dataset


 


| Example | $x_1$ (bias) | $x_2$ (feature 1) | $x_3$ (feature 2) | Label $y$ |


|---------|---------|----------|----------|-------|


| 1 | 1 | 1 | 1 | +1 |


| 2 | 1 | 1 | -1 | -1 |


| 3 | 1 | -1 | 1 | -1 |


| 4 | 1 | -1 | -1 | +1 |


 


**Goal**: Learn $\mathbf{w} = [w_0, w_1, w_2]$ to classify correctly.


 


### Perceptron Execution


 


**Initialize**: $\mathbf{w} = [0, 0, 0]$


 


**Epoch 1**:


 


**Example 1**: $\mathbf{x} = [1, 1, 1], y = +1$


- Prediction: $\mathbf{w} \cdot \mathbf{x} = 0$ (wrong, predicts 0 or -1)


- Update: $\mathbf{w} \leftarrow [0, 0, 0] + 1 \cdot [1, 1, 1] = [1, 1, 1]$


 


**Example 2**: $\mathbf{x} = [1, 1, -1], y = -1$


- Prediction: $\mathbf{w} \cdot \mathbf{x} = 1 + 1 - 1 = 1 > 0$ (wrong, predicts +1)


- Update: $\mathbf{w} \leftarrow [1, 1, 1] - 1 \cdot [1, 1, -1] = [0, 0, 2]$


 


**Example 3**: $\mathbf{x} = [1, -1, 1], y = -1$


- Prediction: $\mathbf{w} \cdot \mathbf{x} = 0 + 0 + 2 = 2 > 0$ (wrong, predicts +1)


- Update: $\mathbf{w} \leftarrow [0, 0, 2] - 1 \cdot [1, -1, 1] = [-1, 1, 1]$


 


**Example 4**: $\mathbf{x} = [1, -1, -1], y = +1$


- Prediction: $\mathbf{w} \cdot \mathbf{x} = -1 - 1 - 1 = -3 < 0$ (wrong, predicts -1)


- Update: $\mathbf{w} \leftarrow [-1, 1, 1] + 1 \cdot [1, -1, -1] = [0, 0, 0]$


 


**Epoch 2**: Repeat... (continue until no mistakes)


 


**Final Weights** (after convergence): $\mathbf{w} = [0, 0, 1]$


 


**Verification**:


- Example 1: $0 + 0 + 1 = 1 > 0$ ✓ (predicts +1, correct)


- Example 2: $0 + 0 - 1 = -1 < 0$ ✓ (predicts -1, correct)


- Example 3: $0 + 0 + 1 = 1 > 0$ ✗ (predicts +1, but label is -1!)


 


**Note**: This particular dataset is not linearly separable with this feature representation. Perceptron will not converge!


 


## Multi-Class Perceptron


 


### Extending to Multiple Classes


 


**Binary Perceptron**: Two classes {-1, +1}


 


**Multi-Class Perceptron**: $K$ classes {1, 2, ..., $K$}


 


**Approach**: Learn **one weight vector per class**


- $\mathbf{w}_1, \mathbf{w}_2, \ldots, \mathbf{w}_K$


 


**Prediction**: Choose class with highest score


$$\hat{y} = \arg\max_k \mathbf{w}_k \cdot \mathbf{x}$$


 


**Update Rule** (when prediction is wrong):


 


For true class $y$ and predicted class $\hat{y}$:


$$\mathbf{w}_y \leftarrow \mathbf{w}_y + \mathbf{x} \quad \text{(increase score for correct class)}$$


$$\mathbf{w}_{\hat{y}} \leftarrow \mathbf{w}_{\hat{y}} - \mathbf{x} \quad \text{(decrease score for incorrect class)}$$


 


**Intuition**: Reward the correct class, punish the incorrect class.


 


### Example: Digit Recognition


 


**Classes**: {0, 1, 2, ..., 9}


 


**Features**: 784 pixel values (28×28 image)


 


**Weights**: 10 weight vectors, each of size 784


 


**Training Example**: Image of digit "7" with features $\mathbf{x}$


 


**Prediction**:


$$\hat{y} = \arg\max_k \mathbf{w}_k \cdot \mathbf{x}$$


 


Suppose $\mathbf{w}_7 \cdot \mathbf{x} = 120$ and $\mathbf{w}_2 \cdot \mathbf{x} = 150$ (highest)


 


**Predicted**: 2 (wrong!)


 


**Update**:


- $\mathbf{w}_7 \leftarrow \mathbf{w}_7 + \mathbf{x}$ (increase score for 7)


- $\mathbf{w}_2 \leftarrow \mathbf{w}_2 - \mathbf{x}$ (decrease score for 2)


 


**Effect**: Next time, score for 7 will be higher relative to 2.


 


## Perceptron Convergence and Limitations


 


### Convergence Theorem


 


**Perceptron Convergence Theorem** (Rosenblatt, 1962):


 


If the training data is **linearly separable**, the Perceptron algorithm will converge to a solution in a **finite number of updates**.


 


**Linearly Separable**: There exists a hyperplane that perfectly separates the two classes.


 


**Convergence Bound**:


$$\text{Number of mistakes} \leq \frac{R^2}{\gamma^2}$$


 


where:


- $R = \max_i \|\mathbf{x}^{(i)}\|$ (maximum feature vector magnitude)


- $\gamma = \min_i y^{(i)} (\mathbf{w}^* \cdot \mathbf{x}^{(i)}) / \|\mathbf{w}^*\|$ (margin of optimal separator)


 


**Interpretation**: Converges faster when classes are well-separated (large margin).


 


### Limitations


 


**1. No Convergence for Non-Separable Data**:


 


If data is **not linearly separable**, Perceptron will **never converge** (keeps making mistakes).


 


**Example**: XOR problem


 


| $x_1$ | $x_2$ | $y$ |


|-------|-------|-----|


| 0 | 0 | 0 |


| 0 | 1 | 1 |


| 1 | 0 | 1 |


| 1 | 1 | 0 |


 


**No linear separator** can classify this correctly!


 


**Solution**: Use non-linear features (e.g., $x_1 x_2$) or multi-layer networks.


 


**2. No Probabilistic Interpretation**:


 


Perceptron gives a decision (±1) but **no confidence/probability**.


 


**Example**:


- Email 1: $f(x) = 0.01$ → predict spam


- Email 2: $f(x) = 100$ → predict spam


 


Both are "spam," but Email 2 is much more confidently spam. Perceptron doesn't distinguish.


 


**Solution**: Logistic regression provides $P(y = 1 \mid x)$.


 


**3. Sensitive to Outliers**:


 


A single mislabeled example far from the decision boundary can drastically affect the result.


 


**4. Multiple Solutions**:


 


If data is separable, many hyperplanes work. Perceptron finds one but doesn't prefer maximum-margin separator (unlike SVM).


 


## Connection to Neural Networks


 


### The Perceptron as a Neuron


 


The Perceptron is a **single artificial neuron**:


 


```


Inputs:     x₁   x₂   x₃  ...  xₙ


              \   |   /        /


Weights:       w₁ w₂ w₃  ...  wₙ


                 \ | /         /


                  \|/         /


                   Σ  (weighted sum)


                   |


                   |


              [Activation]


                   |


              sign function


                   |


                Output: ±1


```


 


**Components**:


1. **Inputs**: Features $x_1, \ldots, x_n$


2. **Weights**: $w_1, \ldots, w_n$


3. **Summation**: $z = \sum_i w_i x_i$


4. **Activation**: $\hat{y} = \text{sign}(z)$


 


### From Perceptron to Neural Networks


 


**Multi-Layer Perceptron (MLP)**:


- **Input Layer**: Raw features


- **Hidden Layers**: Computed features (non-linear combinations)


- **Output Layer**: Final prediction


 


**Key Difference**: Hidden layers use **non-linear activations** (sigmoid, ReLU)


 


**Example**:


```


Input Layer    Hidden Layer    Output Layer


   x₁ ────┐


           ├──→ [h₁] ───┐


   x₂ ────┤              ├──→ [y]


           ├──→ [h₂] ───┘


   x₃ ────┘


```


 


**Power**: Can learn non-linear decision boundaries (solves XOR!)


 


**Training**: Backpropagation (gradient descent on all layers)


 


**Modern Deep Learning**: Many hidden layers (100s in some cases)


 


## Practice Problems


 


### Problem 1: Manual Perceptron


 


Given data:


| $\mathbf{x}$ | $y$ |


|--------------|-----|


| [1, 2, 1] | +1 |


| [1, -1, -1] | -1 |


| [1, 1, -1] | +1 |


 


Run 2 epochs of Perceptron starting with $\mathbf{w} = [0, 0, 0]$. What are the final weights?


 


### Problem 2: Linear Separability


 


Determine if the following datasets are linearly separable:


 


1. Points: (0,0):-, (0,1):+, (1,0):+, (1,1):-


2. Points: (0,0):-, (0,1):+, (1,0):+, (1,1):+


 


If yes, find a separating hyperplane.


 


### Problem 3: Multi-Class Decision


 


You have 3 classes with weight vectors:


- $\mathbf{w}_1 = [1, 2, -1]$


- $\mathbf{w}_2 = [0, -1, 2]$


- $\mathbf{w}_3 = [-1, 1, 1]$


 


Classify $\mathbf{x} = [1, 3, 2]$ (including bias).


 


## Conclusion


 


The Perceptron algorithm bridges classical machine learning and modern neural networks:


 


1. **Discriminative Approach**: Learns decision boundary directly without modeling $P(X \mid Y)$


2. **Linear Classifier**: Uses weighted sum of features with bias term


3. **Online Learning**: Updates weights incrementally based on mistakes


4. **Convergence Guarantee**: Finds solution if data is linearly separable


5. **Foundation of Neural Networks**: Single neuron extended to multi-layer architectures


 


**Strengths**:


- Simple and efficient


- Provable convergence for separable data


- Forms basis for neural networks


 


**Weaknesses**:


- Fails on non-separable data


- No probabilistic output


- Sensitive to feature scaling


 


**Historical Impact**: Despite being from 1957, the Perceptron remains relevant as:


- A pedagogical tool for understanding neural networks


- The building block of modern deep learning


- A baseline for linear classification


 


**Next Steps**: Modern extensions include:


- **Logistic Regression**: Adds probabilistic interpretation


- **Support Vector Machines**: Maximizes margin for better generalization


- **Deep Neural Networks**: Multiple layers for non-linear functions


 


## Further Reading


 


- *Pattern Recognition and Machine Learning* by Bishop (Chapter 4) - Linear models for classification


- *Deep Learning* by Goodfellow, Bengio, and Courville (Chapter 6) - From Perceptron to deep networks


- [The Perceptron: A Probabilistic Model](http://www.ling.upenn.edu/courses/cogs501/Rosenblatt1958.pdf) by Rosenblatt (1958) - Original paper


- *Neural Networks and Deep Learning* by Michael Nielsen - Free online book


- [sklearn.linear_model.Perceptron](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Perceptron.html) - Python implementation


 


---


 


*This lecture introduced the Perceptron algorithm and linear classifiers, completing our journey from probabilistic inference to machine learning. You now have the foundations to explore advanced topics in neural networks and deep learning.*


 


