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
- `src/features/landing` - публичный landing, который рендерится на `/`.
- `src/features/landing-concept` - экспериментальный landing на `/landing-concept`.
- `src/features/legal` - privacy / terms страницы.

## Важное

- Публичный `"/"` рендерит landing через `DomainAwareHome`, а `/landing-concept` доступен как отдельный экспериментальный маршрут.
- Все UI-строки лежат в `src/shared/i18n`.
- Все цвета и токены для landing заведены в `src/shared/theme/theme.ts`.

Последнее обновление: 2026-05-22
