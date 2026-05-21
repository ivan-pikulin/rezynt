# Upgrade

Upgrade - full-page paywall вместо старого modal-only flow.

## Ключевая страница

- `frontend/src/features/upgrade/UpgradePage.tsx`

## Поведение

- Показывает preview резюме слева и value proposition справа.
- Берёт preview через `useResumeQuery` и `useTemplate`.
- CTA ведёт напрямую на Stripe checkout.
- Использует статический набор feature bullets и pricing block из translations.

## Точка входа

- `/upgrade`

## Используется из

- Export page для non-premium users.
- Profile subscription section.
- Любых paywall-trigger сценариев.

*Последнее обновление: 2026-05-21*
