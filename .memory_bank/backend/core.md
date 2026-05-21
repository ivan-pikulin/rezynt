# Core

Core содержит settings, security, verification и celery integration.

## Config

- Settings читаются из `.env`.
- `API_V1_STR = /api/v1`.
- `CORS_ORIGINS` включает production domains и local dev.
- Есть отдельные settings для email, redis и OpenAI.
- Хранятся `PLATFORM_*` keys и `TEMP_UPLOAD_DIR`.

## Security

- JWT access token и refresh token.
- `bcrypt` password hashing.
- `guest_id` и `is_registered` зашиваются в токены.
- `create_access_token`, `create_refresh_token`, `verify_refresh_token`, `verify_password`, `get_password_hash`.

## Verification

- Email confirmation token/code flows.
- Password reset token/code flows.
- Email change code flow для смены email.

## Celery

- `celery_app.py` - app bootstrap.
- `tasks.py` - email tasks, onboarding notification, resume upload processing.
- Fail-fast policy: task errors должны быть видимы и не скрываться silent fallback-ом.

*Последнее обновление: 2026-05-21*
