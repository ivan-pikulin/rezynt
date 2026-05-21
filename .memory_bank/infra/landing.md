# Landing

Legacy separate `landing/` project больше не является источником истины.

## Current state

- Публичный landing живёт в `frontend/src/features/landing`.
- Экспериментальный landing для создания резюме с нуля живёт в `frontend/src/features/landing-concept`.
- Оба варианта рендерятся внутри React/Vite приложения.
- Публичный домен обслуживается через `frontend` и `nginx`, без отдельного landing-контейнера.

## Что помнить

- Не возвращать отдельный `landing/` пайплайн в актуальную архитектуру.
- Если меняется промо-структура, обновлять соответствующие docs в `.memory_bank/frontend/`.

*Последнее обновление: 2026-05-22*
