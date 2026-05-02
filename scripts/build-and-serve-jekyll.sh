#!/usr/bin/env bash
# Build all Jekyll sites and serve the main site locally.
# Requires: Ruby, Bundler (bundle install in each site root first).
# Usage: ./scripts/build-and-serve-jekyll.sh [serve]
#   With no args: only build. With "serve": build then serve main site.

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Building main site ==="
bundle exec jekyll build

for dir in coursework/courses/cryptography coursework/courses/software-vv \
  coursework/courses/intelligent-systems coursework/courses/logic-for-computer-scientists \
  coursework/courses/theory-of-automata coursework/courses/analysis-of-algorithms \
  coursework/courses/software-project-management coursework/courses/machine-learning-security; do
  if [[ -f "$dir/_config.yml" ]]; then
    echo "=== Building $dir ==="
    (cd "$dir" && bundle exec jekyll build)
  fi
done

if [[ "${1:-}" == "serve" ]]; then
  echo "=== Serving main site at http://localhost:4000 ==="
  bundle exec jekyll serve --livereload
fi
