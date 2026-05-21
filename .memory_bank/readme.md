# Memory Bank

Карта актуальной архитектуры репозитория `rezynt`.

## Разделы

- `frontend/readme.md` - React/Vite frontend, включая landing, auth, onboarding и пользовательские потоки.
- `backend/readme.md` - FastAPI API, фоновые задачи, БД и обработка резюме.
- `deployment/readme.md` - Docker Compose, Nginx и GitHub Actions deploy-поток.
- `stack.md` - общий стек, версии и локальные ограничения.

## Актуальные заметки

- Legacy `landing/` как отдельный проект удалён.
- Публичный лендинг теперь живёт внутри `frontend/src/features/landing`.
- Экспериментальный from-scratch landing живёт в `frontend/src/features/landing-concept`.
- Публичный домен обслуживается через `nginx` и `frontend`, без отдельного landing-контейнера.

Последнее обновление: 2026-05-22
