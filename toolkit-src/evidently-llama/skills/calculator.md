---
name: calculator
description: Arithmetic word problems; the math is delegated to the deterministic calc tool.
triggers: [calculate, how many, how much, total, percent, "%", times, reduction]
tools: [calc]
output: text
---
Solve arithmetic word problems. Translate the question into a single arithmetic
expression (numbers and + - * / % ** only) and let the calc tool compute it — small
models are unreliable at multi-digit arithmetic. Reply with the number and its unit.
