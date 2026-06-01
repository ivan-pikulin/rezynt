import asyncio
from typing import Any, Optional, Tuple
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.ext.asyncio import AsyncSession
from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.core.config import settings
from app.core.verification import verification_generator
from app.database.crud import user_crud
from app.schemas import UserCreate, User
from logging import getLogger


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
        self.logger = getLogger(__name__)

    async def signup(self, user_in: UserCreate) -> User:
        """Creates a new user and sends confirmation email"""
        # Check if user with this email already exists
        existing_user = await user_crud.get_by_email(self.db, email=user_in.email)
        if existing_user:
            raise ValueError("Пользователь с таким адресом электронной почты уже существует")
        
        # Create user
        user = await user_crud.create(self.db, obj_in=user_in)
        
        # Generate token and 6-digit code
        token, code = verification_generator.generate_token_and_code(user.id, 'email-confirm')
        
        # Store token and code in database
        await user_crud.set_verification_data(self.db, user_id=user.id, token=token, code=code, code_type='email_confirm')
        
        # Send email in background with both token and code
        # Try enqueueing via Celery; if broker is read-only/unavailable, fallback to direct send
        try:
            from app.core.tasks import send_confirmation_email_task
            send_confirmation_email_task.delay(user.email, token, code)
        except Exception as celery_error:
            self.logger.warning(f"Celery publish failed, falling back to direct email: {celery_error}")
            from app.services.email_service import EmailService
            EmailService().send_confirmation_email(user.email, token, code)
        
        return user

    async def confirm_user(self, token: str) -> User:
        """Confirms user email by token"""
        try:
            # Decode token (24 hour expiration)
            user_id = self.serializer.loads(token, salt='email-confirm', max_age=86400)
            user_id_int = int(user_id)
        except Exception:
            raise ValueError("Недействительный или просроченный токен")
        
        # Confirm email
        user = await user_crud.confirm_email(self.db, user_id=user_id_int)
        if not user:
            raise ValueError("Пользователь не найден")
        
        return user

    async def request_password_reset(self, email: str) -> bool:
        """Requests password reset and sends email with token"""
        # Check if user with this email exists
        user = await user_crud.get_by_email(self.db, email=email)
        if not user:
            # For security, don't reveal that user doesn't exist
            return True
        
        # Generate token and 6-digit code
        token, code = verification_generator.generate_token_and_code(user.id, 'password-reset')
        
        # Send email in background with both token and code
        try:
            from app.core.tasks import send_password_reset_email_task
            send_password_reset_email_task.delay(user.email, token, code)
        except Exception as celery_error:
            self.logger.warning(f"Celery publish failed, falling back to direct email: {celery_error}")
            from app.services.email_service import EmailService
            EmailService().send_password_reset_email(user.email, token, code)
        
        return True

    async def confirm_password_reset(self, token: str, new_password: str) -> User:
        """Confirms password reset by token and sets new password"""
        try:
            # Decode token (1 hour expiration)
            user_id = self.serializer.loads(token, salt='password-reset', max_age=3600)
            user_id_int = int(user_id)
        except Exception:
            raise ValueError("Недействительный или просроченный токен")
        
        # Update user password
        user = await user_crud.update_password(self.db, user_id=user_id_int, new_password=new_password)
        if not user:
            raise ValueError("Пользователь не найден")
        
        return user

    async def confirm_user_by_code(self, code: str, email: str) -> User:
        """Confirms user email by 6-digit verification code and returns the user."""
        
        # Verify code against stored code in database
        user = await user_crud.verify_code(self.db, email=email, code=code, code_type='email_confirm')
        if not user:
            raise ValueError("Недействительный код подтверждения")

        # Confirm email if needed and clear any stored code so the same code cannot be reused.
        user = await user_crud.confirm_email(self.db, user_id=user.id)
        if not user:
            raise ValueError("Пользователь не найден")

        return user

    async def confirm_password_reset_by_code(self, code: str, email: str, new_password: str) -> User:
        """Confirms password reset by 6-digit verification code and sets new password"""
        # Verify code against stored code in database
        user = await user_crud.verify_code(self.db, email=email, code=code, code_type='password_reset')
        if not user:
            raise ValueError("Недействительный код подтверждения")
        
        # Update user password
        user = await user_crud.update_password(self.db, user_id=user.id, new_password=new_password)
        if not user:
            raise ValueError("Пользователь не найден")
        
        return user

    async def resend_verification_code(self, email: str, code_type: str) -> Tuple[bool, str]:
        """Resend verification code for email confirmation or password reset"""
        # Check if user exists
        user = await user_crud.get_by_email(self.db, email=email)
        if not user:
            # For security, don't reveal that user doesn't exist
            return True, ""
        
        # Generate new token and code
        salt = 'email-confirm' if code_type == 'email_confirm' else 'password-reset'
        token, code = verification_generator.generate_token_and_code(user.id, salt)
        
        # Store new token and code in database
        await user_crud.set_verification_data(self.db, user_id=user.id, token=token, code=code, code_type=code_type)
        
        # Send appropriate email based on code type
        try:
            from app.services.email_service import EmailService
            email_service = EmailService()
            
            if code_type == 'email_confirm':
                success = email_service.send_confirmation_email(email, token, code)
            elif code_type == 'password_reset':
                success = email_service.send_password_reset_email(email, token, code)
            else:
                raise ValueError("Недопустимый тип кода")
            
            return success, token
        except Exception as e:
            self.logger.error(f"Failed to resend verification code: {e}")
            raise RuntimeError(f"Failed to resend verification code: {e}") from e

    async def send_email_change_code(self, user_id: int, new_email: str) -> Tuple[bool, str]:
        """Send verification code for email change"""
        # Check if new email is already taken
        existing_user = await user_crud.get_by_email(self.db, email=new_email)
        if existing_user and existing_user.id != user_id:
            raise ValueError("Пользователь с таким адресом электронной почты уже существует")
        
        # Generate token and code for email change
        token, code = verification_generator.generate_token_and_code(user_id, 'email-change')
        
        # Store token and code in database
        await user_crud.set_verification_data(self.db, user_id=user_id, token=token, code=code, code_type='email_change')
        
        # Send email to the NEW email address
        try:
            from app.services.email_service import EmailService
            email_service = EmailService()
            success = email_service.send_email_change_confirmation(new_email, token, code)
            return success, token
        except Exception as e:
            self.logger.error(f"Failed to send email change code: {e}")
            return False, ""
    
    async def verify_email_change_code(self, user_id: int, code: str) -> bool:
        """Verify the email change code"""
        # Verify code against stored code in database
        user = await user_crud.verify_code(self.db, code=code, code_type='email_change', user_id=user_id)
        return user is not None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Gets user by email"""
        return await user_crud.get_by_email(self.db, email=email)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticates user"""
        return await user_crud.authenticate(self.db, email=email, password=password)

    async def _verify_google_id_token(self, id_token: str) -> dict[str, Any]:
        if not settings.GOOGLE_CLIENT_ID:
            raise ValueError("Аутентификация через Google не настроена")

        def _verify() -> dict[str, Any]:
            request = google_requests.Request()
            return google_id_token.verify_oauth2_token(
                id_token,
                request,
                settings.GOOGLE_CLIENT_ID
            )

        try:
            return await asyncio.to_thread(_verify)
        except GoogleAuthError as error:
            self.logger.warning(f"Google token issuer validation failed: {error}")
            raise ValueError("Недействительный issuer Google-токена")
        except ValueError as error:
            self.logger.warning(f"Google token validation failed: {error}")
            raise ValueError("Недействительный Google-токен")
        except Exception as error:
            self.logger.error(f"Unexpected Google token verification error: {error}")
            raise ValueError("Не удалось проверить Google-токен")

    async def authenticate_google_user(self, *, id_token: str, guest_id: Optional[str] = None) -> User:
        payload = await self._verify_google_id_token(id_token)

        google_sub = payload.get("sub")
        email = payload.get("email")
        email_verified = payload.get("email_verified")
        first_name = payload.get("given_name")
        last_name = payload.get("family_name")

        if not google_sub or not email:
            raise ValueError("В Google-токене отсутствуют обязательные данные пользователя")

        if isinstance(email_verified, str):
            email_verified = email_verified.lower() == "true"
        if email_verified is not True:
            raise ValueError("Электронная почта Google не подтверждена")

        user_by_google_sub = await user_crud.get_by_google_sub(self.db, google_sub=google_sub)
        if user_by_google_sub:
            return await user_crud.link_google_account(
                self.db,
                user=user_by_google_sub,
                google_sub=google_sub,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )

        user_by_email = await user_crud.get_by_email(self.db, email=email)
        if user_by_email:
            return await user_crud.link_google_account(
                self.db,
                user=user_by_email,
                google_sub=google_sub,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )

        guest_user = None
        guest_id_for_new_user = None
        if guest_id:
            user_with_guest_id = await user_crud.get_by_guest_id(self.db, guest_id=guest_id)
            if user_with_guest_id and not user_with_guest_id.is_registered:
                guest_user = user_with_guest_id
            elif not user_with_guest_id:
                guest_id_for_new_user = guest_id

        if guest_user:
            return await user_crud.link_google_account(
                self.db,
                user=guest_user,
                google_sub=google_sub,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )

        return await user_crud.create_google_user(
            self.db,
            email=email,
            google_sub=google_sub,
            first_name=first_name,
            last_name=last_name,
            guest_id=guest_id_for_new_user,
        )
