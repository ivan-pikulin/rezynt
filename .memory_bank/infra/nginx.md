# Reverse Proxy

## Роль

- Shared Caddy в `/opt/shared-proxy` на сервере `personal-sara` является публичным reverse proxy для Rezynt и Sara Help.
- SSL termination.
- Routing к frontend и backend.
- Health endpoint.

## Домены

- `rezynt.ru`
- `www.rezynt.ru`
- `app.rezynt.ru` поддерживается приложением, но production Caddy сейчас маршрутизирует root/www.

## Основные маршруты

- Main domain -> frontend
- `/api` -> backend
- `/docs` -> backend
- `/health` -> frontend/backend route depending on app implementation; Caddy owns the public entrypoint.
- `/ingest/` -> PostHog proxy
- `/static/` -> PostHog static assets proxy

## SSL

- Сертификаты управляются Caddy container из `/opt/shared-proxy`.
- Rezynt production compose не запускает certbot.
- GitHub Actions валидирует Caddy config и вызывает `caddy reload` после обновления managed block.

## Source files

- `.github/workflows/deploy.yml` - managed Caddy block для `rezynt.ru`.
- `docker-compose.prod.yml` - Rezynt services and shared Caddy network aliases.
- `sara-help/shared-proxy/` - source of truth for the shared Caddy compose and base Caddyfile.
- `nginx/nginx.conf` - legacy standalone nginx config, not used by the new shared-server deployment.

*Последнее обновление: 2026-05-22*
