#!/usr/bin/env bash
# secrets-gpg-provider.sh — GPG-backed secrets using your default secret key.
#
# Design
# -------
# - Cleartext ~/.profile: PATH, conda, non-secret config only.
# - Encrypted ~/.profile.secrets.gpg: private lines (export KEY=...).
# - Login sources this script and calls secrets_gpg_source; gpg-agent + pinentry
#   decrypt with the default secret key (--default-recipient-self).
#
# Override recipient: export SECRETS_GPG_RECIPIENT='0xLONGID' or email@domain.
# Encrypted file path: export SECRETS_GPG_FILE (default ~/.profile.secrets.gpg).
#
# macOS: gpg + gpg-agent; pinentry-mac (GPG Suite) can use Keychain for passphrases.
#
# CLI:  ~/profile/scripts/secrets-gpg help|encrypt|decrypt|edit
# Profile:  . "$HOME/profile/scripts/secrets-gpg-provider.sh" && secrets_gpg_source

SECRETS_GPG_FILE="${SECRETS_GPG_FILE:-${HOME}/.profile.secrets.gpg}"
SECRETS_GPG_RECIPIENT="${SECRETS_GPG_RECIPIENT:-}"

secrets_gpg__encrypt_args() {
  if [[ -n "${SECRETS_GPG_RECIPIENT}" ]]; then
    echo --recipient "${SECRETS_GPG_RECIPIENT}"
  else
    echo --default-recipient-self
  fi
}

# Decrypt secrets file to stdout.
secrets_gpg_decrypt() {
  if [[ ! -f "${SECRETS_GPG_FILE}" ]]; then
    echo "secrets_gpg: missing ${SECRETS_GPG_FILE}" >&2
    return 1
  fi
  gpg --quiet --batch --decrypt "${SECRETS_GPG_FILE}"
}

# Decrypt and eval in the current shell (for ~/.profile).
secrets_gpg_source() {
  local _blob
  if ! _blob="$(secrets_gpg_decrypt 2>/dev/null)"; then
    echo "secrets_gpg: decrypt failed (agent, pinentry, or key)" >&2
    return 1
  fi
  # shellcheck disable=SC2090
  eval "${_blob}"
}

# Encrypt stdin -> SECRETS_GPG_FILE (binary OpenPGP message).
secrets_gpg_encrypt_stdin() {
  local _tmp _a
  _tmp="$(mktemp)"
  cat >"${_tmp}"
  # shellcheck disable=SC2046
  _a="$(secrets_gpg__encrypt_args)"
  gpg --quiet --batch --yes ${_a} --encrypt --output "${SECRETS_GPG_FILE}" "${_tmp}"
  rm -f "${_tmp}"
  echo "secrets_gpg: wrote ${SECRETS_GPG_FILE}" >&2
}

secrets_gpg_edit() {
  local _tmp _dir _a
  _dir="$(mktemp -d)"
  _tmp="${_dir}/secrets.plain"
  secrets_gpg_decrypt >"${_tmp}"
  ${EDITOR:-vi} "${_tmp}"
  # shellcheck disable=SC2046
  _a="$(secrets_gpg__encrypt_args)"
  gpg --quiet --batch --yes ${_a} --encrypt --output "${SECRETS_GPG_FILE}" "${_tmp}"
  rm -rf "${_dir}"
  echo "secrets_gpg: updated ${SECRETS_GPG_FILE}" >&2
}

# Dispatch CLI (used by secrets-gpg wrapper; safe to call manually).
secrets_gpg_cli() {
  case "${1:-help}" in
  help|-h|--help)
    sed -n '1,24p' "${BASH_SOURCE[0]:-$0}"
    ;;
  decrypt)
    secrets_gpg_decrypt
    ;;
  encrypt)
    secrets_gpg_encrypt_stdin
    ;;
  edit)
    secrets_gpg_edit
    ;;
  *)
    echo "Usage: secrets_gpg_cli help|encrypt|decrypt|edit" >&2
    return 2
    ;;
  esac
}
