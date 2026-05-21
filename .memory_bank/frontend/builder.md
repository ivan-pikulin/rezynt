# Builder

Builder - пошаговый editor для ручного заполнения резюме.

## Ключевые страницы

- `frontend/src/features/builder/BuilderPage.tsx`

## Шаги

1. `contact-info`
2. `work-experience`
3. `education`
4. `skills`
5. `summary`

## Поведение

- Состояние управляется через `useBuilder`.
- Данные сохраняются локально в `builderStorageService`.
- Header получает `customSteps` и работает как stepper для 5 шагов.
- На финальном шаге данные сохраняются в backend через `resumeApi.updateResume`.
- После успешного сохранения builder очищает local state и переводит пользователя на `/refine` или `/onboarding?redirect=/refine`.
- Есть desktop preview через `ResumeRenderer`.

## Связанные файлы

- `frontend/src/features/builder/hooks/useBuilder.ts`
- `frontend/src/features/builder/services/builderStorageService.ts`
- `frontend/src/features/builder/types/builder.ts`
- `frontend/src/features/builder/components/*`

*Последнее обновление: 2026-05-21*
