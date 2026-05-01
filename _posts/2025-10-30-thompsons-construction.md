---
layout: post
title: "Thompson's Construction: From Regex to NFA"
date: 2025-10-30
categories: [computer-science, theory, algorithms]
tags: [automata, regex, nfa, thompson-construction, finite-automata, formal-languages, compilers]
excerpt: "Explore Thompson's Construction algorithm, the elegant method for converting regular expressions to NFAs that revolutionized pattern matching and influenced decades of Unix tools."
reading_time: 15
course: "Theory of Automata"
---

# Thompson's Construction: From Regex to NFA

In 1968, Ken Thompson published a four-page paper that would fundamentally change how computers process text patterns. **"Regular Expression Search Algorithm"** in *Communications of the ACM* introduced what we now call **Thompson's Construction**—an algorithm that converts regular expressions into nondeterministic finite automata (NFAs) with remarkable efficiency.

While regular expressions were well-understood mathematically, practical implementations before Thompson's work relied on backtracking approaches that could become exponentially slow. Thompson's insight was to build an NFA where matching proceeds by simulating all possible paths simultaneously, guaranteeing linear-time performance.

## The Algorithm at a Glance

Thompson's Construction is a **recursive, divide-and-conquer algorithm**. Given a regular expression E, it constructs an NFA with these invariant properties:

- Exactly one **initial state** with no incoming transitions
- Exactly one **final state** with no outgoing transitions  
- At most **two outgoing ε-transitions** per state
- Number of states is **linear** in the size of the expression: `2s - c` where `s` is the number of symbols and `c` is the number of concatenations

## Base Cases

The construction handles three base cases:

### Empty String (ε)

The NFA for the empty string has two states with an ε-transition between them:

```
┌───┐  ε  ┌───┐
│ q₀│─────→│ q₁│
└───┘      └───┘
(start)     (accept)
```

### Single Symbol (a)

A symbol `a` gets two states connected by a transition labeled with that symbol:

```
┌───┐  a  ┌───┐
│ q₀│─────→│ q₁│
└───┘      └───┘
(start)     (accept)
```

## Recursive Cases

For compound expressions, we combine smaller NFAs using ε-transitions:

### Concatenation (st)

Given NFAs for `s` and `t`, connect the final state of `s` to the start state of `t` with an ε-transition. The start of `s` becomes the new start; the final state of `t` becomes the new accept state.

```
N(s):  ┌───┐      ┌───┐
       │ s₀│──...→│ s_f│
       └───┘      └───┘
                      │ ε
                      ↓
N(t):  ┌───┐      ┌───┐
       │ t₀│──...→│ t_f│
       └───┘      └───┘

Result: ┌───┐      ┌───┐  ε  ┌───┐      ┌───┐
        │ s₀│──...→│ s_f│────→│ t₀│──...→│ t_f│
        └───┘      └───┘      └───┘      └───┘
       (start)                            (accept)
```

### Alternation (s|t)

Create a new start state with ε-transitions to both `s` and `t`, and a new accept state with ε-transitions from both. This represents "s OR t":

```
         ε       ε
        ┌─→┌───┐    ┌───┐
   ┌───┐│  │ s₀│...→│ s_f│─┐
   │ q₀│└─→└───┘    └───┘ │ε
   └───┘                  └─→┌───┐
        ┌─→┌───┐    ┌───┐ │  │ q_f│
        │  │ t₀│...→│ t_f│─┘  └───┘
        └─→└───┘    └───┘
       (start)             (accept)
```

### Kleene Star (s*)

The Kleene star allows **zero or more repetitions**. Create a new start/accept state, with ε-transitions that allow bypassing `s` entirely (zero repetitions) or looping back after traversing `s` (more repetitions):

```
              ε
        ┌─────────────┐
        │             │
        ↓             │
   ┌───┐  ε  ┌───┐ │ε  ┌───┐
   │ q₀│────→│ s₀│...→│ s_f│─┐
   └───┘      └───┘    └───┘ │
     │              ↑          │
     │              └─ε───────┘
     │                           
     └──────────ε──────────────→┌───┐
                                 │ q_f│
                                 └───┘
       (start/accept)
```

## Worked Example: (a|b)*c

Let's trace through a complete example: `(a|b)*c`

**Step 1:** Build NFA for `a`
```
┌───┐  a  ┌───┐
│ 0 │─────→│ 1 │
└───┘      └───┘
```

**Step 2:** Build NFA for `b`
```
┌───┐  b  ┌───┐
│ 2 │─────→│ 3 │
└───┘      └───┘
```

**Step 3:** Alternation `a|b`
```
        ε       ε
   ┌──→│ 0 │─a─→│ 1 │─┐
┌──┐│   └───┘    └───┘ │ε
│ 4│└───────────────────┘
└──┘│   ┌───┐  b  ┌───┐│
    └──→│ 2 │─────→│ 3 │┘
        └───┘      └───┘
```

**Step 4:** Kleene star `(a|b)*`
```
                  ε
            ┌──────────┐
            ↓          │
      ┌──→│ 0 │─a─→│ 1 │─┐
   ┌──┐│   └───┘    └───┘ │ε
   │ 4│└───────────────────┘
   └──┘│   ┌───┐  b  ┌───┐│
       └──→│ 2 │─────→│ 3 │┘
           └───┘      └───┘
            │
            └────ε──────→ (back to 4)
```

**Step 5:** Concatenate with `c`
```
     [(a|b)* NFA]  ε  ┌───┐  c  ┌───┐
                       │ 5 │─────→│ 6 │
                       └───┘      └───┘
```

## NFA Simulation

Once we have the NFA, we simulate it on input strings using **set-based simulation**:

```python
def simulate_nfa(nfa, input_string):
    current_states = epsilon_closure({nfa.start})
    
    for char in input_string:
        # Move through character transitions
        next_states = set()
        for state in current_states:
            if char in state.transitions:
                next_states.update(state.transitions[char])
        
        # Close under epsilon transitions
        current_states = epsilon_closure(next_states)
    
    return nfa.accept in current_states

def epsilon_closure(states):
    stack = list(states)
    closure = set(states)
    
    while stack:
        state = stack.pop()
        for next_state in state.epsilon_transitions:
            if next_state not in closure:
                closure.add(next_state)
                stack.append(next_state)
    
    return closure
```

The key insight: we track **sets of states**, not individual paths. This avoids the exponential blowup of backtracking.

## Complexity

For an NFA with `m` states and at most `e` transitions per state, matching a string of length `n` takes **O(emn)** time. Since Thompson's construction ensures `e ≤ 2`, this simplifies to **O(mn)**—linear in both NFA size and input length.

Contrast this with naive backtracking regex engines that can exhibit **exponential worst-case behavior** on patterns like `(a|a)*b` matched against `aaaaaaaaaaaaaaaaaaaaX`.

## Historical Impact

Thompson's algorithm became the foundation for:

- **Early Unix tools**: `grep`, `egrep`, `sed`
- **Text editors**: The `sam` and `acme` editors used Thompson NFA simulation
- **Russ Cox's modern implementation**: Demonstrated that Thompson-based matchers outperform Perl/Python regex in many cases

As Cox noted in his seminal 2007 article: *"Regular expression matching can be simple and fast"*—a direct reference to Thompson's approach.

## Comparison: Thompson NFA vs Backtracking

| Aspect | Thompson NFA | Backtracking |
|--------|-------------|--------------|
| Worst-case time | O(mn) linear | O(2ⁿ) exponential |
| Space usage | O(m) | O(n) recursion stack |
| Supports all regex? | Most common features | Yes, with tradeoffs |
| Used by | Go, RE2, TRE | Perl, Python (default), Ruby |

## Modern Relevance

Thompson's Construction remains relevant because:

1. **Predictable performance**: No catastrophic backtracking
2. **Simplicity**: The NFA construction is elegantly recursive
3. **Foundation**: Understanding it deepens comprehension of formal languages
4. **Modern implementations**: Google's RE2, Go's `regexp` package both use Thompson-style NFA simulation

## Conclusion

Thompson's Construction represents a perfect marriage of theoretical computer science and practical engineering. In just four pages, Ken Thompson provided an algorithm that converts the elegant mathematics of regular expressions into efficient executable code—a testament to the power of thinking in terms of automata.

The next time you use `grep` or ponder how regex engines work under the hood, remember Thompson's insight: simulate all possibilities in parallel, and let the NFA do the heavy lifting.
