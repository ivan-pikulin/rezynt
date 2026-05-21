# Backend

Backend - FastAPI-приложение с JSONB storage для resume, Celery задачами и analysis engine.

## Основные слои

- `api/v1/endpoints/` - HTTP handlers.
- `core/` - config, security, verification и celery.
- `database/` - SQLAlchemy models, CRUD, sessions и migrations.
- `schemas/` - Pydantic request/response модели.
- `services/` - parse, email, pdf, platform, user и analysis services.

## Главная модель данных

- `User.resume_data` - единственное основное хранилище резюме.
- `User.analysis_result` и `User.analysis_generated_at` - кэш анализа.
- `TempResumeFile` - временные файлы загрузки с TTL и последующей привязкой.
- Пользовательские флаги: `guest_id`, `auth_provider`, `google_sub`, `is_verified`, `is_premium`, `is_registered`, `has_completed_onboarding`.

## Что читать по темам

- [`api.md`](./api.md)
- [`core.md`](./core.md)
- [`services.md`](./services.md)
- [`analysis.md`](./analysis.md)
- [`rules.md`](./rules.md)
- [`tasks.md`](./tasks.md)
- [`database.md`](./database.md)
- [`flow.md`](./flow.md)

## Правило актуальности

- Если поведение endpoint/task/service меняется, обновляй соответствующий Memory Bank файл.
- Не тащи устаревшие spec.xml-детали из старых документов, если код уже ушёл дальше.

*Последнее обновление: 2026-05-21*
