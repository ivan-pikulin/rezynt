# Upgrade

Upgrade - full-page paywall вместо старого modal-only flow.

## Ключевая страница

- `frontend/src/features/upgrade/UpgradePage.tsx`

## Поведение

- Показывает одну тарифную карточку `best` за `149 ₽` с подписью под ценой.
- Срок доступа отображается в списке преимуществ, а не отдельной строкой под ценой.
- Список преимуществ включает пункт о разовом платеже без дополнительных списаний.
- Кнопка оплаты ведет на текущий Stripe checkout URL.
- Тексты тарифов, цены, сроки доступа и feature bullets хранятся в `upgrade.plans`.
- Страница использует visual shell нового лендинга: `lc-page`, `lc-header`, `/rezynt-logo-with-name.svg` и `LandingConceptTheme`.

## Точка входа

- `/upgrade`

## Используется из

- Export page для non-premium users.
- Profile subscription section.
- Любых paywall-trigger сценариев.

*Последнее обновление: 2026-05-22*
