# Formalization of AGENTS.md

## Extracted first-order statements

From AGENTS.md we capture the core facts as ground formulas:

$$
\begin{aligned}
agent(agent\_herbrand) & \\
agent(agent\_logic) & \\
focused\_on(system,\, herbrand\_bases) & \\
target\_course(system,\, course\_cs5384) & \\
covers\_lecture(course\_cs5384,\, lecture\_16) & \\
core\_application(system,\, app\_herbrand\_pl) & \\
uses\_language(app\_herbrand\_pl,\, prolog\_language) & \\
responsible\_for(agent\_herbrand,\, task\_prolog\_impl) & \\
responsible\_for(agent\_herbrand,\, task\_correctness\_verification) & \\
responsible\_for(agent\_logic,\, task\_extract\_requirements) & \\
implements(app\_herbrand\_pl,\, pred\_herbrand\_universe) & \\
implements(app\_herbrand\_pl,\, pred\_herbrand\_base) & \\
implements(app\_herbrand\_pl,\, pred\_satisfies) & \\
has\_success\_criterion(system,\, goal\_correctness) & \\
has\_success\_criterion(system,\, goal\_readability) & \\
has\_success\_criterion(system,\, goal\_integration) &
\end{aligned}
$$

These facts encode agents, responsibilities, the core application, and the success criteria described in the document.

## Clause form and Skolemization

All statements are already ground. Taking their universal closure yields a set of unit clauses; Skolemization leaves them unchanged. In Prolog we expose this clause set as `agents_axioms/1` (and the backward-compatible alias `agents_clauses/1`).

## Vocabulary (Herbrand signature)

**Constants**

`agent_herbrand`, `agent_logic`, `system`, `course_cs5384`, `lecture_16`,
`app_herbrand_pl`, `herbrand_bases`, `prolog_language`,
`task_extract_requirements`, `task_prolog_impl`, `task_correctness_verification`,
`goal_correctness`, `goal_readability`, `goal_integration`,
`pred_herbrand_universe`, `pred_herbrand_base`, `pred_satisfies`

**Predicates**

`agent/1`, `focused_on/2`, `target_course/2`, `covers_lecture/2`,
`core_application/2`, `responsible_for/2`, `implements/2`,
`has_success_criterion/2`, `uses_language/2`

**Functions**

None (the specification is propositional with respect to objects).

## Herbrand universe and base

With no function symbols, the Herbrand universe is exactly the constant set above (17 elements), so depth `0` suffices; depth `1` yields the same result.

The Herbrand base contains:
- `1` unary predicate × `17` constants = `17` atoms
- `8` binary predicates × `17 × 17` constant pairs = `2,312` atoms
- **Total: 2,329 ground atoms**

Sample atoms (all are included in the base at depth `0`):

- `agent(agent_herbrand)`
- `focused_on(system, herbrand_bases)`
- `core_application(system, app_herbrand_pl)`
- `implements(app_herbrand_pl, pred_herbrand_base)`
- `has_success_criterion(system, goal_integration)`

## Prolog usage (`scripts/herbrand.pl`)

Key predicates:
- `agents_vocab/1` — vocabulary (constants and predicates)
- `agents_axioms/1` (alias `agents_clauses/1`) — ground clause set
- `agents_universe/2` — Herbrand universe up to a given depth
- `agents_base/2` — Herbrand base up to a given depth

Example queries:

```prolog
?- agents_universe(0, U).
?- agents_base(0, B), length(B, N).        % N = 2329
?- agents_axioms(Facts), maplist(writeln, Facts).
?- agents_base(0, B), agents_axioms(Facts), subset(Facts, B).
?- agents_base(0, B), member(core_application(system, app_herbrand_pl), B).
```
