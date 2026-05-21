# Stack

## Frontend

- React 19 + TypeScript + Vite
- Material UI
- React Router
- TanStack React Query
- i18next
- Yarn, не npm

## Backend

- FastAPI
- SQLAlchemy + Alembic
- PostgreSQL
- Redis
- Celery
- uv для Python-пакетов

## Deployment

- Docker Compose
- Nginx
- GitHub Actions deploy
- Публичный сайт идёт через `frontend`, а не через отдельный landing-сервис

## Репозиторные правила

- Не запускать production build без необходимости.
- Не добавлять отдельный `landing/` проект обратно.
- Для локальной разработки помнить про API proxy в Vite и порт backend.

Последнее обновление: 2026-05-21
