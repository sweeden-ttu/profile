# Prolog Workflow Application

A declarative logic programming implementation of the multi-agent blog post generation workflow.

## Installation

```bash
# macOS
brew install swi-prolog

# Ubuntu/Debian
sudo apt install swi-prolog

# Or download from: https://www.swi-prolog.org/Download.html
```

## Usage

### Start Interactive Session

```bash
swipl -s scripts/workflow.pl
```

### Commands

```prolog
% Show help
?- help.

% Initialize agents
?- init_agents.

% Show agent status
?- status(agent_a).
?- status(agent_b).
?- status_all.

% Show current phase prompt
?- prompt(agent_a).
?- prompt(agent_b).

% Get next action
?- next_action(agent_a, Action).

% Advance to next phase
?- advance(agent_a).
?- advance(agent_b).

% Cross-review workflow
?- exchange_reviews.    % Exchange feedback between agents
?- approve(agent_a).    % Agent A approves Agent B's draft

% Complete lecture and move to next
?- complete_lecture(agent_a).

% Validate quality
?- validate_quality(2300, 15, 3, 4, Result).

% Reset agent
?- reset(agent_a).
```

## Workflow State Machine

```prolog
% Phases in order
phase(1, extraction).   % Extract from PDFs, JSON
phase(2, planning).     % Create lesson plan
phase(3, drafting).     % Write blog post
phase(4, reviewing).    % Cross-review peer draft
phase(5, refining).     % Address feedback
phase(6, finalizing).   % Publish to _posts
phase(7, complete).     % Done
```

## Example Session

```prolog
?- run_workflow.
Workflow initialized. Agents ready.

========================================
agent_a: CS-5384 Logic for Computer Scientists
========================================
Phase:          extraction
Lecture:        #4 - Natural Deduction Introduction
...

?- prompt(agent_a).
=== PHASE: extraction ===
Agent: agent_a
Course: CS-5384 Logic for Computer Scientists
...

?- advance(agent_a).
agent_a advanced: extraction -> planning

?- status(agent_a).
...
Phase:          planning
...
```

## Key Predicates

| Predicate | Description |
|-----------|-------------|
| `init_agents` | Initialize both agents |
| `status(Agent)` | Show agent status |
| `prompt(Agent)` | Generate phase prompt |
| `advance(Agent)` | Move to next phase |
| `complete_lecture(Agent)` | Finish current lecture |
| `exchange_reviews` | Exchange peer reviews |
| `approve(Agent)` | Approve peer's draft |
| `validate_quality/5` | Check draft quality |

## State Facts

```prolog
% Current phase for each agent
current_phase(agent_a, Phase).
current_phase(agent_b, Phase).

% Current lecture being processed
current_lecture(Agent, Number, Title).

% Completed lectures list
completed(Agent, [List]).

% Refinement iteration counter
iteration(Agent, N).

% Peer review status: pending | received | approved
peer_review_status(Agent, Status).
```

## Extending the Workflow

Add new phases:
```prolog
phase(8, publishing).
phase_desc(publishing, 'Publish to social media').
success_criteria(publishing, ['Tweet posted', 'LinkedIn shared']).
```

Add quality rules:
```prolog
min_code_examples(2).
validate_code(Count, Result) :-
    min_code_examples(Min),
    (Count >= Min -> Result = pass ; Result = fail).
```

## Why Prolog?

1. **Declarative**: Define *what* not *how*
2. **Pattern Matching**: Natural for state machines
3. **Backtracking**: Explore alternatives automatically
4. **Logic**: Perfect for workflow rules and constraints
5. **Concise**: ~300 lines vs ~500+ in Python

The workflow is expressed as facts and rules, making it easy to:
- Query current state
- Validate transitions
- Add new phases
- Modify quality criteria
