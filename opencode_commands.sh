#!/usr/bin/env bash
# =============================================================================
# Five autonomous opencode agents — each with a DIFFERENT non-exhausted model.
# Within each agent: Phase 1 (plan) → Phase 2 (execute).
# All 5 agents launch simultaneously in the background.
# =============================================================================
set -euo pipefail

# Timestamp suffix for unique branch names
TS=$(date +%Y%m%d-%H%M%S)

# ─── Helper ────────────────────────────────────────────────────────────────────
# Usage: plan_and_execute <name> <model> <plan_prompt> <exec_prompt>
plan_and_execute() {
  local name="$1"
  local model="$2"
  local branch="oc-${name}-${TS}"
  local plan_prompt="$3"
  local exec_prompt="$4"

  # Ensure we're on a fresh branch for this agent
  git -C ~/profile checkout -b "$branch" 2>/dev/null \
    || git -C ~/profile checkout "$branch"

  echo "🚀 [$branch] Phase 1 — Planning (Model: $model)"

  # Phase 1 — plan only (non-interactive)
  # Capturing session ID from output
  SESSION_ID=$(
    opencode run --model "$model" ~/profile "$plan_prompt" 2>&1 \
    | grep -oE '"id":"[a-z0-9-]+"' | head -1 | grep -oE '[a-z0-9-]{20,}' || true
  )

  # Fallback: grab latest session if grep above finds nothing
  if [[ -z "$SESSION_ID" ]]; then
    SESSION_ID=$(opencode session list --json 2>/dev/null \
      | grep -oE '"id":"[^"]+"' | head -1 | grep -oE '[^"]+$' || true)
  fi

  echo "⚡ [$branch] Phase 2 — Executing (session: $SESSION_ID)"

  # Phase 2 — execute the plan (resume session)
  opencode run --model "$model" --session "$SESSION_ID" ~/profile "$exec_prompt"

  echo "✅ [$branch] Done"
}

# ─── Agent 1: Design Revamp (Big Pickle) ──────────────────────────────────────
plan_and_execute "design-revamp" "opencode/big-pickle" \
"You are a site-design agent working in ~/profile. \
Analyze the entire site and the design system in ~/profile/emerging-tech/. \
Review any skills in ~/.agent/skills/ that are relevant. \
Produce a comprehensive plan to: \
  1. Revamp every page layout to match the emerging-tech theme, maximising screen space. \
  2. Completely redesign the projects page with a modern card-grid layout. \
  3. Create a professional resume page using the GitHub headshot at https://github.com/sweeden-ttu.png. \
  4. Add social-media links everywhere appropriate. \
List every file you will modify and the exact changes." \
"Execute the plan you just created. Make every change. \
When completely finished, run: \
  git -C ~/profile add -A && git -C ~/profile commit -m 'oc/design-revamp: full site redesign' && git -C ~/profile push -u origin HEAD" &

# ─── Agent 2: Markdown Quality (GPT-5 Nano) ───────────────────────────────────
plan_and_execute "markdown-quality" "opencode/gpt-5-nano" \
"You are a copy-editing agent working in ~/profile. \
Scan every markdown file (content/**/*.md, README.md, etc.). \
Review skills in ~/.agent/skills/ for anything useful. \
Produce a comprehensive plan listing: \
  - Every spelling error, grammar issue, and inconsistency. \
  - Broken links or missing front-matter fields. \
  - Heading hierarchy violations." \
"Execute the plan you just created. Fix every issue identified. \
When completely finished, run: \
  git -C ~/profile add -A && git -C ~/profile commit -m 'oc/markdown-quality: copy-edit all markdown' && git -C ~/profile push -u origin HEAD" &

# ─── Agent 3: Data / YAML Dedup (HY3 Preview Free) ────────────────────────────
plan_and_execute "data-dedup" "opencode/hy3-preview-free" \
"You are a data-integrity agent working in ~/profile. \
Inspect the data/ folder — especially YAML files that list projects. \
Review skills in ~/.agent/skills/ for anything useful. \
Produce a comprehensive plan that: \
  - Identifies every duplicate project entry. \
  - Explains which copy to keep. \
  - Validates YAML structure." \
"Execute the plan you just created. Remove all duplicates, keep the best version. \
Validate the YAML is well-formed after changes. \
When completely finished, run: \
  git -C ~/profile add -A && git -C ~/profile commit -m 'oc/data-dedup: deduplicate project data' && git -C ~/profile push -u origin HEAD" &

# ─── Agent 4: Media, UX & Animations (Minimax M2.5 Free) ───────────────────────
plan_and_execute "media-ux" "opencode/minimax-m2.5-free" \
"You are a media-and-UX agent working in ~/profile. \
Audit the entire site and review skills in ~/.agent/skills/. \
Produce a comprehensive plan to: \
  1. Add high-quality icons. \
  2. Integrate CSS and SVG micro-animations using GSAP or AOS. \
  3. Load KaTeX from CDN for LaTeX math. \
  4. Add any other FX for a premium feel." \
"Execute the plan you just created. Implement every enhancement outlined. \
When completely finished, run: \
  git -C ~/profile add -A && git -C ~/profile commit -m 'oc/media-ux: media, icons, animations & KaTeX' && git -C ~/profile push -u origin HEAD" &

# ─── Agent 5: Final Integration (Nemotron 3 Super Free) ───────────────────────
plan_and_execute "final-review" "opencode/nemotron-3-super-free" \
"You are a QA integration agent working in ~/profile. \
Produce a comprehensive plan to: \
  1. Wait for sibling branches on origin. \
  2. Merge all four into oc-integrated. \
  3. Resolve merge conflicts. \
  4. Build the site and fix any errors. \
  5. Verify the site renders correctly." \
"Execute the plan you just created. \
When completely finished, run: \
  git -C ~/profile push -u origin oc-integrated" &

# ─── Wait for all agents ───────────────────────────────────────────────────────
wait
echo "✅ All 5 opencode agents have completed."
