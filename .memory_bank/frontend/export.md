# Export

Export - экран выбора шаблона и выгрузки резюме.

## Ключевые страницы

- `frontend/src/features/export/ExportPage.tsx`
- `frontend/src/features/export/PaymentSuccessPage.tsx`

## Поведение

- Использует `useResumeQuery` и `useTemplate`.
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
