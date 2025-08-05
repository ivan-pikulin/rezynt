from typing import List, Optional

from app.database.crud.base import CRUDBase
from app.database.models import Template
from app.schemas import TemplateCreate, TemplateUpdate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class CRUDTemplate(CRUDBase[Template, TemplateCreate, TemplateUpdate]):
    async def get_by_slug(self, db: AsyncSession, *, slug: str) -> Optional[Template]:
        result = await db.execute(select(self.model).where(Template.slug == slug))
        return result.scalar_one_or_none()

    async def get_premium_templates(self, db: AsyncSession) -> List[Template]:
        result = await db.execute(select(self.model).where(Template.is_premium == True))
        return result.scalars().all()

    async def get_free_templates(self, db: AsyncSession) -> List[Template]:
        result = await db.execute(select(self.model).where(Template.is_premium == False))
        return result.scalars().all()


template_crud = CRUDTemplate(Template)
