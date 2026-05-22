# Landing Concept

Experimental marketing page for Rezynt focused on creating a resume from scratch.

## Route

- `/landing-concept`

## Key files

- `frontend/src/features/landing-concept/LandingConceptPage.tsx`
- `frontend/src/features/landing-concept/LandingConceptPage.css`
- `frontend/src/features/landing-concept/LandingConceptTheme.ts`
- `frontend/src/features/landing-concept/LandingConceptQuestionnaire.tsx`
- `frontend/src/shared/i18n/ru.json`

## Layout

- Sticky header with image logo.
- One compact badge in the hero: `Конструктор резюме онлайн`.
- Hero headline: `Сборка резюме за 5 мин`.
- Short subheading: `Меньше возни с резюме, больше откликов и собеседований.`
- Hero includes a filled Russian-language resume preview rendered through the real `ResumeRenderer` using the `professional` template. The preview sits to the right of the hero headline/subtitle on desktop and below it on compact screens, with a static tilted 3D card treatment that animates only on hover.
- The resume preview uses two green-check overlay pills instead of a score badge:
  - `Готово к отправке`
  - `Оптимизировано под ATS`
- Below the resume preview there is an animated pill CTA `Собрать резюме`, which smooth-scrolls to the embedded builder form (`#builder`).
- The former three-card hero flow (`Заполните форму`, `Выберите шаблон`, `Скачайте файл`) is not rendered.
- Below the hero, the page embeds the full builder questionnaire from the product as a vertical landing-page form:
  - contact info
  - work experience
  - education
  - skills
  - summary
- The questionnaire starts immediately with stacked accordion section cards. There is no extra section header, subtitle, or progress card inside the builder block.
- All builder section headers are visible one under another on the landing page; only `Контакты` is expanded by default.
- Users can collapse/expand each section by clicking its heading.
- Each non-final expanded section has one bottom CTA labeled only with the next section name and a down arrow. It expands the next section and smooth-scrolls it into view.
- Section transition CTAs also move focus into the first editable field of the newly opened section.
- Header arrow navigation is not rendered in the landing questionnaire.
- The final section has no internal CTA. A separate final CTA block renders below all section cards.
- The final CTA block is always visible below all accordion section cards. The button says `Перейти к выбору шаблона`, is larger than section-scroll buttons, and remains disabled until the user checks personal data processing consent.
- Clicking the final CTA saves the builder data and navigates directly to the existing template selection/export screen at `/export`: authenticated users are saved through `resumeApi.updateResume`; unauthenticated users are registered through `authApi.signupFromLanding` using the email from the contacts step, receive auth tokens, are stored as full logged-in users, and then continue to `/export`.
- The landing signup flow rejects existing emails instead of silently logging in by email alone. The UI shows a diagnostic error and keeps the user on the form.
- The consent text links to `/privacy-policy.html`.
- The summary step is labeled `Саммари` in Russian builder UI to avoid confusing the section with the whole resume document.
- The page ends immediately after the final questionnaire CTA/consent block with a footer copied from the public landing pattern: logo, copyright, email, privacy policy, and terms links.

## Important behavior

- The hero does not use CTA buttons.
- No separate product-flow cards are rendered in the hero.
- The questionnaire reuses the same builder state, navigation, and step content as the main product flow.
- The page is separate from the public `/` landing and does not replace it.

*Последнее обновление: 2026-05-22*
