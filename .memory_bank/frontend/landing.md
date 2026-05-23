# Public Landing

Public marketing landing for `Резинт` rendered at `/`.

## Key files

- `frontend/src/features/landing/LandingPage.tsx`
- `frontend/src/features/landing/LandingPage.css`
- `frontend/src/shared/i18n/ru.json`
- `frontend/src/shared/i18n/en.json`

## Current structure

- Sticky logo header with the `Резинт` brand asset from `frontend/public/rezynt-logo-with-name.svg`.
- Hero with upload dropzone, resume preview image, ATS/ready badges, and score badge.
- Pain points, solution statement, four-step process, benefits, and pricing sections.
- FAQ section after pricing, inspired by a resume-builder reference structure:
  - round info marker
  - large two-tone heading
  - four white question cards with divider lines
- Long-form guide/SEO section below FAQ:
  - online AI resume builder overview
  - why to use a resume builder
  - online builder positioning
  - resume template explanation
  - step-by-step Rezynt filling flow
  - Rezynt advantages list
  - final job-search CTA copy
- Footer with support email and legal links.

## Content rules

- UI copy must stay in i18n, not hardcoded in the component.
- Public landing currently has landing copy in `ru.json` and `en.json`; `pt.json` does not define the public landing namespace.
- New marketing copy should stay `Резинт`-specific: AI analysis, create-from-scratch or upload flow, ATS readability, templates, and PDF export.
- The SEO guide should paraphrase references and not copy external text verbatim.

*Последнее обновление: 2026-05-22*
