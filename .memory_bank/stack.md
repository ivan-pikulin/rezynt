# Stack

## Frontend

- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.6
- Material UI 7.1.0 + Emotion
- React Router DOM 7.6.0
- TanStack React Query 5.79.0
- Formik 2.4.6 + Yup 1.7.0
- i18next 25.1.2 + react-i18next 15.5.1
- jsPDF 3.0.1 + html2canvas 1.4.1

## Backend

- FastAPI 0.116.1
- Uvicorn 0.35.0
- SQLAlchemy 2.0.41 + Alembic 1.16.4
- Pydantic 2.11.7
- Celery 5.5.3 + Redis 6.3.0
- PostgreSQL 15
- WeasyPrint 62.0
- OpenAI API 1.101.0

## Operational rules

- Frontend package manager: `yarn`, not `npm`.
- Backend package manager: `uv`.
- Do not run production build commands unless the user explicitly asks.
- Do not create Alembic migrations manually from Memory Bank notes; keep migrations aligned with repo policy.
- UI text belongs in `frontend/src/shared/i18n/`.
- Colors should come from `frontend/src/shared/theme/theme.ts`.

## Files that matter most for context

- `frontend/src/shared/theme/theme.ts`
- `frontend/src/index.css`
- `frontend/src/shared/components/Header/Header.tsx`
- `frontend/src/shared/components/templates/*`
- `landing/styles.css`
- `frontend/src/shared/design/designVariant.ts`

*Последнее обновление: 2026-05-21*
