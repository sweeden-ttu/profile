#!/bin/bash
# Build the single-file bundle and copy it into the Jekyll site.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist .parcel-cache bundle.html
pnpm exec parcel build index.html --dist-dir dist --no-source-maps
pnpm exec html-inline dist/index.html > bundle.html
if grep -qE '<(script|link)[^>]+(src|href)="(https?:)?//' bundle.html; then
  echo "error: bundle references external resources" >&2; exit 1
fi
mkdir -p ../../assets/apps/cheatsheet
cp bundle.html ../../assets/apps/cheatsheet/index.html
echo "bundle: $(du -h bundle.html | cut -f1) -> assets/apps/cheatsheet/index.html"
