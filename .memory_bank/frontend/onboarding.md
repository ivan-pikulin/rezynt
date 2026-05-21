# Onboarding

Onboarding собирает 4 коротких ответа после регистрации или подтверждения email и помогает завершить первичный setup.

## Ключевые страницы

- `frontend/src/features/onboarding/OnboardingPage.tsx`

## Поведение

- 4 шага с авто-переходом после выбора ответа.
- Есть banner состояния обработки резюме.
- Если пришёл `temp_file_id`, страница пытается привязать temp upload через `resumeApi.claimTempFile`.
- Если `redirect` передан в query, он имеет приоритет над default redirect на `/refine`.
- Повторный вызов при уже завершённом onboarding не ломает поток: показывается ошибка и происходит переход на `/refine`.

## API

- `POST /user/onboarding/complete`

## Связанные компоненты

- `frontend/src/shared/components/Header/Header.tsx`
- `frontend/src/shared/components/PublicOnboardingGuard.tsx`
- `frontend/src/shared/contexts/AuthContext.tsx`

*Последнее обновление: 2026-05-21*
