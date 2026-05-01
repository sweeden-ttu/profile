#!/usr/bin/env bash
# =============================================================================
# Five autonomous agents using Gemini 3.1 Pro — each with a UNIQUE worktree.
# Within each agent: Phase 1 (plan) → Phase 2 (execute via --resume).
# All 5 agents launch simultaneously in the background.
# Model: gemini-3.1-pro
# =============================================================================
set -euo pipefail

# Timestamp suffix for globally unique worktree names
TS=$(date +%Y%m%d-%H%M%S)

# Helper: plan-then-execute in a unique worktree (runs as a single background job)
plan_and_execute() {
  local name="$1"        # e.g. "design-revamp"
  local worktree="gemini-${name}-${TS}"
  local plan_prompt="$2"
  local exec_prompt="$3"

  echo "🚀 [$worktree] Starting — Plan phase (Gemini)"
  CHAT_ID=$(agent create-chat)

  # Phase 1 — Plan (read-only, headless, gemini model)
  agent \
    --resume "$CHAT_ID" \
    --worktree "$worktree" \
    --workspace ~/profile \
    --model gemini-3.1-pro \
    --plan \
    --print \
    --trust \
    "$plan_prompt"

  echo "⚡ [$worktree] Switching to Execute phase (chat $CHAT_ID)"

  # Phase 2 — Execute (full permissions, headless, gemini model)
  agent \
    --resume "$CHAT_ID" \
    --worktree "$worktree" \
    --workspace ~/profile \
    --model gemini-3.1-pro \
    --yolo \
    --print \
    --trust \
    "$exec_prompt"

  echo "✅ [$worktree] Done"
}

# ---------------------------------------------------------------------------
# Agent 1 – Design Revamp
# ---------------------------------------------------------------------------
plan_and_execute "design-revamp" \
"You are a site-design agent. \
Analyze the entire ~/profile site and the design system in ~/profile/emerging-tech/. \
Review skills in ~/.agent/skills/ for anything useful. \
Produce a comprehensive plan to: \
  1. Revamp every page layout to match the emerging-tech theme, maximising screen space. \
  2. Completely redesign the projects page with a modern card-grid layout. \
  3. Create a professional resume page using my GitHub headshot (https://github.com/sweeden-ttu.png). \
  4. Add social-media links everywhere appropriate: \
       LinkedIn  → https://linkedin.com/in/weedens \
       Facebook  → https://facebook.com/scotdwg81 \
       Instagram → https://instagram.com/websharps \
       GitHub    → https://github.com/sweeden-ttu \
List every file you will modify and what changes you will make." \
"Execute the plan you just created. Make every change you outlined. \
When completely finished, run: \
  git add -A && git commit -m 'gemini/design-revamp: full site redesign' && git push -u origin HEAD" &

# ---------------------------------------------------------------------------
# Agent 2 – Markdown Quality
# ---------------------------------------------------------------------------
plan_and_execute "markdown-quality" \
"You are a copy-editing agent. \
Scan every markdown file in this repository (content/**/*.md, README.md, etc.). \
Review skills in ~/.agent/skills/ for anything useful. \
Produce a comprehensive plan listing: \
  - Every spelling error, grammar issue, and inconsistency you find. \
  - Broken links or missing front-matter fields. \
  - Heading hierarchy violations. \
Organise findings by file." \
"Execute the plan you just created. Fix every issue you identified. \
When completely finished, run: \
  git add -A && git commit -m 'gemini/markdown-quality: copy-edit all markdown' && git push -u origin HEAD" &

# ---------------------------------------------------------------------------
# Agent 3 – Data / YAML Dedup
# ---------------------------------------------------------------------------
plan_and_execute "data-dedup" \
"You are a data-integrity agent. \
Inspect the data/ folder — especially YAML files that list projects. \
Review skills in ~/.agent/skills/ for anything useful. \
Produce a comprehensive plan that: \
  - Identifies every duplicate project entry. \
  - Explains which copy to keep (the most complete version). \
  - Validates YAML structure and lists any syntax issues. \
Present findings in a table." \
"Execute the plan you just created. Remove all duplicates, keeping the best version. \
Validate the YAML is well-formed after changes. \
When completely finished, run: \
  git add -A && git commit -m 'gemini/data-dedup: deduplicate project data' && git push -u origin HEAD" &

# ---------------------------------------------------------------------------
# Agent 4 – Media, UX & Animations
# ---------------------------------------------------------------------------
plan_and_execute "media-ux" \
"You are a media-and-UX agent dedicated to visual enhancements. \
Audit the entire site and review skills in ~/.agent/skills/. \
Produce a comprehensive plan to: \
  1. Add high-quality icons (Font Awesome or similar CDN). \
  2. Integrate CSS and SVG micro-animations (hover states, page transitions, scroll-triggered effects) using GSAP or AOS. \
  3. Load KaTeX from CDN and ensure every blog post with LaTeX math renders correctly. \
  4. Add any other FX that make the site feel premium and polished. \
List every file you will create or modify and the specific changes." \
"Execute the plan you just created. Implement every enhancement you outlined. \
When completely finished, run: \
  git add -A && git commit -m 'gemini/media-ux: integrate media, icons, animations, KaTeX' && git push -u origin HEAD" &

# ---------------------------------------------------------------------------
# Agent 5 – Final Integration & QA
# ---------------------------------------------------------------------------
plan_and_execute "final-review" \
"You are a QA integration agent. \
Produce a comprehensive plan to: \
  1. Wait for the four sibling gemini branches on origin. \
  2. Merge all four into a new branch called gemini-integrated. \
  3. Resolve any merge conflicts with a clear strategy. \
  4. Run 'hugo --minify' and fix build errors. \
  5. Verify the site renders correctly. \
Outline your conflict-resolution strategy and build-fix approach." \
"Execute the plan you just created. \
When completely finished, run: \
  git push -u origin gemini-integrated" &

# ---------------------------------------------------------------------------
wait
echo "════════════════════════════════════════"
echo "✅ All 5 Gemini agents have completed."
echo "════════════════════════════════════════"
