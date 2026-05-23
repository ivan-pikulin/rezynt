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
- `landing-signup` creates a full verified, free-tier user from the landing questionnaire resume data and returns tokens immediately. Existing emails return conflict instead of logging in by email alone.
- Resume upload uses Celery task ids as user-visible progress state.
- `resume/export-docx` принимает `template_slug` и optional `filename`, генерирует DOCX из сохраненного `User.resume_data` через подготовленные Word-шаблоны.
- Analysis endpoints operate on `User.analysis_result` JSONB cache.

*Последнее обновление: 2026-05-21*
