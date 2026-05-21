# Deployment

Окружение и доставка приложения.

## Файлы

- `docker-compose.yml` - production orchestration.
- `docker-compose-local.yml` - локальный backend/postgres/redis стек.
- `nginx/nginx.conf` - reverse proxy и SSL routing.
- `.github/workflows/deploy.yml` - GitHub Actions deploy flow.

## Важное

- Публичный домен `rezynt.com` проксируется на `frontend`.
- `app.rezynt.com` остаётся app-ориентированным SPA и API маршрутом.
- Отдельного landing service больше нет.

Последнее обновление: 2026-05-21
