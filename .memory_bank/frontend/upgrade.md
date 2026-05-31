# Upgrade

Upgrade - full-page paywall вместо старого modal-only flow.

## Ключевая страница

- `frontend/src/features/upgrade/UpgradePage.tsx`

## Поведение

- Показывает одну тарифную карточку `best` за `149 ₽` с подписью под ценой.
- Срок доступа отображается в списке преимуществ, а не отдельной строкой под ценой.
- Список преимуществ включает пункт о разовом платеже без дополнительных списаний.
- Нижняя заметка сообщает про разовый платеж и отсутствие автопродления; гарантия возврата не используется.
- Кнопка оплаты создаёт YooKassa redirect payment через backend `POST /payment/checkout` и редиректит пользователя на `confirmation_url`.
- Перед checkout страница проверяет, что текущий пользователь зарегистрирован и имеет `email`; если пользователь оказался guest с email в сохраненном resume, она создаёт landing account через `authApi.signupFromLanding`, обновляет auth tokens через `login`, и только затем запускает checkout.
- Тексты тарифов, цены, сроки доступа и feature bullets хранятся в `upgrade.plans`.
- Страница использует visual shell нового лендинга: `lc-page`, `lc-header`, `/rezynt-logo-with-name.svg` и `LandingConceptTheme`, без правой ссылки `Опросник`.
- В шапке есть ненавязчивая back-ссылка `К выбору шаблона`, ведущая обратно на `/export`.
- `/payment/welcome` ждёт подтверждения через refetch user до `is_premium=true`; кнопка `Продолжить` возвращает на `/export` только после активации.

## Точка входа

- `/upgrade`
- `/payment/welcome`

## Используется из

- Export page для non-premium users.
- Profile subscription section.
- Любых paywall-trigger сценариев.

*Последнее обновление: 2026-05-31*
