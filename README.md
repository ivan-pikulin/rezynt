# Rezynt

Rezynt is an AI-assisted resume builder. It turns an uploaded resume into editable structured data, reviews it for content and presentation issues, suggests improvements, and exports the finished resume as PDF or DOCX.

The application is built as a React frontend and a FastAPI backend. Resume parsing and AI-generated suggestions use OpenAI-compatible APIs; deterministic checks and LLM-assisted checks are combined in the analysis rules engine.

## What it does

- Upload a PDF, DOC, or DOCX resume and extract its contents into editable sections.
- Build or refine a resume through a guided editor, with a live preview and selectable templates.
- Review the resume with a score and actionable suggestions for completeness, clarity, skills, experience, education, and ATS readiness.
- Export a finished resume to PDF or DOCX.
- Continue as a guest, or create an account to save a resume and use account features.

## AI and analysis flow

1. The backend extracts text from the uploaded file with MarkItDown.
2. An OpenAI-compatible model parses the text into a validated resume schema using structured output.
3. The analysis service runs domain-specific checks concurrently. Some checks are deterministic; others ask an LLM to identify issues or propose a rewrite.
4. The API returns structured improvement points and scoring data to the frontend, where a user can review suggestions and edit the resume.

The parsing flow is implemented in [`backend/app/services/parse_service.py`](backend/app/services/parse_service.py). Analysis orchestration and scoring live in [`backend/app/services/analysis/`](backend/app/services/analysis/), and the shared structured LLM client is [`llm_helper.py`](backend/app/services/analysis/llm_helper.py). The refine experience is in [`frontend/src/features/refine/`](frontend/src/features/refine/).

## Repository layout

```text
backend/                 FastAPI API, resume parsing, analysis, export, and Celery tasks
frontend/                React + TypeScript application, editor, landing pages, and UI
ai/                      Prompt templates used by resume flows
backend/app/database/    SQLAlchemy models and Alembic migrations
docker-compose-local.yml Local backend, PostgreSQL, and Redis stack
docker-compose.prod.yml  Current registry-based production compose configuration
scripts/dev-hot.sh       Local hot-reload development launcher
```

## Technology

- **Frontend:** React 19, TypeScript, Vite, Material UI, React Query, Formik, i18next
- **Backend:** Python 3.12+, FastAPI, Pydantic, SQLAlchemy, Alembic
- **AI:** OpenAI-compatible API with Pydantic structured outputs
- **Background work:** Celery and Redis
- **Data:** PostgreSQL
- **Documents:** MarkItDown for input parsing, WeasyPrint for PDF generation, `docxtpl` for DOCX templates
- **Local infrastructure:** Docker Compose

## Local development

The repository's full hot-reload workflow is `scripts/dev-hot.sh`. It starts PostgreSQL and Redis in Docker, runs the FastAPI and Celery services with code reload, and starts Vite. Default local ports are frontend `5173`, API `8012`, PostgreSQL `5432`, and Redis `6379`; the script can select alternatives when defaults are occupied.

The launcher reads a local environment file that is intentionally not included in this repository. Configure the required development values locally, then run:

```bash
./scripts/dev-hot.sh
```

The script requires Docker, `lsof`, and Yarn (or Corepack). The API is available at `http://localhost:8012`; FastAPI's OpenAPI UI is at `http://localhost:8012/docs`.

For backend-only work, install dependencies from the backend directory with `uv sync`. The backend expects PostgreSQL, Redis, and the configuration values documented in `backend/app/core/config.py`. Apply reviewed Alembic migrations from `backend/` with `PYTHONPATH=. uv run alembic upgrade head`.

## Configuration

The application reads environment variables through Pydantic Settings. Runtime configuration includes:

- Database and Redis connection settings.
- `SECRET_KEY` and token expiration settings.
- OpenAI API credentials and optional proxy settings.
- Frontend/API base URLs and platform integration keys.
- Payment and email provider credentials.

Do not put production credentials in this repository. The checked-in `.env.example` is currently UTF-16 encoded and contains stale sample settings, so it should not be treated as the authoritative setup guide.

## API overview

The API is mounted under `/api/v1/`. Main route groups include:

| Area | Routes |
| --- | --- |
| Health | `GET /health` |
| Authentication | `/auth/` |
| User profile | `/user/` |
| Resume editing, upload, and export | `/resume/` |
| Resume analysis and improvement status | `/analysis/` |
| Payments and webhooks | `/payment/`, `/webhook/` |

Interactive API documentation is available at `/docs` when the backend is running.

## Project notes

Production deployment is image-based: GitHub Actions publishes images to GHCR, and the server runs the reviewed Compose configuration without building application images on the server.
