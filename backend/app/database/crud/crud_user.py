from typing import Any, Dict, Optional, Union

from app.core.security import get_password_hash, verify_password
from app.database.crud.base import CRUDBase
from app.database.models import User
from app.schemas import UserCreate, UserUpdate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def get_by_username(self, db: AsyncSession, *, username: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(User.username == username))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        db_obj = User(
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        return await super().update(db, db_obj=db_obj, obj_in=update_data)

    async def authenticate(self, db: AsyncSession, *, username: str, password: str) -> Optional[User]:
        user = await self.get_by_username(db, username=username)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return True  # All users are active in our system

    async def update_last_login(self, db: AsyncSession, user_id: int):
        user = await self.get(db, id=user_id)
        if user:
            from datetime import datetime
            user.last_login = datetime.utcnow()
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user

    async def update_admin_status(self, db: AsyncSession, user_id: int, is_admin: bool) -> Optional[User]:
        """Update user's admin status."""
        user = await self.get(db, id=user_id)
        if user:
            user.is_admin = is_admin
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user


user_crud = CRUDUser(User)
