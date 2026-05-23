# Header

Header - основной навигационный компонент приложения.

## Ключевой контракт

- Логотип может быть скрыт на мобильных устройствах.
- Логотип использует `/rezynt-logo-with-name.svg` с новым символом из optimized WebP и брендом `Резинт`.
- Stepper поддерживает кастомные шаги через `customSteps`.
- Кнопки назад/вперёд можно скрывать через props.
- `allowFirstStepClick` нужен для guest flows.
- `hideNavigationArrows` отключает стрелки навигации.
- Аватар пользователя ведёт на `/profile-settings`.
- В onboarding режимах header может отображать только title без stepper.

## Важные изменения

- Старый `UserSidebar` удалён.
- Header стал sticky.
- Builder использует кастомный 5-step flow, а основной app flow использует 3-step flow.

## Связанные файлы

- `frontend/src/shared/components/Header/Header.tsx`
- `frontend/src/shared/components/Header/Header.types.ts`
- legacy header notes migrated into Memory Bank

*Последнее обновление: 2026-05-21*
