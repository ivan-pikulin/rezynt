# API

API v1 - основной HTTP контракт backend.

## Группы endpoints

### Auth

- `POST /auth/guest`
- `POST /auth/signup`
- `POST /auth/landing-signup`
- `POST /auth/login`
- `POST /auth/google`
- `GET /auth/confirm-email`
- `POST /auth/request-password-reset`
- `POST /auth/reset-password`
- `POST /auth/confirm-email-by-code`
- `POST /auth/reset-password-by-code`
- `POST /auth/resend-verification-code`
- `POST /auth/refresh`

### User

- `GET /user/me`
- `PATCH /user/me`
- `POST /user/request-email-change-code`
- `POST /user/change-password`
- `DELETE /user/me`
- `PATCH /user/{user_id}/premium/enable`
- `PATCH /user/{user_id}/premium/disable`
- `POST /user/onboarding/complete`

### Payment

- `POST /payment/checkout`
- `POST /payment/simulate-success`
- `POST /webhook/yookassa?secret=<YOOKASSA_WEBHOOK_SECRET>`

### Resume

- `GET /resume/`
- `POST /resume/`
- `PUT /resume/`
- `DELETE /resume/`
- `POST /resume/upload`
- `POST /resume/temp-upload`
- `POST /resume/claim-temp-file`
- `GET /resume/upload/status/{task_id}`
- `POST /resume/export-pdf`
- `POST /resume/export-docx`
- `GET /resume/export-txt`

### Analysis

- `GET /analysis/`
- `POST /analysis/refresh`
- `POST /analysis/mark-fixed`

### AI

- `POST /ai/{resume_id}/update`
- `PATCH /ai/resume/{resume_id}`
- `GET /ai/resume/{resume_id}/full`
- `POST /ai/resume/{resume_id}/experience`
- `PATCH /ai/resume/{resume_id}/experience/{experience_id}`
- `POST /ai/resume/{resume_id}/education`
- `PATCH /ai/resume/{resume_id}/education/{education_id}`

### Misc

- `GET /health`
- `POST /test-pdf`

## Notes

- `confirm-email` redirects to frontend with tokens on success and error page on failure.
- `landing-signup` creates a full verified, free-tier user from the landing questionnaire resume data and returns tokens immediately. Existing emails still return conflict, and the frontend now switches to a code-confirmation modal instead of logging in by email alone.
- `confirm-email-by-code` accepts both the normal email-confirmation path and the existing-account code-login path; a valid code can authenticate an already verified account and returns JWT.
- `resend-verification-code` is fail-fast now: if Resend delivery fails, the endpoint returns `502` instead of silently claiming success.
- All email flows use Resend only, and outbound mail is sent from `team@rezynt.ru` with the API key loaded from `RESEND_API_KEY`.
- Resume upload uses Celery task ids as user-visible progress state.
- `resume/export-docx` принимает `template_slug` и optional `filename`, генерирует DOCX из сохраненного `User.resume_data` через подготовленные Word-шаблоны.
- Analysis endpoints operate on `User.analysis_result` JSONB cache.
- `payment/checkout` создаёт YooKassa redirect payment с `amount=149.00 RUB`, `capture=true` и `metadata.user_id`, а ответ возвращает `confirmation_url` для редиректа пользователя. YooKassa response validation treats `confirmation.return_url` as optional.
- `payment/simulate-success` оставлен как локальный/QA shortcut и активирует `is_premium` тем же сервисом, что webhook; response включает `email_queued`.
- YooKassa webhook обрабатывает только `payment.succeeded`, берет `user_id` из metadata, проверяет query-secret из env и активирует premium без сброса текущей авторизации; письмо с доступом уходит через Celery.
- Refresh tokens теперь содержат `exp` и живут по `REFRESH_TOKEN_EXPIRE_MINUTES` (по умолчанию 7 дней).

*Последнее обновление: 2026-06-01*
