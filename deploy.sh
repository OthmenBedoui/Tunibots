#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

log() {
  printf '[deploy] %s\n' "$1"
}

if ! command -v docker >/dev/null 2>&1; then
  log "Docker n'est pas installe ou n'est pas dans le PATH."
  exit 1
fi

if [ ! -f ".env" ]; then
  log "Fichier .env introuvable dans $PROJECT_DIR."
  exit 1
fi

required_vars=(
  APP_PORT
  POSTGRES_DB
  POSTGRES_USER
  POSTGRES_PASSWORD
  JWT_SECRET
  DEFAULT_ADMIN_EMAIL
  DEFAULT_ADMIN_PASSWORD
  DEFAULT_AGENT_EMAIL
  DEFAULT_AGENT_PASSWORD
)

for var_name in "${required_vars[@]}"; do
  if ! grep -Eq "^${var_name}=.+" .env; then
    log "Variable manquante ou vide dans .env: ${var_name}"
    exit 1
  fi
done

DOCKER_CMD=(docker compose)
if ! docker compose version >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    DOCKER_CMD=(docker-compose)
  else
    log "Ni 'docker compose' ni 'docker-compose' n'est disponible."
    exit 1
  fi
fi

if ! "${DOCKER_CMD[@]}" ps >/dev/null 2>&1; then
  if command -v sudo >/dev/null 2>&1; then
    DOCKER_CMD=(sudo "${DOCKER_CMD[@]}")
  else
    log "Impossible d'acceder a Docker avec l'utilisateur courant."
    exit 1
  fi
fi

log "Verification de la configuration Docker..."
"${DOCKER_CMD[@]}" config >/dev/null

log "Rebuild et redemarrage des conteneurs..."
"${DOCKER_CMD[@]}" up -d --build

log "Application des migrations Prisma..."
"${DOCKER_CMD[@]}" exec -T app sh -lc '
  if [ -z "${DATABASE_URL:-}" ]; then
    ENCODED_USER="$(node -p "encodeURIComponent(process.argv[1])" "$POSTGRES_USER")"
    ENCODED_PASSWORD="$(node -p "encodeURIComponent(process.argv[1])" "$POSTGRES_PASSWORD")"
    ENCODED_DB="$(node -p "encodeURIComponent(process.argv[1])" "$POSTGRES_DB")"
    export DATABASE_URL="postgresql://${ENCODED_USER}:${ENCODED_PASSWORD}@db:5432/${ENCODED_DB}"
  fi
  npx prisma migrate deploy --schema server/schema.prisma
'

log "Etat des services:"
"${DOCKER_CMD[@]}" ps

sleep 3

log "Derniers logs de l'application:"
"${DOCKER_CMD[@]}" logs --tail=60 app

log "Deploiement termine."
