# Memory Bank

Карта актуальной архитектуры репозитория `rezynt`.

## Разделы

- `frontend/readme.md` - React/Vite frontend, включая landing, auth, onboarding и пользовательские потоки.
- `backend/readme.md` - FastAPI API, фоновые задачи, БД и обработка резюме.
- `deployment/readme.md` - Docker Compose, Nginx и GitHub Actions deploy-поток.
- `stack.md` - общий стек, версии и локальные ограничения.
- `.codex/skills/rezynt-docx-resume-templates` - репозиторный Codex skill для создания и QA DOCX-шаблонов резюме.

## Актуальные заметки

- Legacy `landing/` как отдельный проект удалён.
- Основной публичный лендинг теперь живёт внутри `frontend/src/features/landing-concept`.
- Старый публичный лендинг живёт в `frontend/src/features/landing` и доступен на `/old-landing`.
- Публичный домен обслуживается через `nginx` и `frontend`, без отдельного landing-контейнера.
- Для DOCX resume templates добавлен локальный skill `rezynt-docx-resume-templates`; использовать его при правках `backend/app/templates/docx/*` и генератора прототипов.

Последнее обновление: 2026-05-23
