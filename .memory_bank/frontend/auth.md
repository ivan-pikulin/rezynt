# Auth

Auth-флоу покрывает регистрацию, логин, подтверждение email и сброс пароля.

## Ключевые экраны

- `frontend/src/features/auth/AuthPage.tsx`
- `frontend/src/features/auth/LoginPage.tsx`
- `frontend/src/features/auth/SignupPage.tsx`
- `frontend/src/features/auth/EmailConfirmationPage.tsx`
- `frontend/src/features/auth/PasswordResetVerificationPage.tsx`
- `frontend/src/features/auth/RequestPasswordResetPage.tsx`
- `frontend/src/features/auth/ResetPasswordPage.tsx`

## Поведение

- Подтверждение email может возвращать токены для авто-логина.
- `POST /auth/confirm-email-by-code` теперь используется и как кодовый вход для уже существующего аккаунта: валидный код подтверждает почту, очищает старые verification code/token поля и возвращает JWT.
- Сброс пароля работает через email token/code flow, а не через ручной парольный reset без подтверждения.
- После успешного входа пользователь должен попадать в основной app flow через redirect/guard-логику, а не через отдельную ветку.

## Связанные shared-узлы

- `frontend/src/shared/contexts/AuthContext.tsx`
- `frontend/src/shared/services/api/authApi.ts`
- `frontend/src/shared/services/api/tokenService.ts`
- `frontend/src/shared/components/EmailConfirmationModal.tsx`
- `frontend/src/shared/components/EmailVerificationCodeModal.tsx`
- `frontend/src/shared/components/VerificationCodeInput.tsx`
- `frontend/src/shared/components/ProtectedRoute.tsx`

## Что учитывать

- Валидация форм и локализация должны идти через shared-слой.
- Любые изменения auth-флоу должны синхронно отражаться в backend endpoints `/auth/*`.

*Последнее обновление: 2026-06-01*
