# Start

Start page - точка входа в app flow. Отсюда пользователь либо начинает с нуля, либо загружает существующее резюме.

## Ключевые страницы

- `frontend/src/features/start/StartPage.tsx`
- `frontend/src/features/start/components/StartOptions.tsx`

## Поведение

- Использует `useDesignVariant` для подбора visual style.
- Поддерживает два основных сценария:
  - старт с нуля, переход в builder;
  - загрузка файла с последующим polling task status.
- При загрузке файла страница отслеживает Celery task state и редиректит на refine после появления `ANALYZING`/`SUCCESS`.
- Если пользователь ещё не прошёл onboarding, редирект уходит через `/onboarding?redirect=...`.
- Есть alias route `/build`, который отображает тот же `StartPage`.

## API

- `POST /resume/upload`
- `GET /resume/upload/status/{task_id}`

## Навигация

- `StartOptions` ведут в `/builder` для сценария "start from scratch".
- Step click в header ведёт на `/refine` и `/export`.

*Последнее обновление: 2026-05-21*
