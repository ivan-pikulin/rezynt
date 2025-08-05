from typing import List, Optional
from uuid import UUID

from app.database.crud.base import CRUDBase
from app.database.models import Resume
from app.schemas import ResumeCreate, ResumeUpdate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class CRUDResume(CRUDBase[Resume, ResumeCreate, ResumeUpdate]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: UUID) -> List[Resume]:
        result = await db.execute(select(self.model).where(Resume.user_id == user_id))
        return result.scalars().all()

    async def get_by_user_id_and_id(self, db: AsyncSession, *, user_id: UUID, resume_id: UUID) -> Optional[Resume]:
        result = await db.execute(
            select(self.model).where(Resume.user_id == user_id, Resume.id == resume_id)
        )
        return result.scalar_one_or_none()

    async def get_by_template_id(self, db: AsyncSession, *, template_id: UUID) -> List[Resume]:
        result = await db.execute(select(self.model).where(Resume.template_id == template_id))
        return result.scalars().all()


resume_crud = CRUDResume(Resume)
