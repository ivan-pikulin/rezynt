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
- В пользовательских письмах используется бренд `Резинт`.
- Используется для confirmation, password reset и onboarding notification.
- После успешной оплаты отправляет письмо с логином (email) и сгенерированным паролем, не разлогинивая текущую сессию.

## PaymentService

- Единая активация платного доступа для mock-payment endpoint и YooKassa webhook.
- Для успешной оплаты выставляет `is_premium=True`, `is_verified=True`, `is_registered=True`, генерирует новый пароль, сохраняет hash и отправляет письмо с доступом.
- Повторный вызов для уже premium пользователя с паролем считается идемпотентным no-op.

## PlatformChatflow

- Интеграция с внешней platform API.
- Поддержка blocking и streaming mode.
- Используется для chat/history flows и conversation management.

## PdfService

- Backend PDF generation.
- WeasyPrint-based rendering и watermark support.

## DOCXService

- Backend DOCX generation for `POST /resume/export-docx`.
- Uses prepared `docxtpl` Word templates from `backend/app/templates/docx/`.
- Builds the same resume context as the DOCX prototype generator: contact lines, skill pairs, formatted dates, company/location rows and education rows.
- Generates the Professional template monogram as a temporary PNG image before rendering, then deletes it after packaging the DOCX.

## DOCX export prototype

- Первый DOCX-прототип использует `docxtpl`/`python-docx`.
- Базовые шаблоны: `backend/app/templates/docx/clarity.docx`, `backend/app/templates/docx/sidebar.docx`, `backend/app/templates/docx/professional.docx`, `backend/app/templates/docx/frame.docx`.
- `professional.docx` использует image placeholder для монограммы, потому что Word/LibreOffice нестабильно рендерят диагональные границы ячеек.
- Одноразовый генератор артефактов для проверки: `scripts/generate_clarity_resume_prototype.py`.
- Пример заполненного DOCX/PDF лежит в `artifacts/resume_export/`.
- Полноценный backend endpoint реализован через `DOCXService`; прототипный генератор остается QA-инструментом для настройки шаблонов.

## Analysis package

- Отдельный пакет `backend/app/services/analysis/` содержит analysis engine, scoring, config и rule loader.
- Подробности по правилам - в [`rules.md`](./rules.md).

*Последнее обновление: 2026-05-23*
