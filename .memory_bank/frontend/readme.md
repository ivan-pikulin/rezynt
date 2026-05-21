# Frontend

Фронтенд Rezynt на React/Vite. Пользовательский путь собран из отдельных feature-модулей и shared-слоя.

## Главные зоны

- `auth` - вход, регистрация, подтверждение email и reset password.
- `start` - стартовый экран, загрузка резюме и вход в builder.
- `onboarding` - короткий онбординг и привязка temp upload.
- `builder` - пошаговое заполнение резюме с автосохранением.
- `refine` - analysis, editing и navigation по improvement points.
- `export` - preview, template selection, PDF/TXT export.
- `profile` - account settings и security sections.
- `upgrade` - full-page paywall.
- `shared` - общий UI, hooks, API, i18n, theme, templates и guards.
- `designs` - вспомогательные дизайн-страницы, не основной user flow.

## Основной путь

`/start` -> `/onboarding` -> `/builder` -> `/refine` -> `/export`

Дополнительные маршруты:

- `/build` - alias для `StartPage`.
- `/upgrade` - paywall.
- `/profile-settings` - профиль.

## Что читать по темам

- [`../DESIGN.md`](../DESIGN.md)
- [`auth.md`](./auth.md)
- [`onboarding.md`](./onboarding.md)
- [`start.md`](./start.md)
- [`builder.md`](./builder.md)
- [`refine.md`](./refine.md)
- [`export.md`](./export.md)
- [`profile.md`](./profile.md)
- [`upgrade.md`](./upgrade.md)
- [`shared.md`](./shared.md)
- [`header.md`](./header.md)
- [`templates.md`](./templates.md)

## Правила

- Весь UI-text живёт в `frontend/src/shared/i18n/`.
- Цвета и дизайн-токены живут в `frontend/src/shared/theme/theme.ts`.
- Shared-код не импортирует feature-код.
- Все API-запросы идут через `frontend/src/shared/services/api/`.
- `frontend/src/App.tsx` - источник правды по маршрутам и guards.

*Последнее обновление: 2026-05-21*
