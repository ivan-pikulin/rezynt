# Templates

Шаблоны резюме и preview/rendering система.

## Ключевые файлы

- `frontend/src/shared/components/ResumeRenderer.tsx`
- `frontend/src/shared/components/templates/BaseTemplate.tsx`
- `frontend/src/shared/components/templates/ClarityTemplate.tsx`
- `frontend/src/shared/components/templates/SidebarTemplate.tsx`
- `frontend/src/shared/components/templates/ProfessionalTemplate.tsx`
- `frontend/src/shared/components/templates/FrameTemplate.tsx`
- `frontend/src/shared/components/templates/index.ts`
- `frontend/src/shared/hooks/useTemplate.ts`
- `frontend/src/shared/services/templateService.ts`

## Текущие шаблоны

- `clarity`
- `sidebar`
- `professional`
- `frame`

## Использование

- Builder и Export используют `ResumeRenderer` для preview.
- Export page использует выбранный template id для PDF/TXT output.
- `templateService` хранит демо-данные и конфигурацию шаблонов.

## Legacy note

- Старые упоминания `Tero`, `Nume` и других шаблонов из прежней документации больше не считаются источником истины.

*Последнее обновление: 2026-05-21*
