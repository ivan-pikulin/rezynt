from typing import Optional
from uuid import UUID
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.crud import user_crud
from app.schemas import UserCreate, User
from app.core.tasks import send_confirmation_email


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

    async def create_user(self, user_in: UserCreate) -> User:
        """Создает нового пользователя и отправляет email для подтверждения"""
        # Проверяем, существует ли пользователь с таким email
        existing_user = await user_crud.get_by_email(self.db, email=user_in.email)
        if existing_user:
            raise ValueError("Пользователь с таким email уже существует")
        
        # Создаем пользователя
        user = await user_crud.create(self.db, obj_in=user_in)
        
        # Генерируем токен для подтверждения
        token = self.serializer.dumps(str(user.id), salt='email-confirm')
        
        # Отправляем email в фоновом режиме
        send_confirmation_email.delay(user.email, token)
        
        return user

    async def confirm_user(self, token: str) -> User:
        """Подтверждает email пользователя по токену"""
        try:
            # Расшифровываем токен (срок действия 24 часа)
            user_id = self.serializer.loads(token, salt='email-confirm', max_age=86400)
            user_uuid = UUID(user_id)
        except Exception:
            raise ValueError("Invalid or expired token")
        
        # Подтверждаем email
        user = await user_crud.confirm_email(self.db, user_id=user_uuid)
        if not user:
            raise ValueError("User not found")
        
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Получает пользователя по email"""
        return await user_crud.get_by_email(self.db, email=email)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Аутентифицирует пользователя"""
        return await user_crud.authenticate(self.db, email=email, password=password) 