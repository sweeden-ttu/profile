#!/bin/zsh
# LaunchAgent helper: git-backed telemetry HTTP server (auto-push after each commit).
set -euo pipefail
export PATH="${HOME}/.rbenv/shims:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export GIT_TELEMETRY_AUTO_PUSH="${GIT_TELEMETRY_AUTO_PUSH:-1}"
# Override in LaunchAgent plist if you use a different Git host/repo.
export GIT_TELEMETRY_REMOTE_URL="${GIT_TELEMETRY_REMOTE_URL:-git@github.com:sweeden-ttu/profile-telemetry.git}"
exec /opt/homebrew/bin/node "${HOME}/profile/scripts/git-telemetry-server.mjs" --port 8787
