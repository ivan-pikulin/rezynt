# Export

Export - экран выбора шаблона и выгрузки резюме.

## Ключевые страницы

- `frontend/src/features/export/ExportPage.tsx`
- `frontend/src/features/export/PaymentSuccessPage.tsx`

## Поведение

- Использует `useResumeQuery` и `useTemplate`.
- Для авторизованных пользователей `/export` читает единственное пользовательское резюме из backend. Для гостей страница читает локальное резюме из `guestResumeService` через guest-режим `useResumeQuery`; отдельный `resume_id` в URL не используется.
- Шапка страницы повторяет новый лендинг: использует `lc-header`, логотип `/rezynt-logo-with-name.svg` и общие landing CSS variables из `LandingConceptTheme`, без правой ссылки `Опросник`.
- В шапке есть ненавязчивая back-ссылка `К редактированию`, ведущая на `/#builder`.
- Заголовок блока выбора шаблонов хранится в `export.templateSelection.title`.
- На мобильной ширине выбор шаблона показывает один preview резюме и четыре коротких текстовых таба над ним. На `sm+` остается сетка карточек шаблонов с полными названиями.
- Внизу страницы для free/non-premium есть одна основная кнопка `Скачать`; она ведет на `/upgrade`, где находится paywall.
- Для premium users вместо paywall-кнопки показываются отдельные кнопки `Скачать PDF` и `Скачать DOCX`.
- PDF скачивание для premium users идет через backend `POST /resume/export-pdf`; DOCX скачивание идет через backend `POST /resume/export-docx`.
- Показывает preview резюме через `ResumeRenderer`.
- Даёт выбор шаблонов через `TemplateSelectionCards`.
- Yandex Metrika events:
  - `template_selected` when a template is clicked.
  - `export_download_click` when the download CTA sends the user to `/upgrade`.
  - `payment_button_click` on the `/upgrade` pay button.
  - `payment_success` on `/payment/success`.
  - `resume_export_success` when legacy direct export components complete PDF generation.
- TXT export идёт напрямую через backend.
- PDF export для premium users идёт через backend PDF generation с HTML-снимком выбранного шаблона, где frontend инлайнит computed styles в self-contained HTML перед отправкой.
- В export-режиме `ResumeRenderer` больше не центрирует шаблон как preview; контейнер отдаёт блочную раскладку, чтобы PDF не уезжал вправо.
- Non-premium users отправляются на `/upgrade`.
- Unauthenticated users открывают registration modal.
- После удачного экспорта показывается success page.

## API

- `POST /resume/export-pdf`
- `POST /resume/export-docx`
- `GET /resume/export-txt`

## Связанные компоненты

- `DownloadOptions`
- `PricingCard`
- `PricingTable`
- `SuccessPage`
- `UnauthenticatedExportView`

*Последнее обновление: 2026-06-02*
