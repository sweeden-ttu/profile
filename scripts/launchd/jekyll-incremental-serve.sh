#!/bin/zsh
# LaunchAgent helper: Jekyll dev server with incremental rebuilds + file watching.
set -euo pipefail
export RBENV_ROOT="${HOME}/.rbenv"
export PATH="${HOME}/.rbenv/shims:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"
cd "${HOME}/profile"
exec bundle exec jekyll serve \
  --host 127.0.0.1 \
  --port 4000 \
  --incremental \
  --livereload
