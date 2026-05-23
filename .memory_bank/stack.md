# Stack

## Frontend

- React 19 + TypeScript + Vite
- Material UI
- React Router
- TanStack React Query
- i18next
- Yandex Metrika
- Yarn, не npm

## Backend

- FastAPI
- SQLAlchemy + Alembic
- PostgreSQL
- Redis
- Celery
- WeasyPrint для PDF export
- docxtpl/python-docx для DOCX template prototype
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
- Для полного локального hot-reload запуска использовать `scripts/dev-hot.sh`: frontend `5173`, backend `8012`, PostgreSQL `5432`, Redis `6379` по умолчанию; занятые дефолтные порты заменяются следующими свободными.

Последнее обновление: 2026-05-23
