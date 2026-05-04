---
layout: post
title: "Symbolic Execution with KLEE: Automated Test Generation and Bug Finding"
date: 2025-12-18 10:00:00 -0500
categories: [software-verification, testing, formal-methods]
tags: [klee, symbolic-execution, llvm, testing, verification, bugs]
course: "Software Verification and Validation"
---

## Introduction

Symbolic execution is a powerful program analysis technique that executes programs with symbolic values instead of concrete inputs. Unlike traditional testing, which explores a single path with specific inputs, symbolic execution systematically explores multiple paths through a program simultaneously, generating inputs that exercise different execution paths.

In this post, we'll explore **KLEE** (KLEE Symbolic Virtual Machine), a state-of-the-art symbolic execution engine built on top of the LLVM compiler infrastructure. KLEE has proven remarkably effective at finding bugs and generating high-coverage test suites for real-world software.

## What is KLEE?

KLEE is a symbolic virtual machine that can systematically explore program paths by treating inputs as symbolic expressions rather than concrete values. Developed as part of research at Stanford University (and presented in the seminal OSDI 2008 paper), KLEE operates on LLVM bitcode and can:

- **Automatically generate test cases** that achieve high code coverage
- **Find bugs** such as assertion violations, null pointer dereferences, and buffer overflows
- **Explore paths** through complex code with mathematical precision
- **Produce concrete inputs** that trigger specific program behaviors

The key insight behind KLEE is that instead of running a program with `x = 5`, it runs with `x = symbolic`, tracking constraints on `x` as the program executes. When the program reaches a branch (like `if (x > 0)`), KLEE forks execution, exploring both paths while recording the constraints: `{x > 0}` for one path and `{x <= 0}` for the other.

## Getting Started with KLEE

### Installation

KLEE can be installed via several methods:

**Using Docker (Recommended)**
```bash
docker pull klee/klee:latest
docker run -it --rm klee/klee:latest
```

**Using Package Managers**

For macOS with Homebrew:
```bash
brew install klee
```

For Ubuntu/Debian via Snap:
```bash
snap install klee
```

**Building from Source**

KLEE is typically built against LLVM 16 (the currently recommended version):
```bash
git clone https://github.com/klee/klee.git
cd klee
mkdir build && cd build
cmake .. -DLLVM_CONFIG_BINARY=/path/to/llvm-config
make
```

### Basic Workflow

The KLEE workflow consists of three main steps:

1. **Compile source to LLVM bitcode**
2. **Run KLEE on the bitcode**
3. **Replay generated test cases**

## Tutorial: Testing a Simple Function

Let's walk through KLEE's canonical example. Consider this simple function:

```c
// get_sign.c
int get_sign(int x) {
    if (x == 0)
        return 0;
    else if (x < 0)
        return -1;
    else
        return 1;
}
```

To test this with KLEE, we need a driver that marks inputs as symbolic:

```c
// test_get_sign.c
#include "klee/klee.h"

int get_sign(int x);

int main() {
    int a;
    klee_make_symbolic(&a, sizeof(a), "a");
    return get_sign(a);
}
```

### Step 1: Compile to LLVM Bitcode

```bash
clang -I /path/to/klee/include -g -O0 -Xclang -disable-O0-optnone \
      -emit-llvm -c test_get_sign.c -o test_get_sign.bc
```

**Important compilation notes:**
- Use `-emit-llvm` to generate LLVM bitcode
- `-g` adds debug information for source-level statistics
- Avoid `-O0` alone in newer LLVM versions (> 5.0); use `-O0 -Xclang -disable-O0-optnone` instead
- Don't optimize the bitcode—KLEE has its own optimization pipeline (`--optimize` flag)

### Step 2: Run KLEE

```bash
klee test_get_sign.bc
```

KLEE outputs:
```
KLEE: output directory is "klee-out-0"
KLEE: done: total instructions = 42
KLEE: done: completed paths = 3
KLEE: done: generated tests = 3
```

This tells us KLEE explored all three paths through `get_sign()` (x = 0, x < 0, x > 0) and generated three test cases.

### Step 3: Examine Generated Test Cases

Test cases are stored in `klee-out-0/` as `.ktest` files:

```bash
ktest-tool klee-out-0/test000001.ktest
```

Output:
```
ktest file : 'klee-out-0/test000001.ktest'
args       : ['test_get_sign.bc']
num objects: 1
object 0: name: 'a'
  data (int): 0
  (hex): 0x00000000
```

The three test cases contain:
- `a = 0` (path where x == 0)
- `a = 16843009` (some positive value)
- `a = -2147483648` (a negative value)

### Step 4: Replay Test Cases

KLEE provides a replay library to run test cases on native code:

```bash
clang test_get_sign.c -lkleeRuntest -o test_get_sign_native
export KTEST_FILE=klee-out-0/test000001.ktest
./test_get_sign_native
echo "Exit code: $?"
```

## Key KLEE Intrinsics

KLEE provides special intrinsic functions declared in `klee/klee.h`:

### klee_make_symbolic()

```c
klee_make_symbolic(&var, sizeof(var), "var_name");
```

Marks a memory location as symbolic. KLEE will treat `var` as an unconstrained symbolic value and explore paths based on its use.

### klee_assume()

```c
klee_assume(condition);
```

Adds constraints to the current path. KLEE will only explore states where `condition` is true. Conceptually equivalent to wrapping remaining code in `if(condition) {}`.

**Warning with short-circuit operators:**
```c
// This may create unexpected extra paths due to compiler behavior
klee_assume(a > 0 && b < 10);

// Better: use bitwise operators or separate calls
klee_assume(a > 0);
klee_assume(b < 10);
```

### klee_prefer_cex()

```c
klee_prefer_cex(&var, condition);
```

Tells KLEE to prefer certain concrete values when generating test cases. Useful for readability:

```c
char input[4];
klee_make_symbolic(input, sizeof(input), "input");
for (int i = 0; i < 4; i++)
    klee_prefer_cex(&input[i], 32 <= input[i] && input[i] <= 126);
```

This prefers printable ASCII characters in test outputs.

## Symbolic Environment Options

KLEE's POSIX runtime (`-posix-runtime`) provides options for symbolic environments:

### Symbolic Arguments

```bash
klee -posix-runtime program.bc -sym-arg 10     # One symbolic arg of length 10
klee -posix-runtime program.bc -sym-args 1 3 5 # 1-3 args, each max length 5
```

### Symbolic Files

```bash
klee -posix-runtime program.bc -sym-files 2 100 -sym-stdin 50
```

This creates:
- 2 symbolic files ('A', 'B') each of size 100 bytes
- Symbolic stdin of size 50 bytes

### Example: Password Checker

```c
// password.c
#include <string.h>
#include <stdio.h>

int main(int argc, char **argv) {
    if (argc < 2) return 1;
    
    if (strcmp(argv[1], "secret123") == 0) {
        printf("Access granted!\n");
        return 0;
    } else {
        printf("Access denied!\n");
        return 1;
    }
}
```

Compile and run with symbolic arguments:
```bash
clang -emit-llvm -c password.c -o password.bc
klee -posix-runtime password.bc -sym-arg 10
```

KLEE will explore paths and discover the password "secret123" in one of the test cases!

## Search Heuristics

KLEE provides several search strategies for exploring paths:

| Heuristic | Description |
|-----------|-------------|
| Depth-First Search (DFS) | Traverses states depth-first |
| Random State Search | Randomly selects a state |
| Random Path Selection | Probabilistic path selection (from OSDI'08 paper) |
| NURS (Non-Uniform Random Search) | Selects based on distributions (query cost, distance to uncovered code, etc.) |

Interleave heuristics with multiple `--search` options:
```bash
klee --search=random-path --search=nurs:query program.bc
```

## Practical Applications

### Testing GNU Coreutils

KLEE has been used to test GNU Coreutils, finding numerous bugs. The process involves:

1. Compiling Coreutils with `wllvm` (whole-program LLVM)
2. Extracting bitcode for specific utilities
3. Running KLEE with appropriate symbolic environment options
4. Achieving 95%+ line coverage with generated tests

### Bug Finding

KLEE excels at finding:
- **Assertion violations**: Reaching `assert()` failures
- **Null pointer dereferences**: Invalid memory access
- **Buffer overflows**: Out-of-bounds array access
- **Division by zero**: Undefined behavior detection

When KLEE finds a bug, it generates a test case that reproduces the error, making debugging straightforward.

## Advanced Features

### Controlling Path Explosion

Real programs have exponentially many paths. KLEE provides limits:

```bash
klee -max-time=10min -max-memory=4096 -max-forks=1000 program.bc
```

- `-max-time`: Halt after specified time
- `-max-memory`: Limit memory usage (in MB)
- `-max-forks`: Stop forking after N symbolic branches

### Coverage-Guided Execution

```bash
klee --only-output-states-covering-new program.bc
```

This generates test cases only for states covering new code, dramatically reducing output while maintaining high coverage.

### Solver Chain

KLEE uses SMT solvers (like STP, Z3) to solve path constraints. Configure via:
```bash
klee -solver-backend=z3 program.bc
```

## Using KLEE with Existing Test Infrastructure

The `klee-stats` tool extracts statistics from KLEE runs:
```bash
klee-stats klee-out-0/
```

Output includes:
- Total instructions executed
- Number of completed paths
- Number of generated test cases
- Time spent in solver

For live monitoring, `klee-stats` can serve as a Grafana data source.

## Tools in the KLEE Ecosystem

| Tool | Purpose |
|------|---------|
| `ktest-tool` | Read and display `.ktest` files |
| `klee-stats` | Extract statistics from runs |
| `ktest-replay` | Replay test cases on native code |
| `klee-exec-tree` | Visualize execution tree (requires `--write-exec-tree`) |
| `ktest-gen` | Generate `.ktest` from concrete inputs |
| `ktest-randgen` | Generate random `.ktest` files |

## Limitations and Considerations

1. **Path Explosion**: Symbolic execution suffers from exponential path growth. Large programs may not be fully explorable.

2. **Constraint Solving Overhead**: SMT solvers are powerful but can be slow for complex constraints.

3. **Environment Modeling**: KLEE's POSIX emulation may not perfectly match real system behavior.

4. **Floating-Point**: Symbolic execution of floating-point code is challenging and partially supported.

5. **External Calls**: Handling of external library calls can be configured (`--external-calls=concrete|all|none`).

## Conclusion

KLEE represents a powerful approach to automated testing and bug finding. By systematically exploring program paths with symbolic inputs, it can achieve high coverage and discover subtle bugs that traditional testing might miss.

For software verification and validation, KLEE offers:
- **Automated test generation** with guaranteed coverage properties
- **Concrete test cases** that reproduce bugs
- **Mathematical rigor** through SMT-based constraint solving

As symbolic execution technology continues to mature, tools like KLEE are becoming increasingly practical for real-world software verification tasks.

## References

1. Cadar, C., Dunbar, D., & Engler, D. (2008). *KLEE: Unassisted and Automatic Generation of High-Coverage Tests for Complex Systems Programs*. OSDI 2008.

2. KLEE Official Documentation: https://klee.github.io/docs/

3. KLEE GitHub Repository: https://github.com/klee/klee

4. LLVM Compiler Infrastructure: https://llvm.org/

5. Tutorials and Examples: https://klee.github.io/tutorials/
