#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/infra/compose/dev.yml"
ENV_FILE="${ROOT_DIR}/.env"

log() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

[[ -f "${ENV_FILE}" ]] || die "Missing ${ENV_FILE}."

log "Stopping compose (dev)..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" down "$@"

log "Dev stack stopped."
