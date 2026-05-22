# Deployment

## Производственный поток

1. Push в `main`.
2. GitHub Actions собирает landing page.
3. Артефакты landing копируются на сервер.
4. На сервере запускается deployment script.
5. Контейнеры пересобираются через Docker Compose.
6. Nginx перезагружается.

## Сервер

- Project path: `/root/rezynt/`
- Host: `46.149.70.254`
- Access: `ssh rezynt`

## Контейнеры

- Все production containers имеют префикс `rezynt-`.
- Основные сервисы: `nginx`, `frontend`, `landing`, `backend`, `celery`, `postgres`, `redis`, `certbot`.

## Local dev

- Для локальной backend-инфраструктуры используется `docker-compose-local.yml`.
- Для полного локального hot-reload запуска используется `scripts/dev-hot.sh`.
- `scripts/dev-hot.sh` поднимает PostgreSQL и Redis через Docker, запускает FastAPI из `backend/` с `uvicorn --reload`, Vite frontend из `frontend/` с HMR и Celery worker с перезапуском при изменениях backend-файлов.
- Локальные адреса по умолчанию: frontend `http://localhost:5173`, backend API `http://localhost:8012/api/v1`, OpenAPI docs `http://localhost:8012/docs`, PostgreSQL `localhost:5432`, Redis `localhost:6379`.
- Порты можно переопределить через env: `FRONTEND_HOST_PORT`, `BACKEND_HOST_PORT`, `POSTGRES_HOST_PORT`, `REDIS_HOST_PORT`.
- Не пытайся искать production-контейнеры локально.

*Последнее обновление: 2026-05-22*
