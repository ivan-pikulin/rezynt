# Analysis

Анализ резюме живёт в `backend/app/services/analysis/`.

## Как устроен расчёт

- `AnalysisService` собирает все правила и запускает их параллельно через `asyncio.gather()`.
- Правила сгруппированы по доменам: `general`, `personal_info`, `contacts`, `professional_summary`, `skills`, `work_experience`, `education`.
- Не-premium пользователи пропускают `premium_only` правила.
- Результат собирается в `AnalysisResult` и кэшируется в `User.analysis_result`.

## Важные файлы

- `backend/app/services/analysis/analysis_service.py`
- `backend/app/services/analysis/scoring.py`
- `backend/app/services/analysis/config.py`
- `backend/app/services/analysis/rules/`
- `backend/app/schemas/analysis.py`

## Что важно помнить

- Анализ возвращает score, label, subtitle, sections, total_improvements, potential_score и generated_at.
- Improvement points должны быть стабильными по `point_id`, потому что ими пользуется `mark-fixed`.
- Ошибки отдельных правил не должны ломать весь анализ; они локализуются на уровне правила.

## Для быстрой навигации по правилам

- General: `backend/app/services/analysis/rules/general/`
- Personal info: `backend/app/services/analysis/rules/personal_info/`
- Contacts: `backend/app/services/analysis/rules/contacts/`
- Summary: `backend/app/services/analysis/rules/professional_summary/`
- Skills: `backend/app/services/analysis/rules/skills/`
- Experience: `backend/app/services/analysis/rules/work_experience/`
- Education: `backend/app/services/analysis/rules/education/`

*Последнее обновление: 2026-05-21*
