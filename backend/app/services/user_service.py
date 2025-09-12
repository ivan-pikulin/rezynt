from typing import Optional, Tuple
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.ext.asyncio import AsyncSession

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
            raise ValueError("User with this email already exists")
        
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
            raise ValueError("Invalid or expired token")
        
        # Confirm email
        user = await user_crud.confirm_email(self.db, user_id=user_id_int)
        if not user:
            raise ValueError("User not found")
        
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
            raise ValueError("Invalid or expired token")
        
        # Update user password
        user = await user_crud.update_password(self.db, user_id=user_id_int, new_password=new_password)
        if not user:
            raise ValueError("User not found")
        
        return user

    async def confirm_user_by_code(self, code: str, email: str) -> User:
        """Confirms user email by 6-digit verification code"""
        print(f"DEBUG: confirm_user_by_code called with code={code}, email={email}")
        
        # Verify code against stored code in database
        user = await user_crud.verify_code(self.db, email=email, code=code, code_type='email_confirm')
        if not user:
            print(f"DEBUG: Code verification failed - invalid code or user not found")
            raise ValueError("Invalid verification code")
        
        print(f"DEBUG: Code verification successful for user {user.id}")
        
        # Check if user is already confirmed
        if user.is_verified:
            print(f"DEBUG: User {user.id} is already verified")
            raise ValueError("Email already confirmed")
        
        # Confirm email
        user = await user_crud.confirm_email(self.db, user_id=user.id)
        if not user:
            print(f"DEBUG: Failed to confirm email for user {user.id}")
            raise ValueError("User not found")
        
        print(f"DEBUG: Email confirmed successfully for user {user.id}")
        return user

    async def confirm_password_reset_by_code(self, code: str, email: str, new_password: str) -> User:
        """Confirms password reset by 6-digit verification code and sets new password"""
        # Verify code against stored code in database
        user = await user_crud.verify_code(self.db, email=email, code=code, code_type='password_reset')
        if not user:
            raise ValueError("Invalid verification code")
        
        # Update user password
        user = await user_crud.update_password(self.db, user_id=user.id, new_password=new_password)
        if not user:
            raise ValueError("User not found")
        
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
                raise ValueError("Invalid code type")
            
            return success, token
        except Exception as e:
            self.logger.error(f"Failed to resend verification code: {e}")
            return False, ""

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Gets user by email"""
        return await user_crud.get_by_email(self.db, email=email)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticates user"""
        return await user_crud.authenticate(self.db, email=email, password=password) 