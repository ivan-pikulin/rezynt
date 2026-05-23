# Shared

Shared-слой содержит всё, что переиспользуется между feature-модулями.

## Состав

- `components/` - Header, guards, templates, renderer, модалки и общие элементы.
- `hooks/` - `useAuth`, `useResumeData`, `useTemplate`, `useUser`, `useOnboarding`, `usePolling`, `usePageTracking`, `useDesignVariant`.
- `services/api/` - `baseApi`, `authApi`, `resumeApi`, `analysisApi`, `userApi`, `tokenService`.
- `services/` - `guestResumeService`, `guestResumeMigration`, `resumeCacheService`, `templateService`, `yandexMetrikaService`.
- `theme/` - единая тема приложения.
- `i18n/` - переводы.
- `types/` - общие типы `user.ts` и `resume.ts`.
- `public/` - web assets including the `Резинт` logo, favicon, and PWA icons.

## Ключевые компоненты

- `frontend/src/shared/components/Header/Header.tsx`
- `frontend/src/shared/components/ResumeRenderer.tsx`
- `frontend/src/shared/components/PaywallModal.tsx`
- `frontend/src/shared/components/RegistrationModal.tsx`
- `frontend/src/shared/components/HomeRedirect.tsx`
- `frontend/src/shared/components/ProtectedRoute.tsx`
- `frontend/src/shared/components/OnboardingGuard.tsx`
- `frontend/src/shared/components/PublicOnboardingGuard.tsx`
- `frontend/src/shared/components/templates/`
- Brand assets: `frontend/public/rezynt-logo-with-name.svg`, `frontend/public/rezynt-symbol.webp`, `frontend/public/favicon.ico`, `frontend/public/favicon-16.png`, `frontend/public/favicon-32.png`, `frontend/public/logo192.png`, `frontend/public/logo512.png`.

## Смежные документы

- [`header.md`](./header.md) - контракт Header и история изменений.
- [`templates.md`](./templates.md) - система шаблонов и ResumeRenderer.

## Правила

- Shared не импортирует feature-код.
- Все API-запросы идут через `shared/services/api`.
- `authApi.signupFromLanding` creates and authenticates a full user account from landing questionnaire data; the auth context `login` method returns `Promise<boolean>` because it stores tokens and verifies them through `/user/me`.
- `tokenService` shares auth and guest cookies across `rezynt.ru`/subdomains and keeps legacy `rezynt.com` support during migration.
- Yandex Metrika is initialized from `VITE_YANDEX_METRIKA_COUNTER_ID` through `shared/services/yandexMetrikaService.ts`.
- `usePageTracking` sends route changes as Metrika `hit` calls. Funnel actions use `reachGoal` targets for landing CTA/form progress, resume uploads, template selection, export/download intent, payment intent, payment success, and export success.
- Все текстовые строки должны быть в `shared/i18n`.
- Все цвета и токены дизайна должны жить в `shared/theme/theme.ts`.

## Для навигации

- API base: `frontend/src/shared/services/api/baseApi.ts`
- Auth state: `frontend/src/shared/contexts/AuthContext.tsx`
- Resume data hooks: `frontend/src/shared/hooks/useResumeData.ts`, `frontend/src/shared/hooks/useResumeQuery.ts`. `useResumeQuery` uses `AuthContext` for authenticated resume loading and switches to `guestResumeService` when called in guest mode.
- `useResumeData` is a legacy cache wrapper for the single-resume API and calls `resumeApi.getResume()` without a resume id.
- `shared/utils/resumeDataConverter.ts` copies the current JSONB resume shape (`personal_info`, `work_experience`, etc.) into `ResumeData`; it does not expose legacy flat resume fields.

*Последнее обновление: 2026-05-23*
