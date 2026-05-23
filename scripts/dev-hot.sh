#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
COMPOSE_FILE="$ROOT_DIR/docker-compose-local.yml"
ENV_FILE="$ROOT_DIR/.env"

FRONTEND_HOST_PORT_SHELL_PROVIDED="${FRONTEND_HOST_PORT+x}"
BACKEND_HOST_PORT_SHELL_PROVIDED="${BACKEND_HOST_PORT+x}"
POSTGRES_HOST_PORT_SHELL_PROVIDED="${POSTGRES_HOST_PORT+x}"
REDIS_HOST_PORT_SHELL_PROVIDED="${REDIS_HOST_PORT+x}"

FRONTEND_HOST="${FRONTEND_HOST:-0.0.0.0}"
FRONTEND_HOST_PORT="${FRONTEND_HOST_PORT:-5173}"
BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
BACKEND_HOST_PORT="${BACKEND_HOST_PORT:-8012}"
POSTGRES_HOST_PORT="${POSTGRES_HOST_PORT:-5432}"
REDIS_HOST_PORT="${REDIS_HOST_PORT:-6379}"
STOP_INFRA_ON_EXIT="${STOP_INFRA_ON_EXIT:-1}"

PIDS=()
CELERY_STAMP=""
INFRA_STARTED=0
YARN_CMD=()

usage() {
  cat <<EOF
Usage: $(basename "$0")

Starts the local hot-reload stack:
  - PostgreSQL and Redis in Docker
  - FastAPI in Docker with ./backend/app mounted and uvicorn --reload
  - Celery worker in Docker with restart-on-backend-code-change
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

  if [[ "$INFRA_STARTED" == "1" ]]; then
    echo "Stopping Docker dev services..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" stop backend celery >/dev/null 2>&1 || true
    if [[ "$STOP_INFRA_ON_EXIT" == "1" ]]; then
      docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" stop postgres redis >/dev/null 2>&1 || true
    fi
  fi

  exit "$status"
}

trap cleanup EXIT INT TERM

require_command docker
require_command lsof

if command -v yarn >/dev/null 2>&1; then
  YARN_CMD=(yarn)
elif command -v corepack >/dev/null 2>&1; then
  YARN_CMD=(corepack yarn)
else
  echo "Missing required command: yarn. Install Yarn or use a Node.js version with Corepack." >&2
  exit 1
fi

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

port_in_use() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

find_available_port() {
  local port="$1"

  while port_in_use "$port"; do
    port=$((port + 1))
  done

  echo "$port"
}

resolve_local_port() {
  local var_name="$1"
  local default_port="$2"
  local shell_provided="$3"
  local current_port="${!var_name:-$default_port}"
  local next_port

  if port_in_use "$current_port"; then
    if [[ -n "$shell_provided" ]]; then
      echo "$var_name=$current_port is already in use. Choose another port explicitly." >&2
      exit 1
    fi

    next_port="$(find_available_port "$((current_port + 1))")"
    echo "$var_name=$current_port is already in use; using $next_port instead."
    current_port="$next_port"
  fi

  export "$var_name=$current_port"
}

resolve_local_port "FRONTEND_HOST_PORT" "5173" "$FRONTEND_HOST_PORT_SHELL_PROVIDED"
resolve_local_port "BACKEND_HOST_PORT" "8012" "$BACKEND_HOST_PORT_SHELL_PROVIDED"
resolve_local_port "POSTGRES_HOST_PORT" "5432" "$POSTGRES_HOST_PORT_SHELL_PROVIDED"
resolve_local_port "REDIS_HOST_PORT" "6379" "$REDIS_HOST_PORT_SHELL_PROVIDED"

export FRONTEND_HOST_PORT BACKEND_HOST_PORT POSTGRES_HOST_PORT REDIS_HOST_PORT

export FRONTEND_BASE_URL="http://localhost:$FRONTEND_HOST_PORT"
export API_BASE_URL="http://localhost:$BACKEND_HOST_PORT"
export VITE_API_URL="$API_BASE_URL"
export TEMP_UPLOAD_DIR="$BACKEND_DIR/temp_uploads"
export EMAIL_HOST="${EMAIL_HOST:-localhost}"
export EMAIL_PORT="${EMAIL_PORT:-1025}"
export EMAIL_USERNAME="${EMAIL_USERNAME:-local-dev@rezynt.local}"
export EMAIL_DKIM_PRIVATE_KEY_PATH="${EMAIL_DKIM_PRIVATE_KEY_PATH:-$TEMP_UPLOAD_DIR/local-dkim-key.private}"
export PYTHONPATH="$BACKEND_DIR${PYTHONPATH:+:$PYTHONPATH}"

mkdir -p "$TEMP_UPLOAD_DIR" "$(dirname "$EMAIL_DKIM_PRIVATE_KEY_PATH")"
touch "$EMAIL_DKIM_PRIVATE_KEY_PATH"

echo "Starting Docker dev services..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build postgres redis backend celery
INFRA_STARTED=1

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

echo "Installing frontend dependencies if needed..."
(
  cd "$FRONTEND_DIR"
  "${YARN_CMD[@]}" install --frozen-lockfile
)

start_frontend() {
  (
    cd "$FRONTEND_DIR"
    exec "${YARN_CMD[@]}" dev --host "$FRONTEND_HOST" --port "$FRONTEND_HOST_PORT" --strictPort
  ) &
  PIDS+=("$!")
}

stream_backend_logs() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f backend celery &
  PIDS+=("$!")
}

backend_changed_since_stamp() {
  find "$BACKEND_DIR/app" -type f \
    \( -name '*.py' -o -name '*.json' -o -name '*.html' -o -name '*.j2' -o -name '*.jinja2' \) \
    -newer "$CELERY_STAMP" -print -quit | grep -q .
}

restart_celery_on_backend_changes() {
  touch "$CELERY_STAMP"

  while true; do
    sleep 2
    if backend_changed_since_stamp; then
      echo "Backend code changed; restarting Celery worker..."
      touch "$CELERY_STAMP"
      docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart celery
    fi
  done
}

start_celery() {
  CELERY_STAMP="$(mktemp -t rezynt-celery-watch.XXXXXX)"
  restart_celery_on_backend_changes &
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
  Backend API: Dockerized uvicorn --reload
  Celery: Dockerized worker restart on backend file changes

Press Ctrl-C to stop. Set STOP_INFRA_ON_EXIT=0 to keep PostgreSQL and Redis running.

EOF
}

stream_backend_logs
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
