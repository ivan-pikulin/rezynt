# Landing

Legacy separate `landing/` project больше не является источником истины.

## Current state

- Основной публичный landing на `/` живёт в `frontend/src/features/landing-concept`.
- Старый публичный landing живёт в `frontend/src/features/landing` и доступен на `/old-landing`.
- Оба варианта рендерятся внутри React/Vite приложения.
- Публичный домен обслуживается через `frontend` и `nginx`, без отдельного landing-контейнера.

## Что помнить

- Не возвращать отдельный `landing/` пайплайн в актуальную архитектуру.
- Если меняется промо-структура, обновлять соответствующие docs в `.memory_bank/frontend/`.

*Последнее обновление: 2026-05-23*
