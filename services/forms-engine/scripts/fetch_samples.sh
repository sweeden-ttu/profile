#!/usr/bin/env bash
# Download the public USDA eForms used by the demo and make the scanned copy.
set -euo pipefail
cd "$(dirname "$0")/../samples"
base=https://forms.sc.egov.usda.gov/efcommon/eFileServices/eForms
for f in AD2047 CCC941 FSA2001 AD3030 CCC860; do
  curl -fsSL -A "forms-engine/0.1" -o "$f.pdf" "$base/$f.PDF"
done
python3 ../scripts/make_scan.py CCC860.pdf CCC860-scanned.pdf
ls -la
