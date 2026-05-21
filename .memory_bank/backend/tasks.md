# Tasks

Celery используется для email, onboarding notification и обработки uploaded resume.

## Таски

- `send_confirmation_email_task`
- `send_password_reset_email_task`
- `send_onboarding_notification_task`
- `process_resume_upload_task`

## Process resume upload

- Таск привязан (`bind=True`) и обновляет собственный state.
- Используются состояния `PARSING` и `ANALYZING`.
- Файл сначала пишется в system temp dir, потом парсится через `ParseService`.
- После парсинга обновляется `User.resume_data`.
- После анализа обновляются `User.analysis_result` и `User.analysis_generated_at`.
- Временный файл удаляется после успешного завершения.

## Source files

- `backend/app/core/tasks.py`
- `backend/app/services/parse_service.py`
- `backend/app/services/email_service.py`

## Что важно для агентов

- Не предполагай, что task state хранится отдельно от Celery.
- Не добавляй silent fallback, если задача ломается: ошибки должны быть видимы в логах и в результате задачи.

*Последнее обновление: 2026-05-21*
