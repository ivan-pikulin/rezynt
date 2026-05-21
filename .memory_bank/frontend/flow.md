# Flow

## Пользовательский маршрут

1. `/start`
2. `/onboarding`
3. `/builder`
4. `/refine`
5. `/export`
6. `/upgrade` при paywall-сценариях

## Назначение экранов

- `start` - создание нового резюме или загрузка существующего.
- `onboarding` - сбор короткого набора ответов после регистрации или подтверждения email.
- `builder` - пошаговое заполнение данных резюме.
- `refine` - анализ резюме, список улучшений и редактирование полей.
- `export` - выбор шаблона и выгрузка.
- `upgrade` - полный экран апгрейда вместо старого modal-only paywall.

## Что важно в потоке

- После загрузки резюме возможен переход в состояние анализа через Celery task status.
- `refine` должен уметь читать уже сохранённый `analysis_result` и не дёргать полный пересчёт без нужды.
- `profile` и `upgrade` должны использовать shared-компоненты, а не локальные дубли.

## Смежные файлы

- `frontend/src/features/start/StartPage.tsx`
- `frontend/src/features/onboarding/OnboardingPage.tsx`
- `frontend/src/features/builder/BuilderPage.tsx`
- `frontend/src/features/refine/RefinePage.tsx`
- `frontend/src/features/export/ExportPage.tsx`
- `frontend/src/features/upgrade/UpgradePage.tsx`

*Последнее обновление: 2026-05-21*
