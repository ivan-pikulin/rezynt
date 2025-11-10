# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rezynt is an AI-powered resume builder with separated frontend and backend architecture. The project uses Docker Compose for orchestration and deploys to a remote server via GitHub Actions. All code, comments, and UI elements are in English.

## Repository Structure

```
rezynt/
├── backend/         # FastAPI backend server
├── frontend/        # React + Vite frontend application
├── landing/         # Static landing page (Vite + vanilla JS)
├── nginx/           # Nginx reverse proxy configuration
├── ai/              # AI prompt templates for resume improvements
├── .github/         # GitHub Actions CI/CD workflows
└── docker-compose.yml  # Production orchestration
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
- **Reverse Proxy:** Nginx alpine
- **SSL/TLS:** Certbot (Let's Encrypt)
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

### Local Docker Development
```bash
# Start local environment (backend, postgres, redis only)
docker compose -f docker-compose-local.yml --env-file .env up -d

# Backend accessible at: http://localhost:8001
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Production Deployment
Production deployment runs on a remote server. NEVER try to find Docker containers or prod-specific services locally. Deployment is automated via GitHub Actions on push to `main` branch.

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
1. Each meaningful folder contains `spec.xml` with feature descriptions and technical specifications. Always read these files to understand code structure.
2. **When you change code, you MUST update the corresponding `spec.xml`** to reflect the present code state.
3. When adding functionality described in spec.xml, use minimal changes - add new functionality and keep existing structure.
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
4. **For Alembic migrations, always use:** `$env:PYTHONPATH='.'; alembic upgrade head`
5. Never auto-generate migrations - they're done manually

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
FRONTEND_BASE_URL=https://rezynt.com
API_BASE_URL=https://api.rezynt.com

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

## Docker Services (Production)

Services defined in docker-compose.yml:
- **nginx** - Reverse proxy, SSL termination (ports 80, 443)
- **frontend** - React app served by Nginx
- **landing** - Static landing page
- **backend** - FastAPI app (internal port 8000)
- **celery** - Background task worker (1GB memory limit)
- **postgres** - PostgreSQL database with health checks
- **redis** - Cache and task queue
- **certbot** - SSL certificate renewal

Networks:
- `app-network` - Frontend, Nginx, Backend communication
- `backend-network` - Backend, Database, Redis communication

Volumes:
- `postgres_data` - Database persistence
- `redis_data` - Cache persistence
- `migrations_data` - Migration files
- `temp_uploads_data` - Temporary file uploads
- `frontend_node_modules` - Node modules cache

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers on push to `main`:
1. Setup Node.js 20
2. Build landing page with yarn
3. SCP landing files to remote server
4. SSH to server and execute deployment script:
   - Pull latest code
   - Stop containers
   - Build Docker images
   - Start containers with `docker compose up -d`
   - Restart nginx
   - Cleanup old images

## Analytics

Google Analytics 4 (GA4) integration tracks:
- Page views (automatic)
- Authentication events
- Resume creation/updates
- PDF exports (watermarked vs clean)
- Feature usage

Configuration in `frontend/src/shared/services/ga4Service.ts`
