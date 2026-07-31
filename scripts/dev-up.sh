#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/infra/compose/dev.yml"
ENV_FILE="${ROOT_DIR}/.env"
CERT_DIR="${ROOT_DIR}/infra/traefik/certs"
CERT_FILE="${CERT_DIR}/afn.localhost.pem"
KEY_FILE="${CERT_DIR}/afn.localhost-key.pem"
CERT_HOST="afn.localhost"

log() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

require_mkcert() {
  if ! command -v mkcert >/dev/null 2>&1; then
    die "mkcert is not installed. Install it (e.g. https://github.com/FiloSottile/mkcert) and re-run."
  fi
}

cert_is_valid() {
  [[ -f "${CERT_FILE}" && -f "${KEY_FILE}" ]] || return 1
  local end_date end_epoch now_epoch
  end_date="$(openssl x509 -enddate -noout -in "${CERT_FILE}" | cut -d= -f2)"
  end_epoch="$(date -d "${end_date}" +%s)"
  now_epoch="$(date +%s)"
  # Renew if expired or expiring within 24h
  (( end_epoch > now_epoch + 86400 ))
}

ensure_tls_cert() {
  require_mkcert
  mkdir -p "${CERT_DIR}"

  if cert_is_valid; then
    log "TLS cert for ${CERT_HOST} is present and valid."
    return 0
  fi

  log "Creating TLS cert for ${CERT_HOST} with mkcert..."
  # Ensure local CA is installed (may require user interaction / sudo once)
  mkcert -install >/dev/null
  mkcert \
    -cert-file "${CERT_FILE}" \
    -key-file "${KEY_FILE}" \
    "${CERT_HOST}"
  log "TLS cert written to ${CERT_DIR}"
}

[[ -f "${ENV_FILE}" ]] || die "Missing ${ENV_FILE}. Copy .env.example to .env first."

ensure_tls_cert

log "Starting compose (dev)..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up --build -d "$@"

log "Dev stack is up:"
log "  https://${CERT_HOST}          → frontend"
log "  https://${CERT_HOST}/api      → backend"
log "  https://${CERT_HOST}:5555     → prisma studio"
