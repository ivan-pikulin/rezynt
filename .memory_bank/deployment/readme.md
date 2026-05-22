# Deployment

Окружение и доставка приложения.

## Файлы

- `docker-compose.yml` - production orchestration.
- `docker-compose-local.yml` - локальный backend/postgres/redis стек.
- `scripts/dev-hot.sh` - полный локальный hot-reload запуск: Docker infra, FastAPI, Celery и Vite frontend.
- `nginx/nginx.conf` - reverse proxy и SSL routing.
- `.github/workflows/deploy.yml` - GitHub Actions deploy flow.

## Важное

- Публичный домен `rezynt.com` проксируется на `frontend`.
- `app.rezynt.com` остаётся app-ориентированным SPA и API маршрутом.
- Отдельного landing service больше нет.
- Для локальной разработки с UI использовать `scripts/dev-hot.sh`; он выводит адреса frontend, backend API, OpenAPI docs, PostgreSQL и Redis.

Последнее обновление: 2026-05-22
