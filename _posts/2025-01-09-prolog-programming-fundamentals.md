---
layout: post
title: "Prolog Programming Fundamentals: Logic Programming for Beginners"
date: 2025-01-09
categories: [programming, logic]
tags: [prolog, logic-programming, declarative, ai, tutorial]
excerpt: "An introduction to Prolog's unique declarative paradigm, exploring facts, rules, queries, and how logic programming differs from imperative approaches."
reading_time: 12
course: "Logic for Computer Scientists"
---

# Prolog Programming Fundamentals

Prolog (Programming in Logic) represents a fundamentally different approach to programming than most developers encounter. Instead of telling the computer *how* to solve a problem step-by-step, you describe *what* the problem is and let Prolog figure out the solution through logical inference. This declarative paradigm makes Prolog particularly powerful for AI applications, natural language processing, expert systems, and symbolic reasoning.

## What Makes Prolog Different?

Traditional programming languages like Python, Java, or C++ are **imperative**: you write explicit instructions that execute sequentially. Prolog is **declarative**: you state facts and rules about your problem domain, then ask questions (queries) that Prolog answers by searching for logical consequences of your statements.

Consider this simple comparison:

**Imperative (Python)**:
```python
def is_parent(person, child):
    parents = {'alice': ['bob'], 'bob': ['charlie']}
    return child in parents.get(person, [])

def is_grandparent(person, grandchild):
    parents = {'alice': ['bob'], 'bob': ['charlie']}
    for child in parents.get(person, []):
        if grandchild in parents.get(child, []):
            return True
    return False
```

**Declarative (Prolog)**:
```prolog
% Facts
parent(alice, bob).
parent(bob, charlie).

% Rule
grandparent(X, Z) :- parent(X, Y), parent(Y, Z).
```

In Prolog, once you define the logic, you can query in any direction:
- `grandparent(alice, charlie).` → True
- `grandparent(alice, Who).` → `Who = charlie`
- `grandparent(Who, charlie).` → `Who = alice`

## Core Concepts

### Facts

Facts are the simplest Prolog statements - they assert unconditional truths about your domain.

```prolog
% Syntax: predicate(argument1, argument2, ...).
likes(john, pizza).
likes(mary, sushi).
human(socrates).
mortal(X) :- human(X).  % Rule, not fact
```

**Important**: Prolog atoms (like `john`, `pizza`) start with lowercase. Variables (like `X`) start with uppercase.

### Rules

Rules define relationships based on conditions. They have the form:

```prolog
head :- body.
```

The `:-` operator means "if" - the head is true IF the body is true.

```prolog
% A person is happy if they have food and sunshine
happy(Person) :-
    has_food(Person),
    has_sunshine.

% Recursive definition: ancestor
ancestor(X, Y) :- parent(X, Y).
ancestor(X, Y) :- parent(X, Z), ancestor(Z, Y).
```

The second rule is **recursive**: X is an ancestor of Y if X is a parent of some Z, and Z is an ancestor of Y. This elegantly defines transitive relationships.

### Queries

Queries ask Prolog to find values that satisfy your conditions. The Prolog interpreter searches for answers using **backtracking** and **unification**.

```prolog
?- likes(john, What).
What = pizza.

?- likes(Who, sushi).
Who = mary.

?- likes(john, sushi).
false.
```

## Unification: Prolog's Core Mechanism

Unification is the process of making two terms identical by finding appropriate variable bindings. It's more powerful than simple equality testing.

```prolog
% Simple unification
?- X = 5.
X = 5.

% Unifying structures
?- point(X, 3) = point(1, Y).
X = 1,
Y = 3.

% Unifying lists
?- [H|T] = [1, 2, 3, 4].
H = 1,
T = [2, 3, 4].
```

The last example shows **pattern matching with lists**: `[H|T]` separates the head (first element) from the tail (remaining elements).

## Lists in Prolog

Lists are fundamental data structures in Prolog, enclosed in square brackets.

```prolog
% Empty list
[]

% List with elements
[1, 2, 3, 4]

% List with head and tail
[Head|Tail]

% List with first two elements separated
[First, Second|Rest]
```

### Common List Operations

**Finding list length**:
```prolog
% Base case: empty list has length 0
list_length([], 0).

% Recursive case: length is 1 + length of tail
list_length([_|Tail], Length) :-
    list_length(Tail, TailLength),
    Length is TailLength + 1.
```

**Checking membership**:
```prolog
% Base case: element is the head
member(Element, [Element|_]).

% Recursive case: check the tail
member(Element, [_|Tail]) :-
    member(Element, Tail).
```

**Appending lists**:
```prolog
% Base case: appending to empty list
append([], List, List).

% Recursive case: move head from first list to result
append([H|T1], List2, [H|Result]) :-
    append(T1, List2, Result).
```

Try these queries:
```prolog
?- append([1,2], [3,4], Result).
Result = [1, 2, 3, 4].

?- append(X, Y, [1,2,3]).
X = [],
Y = [1, 2, 3] ;
X = [1],
Y = [2, 3] ;
X = [1, 2],
Y = [3] ;
X = [1, 2, 3],
Y = [].
```

Notice Prolog found *all* ways to split the list - this is backtracking in action!

## Arithmetic in Prolog

Prolog handles arithmetic differently than most languages. The `is` operator evaluates arithmetic expressions.

```prolog
% Calculate factorial
factorial(0, 1).
factorial(N, F) :-
    N > 0,
    N1 is N - 1,
    factorial(N1, F1),
    F is N * F1.
```

**Important**: `X is 2 + 3` evaluates the right side and unifies with X. But `X = 2 + 3` just unifies X with the *structure* `+(2, 3)` without evaluation.

## Backtracking: Prolog's Search Strategy

When Prolog tries to satisfy a query, it searches for solutions using **depth-first search with backtracking**. If it reaches a dead end, it backtracks to try alternative paths.

```prolog
likes(john, pizza).
likes(john, pasta).
likes(mary, sushi).
likes(mary, pasta).

?- likes(john, Food).
Food = pizza ;    % First solution
Food = pasta ;    % Backtrack for more
false.            % No more solutions
```

The semicolon (`;`) asks Prolog to backtrack and find another solution.

### Cut Operator (!)

The cut operator (`!`) prevents backtracking past that point. It commits to the current choice.

```prolog
% Without cut - tries all cases
max(X, Y, X) :- X >= Y.
max(X, Y, Y) :- X < Y.

% With cut - commits after first success
max(X, Y, X) :- X >= Y, !.
max(_, Y, Y).
```

The cut improves efficiency but can make code harder to reason about. Use it carefully.

## Practical Example: Family Relationships

Let's build a complete family tree with various relationships:

```prolog
% Facts: parent relationships
parent(tom, bob).
parent(tom, liz).
parent(bob, ann).
parent(bob, pat).
parent(pat, jim).

% Gender facts
male(tom).
male(bob).
male(jim).
male(pat).
female(liz).
female(ann).

% Rules: defining relationships
father(X, Y) :- parent(X, Y), male(X).
mother(X, Y) :- parent(X, Y), female(X).

sibling(X, Y) :-
    parent(Z, X),
    parent(Z, Y),
    X \= Y.  % Not equal

grandparent(X, Z) :-
    parent(X, Y),
    parent(Y, Z).

ancestor(X, Y) :- parent(X, Y).
ancestor(X, Y) :-
    parent(X, Z),
    ancestor(Z, Y).
```

**Example queries**:
```prolog
?- father(tom, Who).
Who = bob ;
Who = liz.

?- grandparent(tom, Grandchild).
Grandchild = ann ;
Grandchild = pat.

?- ancestor(tom, Descendant).
Descendant = bob ;
Descendant = liz ;
Descendant = ann ;
Descendant = pat ;
Descendant = jim.
```

## Advanced Pattern: Accumulators

Accumulators improve efficiency by building results progressively instead of through deep recursion.

**Naive reverse** (creates intermediate lists):
```prolog
reverse([], []).
reverse([H|T], R) :-
    reverse(T, RevT),
    append(RevT, [H], R).
```

**Accumulator-based reverse** (more efficient):
```prolog
reverse(List, Reversed) :-
    reverse_acc(List, [], Reversed).

reverse_acc([], Acc, Acc).
reverse_acc([H|T], Acc, Reversed) :-
    reverse_acc(T, [H|Acc], Reversed).
```

The accumulator version is tail-recursive and runs in O(n) time instead of O(n²).

## Negation as Failure

Prolog implements negation using the **closed world assumption**: if something can't be proven true from the known facts, it's assumed false.

```prolog
happy(john).
happy(mary).

% Not operator: \+
sad(Person) :- \+ happy(Person).

?- sad(john).
false.

?- sad(bob).
true.  % Bob is sad because we can't prove happy(bob)
```

**Caution**: This isn't classical logical negation. It's "negation as failure" - just because we can't prove something doesn't mean it's logically false in the real world.

## When to Use Prolog

Prolog excels at problems involving:

1. **Symbolic reasoning**: Natural language processing, theorem proving
2. **Search problems**: Scheduling, constraint satisfaction, puzzles
3. **Rule-based systems**: Expert systems, business logic
4. **Graph algorithms**: Path finding, relationship queries
5. **Pattern matching**: Parsing, transformation

Prolog struggles with:
- Numerical computation (better suited for Fortran, Julia, etc.)
- I/O heavy applications
- Real-time systems requiring predictable performance
- Programs requiring mutable state

## Getting Started with Prolog

To try these examples:

1. **Install SWI-Prolog**: [https://www.swi-prolog.org/](https://www.swi-prolog.org/)
2. **Save facts to a file**: `family.pl`
3. **Load in interpreter**: `?- [family].`
4. **Query away**: `?- grandparent(Who, jim).`

### Recommended Resources

- **"Learn Prolog Now!"** - Free online textbook
- **SWI-Prolog Documentation** - Comprehensive reference
- **99 Prolog Problems** - Practice exercises
- **"The Art of Prolog"** by Sterling and Shapiro - Advanced techniques

## Conclusion

Prolog's declarative paradigm forces you to think differently about programming. Instead of algorithms and data structures, you think about logical relationships and let Prolog's inference engine find solutions. This makes certain problems remarkably elegant to express, though it requires adjusting your mental model of computation.

The key insight: **Prolog programs are specifications that double as executables**. You describe what's true about your domain, and Prolog figures out how to answer questions about it.

For AI and symbolic reasoning tasks, Prolog remains one of the most powerful tools in a programmer's arsenal - not despite its age, but because of the timeless elegance of logic programming.

---

**Next Steps**: Try implementing these classic Prolog exercises:
- Eight Queens puzzle
- Graph coloring
- Sudoku solver
- Simple natural language parser

Each reveals different aspects of Prolog's power and teaches you to think logically about problems.

*Have questions about Prolog or logic programming? Feel free to reach out!*
