# Frontend

React/Vite приложение в `frontend/`.

## Основные домены

- `src/features/auth` - login, signup, password reset, confirmation.
- `src/features/builder` - основной редактор резюме.
- `src/features/onboarding` - onboarding и привязка к upload flow.
- `src/features/start` - стартовые сценарии создания резюме.
- `src/features/refine` - AI review и улучшение резюме.
- `src/features/export` - экспорт и оплата.
- `src/features/profile` - настройки профиля.
- `src/features/landing` - порт legacy landing из старого `landing/` проекта.
- `src/features/legal` - privacy / terms страницы.

## Важное

- Публичный `"/"` рендерит landing через `DomainAwareHome`.
- Все UI-строки лежат в `src/shared/i18n`.
- Все цвета и токены для landing заведены в `src/shared/theme/theme.ts`.

Последнее обновление: 2026-05-21
