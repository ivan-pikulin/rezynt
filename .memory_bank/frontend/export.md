# Export

Export - экран выбора шаблона и выгрузки резюме.

## Ключевые страницы

- `frontend/src/features/export/ExportPage.tsx`
- `frontend/src/features/export/PaymentSuccessPage.tsx`

## Поведение

- Использует `useResumeQuery` и `useTemplate`.
- Для авторизованных пользователей `/export` читает единственное пользовательское резюме из backend. Для гостей страница читает локальное резюме из `guestResumeService` через guest-режим `useResumeQuery`; отдельный `resume_id` в URL не используется.
- Шапка страницы повторяет новый лендинг: использует `lc-header`, логотип `/rezynt-logo-with-name.svg`, ссылку на `/landing-concept#builder` и общие landing CSS variables из `LandingConceptTheme`.
- В шапке есть ненавязчивая back-ссылка `К редактированию`, ведущая на `/landing-concept#builder`.
- Заголовок блока выбора шаблонов хранится в `export.templateSelection.title`.
- На мобильной ширине выбор шаблона показывает один preview резюме и четыре коротких текстовых таба над ним. На `sm+` остается сетка карточек шаблонов с полными названиями.
- Внизу страницы есть одна основная кнопка `Скачать`; она ведет на `/upgrade`, где находится paywall.
- Показывает preview резюме через `ResumeRenderer`.
- Даёт выбор шаблонов через `TemplateSelectionCards`.
- TXT export идёт напрямую через backend.
- PDF export для premium users идёт через backend PDF generation.
- Non-premium users отправляются на `/upgrade`.
- Unauthenticated users открывают registration modal.
- После удачного экспорта показывается success page.

## API

- `POST /resume/export-pdf`
- `GET /resume/export-txt`

## Связанные компоненты

- `DownloadOptions`
- `PricingCard`
- `PricingTable`
- `SuccessPage`
- `UnauthenticatedExportView`

*Последнее обновление: 2026-05-21*
