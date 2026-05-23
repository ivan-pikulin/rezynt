# Infra

Infra покрывает shared reverse proxy, Docker Compose production delivery и GitHub Actions.

## Доменная карта

- `docker-compose.prod.yml` - production services for the shared `personal-sara` server.
- Shared Caddy in `/opt/shared-proxy` - public reverse proxy, SSL and routing.
- GitHub Actions - GHCR image build/push and SSH deploy pipeline.
- Remote production server - единственная production среда.
- Shared proxy source-of-truth is `shared-proxy/` in the `sara-help` repo.

## Что помнить

- Продакшн не запускается локально и не ищется через локальные контейнеры.
- Сервер не собирает application images; deploy only pulls GHCR images.
- Rezynt не владеет портами 80/443 на сервере; они заняты `shared-proxy-caddy-1`.
- Caddy обслуживает `rezynt.ru` и `www.rezynt.ru`.

## Подфайлы

- [`deployment.md`](./deployment.md)
- [`nginx.md`](./nginx.md)
- [`landing.md`](./landing.md)

*Последнее обновление: 2026-05-22*
