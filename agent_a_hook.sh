#!/usr/bin/env bash
# Git hook helper to regenerate Agent A lecture inventory after repository updates.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GEN_SCRIPT="$ROOT_DIR/scripts/agent_a_generate_inventory.py"

if [[ ! -x "$GEN_SCRIPT" ]]; then
  echo "Agent A generator missing or not executable: $GEN_SCRIPT" >&2
  exit 1
fi

python3 "$GEN_SCRIPT"
