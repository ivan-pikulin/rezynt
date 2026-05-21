# Services

Слой services содержит прикладную бизнес-логику backend.

## ParseService

- Парсит загруженные резюме через `markitdown` и OpenAI Structured Outputs.
- Работает синхронно для совместимости с Celery pipeline.
- Лимиты: до 10MB на файл и до 50000 символов текста.

## UserService

- Signup, authentication, email confirmation.
- Google login.
- Password reset / email change flows.
- Вся логика сосредоточена в сервисе, а endpoint-ы только валидируют и вызывают его.

## EmailService

- Отправляет HTML emails с DKIM signature.
- Используется для confirmation, password reset и onboarding notification.

## PlatformChatflow

- Интеграция с внешней platform API.
- Поддержка blocking и streaming mode.
- Используется для chat/history flows и conversation management.

## PdfService

- Backend PDF generation.
- WeasyPrint-based rendering и watermark support.

## Analysis package

- Отдельный пакет `backend/app/services/analysis/` содержит analysis engine, scoring, config и rule loader.
- Подробности по правилам - в [`rules.md`](./rules.md).

*Последнее обновление: 2026-05-21*
