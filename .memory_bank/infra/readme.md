# Infra

Infra покрывает landing page, nginx и production delivery.

## Доменная карта

- `landing/` - статический marketing site.
- `nginx/` - reverse proxy, SSL и routing.
- GitHub Actions - deployment pipeline.
- Remote production server - единственная production среда.

## Что помнить

- Продакшн не запускается локально и не ищется через локальные контейнеры.
- Landing build и app build разделены.
- Nginx обслуживает `rezynt.com`, `www.rezynt.com` и `app.rezynt.com`.

## Подфайлы

- [`deployment.md`](./deployment.md)
- [`nginx.md`](./nginx.md)
- [`landing.md`](./landing.md)

*Последнее обновление: 2026-05-21*
