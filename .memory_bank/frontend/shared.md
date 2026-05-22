# Shared

Shared-слой содержит всё, что переиспользуется между feature-модулями.

## Состав

- `components/` - Header, guards, templates, renderer, модалки и общие элементы.
- `hooks/` - `useAuth`, `useResumeData`, `useTemplate`, `useUser`, `useOnboarding`, `usePolling`, `usePageTracking`, `useDesignVariant`.
- `services/api/` - `baseApi`, `authApi`, `resumeApi`, `analysisApi`, `userApi`, `tokenService`.
- `services/` - `guestResumeService`, `guestResumeMigration`, `resumeCacheService`, `templateService`, `ga4Service`.
- `theme/` - единая тема приложения.
- `i18n/` - переводы.
- `types/` - общие типы `user.ts` и `resume.ts`.

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

## Смежные документы

- [`header.md`](./header.md) - контракт Header и история изменений.
- [`templates.md`](./templates.md) - система шаблонов и ResumeRenderer.

## Правила

- Shared не импортирует feature-код.
- Все API-запросы идут через `shared/services/api`.
- `authApi.signupFromLanding` creates and authenticates a full user account from landing questionnaire data; the auth context `login` method returns `Promise<boolean>` because it stores tokens and verifies them through `/user/me`.
- Все текстовые строки должны быть в `shared/i18n`.
- Все цвета и токены дизайна должны жить в `shared/theme/theme.ts`.

## Для навигации

- API base: `frontend/src/shared/services/api/baseApi.ts`
- Auth state: `frontend/src/shared/contexts/AuthContext.tsx`
- Resume data hooks: `frontend/src/shared/hooks/useResumeData.ts`, `frontend/src/shared/hooks/useResumeQuery.ts`. `useResumeQuery` uses `AuthContext` for authenticated resume loading and switches to `guestResumeService` when called in guest mode.

*Последнее обновление: 2026-05-22*
