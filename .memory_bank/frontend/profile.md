# Profile

Profile settings - отдельная страница для аккаунта и безопасности.

## Ключевая страница

- `frontend/src/features/profile/ProfileSettingsPage.tsx`

## Секции

- account information
- email confirmation
- subscription
- password security
- delete account

## Поведение

- Страница защищена `ProtectedRoute` и `OnboardingGuard`.
- Данные пользователя подгружаются через `userApi.getCurrentUser()`.
- Изменения синхронизируются с AuthContext.
- Logout требует подтверждения.
- Возврат со страницы ведёт обратно в `/refine`.

## API

- `GET /user/me`
- `PATCH /user/me`
- `POST /user/change-password`
- `DELETE /user/me`
- `POST /auth/resend-verification-code`

*Последнее обновление: 2026-05-21*
