# Landing Concept

Experimental marketing page for Rezynt focused on creating a resume from scratch.

## Route

- `/landing-concept`

## Key files

- `frontend/src/features/landing-concept/LandingConceptPage.tsx`
- `frontend/src/features/landing-concept/LandingConceptPage.css`
- `frontend/src/features/landing-concept/LandingConceptQuestionnaire.tsx`
- `frontend/src/shared/i18n/ru.json`

## Layout

- Sticky header with image logo.
- One compact badge in the hero: `Конструктор резюме онлайн`.
- Hero headline: `Сильное резюме за 5 мин`.
- Short subheading about building a resume from scratch in a few minutes.
- Horizontal visual product flow with three steps and arrows between them.
- The three flow labels live in each card header, to the right of the step number:
  - `Заполните форму`
  - `Выберите шаблон`
  - `Скачайте файл`
- Under the flow, the page embeds the full builder questionnaire from the product:
  - contact info
  - work experience
  - education
  - skills
  - summary
- There are no marketing sections or footer below the questionnaire.
- On compact screens the hero flow collapses into a vertical stack with downward arrows, and the questionnaire becomes a horizontal scroll stepper with one step card at a time.

## Important behavior

- The hero does not use CTA buttons.
- The visual flow is meant to be understood primarily through graphics on larger screens, with short labels in the card header.
- The questionnaire reuses the same builder state, navigation, and step content as the main product flow.
- The page is separate from the public `/` landing and does not replace it.

*Последнее обновление: 2026-05-22*
