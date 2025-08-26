from typing import Optional
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.crud import user_crud
from app.schemas import UserCreate, User


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

    async def signup(self, user_in: UserCreate) -> User:
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
        from app.core.tasks import send_confirmation_email_task
        send_confirmation_email_task.delay(user.email, token)
        
        return user

    async def confirm_user(self, token: str) -> User:
        """Подтверждает email пользователя по токену"""
        try:
            # Расшифровываем токен (срок действия 24 часа)
            user_id = self.serializer.loads(token, salt='email-confirm', max_age=86400)
            user_id_int = int(user_id)
        except Exception:
            raise ValueError("Invalid or expired token")
        
        # Подтверждаем email
        user = await user_crud.confirm_email(self.db, user_id=user_id_int)
        if not user:
            raise ValueError("User not found")
        
        return user

    async def request_password_reset(self, email: str) -> bool:
        """Запрашивает сброс пароля и отправляет email с токеном"""
        # Проверяем, существует ли пользователь с таким email
        user = await user_crud.get_by_email(self.db, email=email)
        if not user:
            # Для безопасности не сообщаем, что пользователь не существует
            return True
        
        # Генерируем токен для сброса пароля (срок действия 1 час)
        token = self.serializer.dumps(str(user.id), salt='password-reset')
        
        # Отправляем email в фоновом режиме
        from app.core.tasks import send_password_reset_email_task
        send_password_reset_email_task.delay(user.email, token)
        
        return True

    async def confirm_password_reset(self, token: str, new_password: str) -> User:
        """Подтверждает сброс пароля по токену и устанавливает новый пароль"""
        try:
            # Расшифровываем токен (срок действия 1 час)
            user_id = self.serializer.loads(token, salt='password-reset', max_age=3600)
            user_id_int = int(user_id)
        except Exception:
            raise ValueError("Invalid or expired token")
        
        # Обновляем пароль пользователя
        user = await user_crud.update_password(self.db, user_id=user_id_int, new_password=new_password)
        if not user:
            raise ValueError("User not found")
        
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Получает пользователя по email"""
        return await user_crud.get_by_email(self.db, email=email)

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Аутентифицирует пользователя"""
        return await user_crud.authenticate(self.db, email=email, password=password) 