:- module(herbrand, [
    herbrand_universe/3,
    herbrand_base/3,
    ground_atom/2,
    agents_vocab/1,
    agents_axioms/1,
    agents_clauses/1,
    agents_universe/2,
    agents_base/2
]).

% herbrand_universe(+Vocabulary, +Depth, -Universe)
% Generates ground terms up to a certain depth.
herbrand_universe(Vocab, Depth, Universe) :-
    findall(Term, (between(0, Depth, D), member_of_universe(Vocab, D, Term)), Universe).

member_of_universe(Vocab, 0, C) :- 
    member(const(C), Vocab).
member_of_universe(Vocab, D, Term) :-
    D > 0,
    member(func(F, Arity), Vocab),
    D1 is D - 1,
    length(Args, Arity),
    maplist(member_of_universe(Vocab, D1), Args),
    Term =.. [F | Args].

% herbrand_base(+Vocab, +Depth, -Base)
% Generates ground atoms up to a certain depth.
herbrand_base(Vocab, Depth, Base) :-
    herbrand_universe(Vocab, Depth, Universe),
    findall(Atom, (
        member(pred(P, Arity), Vocab),
        length(Args, Arity),
        maplist(arg_from_universe(Universe), Args),
        Atom =.. [P | Args]
    ), Base).

arg_from_universe(Universe, Term) :-
    member(Term, Universe).

% ground_atom(+Vocab, +Atom)
% True when Atom is ground and all symbols belong to Vocab.
ground_atom(Vocab, Atom) :-
    ground(Atom),
    Atom =.. [Pred | Args],
    member(pred(Pred, Arity), Vocab),
    length(Args, Arity),
    maplist(term_in_vocab(Vocab), Args).

term_in_vocab(Vocab, Term) :-
    atomic(Term),
    member(const(Term), Vocab).
term_in_vocab(Vocab, Term) :-
    compound(Term),
    Term =.. [F | Args],
    member(func(F, Arity), Vocab),
    length(Args, Arity),
    maplist(term_in_vocab(Vocab), Args).

% Example Vocabulary
example_vocab([
    const(a),
    const(b),
    func(f, 1),
    pred(p, 1),
    pred(q, 2)
]).

% Usage:
% ?- example_vocab(V), herbrand_universe(V, 1, U).
% ?- example_vocab(V), herbrand_base(V, 1, B).

% ============================================================================
% Agents Formalization Vocabulary
% ============================================================================
% Vocabulary extracted from AGENTS.md formalization
% Formalized as propositional logic (ground atoms only, no variables)
% See scripts/agents_formalization.md for detailed formalization steps

% agents_vocab(-Vocab)
% Vocabulary for the multi-agent Herbrand base system
agents_vocab([
    % Object constants
    const(agent_herbrand),
    const(agent_logic),
    const(system),
    const(course_cs5384),
    const(lecture_16),
    const(app_herbrand_pl),
    const(herbrand_bases),
    const(prolog_language),
    const(task_extract_requirements),
    const(task_prolog_impl),
    const(task_correctness_verification),
    const(goal_correctness),
    const(goal_readability),
    const(goal_integration),
    const(pred_herbrand_universe),
    const(pred_herbrand_base),
    const(pred_satisfies),
    % Predicates (relation constants)
    pred(agent, 1),
    pred(focused_on, 2),
    pred(target_course, 2),
    pred(covers_lecture, 2),
    pred(core_application, 2),
    pred(responsible_for, 2),
    pred(implements, 2),
    pred(has_success_criterion, 2),
    pred(uses_language, 2)
]).

% Skolemized ground clauses derived from AGENTS.md.
agents_axioms([
    agent(agent_herbrand),
    agent(agent_logic),
    focused_on(system, herbrand_bases),
    target_course(system, course_cs5384),
    covers_lecture(course_cs5384, lecture_16),
    core_application(system, app_herbrand_pl),
    uses_language(app_herbrand_pl, prolog_language),
    responsible_for(agent_herbrand, task_prolog_impl),
    responsible_for(agent_herbrand, task_correctness_verification),
    responsible_for(agent_logic, task_extract_requirements),
    implements(app_herbrand_pl, pred_herbrand_universe),
    implements(app_herbrand_pl, pred_herbrand_base),
    implements(app_herbrand_pl, pred_satisfies),
    has_success_criterion(system, goal_correctness),
    has_success_criterion(system, goal_readability),
    has_success_criterion(system, goal_integration)
]).

% Backward-compatible alias
agents_clauses(Clauses) :-
    agents_axioms(Clauses).

% agents_universe(+Depth, -Universe)
% Generates the Herbrand universe for the agents vocabulary
% Since we have no function symbols, the universe is just the constants
agents_universe(Depth, Universe) :-
    agents_vocab(Vocab),
    herbrand_universe(Vocab, Depth, Universe).

% agents_base(+Depth, -Base)
% Generates the Herbrand base for the agents vocabulary
% Returns all ground atoms that can be formed from the vocabulary
agents_base(Depth, Base) :-
    agents_vocab(Vocab),
    herbrand_base(Vocab, Depth, Base).

% Usage examples:
% ?- agents_universe(0, U).  % Returns all constants (since no functions)
% ?- agents_base(0, B).      % Returns all ground atoms with constants only
% ?- agents_axioms(Cs).      % Returns the Skolemized ground clauses
% ?- agents_base(0, B), length(B, N).      % N = 2329 ground atoms
% ?- agents_vocab(V), agents_axioms(Cs),   % Verify clauses are grounded
%    maplist(ground_atom(V), Cs).
