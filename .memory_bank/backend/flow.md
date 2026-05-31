# Flow

## API-группы

- `POST /auth/*` - регистрация, логин, подтверждение email, reset password, refresh.
- `GET/PUT /user/me` и связанные user endpoints - профиль и onboarding.
- `GET/POST/PUT/PATCH/DELETE /resume/*` - резюме и загрузка файлов.
- `GET/POST /analysis/*` - анализ, refresh и mark-fixed.
- `POST /ai/*` - AI-assisted updates.
- `POST /payment/checkout` - YooKassa redirect payment.
- `POST /webhook/yookassa` - premium activation via webhook secret.
- `GET /health` - health check.
- `POST /test-pdf` - проверка PDF генерации.

## Upload flow

1. Клиент загружает файл в `/resume/upload`.
2. Backend сохраняет pending `analysis_result`.
3. Celery task `process_resume_upload_task` читает файл, парсит его и пишет `resume_data`.
4. Таск переводит состояние из `PARSING` в `ANALYZING`.
5. После анализа `analysis_result` и `analysis_generated_at` обновляются в `User`.

## Temp upload flow

1. Публичный upload идёт в `/resume/temp-upload`.
2. Файл сохраняется как `TempResumeFile`.
3. После привязки к пользователю вызывается `/resume/claim-temp-file`.
4. Дальше используется тот же pipeline обработки, что и у обычной загрузки.

## Analysis flow

- `GET /analysis/` сначала возвращает сохранённый `analysis_result`, если он есть.
- `POST /analysis/refresh` всегда пересчитывает анализ заново.
- `POST /analysis/mark-fixed` меняет `is_fixed` у конкретного improvement point.

## Payment flow

1. Клиент вызывает `POST /payment/checkout`.
2. Backend создаёт YooKassa payment и возвращает `confirmation_url`.
3. Клиент редиректится на YooKassa.
4. YooKassa шлёт `payment.succeeded` webhook на `/webhook/yookassa?secret=...`.
5. Backend активирует premium, генерирует новый пароль и ставит письмо в Celery.
6. YooKassa возвращает пользователя на `/payment/welcome`, где frontend refetch-ит user до `is_premium=true`.

*Последнее обновление: 2026-05-21*
