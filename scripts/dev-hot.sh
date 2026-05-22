#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
COMPOSE_FILE="$ROOT_DIR/docker-compose-local.yml"
ENV_FILE="$ROOT_DIR/.env"

FRONTEND_HOST="${FRONTEND_HOST:-0.0.0.0}"
FRONTEND_HOST_PORT="${FRONTEND_HOST_PORT:-5173}"
BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
BACKEND_HOST_PORT="${BACKEND_HOST_PORT:-8012}"
POSTGRES_HOST_PORT="${POSTGRES_HOST_PORT:-5432}"
REDIS_HOST_PORT="${REDIS_HOST_PORT:-6379}"
STOP_INFRA_ON_EXIT="${STOP_INFRA_ON_EXIT:-1}"

PIDS=()
CELERY_STAMP=""

usage() {
  cat <<EOF
Usage: $(basename "$0")

Starts the local hot-reload stack:
  - PostgreSQL and Redis in Docker
  - FastAPI from ./backend with uvicorn --reload
  - Celery worker with restart-on-backend-code-change
  - Vite frontend from ./frontend with HMR

Optional environment overrides:
  FRONTEND_HOST_PORT=5173
  BACKEND_HOST_PORT=8012
  POSTGRES_HOST_PORT=5432
  REDIS_HOST_PORT=6379
  STOP_INFRA_ON_EXIT=1
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

cleanup() {
  local status=$?

  trap - EXIT INT TERM

  if [[ ${#PIDS[@]} -gt 0 ]]; then
    echo
    echo "Stopping local dev processes..."
    for pid in "${PIDS[@]}"; do
      if kill -0 "$pid" >/dev/null 2>&1; then
        kill "$pid" >/dev/null 2>&1 || true
      fi
    done
    wait "${PIDS[@]}" >/dev/null 2>&1 || true
  fi

  if [[ -n "$CELERY_STAMP" && -f "$CELERY_STAMP" ]]; then
    rm -f "$CELERY_STAMP"
  fi

  if [[ "$STOP_INFRA_ON_EXIT" == "1" ]]; then
    echo "Stopping Docker infra services..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" stop postgres redis >/dev/null 2>&1 || true
  fi

  exit "$status"
}

trap cleanup EXIT INT TERM

require_command docker
require_command uv
require_command yarn

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Create it from .env.example before starting local dev." >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Missing $COMPOSE_FILE." >&2
  exit 1
fi

load_env_file() {
  local line key value

  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" != *"="* ]] && continue

    key="${line%%=*}"
    value="${line#*=}"
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"

    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    [[ -n "${!key+x}" ]] && continue

    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "$key=$value"
  done < "$ENV_FILE"
}

load_env_file

export POSTGRES_HOST_PORT REDIS_HOST_PORT

export POSTGRES_HOST="127.0.0.1"
export POSTGRES_PORT="$POSTGRES_HOST_PORT"
export REDIS_HOST="127.0.0.1"
export REDIS_PORT="$REDIS_HOST_PORT"
export FRONTEND_BASE_URL="http://localhost:$FRONTEND_HOST_PORT"
export API_BASE_URL="http://localhost:$BACKEND_HOST_PORT"
export VITE_API_URL="$API_BASE_URL"
export TEMP_UPLOAD_DIR="$BACKEND_DIR/temp_uploads"
export PYTHONPATH="$BACKEND_DIR${PYTHONPATH:+:$PYTHONPATH}"

mkdir -p "$TEMP_UPLOAD_DIR"

echo "Starting Docker infra services..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres redis

wait_for_container_health() {
  local service="$1"
  local timeout_seconds="$2"
  local elapsed=0
  local container_id
  local health_status

  container_id="$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps -q "$service")"
  if [[ -z "$container_id" ]]; then
    echo "Docker service did not start: $service" >&2
    exit 1
  fi

  while (( elapsed < timeout_seconds )); do
    health_status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container_id")"
    if [[ "$health_status" == "healthy" || "$health_status" == "none" ]]; then
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done

  echo "Timed out waiting for $service to become healthy. Last status: $health_status" >&2
  exit 1
}

wait_for_container_health postgres 60
wait_for_container_health redis 30

echo "Installing backend dependencies if needed..."
(
  cd "$BACKEND_DIR"
  uv sync --frozen
)

echo "Applying local database migrations..."
(
  cd "$ROOT_DIR"
  "$BACKEND_DIR/.venv/bin/alembic" -c "$BACKEND_DIR/app/database/migrations/alembic.ini" upgrade head
)

echo "Installing frontend dependencies if needed..."
(
  cd "$FRONTEND_DIR"
  yarn install --frozen-lockfile
)

start_backend() {
  (
    cd "$ROOT_DIR"
    exec "$BACKEND_DIR/.venv/bin/uvicorn" app.main:app \
      --host "$BACKEND_HOST" \
      --port "$BACKEND_HOST_PORT" \
      --reload \
      --reload-dir "$BACKEND_DIR/app" \
      --log-level debug
  ) &
  PIDS+=("$!")
}

start_frontend() {
  (
    cd "$FRONTEND_DIR"
    exec yarn dev --host "$FRONTEND_HOST" --port "$FRONTEND_HOST_PORT"
  ) &
  PIDS+=("$!")
}

backend_changed_since_stamp() {
  find "$BACKEND_DIR/app" -type f \
    \( -name '*.py' -o -name '*.json' -o -name '*.html' -o -name '*.j2' -o -name '*.jinja2' \) \
    -newer "$CELERY_STAMP" -print -quit | grep -q .
}

run_celery_with_reload() {
  local child_pid=""
  local restarting=0

  trap 'if [[ -n "$child_pid" ]] && kill -0 "$child_pid" >/dev/null 2>&1; then kill "$child_pid" >/dev/null 2>&1 || true; wait "$child_pid" >/dev/null 2>&1 || true; fi; exit 0' TERM INT

  touch "$CELERY_STAMP"

  while true; do
    (
      cd "$ROOT_DIR"
      exec "$BACKEND_DIR/.venv/bin/celery" -A app.core.celery_app worker \
        --loglevel=info \
        --concurrency=1 \
        --prefetch-multiplier=1 \
        --max-memory-per-child=500000
    ) &
    child_pid="$!"
    restarting=0

    while kill -0 "$child_pid" >/dev/null 2>&1; do
      sleep 2
      if backend_changed_since_stamp; then
        echo "Backend code changed; restarting Celery worker..."
        touch "$CELERY_STAMP"
        restarting=1
        kill "$child_pid" >/dev/null 2>&1 || true
        wait "$child_pid" >/dev/null 2>&1 || true
        break
      fi
    done

    if [[ "$restarting" != "1" ]]; then
      wait "$child_pid"
      exit $?
    fi
  done
}

start_celery() {
  CELERY_STAMP="$(mktemp -t rezynt-celery-watch.XXXXXX)"
  run_celery_with_reload &
  PIDS+=("$!")
}

print_addresses() {
  cat <<EOF

Local hot-reload stack is starting.

UI:
  Main app and landing:     http://localhost:$FRONTEND_HOST_PORT/
  Resume flow:              http://localhost:$FRONTEND_HOST_PORT/start
  Builder:                  http://localhost:$FRONTEND_HOST_PORT/builder
  Landing concept:          http://localhost:$FRONTEND_HOST_PORT/landing-concept

Backend:
  API base:                 http://localhost:$BACKEND_HOST_PORT/api/v1
  Health:                   http://localhost:$BACKEND_HOST_PORT/api/v1/health
  OpenAPI docs:             http://localhost:$BACKEND_HOST_PORT/docs

Infra:
  PostgreSQL:               localhost:$POSTGRES_HOST_PORT
  Redis:                    localhost:$REDIS_HOST_PORT

Reload behavior:
  Frontend: Vite HMR
  Backend API: uvicorn --reload
  Celery: worker restart on backend file changes

Press Ctrl-C to stop. Set STOP_INFRA_ON_EXIT=0 to keep PostgreSQL and Redis running.

EOF
}

start_backend
start_celery
start_frontend
print_addresses

while true; do
  for pid in "${PIDS[@]}"; do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      wait "$pid"
      exit $?
    fi
  done
  sleep 2
done
