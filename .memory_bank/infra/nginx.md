# Nginx

## Роль

- Reverse proxy для app и landing.
- SSL termination.
- Routing к frontend, backend и static landing.
- Health endpoint.

## Домены

- `rezynt.com`
- `www.rezynt.com`
- `app.rezynt.com`

## Основные маршруты

- Main domain -> landing
- App subdomain -> frontend
- `/api` -> backend
- `/docs` -> backend
- `/health` -> nginx health
- `/ingest/` -> PostHog proxy
- `/static/` -> PostHog static assets proxy

## SSL

- Сертификаты управляются certbot container.
- Nginx должен перезагружаться после обновления сертификата или конфига.

## Source files

- `nginx/nginx.conf`
- `nginx/landing.conf`
- `nginx/check-ssl.sh`

*Последнее обновление: 2026-05-21*
