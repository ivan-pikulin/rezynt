# Database

## Модели

- `User` - основная сущность приложения.
- `TempResumeFile` - временный upload storage.

## User

- Идентификация: `id`, `email`, `guest_id`, `google_sub`.
- Auth flags: `auth_provider`, `is_verified`, `is_registered`, `is_premium`.
- Onboarding: `has_completed_onboarding`, `onboarding_responses`.
- Security: `verification_token`, `verification_code`, `password_reset_token`, `password_reset_code`.
- Resume data: `resume_data` (`JSONB`).
- Analysis cache: `analysis_result` (`JSONB`), `analysis_generated_at`.
- Timestamps: `created_at`, `updated_at`.

## TempResumeFile

- Хранит `file_id`, `filename`, `file_path`, `file_size`, `content_type`.
- Имеет TTL через `expires_at` по умолчанию 24 часа.
- Может быть привязан к `user_id` после регистрации/подтверждения.

## CRUD

- Пользовательская логика: `backend/app/database/crud/crud_user.py`
- `CRUDUser.create_landing_user` создает полноценного verified-пользователя из лендинга с `auth_provider="landing"`, `has_completed_onboarding=True`, `is_premium=False`, `credits=20` и сохраненным `resume_data`, чтобы landing-concept поток сразу вел на выбор шаблона без survey/onboarding intercept.
- Временные файлы: `backend/app/database/crud/crud_temp_resume_file.py`

## Миграции

- Работать с текущей схемой через `alembic upgrade head`.
- Не пытаться восстанавливать старые доктринальные правила из устаревших спеки.

*Последнее обновление: 2026-05-23*
