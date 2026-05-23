# Deployment

Окружение и доставка приложения.

## Файлы

- `docker-compose.prod.yml` - production orchestration for the shared `personal-sara` server.
- `docker-compose.yml` - legacy standalone production orchestration.
- `docker-compose-local.yml` - локальный backend/postgres/redis стек.
- `scripts/dev-hot.sh` - полный локальный hot-reload запуск: Docker infra, FastAPI, Celery и Vite frontend.
- `.github/workflows/deploy.yml` - GitHub Actions build/push/deploy flow.
- `nginx/nginx.conf` - legacy standalone reverse proxy config.

## Важное

- Публичный домен `rezynt.ru` проксируется на `frontend` через общий Caddy в `/opt/shared-proxy`.
- `/api`, `/docs` и `/openapi.json` проксируются на `backend`.
- На сервере нельзя запускать Rezynt `nginx`/`certbot` на портах 80/443, потому что эти порты уже заняты `shared-proxy-caddy-1`.
- Production deploy должен использовать опубликованные GHCR images и `docker compose up -d --no-build`; сервер не собирает application images.
- Для локальной разработки с UI использовать `scripts/dev-hot.sh`; он выводит адреса frontend, backend API, OpenAPI docs, PostgreSQL и Redis.

Последнее обновление: 2026-05-22
