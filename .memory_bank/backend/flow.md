# Flow

## API-группы

- `POST /auth/*` - регистрация, логин, подтверждение email, reset password, refresh.
- `GET/PUT /user/me` и связанные user endpoints - профиль и onboarding.
- `GET/POST/PUT/PATCH/DELETE /resume/*` - резюме и загрузка файлов.
- `GET/POST /analysis/*` - анализ, refresh и mark-fixed.
- `POST /ai/*` - AI-assisted updates.
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

*Последнее обновление: 2026-05-21*
