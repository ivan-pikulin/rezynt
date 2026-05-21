# Landing

Landing page - отдельный статический entrypoint для маркетинга и upload funnel.

## Структура

- `landing/index.html`
- `landing/styles.css`
- `landing/script.js`
- `landing/privacy-policy.html`
- `landing/terms-of-service.html`
- `landing/public/`

## Что важно

- Landing строится отдельным Vite-пайплайном.
- Build output идёт в `landing_html/`.
- Лэндинг не является частью React app, он живёт отдельно.
- В потоках upload он ведёт пользователя в app-домен.

## Аналитика

- PostHog
- Google Analytics 4
- Google Ads conversion tracking

## Source files

- `landing/vite.config.js`
- landing legacy notes migrated into Memory Bank

*Последнее обновление: 2026-05-21*
