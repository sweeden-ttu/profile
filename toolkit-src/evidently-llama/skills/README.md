# Skills

Each `*.md` file here is one skill the agent can load (`evllama.skills.load_skills`).
Front matter keys: `name`, `description`, `triggers` (keywords for deterministic routing),
`tools` (subset of `calc`, `lookup`), `output` (`text` or `json`). The body is appended to
the system prompt when the skill is active. Add a file to add a skill; nothing else to wire.
