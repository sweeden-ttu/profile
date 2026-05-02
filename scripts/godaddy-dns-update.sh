#!/usr/bin/env bash
# Update GoDaddy DNS for scottweeden.online to point to GitHub Pages.
# Credentials via environment (never commit keys to the repo):
#   GODADDY_API_KEY    - GoDaddy API key
#   GODADDY_API_SECRET - GoDaddy API secret
# Usage: GODADDY_API_KEY=xxx GODADDY_API_SECRET=yyy ./scripts/godaddy-dns-update.sh [list|update]
#   list   - show current DNS records (default)
#   update - set A/CNAME records for GitHub Pages

set -e
DOMAIN="scottweeden.online"
API_BASE="https://api.godaddy.com/v1/domains/${DOMAIN}/records"
# GitHub Pages IPs for custom apex domain
GITHUB_A_IPS=(185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153)
GITHUB_CNAME="sweeden-ttu.github.io"
# Course subdomains (CNAME to GitHub Pages)
SUBDOMAINS=(cryptography software-vv intelligent-systems logic-for-computer-scientists theory-of-automata analysis-of-algorithms software-project-management machine-learning-security)

if [[ -z "${GODADDY_API_KEY:-}" || -z "${GODADDY_API_SECRET:-}" ]]; then
  echo "Error: Set GODADDY_API_KEY and GODADDY_API_SECRET in the environment." >&2
  echo "Example: export GODADDY_API_KEY=your_key; export GODADDY_API_SECRET=your_secret" >&2
  exit 1
fi

AUTH_HEADER="sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}"

list_records() {
  echo "=== Current DNS records for ${DOMAIN} ==="
  RESP=$(curl -s -w "\n%{http_code}" -H "Authorization: ${AUTH_HEADER}" "${API_BASE}")
  BODY=$(echo "$RESP" | head -n -1)
  CODE=$(echo "$RESP" | tail -n 1)
  if [[ "$CODE" != "200" ]]; then
    echo "API error (HTTP $CODE): $BODY" >&2
    echo "Check: domain is in this account, API key is Production (not OTE), key has DNS scope." >&2
    return 1
  fi
  echo "$BODY" | jq -r '.[] | "\(.type) \(.name) \(.data)"' 2>/dev/null || echo "$BODY"
}

update_dns() {
  echo "=== Updating DNS for ${DOMAIN} (GitHub Pages) ==="

  # A records for apex (@)
  echo "Setting A records for @..."
  A_RECORDS=$(printf '%s\n' "${GITHUB_A_IPS[@]}" | jq -R . | jq -s 'map({type: "A", name: "@", data: ., ttl: 600})')
  curl -s -X PUT -H "Authorization: ${AUTH_HEADER}" -H "Content-Type: application/json" \
    -d "${A_RECORDS}" "${API_BASE}/A/%40"

  # CNAME for www
  echo "Setting CNAME www -> ${GITHUB_CNAME}..."
  curl -s -X PUT -H "Authorization: ${AUTH_HEADER}" -H "Content-Type: application/json" \
    -d "[{\"type\":\"CNAME\",\"name\":\"www\",\"data\":\"${GITHUB_CNAME}\",\"ttl\":600}]" \
    "${API_BASE}/CNAME/www"

  # CNAME for each course subdomain
  for sub in "${SUBDOMAINS[@]}"; do
    echo "Setting CNAME ${sub} -> ${GITHUB_CNAME}..."
    curl -s -X PUT -H "Authorization: ${AUTH_HEADER}" -H "Content-Type: application/json" \
      -d "[{\"type\":\"CNAME\",\"name\":\"${sub}\",\"data\":\"${GITHUB_CNAME}\",\"ttl\":600}]" \
      "${API_BASE}/CNAME/${sub}"
  done

  echo "=== DNS update complete ==="
  list_records
}

case "${1:-list}" in
  list)  list_records ;;
  update) update_dns ;;
  *) echo "Usage: $0 [list|update]" >&2; exit 1 ;;
esac
