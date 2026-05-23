# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Rezynt is an AI-powered resume builder with separated frontend and backend architecture. The project uses Docker Compose for orchestration and deploys to a remote server via GitHub Actions. All code, comments, and UI elements are in English.

## Repository Structure

```
rezynt/
├── backend/         # FastAPI backend server
├── frontend/        # React + Vite frontend application
├── landing/         # Static landing page (Vite + vanilla JS)
├── nginx/           # Legacy standalone Nginx reverse proxy configuration
├── ai/              # AI prompt templates for resume improvements
├── .github/         # GitHub Actions CI/CD workflows
├── docker-compose.yml       # Legacy standalone production orchestration
└── docker-compose.prod.yml  # Current production orchestration for shared server
```

## Technology Stack

### Frontend
- **Framework:** React 19.1.0 with TypeScript 5.8.3
- **Build Tool:** Vite 7.0.6
- **UI Framework:** Material-UI (MUI) 7.1.0 with Emotion (CSS-in-JS)
- **Routing:** React Router DOM 7.6.0
- **State Management:** React Context API + TanStack React Query 5.79.0
- **Forms:** Formik 2.4.6 + Yup 1.7.0
- **PDF Export:** jsPDF 3.0.1 + html2canvas 1.4.1
- **i18n:** i18next 25.1.2 + react-i18next 15.5.1
- **Analytics:** React GA4 2.1.0
- **Package Manager:** Yarn (NOT npm)

### Backend
- **Framework:** FastAPI 0.116.1
- **Async Runtime:** Uvicorn 0.35.0
- **ORM:** SQLAlchemy 2.0.41 + Alembic 1.16.4
- **Validation:** Pydantic 2.11.7 + Pydantic Settings
- **Auth:** PyJWT (via python-jose) + bcrypt 4.3.0
- **Async Tasks:** Celery 5.5.3 + Redis 6.3.0
- **Database:** PostgreSQL 15 (async via asyncpg)
- **PDF Generation:** WeasyPrint 62.0
- **AI Integration:** OpenAI API 1.101.0
- **Email:** Jinja2 3.1.6 + DKIM support (dkimpy)
- **Package Manager:** uv (modern Python package manager)

### Infrastructure
- **Database:** PostgreSQL 15-alpine
- **Cache/Queue:** Redis 7-alpine
- **Reverse Proxy:** Shared Caddy in `/opt/shared-proxy` on the production server
- **SSL/TLS:** Caddy automatic Let's Encrypt certificates
- **Containerization:** Docker + Docker Compose

## Common Commands

### Frontend Development
```bash
# Install dependencies (ALWAYS use yarn, never npm)
yarn install

# Start development server (runs on http://localhost:5173)
yarn dev
```

Never run a production build. Do not run yarn dev until directly asked by user.

### Backend Development
```bash
# Install dependencies
uv sync

# Add new package
uv add package-name

# Run database migrations (Windows PowerShell)
$env:PYTHONPATH='.'; alembic upgrade head

# Start development server
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Start Celery worker
uv run celery -A app.core.celery_app worker -l info
```

**IMPORTANT: Database Migrations**
- Migrations are created **automatically on the server** via `backend/app/scripts/migrate.sh`
- The migration script runs on deployment and auto-generates migrations if `AUTO_GENERATE_MIGRATIONS=true`
- **NEVER manually create migration files** - just modify models and push to `main`
- For local testing, run: `$env:PYTHONPATH='.'; alembic upgrade head`

### Local Docker Development
```bash
# Start local environment (backend, postgres, redis only)
docker compose -f docker-compose-local.yml --env-file .env up -d

# Backend accessible at: http://localhost:8001
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Production Deployment
Production deployment runs on the remote `personal-sara` server. NEVER try to find Docker containers or prod-specific services locally. Deployment is automated via GitHub Actions on push to `main` branch.

Current deployment is registry-based:
- GitHub Actions builds `rezynt-backend` and `rezynt-frontend` images.
- Images are pushed to GHCR.
- The server only pulls images and runs `docker compose up -d --no-build`.
- Do not add server-side `docker compose build` steps.

## Code Architecture

### Frontend Architecture

**Feature-Based Structure:** Code is organized by feature modules under `frontend/src/features/`:
- `auth/` - Authentication (login, signup, password reset)
- `builder/` - Step-by-step resume form builder
- `refine/` - AI-powered resume enhancement
- `export/` - Download/export with payment flow
- `preview/` - Live resume preview
- `profile/` - User settings and account management
- `onboarding/` - User onboarding flow
- `start/` - Initial resume creation options

**Shared Resources:** Common code in `frontend/src/shared/`:
- `components/` - Reusable UI components
  - `templates/` - Resume template renderers (AltoTemplate, LumaTemplate, NumeTemplate, VeroTemplate)
  - `Header/` - App header with navigation
  - `ProtectedRoute.tsx`, `OnboardingGuard.tsx` - Route guards
- `services/api/` - HTTP API clients
  - `baseApi.ts` - Axios instance with auth interceptors
  - `authApi.ts`, `resumeApi.ts`, `userApi.ts`, `analysisApi.ts` - Endpoint-specific clients
  - `tokenService.ts` - JWT token management
- `hooks/` - Custom React hooks
  - `useAuth.ts` - Authentication state
  - `useResumeData.ts` - Resume data management
  - `useTemplate.ts` - Template selection
  - `useUser.ts` - User profile data
- `contexts/` - React Context providers (AuthContext)
- `theme/` - Material-UI theme configuration (colors, breakpoints)
- `types/` - Global TypeScript types (resume.ts, user.ts)
- `i18n/` - Internationalization files (all UI text must be stored here)

**TypeScript Configuration:**
- Base URL is set to `src` in tsconfig.json, enabling clean imports: `import { Component } from 'shared/components'`
- Strict type checking enabled

### Backend Architecture

**FastAPI Layered Structure:**
```
backend/app/
├── api/v1/endpoints/    # API route handlers (auth, user, resume, analysis, ai)
├── core/                # Core application logic
│   ├── config.py        # Settings from environment variables
│   ├── security.py      # JWT token handling, password hashing
│   ├── verification.py  # Email verification tokens
│   ├── tasks.py         # Celery background tasks
│   └── celery_app.py    # Celery configuration
├── database/            # Data persistence layer
│   ├── models/          # SQLAlchemy ORM models
│   ├── crud/            # CRUD operations (Create, Read, Update, Delete)
│   ├── migrations/      # Alembic database migrations
│   └── session.py       # Database session factory
├── schemas/             # Pydantic request/response models
└── services/            # Business logic layer
    └── analysis/        # Resume analysis engine with scoring rules
```

**Database Migrations:**
- Migrations are done MANUALLY using Alembic
- NEVER run `alembic revision --autogenerate`
- Always use prefix: `$env:PYTHONPATH='.'; alembic upgrade head`

**API Pattern:**
```python
@router.post("/endpoint")
async def endpoint_handler(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    body: RequestSchema = Body(...),
) -> ResponseSchema:
    # Dependency injection for DB and Auth
    # Pydantic validation on request/response
    pass
```

### Resume Templates

Four resume templates are available:
- **Nume** (free) - Basic template
- **Luma** (premium) - Premium design
- **Alto** (premium) - Premium design
- **Vero** - Standard template

Template components are in `frontend/src/shared/components/templates/` with a shared BaseTemplate.tsx.

### AI Integration

AI prompt templates in `ai/` directory guide OpenAI API for:
- Basic info extraction (1_upd_basic_info.json)
- Contact details (2_add_contacts.json)
- Work experience (3_add_experience.json)
- Education (4_add_education.json)
- Skills (5_add_skills.json)
- Summary/objective (6_upd_summary.json)

Backend AI service integrates with OpenAI API for resume enhancement and content suggestions.

## Important Development Rules

### General Rules
1. Each meaningful domain is documented in `.memory_bank`; always read the relevant memory bank files before changing code.
2. **When you change code, you MUST update the corresponding `.memory_bank` docs** to reflect the present code state.
3. When adding functionality described in Memory Bank, use minimal changes - add new functionality and keep existing structure.
4. All code runs on a remote server. NEVER try to find Docker containers locally. Analyze docker-compose.yml and .github workflows instead.

### Frontend Rules
1. **All UI text must be stored in the `i18n` folder** - never hardcode strings in components
2. **Always use yarn + vite, never use npm**
3. Never manually build or start the app - let the user handle that
4. **All colors must be stored in theme.ts** - no hardcoded color values

### Backend Rules
1. **Use Python classes wherever possible**
2. Keep code short and simple - don't expand functionality without user approval
3. **Use uv for package management:** `uv add package-name` to add packages
4. **Database migrations are auto-generated on server** via `backend/app/scripts/migrate.sh` - just modify models and commit
5. **For local migration testing:** `$env:PYTHONPATH='.'; alembic upgrade head`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Backend (.env)
Required environment variables (see docker-compose.yml for full list):
```
# Security
SECRET_KEY=<random-32-chars>
ACCESS_TOKEN_EXPIRE_MINUTES=1440      # 24 hours
REFRESH_TOKEN_EXPIRE_MINUTES=10080    # 7 days

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<password>
POSTGRES_DB=rezynt

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_CELERY_DB=1

# Email
EMAIL_HOST=smtp.timeweb.ru
EMAIL_PORT=465
EMAIL_USERNAME=team@rezynt.com
EMAIL_PASSWORD=<password>
EMAIL_DKIM_PRIVATE_KEY_PATH=/app/dkim-key.private

# URLs
FRONTEND_BASE_URL=https://rezynt.ru
API_BASE_URL=https://rezynt.ru

# OpenAI
OPENAI_API_KEY=<key>
OPENAI_PROXY_URL=<url>

# Platform Integration
PLATFORM_SCRATCH_APP_KEY=<key>
PLATFORM_UPLOAD_APP_KEY=<key>
PLATFORM_APP_URL=<url>
```

## API Structure

Backend API base path: `/api/v1/`

Main endpoint groups:
- `/health` - Health check
- `/auth/` - User registration, login, token refresh, email verification
- `/user/` - User profile management
- `/resume/` - Resume CRUD operations
- `/analysis/` - Resume scoring and analysis
- `/ai/` - AI-powered resume improvements

Frontend API clients are in `frontend/src/shared/services/api/` with a baseApi.ts that provides Axios instance with authentication interceptors.

## Key Features

### Authentication System
- JWT tokens: Access (24 hours) + Refresh (7 days)
- Email verification with token-based flow
- Password reset via email
- Guest mode with temporary resume storage

### Resume Analysis
- Scoring system for ATS compatibility, content quality, formatting
- Rules engine in `backend/app/services/analysis/rules/`
- OpenAI integration for intelligent suggestions

### PDF Export
- Frontend: jsPDF + html2canvas
- Backend: WeasyPrint for server-side generation
- Watermarking for free/preview versions
- Clean exports for premium users

### Background Tasks
- Celery + Redis for async operations
- Email sending (with DKIM authentication)
- PDF generation
- Resume analysis

## Production Docker Structure

Current production compose file: `docker-compose.prod.yml`.

Rezynt app services:
- **frontend** - React app served by its internal Nginx on port `80`.
- **backend** - FastAPI app on internal port `8000`.
- **celery** - Background task worker.
- **postgres** - PostgreSQL database.
- **redis** - Redis cache and Celery broker.

Rezynt does **not** run a public reverse proxy, Nginx, or Certbot in current production. Public `80/443` are owned by the shared Caddy stack.

Networks:
- `sara-help_default` - external shared network used by Caddy, Sara Help, and Rezynt. Rezynt joins it with aliases `rezynt-frontend` and `rezynt-backend`.
- `app-network` - internal frontend/backend communication.
- `backend-network` - backend/postgres/redis/celery communication.

Volumes:
- `postgres_data` - database persistence.
- `redis_data` - cache persistence.
- `migrations_data` - persistent Alembic `versions/`.
- `temp_uploads_data` - temporary uploads.

Alembic note: the backend image stores baked migrations in `/app/app/database/migrations_baked`; production startup seeds the persistent `versions/` volume before running `backend/app/scripts/migrate.sh`.

## Shared Proxy Structure

The shared public proxy is not owned by this repository.

Source of truth:
- Local repo: `/Users/ivan/Desktop/repositories/Personal/sara-help/shared-proxy/`
- Server path: `/opt/shared-proxy/`
- Compose file: `/opt/shared-proxy/docker-compose.yml`
- Caddyfile: `/opt/shared-proxy/Caddyfile`
- Container: `shared-proxy-caddy-1`

Caddy routes both applications on the same server:
- `sarahelp.ru` and `mastra.sarahelp.ru` -> Sara Help services.
- `rezynt.ru` and `www.rezynt.ru` -> Rezynt services.

Rezynt workflow may update only the block between:
```
# BEGIN REZYNT MANAGED BLOCK
# END REZYNT MANAGED BLOCK
```

Always validate candidate Caddy config before replacing `/opt/shared-proxy/Caddyfile`, then use `caddy reload`. Do not restart the Caddy container for app-only deploys.

## Production Server

### SSH Access
```bash
ssh personal-sara   # root@46.149.70.254
```

### Server Specs
- **OS:** Ubuntu 22.04.5 LTS
- **CPU:** 2 vCPUs
- **RAM:** 3.8 GB (no swap)
- **Disk:** 50 GB (29 GB free, 42% used)
- **Hostname:** 5397917-ivanpikulin
- **IP:** 46.149.70.254

### Project Location
- **Path:** `/opt/rezynt/`
- **Env file:** `/opt/rezynt/.env`
- **DKIM key:** `/root/rezynt.com.private`

### Docker Containers (Production)
All containers are prefixed with `rezynt-`:
```
rezynt-frontend-1   — React app, internal port 80
rezynt-backend-1    — FastAPI, internal port 8000
rezynt-celery-1     — Background task worker
rezynt-postgres-1   — PostgreSQL
rezynt-redis-1      — Redis
shared-proxy-caddy-1 — Shared public proxy for Sara Help and Rezynt (ports 80, 443)
```

### SSL Certificates
- **Managed by:** shared Caddy container.
- **Domains:** `rezynt.ru`, `www.rezynt.ru`.
- **Storage:** Docker volumes `sara-help_caddy_data` and `sara-help_caddy_config`, mounted by `/opt/shared-proxy/docker-compose.yml`.
- **Reload:** `docker compose -f /opt/shared-proxy/docker-compose.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile`.

### Common Server Commands
```bash
# Check container status
ssh personal-sara "docker ps -a"

# View backend logs
ssh personal-sara "docker logs rezynt-backend-1 --tail 100"

# View shared proxy logs
ssh personal-sara "docker logs shared-proxy-caddy-1 --tail 100"

# Validate shared Caddy config
ssh personal-sara "docker compose -f /opt/shared-proxy/docker-compose.yml exec -T caddy caddy validate --config /etc/caddy/Caddyfile"

# Reload shared Caddy
ssh personal-sara "docker compose -f /opt/shared-proxy/docker-compose.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile"

# Restart Rezynt app containers only
ssh personal-sara "cd /opt/rezynt && docker compose -f docker-compose.prod.yml --env-file .env up -d --no-build"
```

### Known Issues
- Do not run Rezynt Nginx/Certbot on ports `80/443`; those ports belong to `shared-proxy-caddy-1`.
- `rezynt.ru` DNS is managed in Timeweb. The Timeweb authoritative zone has `A` records for `rezynt.ru` and `www.rezynt.ru`, but `.ru` TLD propagation may lag after initial registration/delegation.
- DKIM key path is `/root/rezynt.com.private`; if it is empty, email sends without DKIM signing.

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers on push to `main`:
1. Build backend and frontend Docker images on GitHub-hosted runners.
2. Push images to GHCR as `${GITHUB_SHA}` and `main`.
3. SSH to `personal-sara`.
4. Update `/opt/rezynt` checkout using the read-only deploy key alias `github.com-rezynt`.
5. Write runtime `.env` from GitHub secret `PROD_ENV`.
6. Pull images and run `docker compose -f docker-compose.prod.yml --env-file .env up -d --no-build --remove-orphans`.
7. Update the Rezynt managed block in `/opt/shared-proxy/Caddyfile`, validate candidate config, and gracefully reload Caddy.

## Analytics

Google Analytics 4 (GA4) integration tracks:
- Page views (automatic)
- Authentication events
- Resume creation/updates
- PDF exports (watermarked vs clean)
- Feature usage

Configuration in `frontend/src/shared/services/ga4Service.ts`
