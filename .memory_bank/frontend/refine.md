# Refine

Refine - центральный экран анализа и редактирования резюме.

## Ключевая страница

- `frontend/src/features/refine/RefinePage.tsx`

## Что делает экран

- Загружает `resume` через shared query hook.
- Загружает `analysis` через `analysisApi.getAnalysis()`.
- Если в URL есть `?analyzing=true&taskId=...`, polling идёт по `resumeApi.getUploadStatus(taskId)` каждые 2 секунды.
- На успехе очищает query params и делает обычный reload анализа.
- На failure показывает error state.
- Отображает score bar, improvement sections и editor accordion.
- Поддерживает mobile tabs `analysis` / `editor`.
- Сохраняет историю правок, поддерживает undo/redo и локальные save notifications.
- Improvement points могут быть помечены как fixed и участвуют в recalculation score.

## Основные UI-компоненты

- `ScoreBar`
- `ImprovementSections`
- `EditorAccordion`
- `ImprovementPoint`
- `LoadingSpinner`
- `ErrorMessage`
- `DiffView`

## Связанные utils

- `frontend/src/features/refine/utils/resumeDataConverter.ts`
- `frontend/src/features/refine/utils/resumeFieldPath.ts` supports string and string-array fix content for replace/add suggestions.
- `frontend/src/features/refine/utils/generatePremiumPoints.ts`

## API

- `GET /analysis/`
- `POST /analysis/refresh`
- `POST /analysis/mark-fixed`
- `GET /resume/upload/status/{task_id}`

*Последнее обновление: 2026-05-23*
