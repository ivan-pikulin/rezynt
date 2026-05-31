# Deployment

Окружение и доставка приложения.

## Файлы

- `docker-compose.prod.yml` - production orchestration for the shared `personal-sara` server.
- `docker-compose.yml` - legacy standalone production orchestration.
- `docker-compose-local.yml` - локальный backend/postgres/redis стек.
- `scripts/dev-hot.sh` - полный локальный hot-reload запуск: Docker infra, Dockerized FastAPI/Celery и Vite frontend.
- `.github/workflows/deploy.yml` - GitHub Actions build/push/deploy flow.
- `nginx/nginx.conf` - legacy standalone reverse proxy config.

## Важное

- Публичные домены `rezynt.ru`, `www.rezynt.ru`, `rezynt.com` и `www.rezynt.com` проксируются на `frontend` через общий Caddy в `/opt/shared-proxy`.
- `/api`, `/docs` и `/openapi.json` проксируются на `backend`.
- На сервере нельзя запускать Rezynt `nginx`/`certbot` на портах 80/443, потому что эти порты уже заняты `shared-proxy-caddy-1`.
- Production deploy должен использовать опубликованные GHCR images и `docker compose up -d --no-build`; сервер не собирает application images.
- `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` и `YOOKASSA_WEBHOOK_SECRET` передаются из GitHub Actions secrets и дописываются workflow в runtime `/opt/rezynt/.env` после `PROD_ENV`.
- Production email runtime использует SMTP env из `PROD_ENV`. Для Resend: `EMAIL_HOST=smtp.resend.com`, `EMAIL_PORT=465`, `EMAIL_USERNAME=resend`, `EMAIL_PASSWORD=<RESEND_API_KEY>`, `EMAIL_FROM=team@rezynt.ru`, `EMAIL_DOMAIN=rezynt.ru`, `EMAIL_DKIM_ENABLED=false`.
- Для локальной разработки с UI использовать `scripts/dev-hot.sh`; он выводит фактические адреса frontend, backend API, OpenAPI docs, PostgreSQL и Redis, включая автоматически выбранные порты при локальных конфликтах.

Последнее обновление: 2026-05-31
