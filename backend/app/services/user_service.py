from typing import Optional
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
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
        
        # Generate confirmation token
        token = self.serializer.dumps(str(user.id), salt='email-confirm')
        
        # Send email in background
        # Try enqueueing via Celery; if broker is read-only/unavailable, fallback to direct send
        try:
            from app.core.tasks import send_confirmation_email_task
            send_confirmation_email_task.delay(user.email, token)
        except Exception as celery_error:
            self.logger.warning(f"Celery publish failed, falling back to direct email: {celery_error}")
            from app.services.email_service import EmailService
            EmailService().send_confirmation_email(user.email, token)
        
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
        
        # Generate password reset token (1 hour expiration)
        token = self.serializer.dumps(str(user.id), salt='password-reset')
        
        # Send email in background
        try:
            from app.core.tasks import send_password_reset_email_task
            send_password_reset_email_task.delay(user.email, token)
        except Exception as celery_error:
            self.logger.warning(f"Celery publish failed, falling back to direct email: {celery_error}")
            from app.services.email_service import EmailService
            EmailService().send_password_reset_email(user.email, token)
        
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

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Gets user by email"""
        return await user_crud.get_by_email(self.db, email=email)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticates user"""
        return await user_crud.authenticate(self.db, email=email, password=password) 