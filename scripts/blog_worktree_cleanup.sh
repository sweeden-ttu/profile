#!/usr/bin/env bash
# Remove all git worktrees under $HOME/blog-* after committing any WIP.
# Main repo: $PROFILE. Does not delete local or remote branches.
set -u

PROFILE="/Users/sweeden/profile"
LOG="${HOME}/blog_worktree_cleanup.log"
PROFILE_GIT="${PROFILE}/.git"

log() {
  printf '[%s] %s\n' "$(date -Iseconds 2>/dev/null || date '+%Y-%m-%dT%H:%M:%S%z')" "$*"
}

expected_common_git() {
  ( cd "$PROFILE_GIT" && pwd -P )
}

resolve_common_git() {
  local path="$1"
  local raw
  raw="$(git -C "$path" rev-parse --git-common-dir 2>/dev/null)" || return 1
  if [[ "$raw" != /* ]]; then
    raw="$path/$raw"
  fi
  ( cd "$raw" && pwd -P )
}

main() {
  log "=== Blog worktree cleanup start ==="
  date
  uname -a
  git -C "$PROFILE" worktree list || true
  echo "--- processing ---"

  local path base commondir_expected commondir_actual
  commondir_expected="$(expected_common_git)"

  # shellcheck disable=SC2012
  for path in $(ls -d "$HOME"/blog-* 2>/dev/null | sort -V); do
    [[ -d "$path" ]] || { log "SKIP not a directory: $path"; continue; }

    if ! git -C "$path" rev-parse --is-inside-work-tree &>/dev/null; then
      log "FAIL not a git work tree: $path"
      continue
    fi

    commondir_actual="$(resolve_common_git "$path" 2>/dev/null)" || commondir_actual=""
    if [[ -z "$commondir_actual" || "$commondir_actual" != "$commondir_expected" ]]; then
      log "FAIL common-dir mismatch or unreadable: $path (got '${commondir_actual:-?}', want '$commondir_expected')"
      continue
    fi

    base="$(basename "$path")"

    if [[ -n "$(git -C "$path" status --porcelain 2>/dev/null)" ]]; then
      if git -C "$path" add -A && git -C "$path" commit -m "chore: checkpoint before worktree removal ($base)"; then
        log "OK committed WIP: $path"
      else
        log "FAIL commit: $path — not removing worktree"
        continue
      fi
    else
      log "OK clean (no commit): $path"
    fi

    if git -C "$PROFILE" worktree remove "$path"; then
      log "OK removed worktree: $path"
    else
      log "WARN normal remove failed, trying --force: $path"
      if git -C "$PROFILE" worktree remove --force "$path"; then
        log "OK removed worktree (force): $path"
      else
        log "FAIL remove worktree: $path"
      fi
    fi
  done

  log "=== Done ==="
  git -C "$PROFILE" worktree list || true
}

main >>"$LOG" 2>&1
