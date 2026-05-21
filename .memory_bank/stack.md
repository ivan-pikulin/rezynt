# Stack

## Frontend

- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.6
- Material UI 7.1.0
- React Router DOM 7.6.0
- TanStack React Query 5.79.0
- Formik 2.4.6
- Yup 1.7.0
- i18next 25.1.2
- react-i18next 15.5.1
- jsPDF 3.0.1
- html2canvas 1.4.1
- react-ga4 2.1.0
- Package manager: `yarn`

## Backend

- FastAPI 0.116.1
- Uvicorn 0.35.0
- SQLAlchemy 2.0.41
- Alembic 1.16.4
- Pydantic 2.11.7
- Celery 5.5.3
- Redis 6.3.0 client, Redis 7-alpine in containers
- PostgreSQL 15
- WeasyPrint 62.0
- OpenAI API 1.101.0
- Package manager: `uv`

## Runtime and storage

- Resume data lives in `User.resume_data` as JSONB.
- Analysis cache lives in `User.analysis_result` and `User.analysis_generated_at`.
- Temporary uploads use `TempResumeFile` with 24h TTL.
- File upload processing goes through Celery task `process_resume_upload_task`.

## Operational rules

- Frontend and landing use `yarn`; never switch to `npm`.
- Do not create manual Alembic revision files unless the current task explicitly demands it and the repo policy has changed.
- Local backend infra is handled with Docker Compose; production is deployed remotely.
- Deployment is driven by GitHub Actions on push to `main`.
- Follow fail-fast behavior; avoid silent fallback paths unless they are explicit and logged.

## Key paths

- Frontend app: `frontend/src/App.tsx`
- Shared API clients: `frontend/src/shared/services/api/`
- Shared UI: `frontend/src/shared/components/`
- Backend API: `backend/app/api/v1/endpoints/`
- Backend tasks: `backend/app/core/tasks.py`
- Analysis engine: `backend/app/services/analysis/`
- Database models: `backend/app/database/models/`

*Последнее обновление: 2026-05-21*
