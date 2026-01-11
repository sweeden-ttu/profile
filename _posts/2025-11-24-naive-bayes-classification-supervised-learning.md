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


 


We've spent considerable time learning how to **use** probabilistic models to make optimal decisions through inference. Now we shift to a fundamental question: **How do we acquire these models from data?**


 


This transition marks our entry into **machine learning**—the study of algorithms that improve through experience. We begin with **Naive Bayes**, one of the most elegant and successful classification algorithms, which combines the probabilistic reasoning of Bayesian networks with the simplicity of a strong independence assumption.


 


## From Inference to Learning


 


### The Machine Learning Paradigm


 


**Previously**: Given a model (Bayesian network with probabilities), perform inference


- Example: $P(\text{Burglary} \mid \text{Alarm} = \text{true})$


 


**Now**: Given data, **learn** the model


- Example: From emails labeled "spam" or "ham," learn $P(\text{spam} \mid \text{features})$


 


**Three Types of Machine Learning**:


 


1. **Supervised Learning**: Learn from labeled examples


   - **Classification**: Discrete outputs (spam/ham, digit 0-9)


   - **Regression**: Continuous outputs (house prices, temperature)


 


2. **Unsupervised Learning**: Find patterns in unlabeled data


   - Clustering, dimensionality reduction, anomaly detection


 


3. **Reinforcement Learning**: Learn from reward signals


   - Game playing, robotics, resource allocation


 


**This lecture focuses on supervised classification**, the most widely used ML paradigm.


 


## The Classification Problem


 


### Problem Definition


 


**Given**:


- **Training Dataset**: $\{(x^{(1)}, y^{(1)}), (x^{(2)}, y^{(2)}), \ldots, (x^{(n)}, y^{(n)})\}$


  - $x^{(i)}$: Input (features)


  - $y^{(i)}$: Label (class)


 


**Goal**: Learn a function $f: X \to Y$ that predicts labels for new inputs


 


**Workflow**:


1. **Input provided**: Raw data (email, image, sensor readings)


2. **Feature extraction**: Convert to feature vector


3. **Classification algorithm**: Apply learned model


4. **Output prediction**: Return predicted label


 


### Example 1: Spam Filter


 


**Input**: Email text


```


Dear Sir,


First, I must solicit your confidence in this transaction...


TO BE REMOVED FROM FUTURE MAILINGS, SIMPLY REPLY...


99 MILLION EMAIL ADDRESSES FOR ONLY $99


```


 


**Output**: spam or ham (not spam)


 


**Features** (extracted from email):


- **Word frequency**: Does email contain "FREE", "million", "click"?


- **Text patterns**: Presence of $\$\$, ALL CAPS, excessive punctuation


- **Metadata**: Sender in contacts? Widely broadcast?


- **Link count**: Number of URLs


 


**Example Feature Vector**:


```


F1 (sender_in_contacts) = 0


F2 (contains_free) = 1


F3 (all_caps_ratio) = 0.15


F4 (num_links) = 5


```


 


**Label**: $Y = \text{spam}$


 


### Example 2: Digit Recognition


 


**Input**: 28×28 pixel image


 


```


  ████████


  ██    ██


      ███


    ███


  ███


  ████████


```


 


**Output**: Digit 0-9


 


**Features**:


- **Raw pixels**: $F_{i,j} = \text{pixel intensity at position } (i,j)$


- **Shape patterns**: Number of connected components, loops, aspect ratio


- **Edge features**: Vertical lines, horizontal lines, curves


 


**Modern Approach**: Deep learning extracts features automatically from raw pixels


 


### Real-World Classification Applications


 


| Domain | Input | Classes | Application |


|--------|-------|---------|-------------|


| Medical Diagnosis | Symptoms, test results | Diseases | Patient care |


| Fraud Detection | Transaction history | Fraud/Legitimate | Banking security |


| Essay Grading | Text document | Letter grades | Education |


| Customer Service | Email content | Department routing | Support automation |


| Sentiment Analysis | Product review | Positive/Negative | Market research |


| Language ID | Text | Language (English, Spanish, etc.) | Translation systems |


 


**Impact**: Classification is a **core commercial technology** powering billions of dollars in applications.


 


## Model-Based Classification with Bayesian Networks


 


### The Generative Approach


 


**Idea**: Model the joint distribution $P(Y, F_1, \ldots, F_n)$ using a Bayesian network.


 


**Network Structure**:


```


       Y (Label)


      / | \


     /  |  \


    F₁  F₂  F₃ ... Fₙ (Features)


```


 


**Why this structure?** The label **causes** the features:


- Spam emails contain certain words **because** they are spam


- Digit images have certain pixels on **because** of the digit's shape


 


**Probability Tables**:


1. **Prior**: $P(Y)$ - How often does each class occur?


2. **Likelihoods**: $P(F_i \mid Y)$ - How does the class affect each feature?


 


### Training: Learning from Data


 


**Given**: Training dataset with $N$ labeled examples


 


**Estimate**:


1. **$P(Y = y)$**: Count frequency of each label


   $$P(Y = y) = \frac{\text{count}(Y = y)}{N}$$


 


2. **$P(F_i = f \mid Y = y)$**: Count feature value given label


   $$P(F_i = f \mid Y = y) = \frac{\text{count}(F_i = f, Y = y)}{\text{count}(Y = y)}$$


 


**Example**: Spam filter with 6 training emails


 


| Email | Sender Known? | Contains "free"? | Label |


|-------|---------------|------------------|-------|


| 1 | Yes | No | ham |


| 2 | No | Yes | spam |


| 3 | Yes | No | ham |


| 4 | No | Yes | spam |


| 5 | No | No | spam |


| 6 | Yes | Yes | ham |


 


**Learned Prior**:


- $P(\text{spam}) = 3/6 = 0.5$


- $P(\text{ham}) = 3/6 = 0.5$


 


**Learned Likelihoods**:


 


$P(F_1 \mid Y)$: Sender known?


 


| $Y$ | $F_1 = \text{yes}$ | $F_1 = \text{no}$ |


|-----|-------|------|


| spam | 0/3 = 0 | 3/3 = 1 |


| ham | 3/3 = 1 | 0/3 = 0 |


 


$P(F_2 \mid Y)$: Contains "free"?


 


| $Y$ | $F_2 = \text{yes}$ | $F_2 = \text{no}$ |


|-----|-------|------|


| spam | 2/3 ≈ 0.67 | 1/3 ≈ 0.33 |


| ham | 1/3 ≈ 0.33 | 2/3 ≈ 0.67 |


 


### Classification: Inference


 


**Given**: New email with features $f_1, f_2$


 


**Query**: $P(Y \mid f_1, f_2)$


 


**Apply Bayes' Rule**:


$$P(Y \mid f_1, f_2) = \frac{P(f_1, f_2 \mid Y) \cdot P(Y)}{P(f_1, f_2)}$$


 


**Key Simplification** (Naive Bayes assumption):


$$P(f_1, f_2 \mid Y) = P(f_1 \mid Y) \cdot P(f_2 \mid Y)$$


 


*Features are independent given the label*


 


**Computational Steps**:


 


1. **Compute unnormalized posterior** for each class:


   $$\tilde{P}(Y = y) = P(Y = y) \prod_{i=1}^n P(F_i = f_i \mid Y = y)$$


 


2. **Normalize**:


   $$P(Y = y \mid f_1, \ldots, f_n) = \frac{\tilde{P}(Y = y)}{\sum_{y'} \tilde{P}(Y = y')}$$


 


3. **Predict**:


   $$\hat{y} = \arg\max_y P(Y = y \mid f_1, \ldots, f_n)$$


 


### Example Classification


 


**New email**: Sender unknown, contains "free"


- $f_1 = \text{no}$ (sender not known)


- $f_2 = \text{yes}$ (contains "free")


 


**Compute for $Y = \text{spam}$**:


$$\tilde{P}(\text{spam}) = P(\text{spam}) \cdot P(f_1 = \text{no} \mid \text{spam}) \cdot P(f_2 = \text{yes} \mid \text{spam})$$


$$= 0.5 \times 1.0 \times 0.67 = 0.335$$


 


**Compute for $Y = \text{ham}$**:


$$\tilde{P}(\text{ham}) = P(\text{ham}) \cdot P(f_1 = \text{no} \mid \text{ham}) \cdot P(f_2 = \text{yes} \mid \text{ham})$$


$$= 0.5 \times 0.0 \times 0.33 = 0.0$$


 


**Normalize**:


$$P(\text{spam} \mid f_1, f_2) = \frac{0.335}{0.335 + 0.0} = 1.0$$


 


**Prediction**: **spam** (100% confidence)


 


**Note**: Zero probability for ham because $P(f_1 = \text{no} \mid \text{ham}) = 0$ in our small dataset. This is the **zero-frequency problem**—addressed with smoothing (next lecture).


 


## The Naive Bayes Assumption


 


### Why "Naive"?


 


The name comes from the **conditional independence assumption**:


 


$$P(F_1, \ldots, F_n \mid Y) = \prod_{i=1}^n P(F_i \mid Y)$$


 


**Meaning**: Given the class label, all features are independent.


 


**Example in Spam**:


- Given an email is spam, knowing it contains "free" tells us nothing additional about whether it has many links


- This is clearly **false** in reality (spam emails with "free" often also have many links)


 


**Yet Naive Bayes often works!** Why?


 


1. **Classification only needs ranking**: We don't need exact probabilities, just correct ordering


2. **Averaging effect**: Errors in individual feature probabilities often cancel out


3. **Sufficient statistics**: Features collectively capture enough information despite independence assumption


 


### Model Complexity


 


**Without Naive Bayes** (full joint):


- Must learn $P(F_1, \ldots, F_n \mid Y)$


- Table size: $|Y| \times |F_1| \times \cdots \times |F_n|$


- For binary features: $|Y| \times 2^n$ parameters


- **Exponential in number of features!**


 


**With Naive Bayes**:


- Learn $P(F_i \mid Y)$ for each feature independently


- Table size: $n \times |Y| \times |F_i|$


- For binary features: $n \times |Y| \times 2$ parameters


- **Linear in number of features!**


 


**Example**:


- 100 binary features, 10 classes


- Full joint: $10 \times 2^{100} \approx 10^{31}$ parameters (impossible!)


- Naive Bayes: $100 \times 10 \times 2 = 2000$ parameters (tractable!)


 


## Digit Recognition with Naive Bayes


 


### Setup


 


**Input**: 28×28 grayscale images of handwritten digits


 


**Features**:


- One binary feature $F_{i,j}$ for each pixel position $(i,j)$


- $F_{i,j} = 1$ if intensity $> 0.5$, else $F_{i,j} = 0$


 


**Labels**: $Y \in \{0, 1, 2, \ldots, 9\}$


 


**Training Data**: MNIST dataset with 60,000 labeled examples


 


### Model


 


**Bayesian Network**:


```


       Y


      /|\


     / | \


   F₁₁ F₁₂ ... F₂₈,₂₈


```


 


**Parameters to Learn**:


1. **Prior**: $P(Y = d)$ for $d \in \{0, \ldots, 9\}$


   - Count frequency of each digit in training data


 


2. **Likelihoods**: $P(F_{i,j} = 1 \mid Y = d)$ for each pixel and digit


   - Fraction of training images of digit $d$ where pixel $(i,j)$ is on


 


**Number of Parameters**:


- Prior: 10 values


- Likelihoods: $28 \times 28 \times 10 = 7,840$ values


- **Total: 7,850 parameters** (very manageable!)


 


### Visualization


 


After training, $P(F_{i,j} = 1 \mid Y = d)$ gives a "probability heatmap" for each digit:


 


**Digit 0**: High probability in circular ring, low in center


**Digit 1**: High probability in vertical line


**Digit 8**: High probability in two circular loops


 


These learned patterns match our intuition about digit shapes!


 


### Classification


 


**Given**: New 28×28 image


 


**Compute**:


$$P(Y = d \mid \text{image}) \propto P(Y = d) \prod_{i,j} P(F_{i,j} \mid Y = d)$$


 


**Predict**:


$$\hat{d} = \arg\max_{d \in \{0,\ldots,9\}} P(Y = d \mid \text{image})$$


 


**Performance**: Naive Bayes achieves ~85% accuracy on MNIST (decent, though modern CNNs reach 99.7%)


 


## General Naive Bayes Algorithm


 


### Training Algorithm


 


**Input**: Training dataset $\{(x^{(i)}, y^{(i)})\}_{i=1}^N$


 


**Output**: Parameters $P(Y)$ and $P(F_j \mid Y)$ for all $j$


 


```python


def train_naive_bayes(data):


    # Count label frequencies


    for (x, y) in data:


        count[y] += 1


 


    # Estimate prior


    for y in labels:


        P(Y = y) = count[y] / N


 


    # Count feature frequencies per class


    for (x, y) in data:


        for j in range(num_features):


            count[F_j = x[j], Y = y] += 1


 


    # Estimate likelihoods


    for y in labels:


        for j in range(num_features):


            for f in feature_values:


                P(F_j = f | Y = y) = count[F_j = f, Y = y] / count[Y = y]


 


    return P(Y), P(F_j | Y)


```


 


### Inference (Classification) Algorithm


 


**Input**: Learned parameters, new instance $x$


 


**Output**: Predicted label $\hat{y}$


 


```python


def classify(x, P_Y, P_F_given_Y):


    best_y = None


    best_score = -infinity


 


    for y in labels:


        # Compute unnormalized log probability


        score = log(P(Y = y))


        for j in range(num_features):


            score += log(P(F_j = x[j] | Y = y))


 


        if score > best_score:


            best_score = score


            best_y = y


 


    return best_y


```


 


**Note**: We use **log probabilities** to avoid numerical underflow (discussed in next lecture).


 


## Practice Problems


 


### Problem 1: Email Classification


 


Given this training data:


 


| Sender | Length | Contains $ | Label |


|--------|--------|------------|-------|


| known | short | yes | ham |


| unknown | long | yes | spam |


| known | short | no | ham |


| unknown | long | yes | spam |


 


1. Compute $P(Y)$ for both classes


2. Compute $P(F_{\text{sender}} \mid Y)$ for both classes


3. Classify a new email: unknown sender, short, contains $


 


### Problem 2: Digit Features


 


For digit recognition, suppose you add a derived feature: $F_{\text{loops}} = \text{number of closed loops}$


 


1. What values can $F_{\text{loops}}$ take for digits 0-9?


2. Is $F_{\text{loops}}$ independent of pixel features? Why or why not?


3. Would including this feature violate the Naive Bayes assumption?


 


### Problem 3: Model Comparison


 


Compare full joint distribution vs. Naive Bayes for:


- 20 binary features


- 5 classes


 


1. How many parameters does each model require?


2. With 1000 training examples, which model would you trust more?


 


## Conclusion


 


Naive Bayes bridges Bayesian networks and machine learning, providing a simple yet powerful classification framework:


 


1. **Model-Based Approach**: Represents the joint distribution $P(Y, F_1, \ldots, F_n)$


2. **Conditional Independence**: Assumes features are independent given the label (naive but effective)


3. **Learning**: Maximum likelihood parameter estimation from labeled data


4. **Inference**: Bayesian classification via posterior probability computation


5. **Scalability**: Linear parameters in number of features (vs. exponential for full joint)


 


**Strengths**:


- Simple to implement and interpret


- Fast training and prediction


- Works well with high-dimensional data


- Requires relatively little training data


 


**Weaknesses**:


- Independence assumption rarely holds


- Sensitive to zero frequencies (solved with smoothing)


- Probability estimates can be poor (but rankings often good)


 


**Key Takeaway**: Naive Bayes demonstrates that simple models with strong assumptions can be remarkably effective, especially when data is limited.


 


In the next lecture, we'll address the **zero-frequency problem** and introduce **Laplace smoothing** to make Naive Bayes more robust.


 


## Further Reading


 


- *Pattern Recognition and Machine Learning* by Bishop (Chapter 8) - Comprehensive treatment of probabilistic classification


- *Machine Learning: A Probabilistic Perspective* by Murphy (Chapter 3) - Generative classifiers including Naive Bayes


- [Naive Bayes Classifier (Wikipedia)](https://en.wikipedia.org/wiki/Naive_Bayes_classifier) - Accessible overview with examples


- [sklearn.naive_bayes Documentation](https://scikit-learn.org/stable/modules/naive_bayes.html) - Practical Python implementation


- *Artificial Intelligence: A Modern Approach* by Russell and Norvig (Chapter 20) - Learning from examples


 


---


 


*This lecture introduced Naive Bayes classification and the transition from probabilistic inference to machine learning. Next, we'll explore parameter estimation, smoothing, and practical improvements to Naive Bayes.*


 


