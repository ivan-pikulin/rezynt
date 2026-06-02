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

- Отправляет HTML emails через Resend HTTPS API.
- В пользовательских письмах используется бренд `Резинт`.
- Используется для confirmation, password reset и onboarding notification.
- API key берётся только из `RESEND_API_KEY`.
- Отправитель фиксирован: `team@rezynt.ru`.
- Никаких legacy provider режимов больше нет; при ошибке отправка падает fail-fast и поднимает исключение.
- После успешной оплаты отправляет письмо с логином (email) и сгенерированным паролем, не разлогинивая текущую сессию.

## PaymentService

- Создаёт YooKassa redirect payment через HTTP API и активирует платный доступ для mock-payment endpoint и YooKassa webhook.
- `payment/checkout` возвращает `confirmation_url`, а `payment/welcome` используется как `return_url`; входящий ответ YooKassa не обязан повторять `return_url` внутри `confirmation`.
- Для успешной оплаты выставляет `is_premium=True`, `is_verified=True`, `is_registered=True`, генерирует новый пароль, сохраняет hash и отправляет письмо с доступом.
- Premium-доступ коммитится до отправки письма; письмо ставится в Celery через `send_paid_access_email_task`, поэтому payment response не блокируется на email delivery.
- Повторный вызов для уже premium пользователя с паролем считается идемпотентным no-op.

## PlatformChatflow

- Интеграция с внешней platform API.
- Поддержка blocking и streaming mode.
- Используется для chat/history flows и conversation management.

## PdfService

- Backend PDF generation.
- WeasyPrint-based rendering и watermark support.
- HTML export получает `FRONTEND_BASE_URL` как `base_url`, чтобы относительные `/assets/...` ссылки из frontend HTML не ломали генерацию.
- Frontend now sends a self-contained HTML snapshot with computed styles inlined, so WeasyPrint receives the actual template layout rather than relying on Emotion-generated CSS in the page.
- FileResponse оставляет Starlette сформировать `Content-Disposition`, потому что имена файлов могут содержать UTF-8.

## DOCXService

- Backend DOCX generation for `POST /resume/export-docx`.
- Uses prepared `docxtpl` Word templates from `backend/app/templates/docx/`.
- Builds the same resume context as the DOCX prototype generator: contact lines, skill pairs, formatted dates, company/location rows and education rows.
- Generates the Professional template monogram as a temporary PNG image before rendering, then deletes it after packaging the DOCX.
- FileResponse оставляет Starlette сформировать `Content-Disposition`, потому что имена файлов могут содержать UTF-8.

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

*Последнее обновление: 2026-06-02*
