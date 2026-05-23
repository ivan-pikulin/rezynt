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
- `src/features/landing` - старый публичный landing, доступный на `/old-landing`.
- `src/features/landing-concept` - основной публичный landing на `/` с встроенным builder questionnaire; `/landing-concept` сохранен как совместимый маршрут.
- `src/features/legal` - privacy / terms страницы.

## Важное

- Публичный `"/"` рендерит landing-concept через `DomainAwareHome`; старый landing доступен на `/old-landing`.
- Все UI-строки лежат в `src/shared/i18n`.
- Все цвета и токены для landing заведены в `src/shared/theme/theme.ts`.

## См. также

- [`landing.md`](./landing.md) - структура публичного marketing landing.

Последнее обновление: 2026-05-23
