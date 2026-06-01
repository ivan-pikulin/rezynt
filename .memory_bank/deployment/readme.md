# Deployment

Окружение и доставка приложения.

## Файлы

- `docker-compose.prod.yml` - production orchestration for the shared `personal-sara` server.
- `docker-compose.yml` - legacy standalone production orchestration.
- `docker-compose-local.yml` - локальный backend/postgres/redis стек.
- `scripts/dev-hot.sh` - полный локальный hot-reload запуск: Docker infra, Dockerized FastAPI/Celery и Vite frontend.
- `.github/workflows/deploy.yml` - GitHub Actions build/push/deploy flow.
- `nginx/nginx.conf` - legacy standalone reverse proxy config.

## Важное

- Публичные домены `rezynt.ru`, `www.rezynt.ru`, `rezynt.com` и `www.rezynt.com` проксируются на `frontend` через общий Caddy в `/opt/shared-proxy`.
- `/api`, `/docs` и `/openapi.json` проксируются на `backend`.
- На сервере нельзя запускать Rezynt `nginx`/`certbot` на портах 80/443, потому что эти порты уже заняты `shared-proxy-caddy-1`.
- Production deploy должен использовать опубликованные GHCR images и `docker compose up -d --no-build`; сервер не собирает application images.
- `PROD_ENV` must already contain all runtime values, including `YOOKASSA_*`, `RESEND_API_KEY`, database, OpenAI and platform settings.
- Production email runtime использует только `RESEND_API_KEY`. Все письма отправляются через Resend HTTPS API от имени `team@rezynt.ru`; legacy email env больше не используются.
- Для локальной разработки с UI использовать `scripts/dev-hot.sh`; он выводит фактические адреса frontend, backend API, OpenAPI docs, PostgreSQL и Redis, включая автоматически выбранные порты при локальных конфликтах.

Последнее обновление: 2026-06-01
