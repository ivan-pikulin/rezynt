# Deployment

## Производственный поток

1. Push в `main` или ручной запуск `workflow_dispatch`.
2. GitHub Actions собирает `rezynt-backend` и `rezynt-frontend` на GitHub-hosted runner.
3. Images публикуются в GHCR с тегами `${GITHUB_SHA}` и `main`.
4. GitHub Actions подключается к серверу по SSH.
5. Сервер обновляет checkout в `/opt/rezynt`, тянет опубликованные images и запускает `docker compose up -d --no-build`.
6. Общий Caddy из `/opt/shared-proxy` получает managed block для `rezynt.ru` и проксирует трафик к контейнерам Rezynt.

## Сервер

- Project path: `/opt/rezynt/`
- Shared proxy path: `/opt/shared-proxy/`
- Host: `46.149.70.254`
- Access: `ssh personal-sara`
- Existing app on the same server: `sarahelp.ru`

## Контейнеры

- Все production containers имеют префикс `rezynt-`.
- Основные сервисы: `frontend`, `backend`, `celery`, `postgres`, `redis`.
- Rezynt больше не поднимает собственные `nginx`/`certbot` на 80/443; публичные порты принадлежат `shared-proxy-caddy-1`.
- `frontend` и `backend` подключаются к external network `sara-help_default` с aliases `rezynt-frontend` и `rezynt-backend`.
- Alembic `versions/` хранится в persistent volume; baked migrations из image копируются туда перед `migrate.sh`, чтобы первый старт не скрывал `alembic.ini`.

## GitHub Actions

- Workflow: `.github/workflows/deploy.yml`.
- Runtime env хранится в GitHub secret `PROD_ENV`.
- Server SSH uses secrets `DEPLOY_HOST`, `DEPLOY_USER`, `SSH_PRIVATE_KEY`.
- Frontend build inputs use repository variables for non-sensitive values and `VITE_GOOGLE_CLIENT_ID` secret for Google OAuth client ID.
- Сервер использует read-only deploy key alias `github.com-rezynt` для checkout репозитория.
- Shared proxy source files live in the `sara-help` repo under `shared-proxy/`; Rezynt workflow only updates the Rezynt managed block in `/opt/shared-proxy/Caddyfile`.

## Local dev

- Для локальной backend-инфраструктуры используется `docker-compose-local.yml`.
- Для полного локального hot-reload запуска используется `scripts/dev-hot.sh`.
- `scripts/dev-hot.sh` поднимает PostgreSQL, Redis, FastAPI backend и Celery через Docker, монтирует `backend/app` для `uvicorn --reload`, запускает Vite frontend из `frontend/` с HMR и перезапускает Celery worker при изменениях backend-файлов.
- Локальные адреса по умолчанию: frontend `http://localhost:5173`, backend API `http://localhost:8012/api/v1`, OpenAPI docs `http://localhost:8012/docs`, PostgreSQL `localhost:5432`, Redis `localhost:6379`.
- Если дефолтный порт занят, `scripts/dev-hot.sh` выбирает следующий свободный порт и печатает фактические адреса. Явно заданные через shell env порты fail-fast падают при конфликте.
- Порты можно переопределить через env: `FRONTEND_HOST_PORT`, `BACKEND_HOST_PORT`, `POSTGRES_HOST_PORT`, `REDIS_HOST_PORT`.
- Не пытайся искать production-контейнеры локально.

*Последнее обновление: 2026-05-23*
