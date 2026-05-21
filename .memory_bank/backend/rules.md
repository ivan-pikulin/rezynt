# Rules

Resume analysis rules организованы по группам и исполняются как набор независимых проверок.

## Базовый контракт

- Все правила наследуются от `BaseRule`.
- Каждое правило возвращает список `ImprovementPoint`.
- Metadata поля вроде `severity`, `score_impact`, `premium_only`, `check_type`, `action_type` нужны для UI и scoring, а не для управления flow.

## Группы правил

- `general` - grammar, buzzwords, filler phrases, undefined abbreviations, personal pronouns, content language, resume length, missing required fields.
- `personal_info` - capitalization consistency.
- `contacts` - contact validation и role-based contact checks.
- `professional_summary` - missing summary, summary length, weak phrases, number format consistency.
- `skills` - skills count, missing keywords, skills not in experience.
- `work_experience` - missing company/start date/location, date validation, generic job titles, job title capitalization, company name consistency, employment gaps, achievements checks, weak verbs, passive voice, duplicates.
- `education` - missing institution/degree/field, education date validation, institution name consistency, relevance, relevant courses.

## Behavior

- `AnalysisService` запускает правила параллельно.
- Non-premium users пропускают `premium_only` rules.
- Отдельная ошибка одного правила не должна валить весь анализ.
- Результат сохраняется в `User.analysis_result`.

## Focus

- Чтобы точечно исправить point, frontend использует `point_id` и `field_path`.
- `mark-fixed` меняет состояние point в cached analysis, а не пересчитывает всё с нуля.

*Последнее обновление: 2026-05-21*
