# Backend

FastAPI API в `backend/app/`.

## Основные зоны

- `api/v1/endpoints` - auth, user, resume, analysis.
- `database/models` - SQLAlchemy модели.
- `database/crud` - операции доступа к данным.
- `database/migrations` - Alembic migrations.
- `core` - config, security, celery, tasks.
- `services` - бизнес-логика, включая PDF и analysis.

## Важное

- Локальная БД может требовать bootstrap схемы перед применением текущих миграций.
- Resume upload и temp-upload обслуживают разные сценарии:
  - authenticated upload для зарегистрированных пользователей
  - temp upload для landing/onboarding flow

Последнее обновление: 2026-05-21
