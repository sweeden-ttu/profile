%% ============================================================================
%% Multi-Agent Blog Post Generation Workflow
%% ============================================================================
%% A Prolog implementation of the two-agent parallel processing system
%% for converting lecture materials into publication-ready blog posts.
%%
%% Usage:
%%   swipl -s workflow.pl
%%   ?- status(agent_a).
%%   ?- next_action(agent_a, Action).
%%   ?- advance(agent_a).
%%   ?- run_workflow.
%% ============================================================================

:- use_module(library(lists)).
:- dynamic current_phase/2.
:- dynamic current_lecture/3.
:- dynamic completed/2.
:- dynamic iteration/2.
:- dynamic peer_review_status/2.
:- dynamic quality_score/2.

%% ============================================================================
%% CONFIGURATION
%% ============================================================================

%% Agents and their courses
agent(agent_a, 'CS-5384 Logic for Computer Scientists').
agent(agent_b, 'CS-5368 Intelligent Systems').

%% Course paths
course_path(agent_a, '/Users/sdw/CS-5384-Logic-for-Computer-Scientists').
course_path(agent_b, '/Users/sdw/CS-5368-Intelligent-Systems').

%% Maximum iterations for refinement
max_iterations(3).

%% Quality thresholds
min_word_count(2000).
max_word_count(2500).
target_reading_time(15).
min_diagrams(1).
min_external_refs(3).

%% ============================================================================
%% PHASE DEFINITIONS
%% ============================================================================

%% Ordered workflow phases
phase(1, extraction).
phase(2, planning).
phase(3, drafting).
phase(4, reviewing).
phase(5, refining).
phase(6, finalizing).
phase(7, complete).

%% Phase descriptions
phase_desc(extraction, 'Extract content from PDFs, JSON, transcripts').
phase_desc(planning, 'Create lesson plan for 15-minute reading time').
phase_desc(drafting, 'Write complete blog post draft').
phase_desc(reviewing, 'Cross-review peer agent draft').
phase_desc(refining, 'Address feedback and improve draft').
phase_desc(finalizing, 'Publish to _posts directory').
phase_desc(complete, 'Lecture processing complete').

%% Phase success criteria
success_criteria(extraction, [
    'All PDFs processed',
    'All topics identified',
    'Exercises captured',
    'Diagrams described',
    'Extraction file created'
]).

success_criteria(planning, [
    'All topics included',
    'Logical progression',
    '15-minute reading time',
    'Visuals planned',
    'Plan file created'
]).

success_criteria(drafting, [
    'Word count 2000-2500',
    'Diagrams created',
    'Examples included',
    'External resources added',
    'Draft file created'
]).

success_criteria(reviewing, [
    'All categories evaluated',
    'Issues prioritized',
    'Actionable feedback',
    'Review file created'
]).

success_criteria(refining, [
    'Critical issues addressed',
    'Quality maintained',
    'Updated draft created'
]).

success_criteria(finalizing, [
    'All quality standards met',
    'Frontmatter complete',
    'Published to _posts',
    'State updated'
]).

%% ============================================================================
%% INITIAL STATE (Load from files in production)
%% ============================================================================

%% Initialize agent states
init_agents :-
    retractall(current_phase(_, _)),
    retractall(current_lecture(_, _, _)),
    retractall(completed(_, _)),
    retractall(iteration(_, _)),
    retractall(peer_review_status(_, _)),
    retractall(quality_score(_, _)),
    
    %% Agent A initial state
    assertz(current_phase(agent_a, extraction)),
    assertz(current_lecture(agent_a, 4, 'Natural Deduction Introduction')),
    assertz(completed(agent_a, ['Introduction to Logic', 'Propositional Logic Basics', 'Truth Tables'])),
    assertz(iteration(agent_a, 1)),
    assertz(peer_review_status(agent_a, pending)),
    
    %% Agent B initial state
    assertz(current_phase(agent_b, extraction)),
    assertz(current_lecture(agent_b, 2, 'Reinforcement Learning 2')),
    assertz(completed(agent_b, ['Reinforcement Learning Introduction'])),
    assertz(iteration(agent_b, 1)),
    assertz(peer_review_status(agent_b, pending)).

%% ============================================================================
%% WORKFLOW LOGIC
%% ============================================================================

%% Get next phase in workflow
next_phase(CurrentPhase, NextPhase) :-
    phase(N, CurrentPhase),
    N1 is N + 1,
    phase(N1, NextPhase), !.
next_phase(_, complete).

%% Check if agent can advance to next phase
can_advance(Agent) :-
    current_phase(Agent, Phase),
    Phase \= complete,
    (Phase = reviewing -> 
        peer_review_status(Agent, received)
    ; Phase = refining ->
        (iteration(Agent, I), max_iterations(Max), I < Max ; peer_review_status(Agent, approved))
    ; true).

%% Advance agent to next phase
advance(Agent) :-
    can_advance(Agent),
    current_phase(Agent, OldPhase),
    next_phase(OldPhase, NewPhase),
    retract(current_phase(Agent, OldPhase)),
    assertz(current_phase(Agent, NewPhase)),
    format('~w advanced: ~w -> ~w~n', [Agent, OldPhase, NewPhase]),
    
    %% Reset iteration on new lecture
    (NewPhase = extraction ->
        retract(iteration(Agent, _)),
        assertz(iteration(Agent, 1))
    ; true),
    
    %% Increment iteration on refining
    (NewPhase = refining ->
        iteration(Agent, I),
        I1 is I + 1,
        retract(iteration(Agent, I)),
        assertz(iteration(Agent, I1))
    ; true).

advance(Agent) :-
    \+ can_advance(Agent),
    current_phase(Agent, Phase),
    format('~w cannot advance from ~w (check prerequisites)~n', [Agent, Phase]).

%% Complete lecture and move to next
complete_lecture(Agent) :-
    current_phase(Agent, finalizing),
    current_lecture(Agent, Num, Title),
    completed(Agent, CompletedList),
    
    %% Add to completed
    append(CompletedList, [Title], NewCompleted),
    retract(completed(Agent, CompletedList)),
    assertz(completed(Agent, NewCompleted)),
    
    %% Move to next lecture
    NextNum is Num + 1,
    retract(current_lecture(Agent, Num, Title)),
    assertz(current_lecture(Agent, NextNum, 'Next Lecture')),
    
    %% Reset phase
    retract(current_phase(Agent, finalizing)),
    assertz(current_phase(Agent, extraction)),
    
    %% Reset iteration
    retract(iteration(Agent, _)),
    assertz(iteration(Agent, 1)),
    
    %% Reset peer review
    retract(peer_review_status(Agent, _)),
    assertz(peer_review_status(Agent, pending)),
    
    format('~w completed lecture ~w: ~w~n', [Agent, Num, Title]).

%% ============================================================================
%% CROSS-REVIEW LOGIC
%% ============================================================================

%% Get peer agent
peer(agent_a, agent_b).
peer(agent_b, agent_a).

%% Check if both agents ready for cross-review
ready_for_review(Agent) :-
    current_phase(Agent, drafting),
    peer(Agent, Peer),
    current_phase(Peer, drafting).

%% Exchange reviews
exchange_reviews :-
    current_phase(agent_a, reviewing),
    current_phase(agent_b, reviewing),
    retract(peer_review_status(agent_a, pending)),
    retract(peer_review_status(agent_b, pending)),
    assertz(peer_review_status(agent_a, received)),
    assertz(peer_review_status(agent_b, received)),
    writeln('Reviews exchanged between agents').

%% Approve peer's draft
approve(Agent) :-
    peer(Agent, Peer),
    retract(peer_review_status(Peer, _)),
    assertz(peer_review_status(Peer, approved)),
    format('~w approved ~w draft~n', [Agent, Peer]).

%% ============================================================================
%% STATUS AND QUERIES
%% ============================================================================

%% Print agent status
status(Agent) :-
    agent(Agent, Course),
    current_phase(Agent, Phase),
    current_lecture(Agent, LecNum, LecTitle),
    completed(Agent, CompletedList),
    iteration(Agent, Iter),
    peer_review_status(Agent, PeerStatus),
    length(CompletedList, NumCompleted),
    
    format('~n========================================~n'),
    format('~w: ~w~n', [Agent, Course]),
    format('========================================~n'),
    format('Phase:          ~w~n', [Phase]),
    format('Lecture:        #~w - ~w~n', [LecNum, LecTitle]),
    format('Iteration:      ~w~n', [Iter]),
    format('Peer Review:    ~w~n', [PeerStatus]),
    format('Completed:      ~w lectures~n', [NumCompleted]),
    format('----------------------------------------~n').

%% Print both agents' status
status_all :-
    status(agent_a),
    status(agent_b).

%% Get next action for agent
next_action(Agent, Action) :-
    current_phase(Agent, Phase),
    current_lecture(Agent, _, LecTitle),
    phase_desc(Phase, Desc),
    format(atom(Action), '~w: ~w for "~w"', [Phase, Desc, LecTitle]).

%% Print next action
print_next_action(Agent) :-
    next_action(Agent, Action),
    success_criteria(Phase, Criteria),
    current_phase(Agent, Phase),
    format('~nNext Action for ~w:~n', [Agent]),
    format('  ~w~n~n', [Action]),
    format('Success Criteria:~n'),
    print_criteria(Criteria).

print_criteria([]).
print_criteria([H|T]) :-
    format('  [ ] ~w~n', [H]),
    print_criteria(T).

%% ============================================================================
%% PHASE EXECUTION PROMPTS
%% ============================================================================

%% Generate prompt for current phase
prompt(Agent) :-
    current_phase(Agent, Phase),
    current_lecture(Agent, LecNum, LecTitle),
    agent(Agent, Course),
    course_path(Agent, Path),
    format('~n'),
    format('=== PHASE: ~w ===~n', [Phase]),
    format('Agent: ~w~n', [Agent]),
    format('Course: ~w~n', [Course]),
    format('Lecture #~w: ~w~n~n', [LecNum, LecTitle]),
    phase_prompt(Phase, Agent, Path, LecTitle).

phase_prompt(extraction, Agent, Path, _) :-
    format('TASK: Extract content from lecture materials~n~n'),
    format('Path: ~w/Lectures/~n~n', [Path]),
    format('Steps:~n'),
    format('1. List files in lecture folder~n'),
    format('2. Parse PDFs (text, formulas, diagrams)~n'),
    format('3. Parse JSON metadata~n'),
    format('4. Create extraction document~n~n'),
    format('Output: agent_~w_state/extractions/[lecture]_extracted.md~n', [Agent]).

phase_prompt(planning, Agent, _, _) :-
    format('TASK: Create lesson plan (15-min reading time)~n~n'),
    format('Steps:~n'),
    format('1. Analyze topic dependencies~n'),
    format('2. Order: foundational -> advanced~n'),
    format('3. Allocate ~2250 words total~n'),
    format('4. Plan visual elements~n~n'),
    format('Output: agent_~w_state/plans/[lecture]_plan.md~n', [Agent]).

phase_prompt(drafting, Agent, _, _) :-
    format('TASK: Write complete blog post~n~n'),
    format('Requirements:~n'),
    format('- Jekyll frontmatter~n'),
    format('- 2000-2500 words~n'),
    format('- KaTeX math notation~n'),
    format('- Mermaid diagrams~n'),
    format('- 3-5 external resources~n~n'),
    format('Output: agent_~w_state/drafts/[lecture]_draft_v1.md~n', [Agent]).

phase_prompt(reviewing, Agent, _, _) :-
    peer(Agent, Peer),
    format('TASK: Review ~w draft~n~n', [Peer]),
    format('Checklist:~n'),
    format('[ ] Accuracy (definitions, formulas)~n'),
    format('[ ] Completeness (all topics)~n'),
    format('[ ] Readability (flow, clarity)~n'),
    format('[ ] Visuals (diagrams, tables)~n'),
    format('[ ] Structure (frontmatter, headings)~n~n'),
    format('Output: agent_~w_state/reviews/[lecture]_review.md~n', [Agent]).

phase_prompt(refining, Agent, _, _) :-
    iteration(Agent, I),
    format('TASK: Address feedback (iteration ~w)~n~n', [I]),
    format('Steps:~n'),
    format('1. Read peer feedback~n'),
    format('2. Fix critical issues first~n'),
    format('3. Address moderate issues~n'),
    format('4. Create updated draft~n~n'),
    I1 is I + 1,
    format('Output: agent_~w_state/drafts/[lecture]_draft_v~w.md~n', [Agent, I1]).

phase_prompt(finalizing, Agent, _, _) :-
    format('TASK: Publish blog post~n~n'),
    format('Final Checks:~n'),
    format('[ ] Word count: 2000-2500~n'),
    format('[ ] Reading time: 15 min~n'),
    format('[ ] Diagrams present~n'),
    format('[ ] External resources: 3-5~n'),
    format('[ ] Peer approved~n~n'),
    format('Output: _posts/YYYY-MM-DD-title.md~n'),
    format('~nThen run: complete_lecture(~w).~n', [Agent]).

phase_prompt(complete, _, _, _) :-
    format('Lecture complete! Run advance/1 for next lecture.~n').

%% ============================================================================
%% WORKFLOW RUNNER
%% ============================================================================

%% Run one step for an agent
step(Agent) :-
    prompt(Agent),
    format('~n[Enter to continue, or type "skip" to advance]~n'),
    read_line_to_string(user_input, Input),
    (Input = "skip" -> advance(Agent) ; true).

%% Run full workflow for one agent
run_agent(Agent) :-
    current_phase(Agent, complete), !,
    format('~w has completed all phases for current lecture.~n', [Agent]).

run_agent(Agent) :-
    step(Agent),
    advance(Agent),
    run_agent(Agent).

%% Run parallel workflow
run_workflow :-
    init_agents,
    writeln('Workflow initialized. Agents ready.'),
    status_all.

%% ============================================================================
%% HELPER PREDICATES
%% ============================================================================

%% Check workflow health
health_check :-
    forall(agent(A, _), (
        current_phase(A, P),
        format('~w: phase=~w ', [A, P])
    )),
    nl.

%% Reset agent to extraction
reset(Agent) :-
    retract(current_phase(Agent, _)),
    assertz(current_phase(Agent, extraction)),
    retract(iteration(Agent, _)),
    assertz(iteration(Agent, 1)),
    retract(peer_review_status(Agent, _)),
    assertz(peer_review_status(Agent, pending)),
    format('~w reset to extraction phase.~n', [Agent]).

%% ============================================================================
%% QUALITY VALIDATION
%% ============================================================================

%% Validate draft quality
validate_quality(WordCount, ReadingTime, DiagramCount, RefCount, Result) :-
    min_word_count(MinW), max_word_count(MaxW),
    target_reading_time(TargetT),
    min_diagrams(MinD), min_external_refs(MinR),
    
    (WordCount >= MinW, WordCount =< MaxW -> WC = pass ; WC = fail),
    (abs(ReadingTime - TargetT) =< 2 -> RT = pass ; RT = fail),
    (DiagramCount >= MinD -> DC = pass ; DC = fail),
    (RefCount >= MinR -> RC = pass ; RC = fail),
    
    (WC = pass, RT = pass, DC = pass, RC = pass ->
        Result = approved
    ;   Result = needs_revision
    ),
    
    format('Quality Check:~n'),
    format('  Words:     ~w (~w)~n', [WordCount, WC]),
    format('  Time:      ~w min (~w)~n', [ReadingTime, RT]),
    format('  Diagrams:  ~w (~w)~n', [DiagramCount, DC]),
    format('  Refs:      ~w (~w)~n', [RefCount, RC]),
    format('  Result:    ~w~n', [Result]).

%% ============================================================================
%% INTERACTIVE COMMANDS
%% ============================================================================

%% Help command
help :-
    writeln(''),
    writeln('Multi-Agent Workflow Commands:'),
    writeln('========================================'),
    writeln('  init_agents.           - Initialize both agents'),
    writeln('  status(Agent).         - Show agent status'),
    writeln('  status_all.            - Show all agents'),
    writeln('  prompt(Agent).         - Show current phase prompt'),
    writeln('  advance(Agent).        - Move to next phase'),
    writeln('  complete_lecture(A).   - Finish lecture, start next'),
    writeln('  exchange_reviews.      - Exchange peer reviews'),
    writeln('  approve(Agent).        - Approve peer draft'),
    writeln('  reset(Agent).          - Reset to extraction'),
    writeln('  run_workflow.          - Initialize and show status'),
    writeln('  help.                  - Show this help'),
    writeln(''),
    writeln('Agents: agent_a, agent_b'),
    writeln('Phases: extraction, planning, drafting,'),
    writeln('        reviewing, refining, finalizing'),
    writeln('').

%% ============================================================================
%% AUTO-INITIALIZATION
%% ============================================================================

:- init_agents.
:- writeln('Workflow loaded. Type help. for commands.').
