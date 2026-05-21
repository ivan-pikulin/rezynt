# Deployment

## Производственный поток

1. Push в `main`.
2. GitHub Actions собирает landing page.
3. Артефакты landing копируются на сервер.
4. На сервере запускается deployment script.
5. Контейнеры пересобираются через Docker Compose.
6. Nginx перезагружается.

## Сервер

- Project path: `/root/rezynt/`
- Host: `46.149.70.254`
- Access: `ssh rezynt`

## Контейнеры

- Все production containers имеют префикс `rezynt-`.
- Основные сервисы: `nginx`, `frontend`, `landing`, `backend`, `celery`, `postgres`, `redis`, `certbot`.

## Local dev

- Для локальной backend-инфраструктуры используется `docker-compose-local.yml`.
- Не пытайся искать production-контейнеры локально.

*Последнее обновление: 2026-05-21*
