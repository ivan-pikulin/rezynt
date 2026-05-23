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
- The Next button label is derived from localized `builder.steps.*` labels instead of the hardcoded `BUILDER_STEPS.label` values.
- In Russian UI, the `summary` step is shown as `Саммари`.
- На финальном шаге данные сохраняются в backend через `resumeApi.updateResume`.
- После успешного сохранения builder очищает local state и переводит пользователя на `/refine` или `/onboarding?redirect=/refine`.
- Есть desktop preview через `ResumeRenderer`.
- Russian locale placeholders use Russian examples for contact info, work experience, and education. Avoid US-specific placeholder examples such as Google, San Francisco, United States, Stanford, or +1 phone formats in the Russian UI.
- The contact phone field auto-formats Russian numbers while typing: leading `8` becomes `+7`, leading `7` is preserved as the country code, and any other leading digit gets `+7` prepended. Russian digits are displayed as `+7 (985) 279-91-76`.
- Contact location fields in Russian UI are labeled `Город` and `Страна`; do not use US-market labels like state/territory or city/suburb.
- Delete icon controls in repeatable builder sections use fixed circular dimensions from `shared/design/iconButtonStyles.ts`, so they stay round next to textareas and other stretched flex content.
- Professional advice blocks in builder steps use `ProTipBox` with a Material icon, not emoji.
- The skills step does not render a large empty-state field when no skills have been added; it only renders skill chips after at least one skill exists.
- `useBuilder.updateField` supports functional updates. Repeatable/nested sections must use functional updates when deriving next `work_experience`, `education`, `skills`, or nested `personal_info` values so rapid sequential field edits cannot overwrite each other with stale render state.

## Связанные файлы

- `frontend/src/features/builder/hooks/useBuilder.ts`
- `frontend/src/features/builder/services/builderStorageService.ts`
- `frontend/src/features/builder/types/builder.ts`
- `frontend/src/features/builder/components/*`

*Последнее обновление: 2026-05-23*
