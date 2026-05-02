#!/usr/bin/env bash
# One-shot: read ~/.profile, extract known credential exports, encrypt with GPG
# symmetric (AES256), write ~/.profile.secrets.gpg, strip those lines from ~/.profile,
# and add a block that sources secrets-gpg-provider with SECRETS_GPG_SYMMETRIC=1.
#
# Requires a TTY (run from Terminal.app) so gpg can prompt for passphrase.
set -euo pipefail

if [[ ! -t 0 ]]; then
  echo "seal-profile-secrets: stdin is not a TTY. Open Terminal.app and run:" >&2
  echo "  bash ${HOME}/profile/scripts/seal-profile-secrets-from-profile.sh" >&2
  exit 1
fi

PROFILE="${HOME}/.profile"
OUT="${HOME}/.profile.secrets.gpg"
PROVIDER="${HOME}/profile/scripts/secrets-gpg-provider.sh"

[[ -f "${PROFILE}" ]] || {
  echo "seal-profile-secrets: missing ${PROFILE}" >&2
  exit 1
}
[[ -f "${PROVIDER}" ]] || {
  echo "seal-profile-secrets: missing ${PROVIDER}" >&2
  exit 1
}

BACKUP="${HOME}/.profile.bak-seal-$(date +%Y%m%d%H%M%S)"
cp "${PROFILE}" "${BACKUP}"
echo "seal-profile-secrets: backup -> ${BACKUP}" >&2

EXTRACT="$(mktemp)"
trap 'rm -f "${EXTRACT}"' EXIT

python3 - "${PROFILE}" "${EXTRACT}" <<'PY'
import pathlib, sys
profile = pathlib.Path(sys.argv[1])
out_path = pathlib.Path(sys.argv[2])
starts = (
    "export CANVAS_EMAIL=",
    "export CANVAS_PASSWORD=",
    "export CANVAS_BASE_URL=",
    "export GEMINI_API_KEY=",
    "export GITHUB_CLIENT_SECRET=",
    "export OPENAI_API_KEY=",
    "export ANTHROPIC_API_KEY=",
    "export HF_TOKEN=",
)
lines = profile.read_text().splitlines()
secrets = [ln for ln in lines if any(ln.startswith(s) for s in starts)]
out_path.write_text("\n".join(secrets) + ("\n" if secrets else ""), encoding="utf-8")
PY

if [[ ! -s "${EXTRACT}" ]]; then
  if [[ -f "${OUT}" ]]; then
    echo "seal-profile-secrets: no secret lines left to extract; ${OUT} already exists." >&2
    exit 0
  fi
  echo "seal-profile-secrets: no matching secret exports in ${PROFILE} and no ${OUT}." >&2
  exit 2
fi

export SECRETS_GPG_SYMMETRIC=1
# shellcheck source=secrets-gpg-provider.sh
. "${PROVIDER}"

TMP_OUT="${OUT}.tmp"
SECRETS_GPG_FILE="${TMP_OUT}" secrets_gpg_encrypt_stdin <"${EXTRACT}"
mv -f "${TMP_OUT}" "${OUT}"
echo "seal-profile-secrets: wrote ${OUT}" >&2

python3 - "${PROFILE}" <<'PY'
import pathlib, sys
profile = pathlib.Path(sys.argv[1])
starts = (
    "export CANVAS_EMAIL=",
    "export CANVAS_PASSWORD=",
    "export CANVAS_BASE_URL=",
    "export GEMINI_API_KEY=",
    "export GITHUB_CLIENT_SECRET=",
    "export OPENAI_API_KEY=",
    "export ANTHROPIC_API_KEY=",
    "export HF_TOKEN=",
)
marker = "SECRETS_GPG_SYMMETRIC=1"
text = profile.read_text()
if marker in text:
    lines = text.splitlines()
    keep = [ln for ln in lines if not any(ln.startswith(s) for s in starts)]
    profile.write_text("\n".join(keep) + "\n", encoding="utf-8")
    sys.exit(0)

lines = text.splitlines()
keep = [ln for ln in lines if not any(ln.startswith(s) for s in starts)]
insert = [
    "",
    "# Encrypted credentials (~/.profile.secrets.gpg, symmetric GPG)",
    'if [ -f "${HOME}/.profile.secrets.gpg" ] && [ -f "${HOME}/profile/scripts/secrets-gpg-provider.sh" ]; then',
    "  export SECRETS_GPG_SYMMETRIC=1",
    "  # shellcheck source=/dev/null",
    '  . "${HOME}/profile/scripts/secrets-gpg-provider.sh" && secrets_gpg_source',
    "fi",
]
idx = None
for i, line in enumerate(keep):
    if line == "fi" and i >= 1 and "conda" in keep[i - 1].lower():
        idx = i + 1
        break
if idx is None:
    for i, line in enumerate(keep):
        if line == "fi":
            idx = i + 1
            break
if idx is None:
    idx = 0
new_lines = keep[:idx] + insert + keep[idx:]
profile.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
PY

echo "seal-profile-secrets: updated ${PROFILE}; open a new shell to load secrets." >&2
