from typing import Any, Dict, Optional, Union

from app.core.security import get_password_hash, verify_password
from app.database.crud.base import CRUDBase
from app.database.models import User
from app.schemas import UserCreate, UserUpdate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        result = await db.execute(select(self.model).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            password_hash=get_password_hash(obj_in.password),
            is_verified=False,
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
            update_data["password_hash"] = hashed_password
        return await super().update(db, db_obj=db_obj, obj_in=update_data)

    async def authenticate(self, db: AsyncSession, *, email: str, password: str) -> Optional[User]:
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return user.is_verified

    async def confirm_email(self, db: AsyncSession, *, user_id: int) -> Optional[User]:
        user = await self.get(db, id=user_id)
        if user:
            user.is_verified = True
            await db.commit()
            await db.refresh(user)
        return user

    async def update_premium_status(self, db: AsyncSession, *, user_id: int, is_premium: bool) -> Optional[User]:
        """
        Update premium status of a user. This method should only be called by admin endpoints.
        """
        user = await self.get(db, id=user_id)
        if user:
            user.is_premium = is_premium
            await db.commit()
            await db.refresh(user)
        return user


user_crud = CRUDUser(User)
