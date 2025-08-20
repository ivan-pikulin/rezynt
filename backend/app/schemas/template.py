from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TemplateBase(BaseModel):
    slug: str
    name: str
    is_premium: bool = False


class TemplateCreate(BaseModel):
    slug: str
    name: str
    is_premium: bool = False


class TemplateUpdate(BaseModel):
    slug: Optional[str] = None
    name: Optional[str] = None
    is_premium: Optional[bool] = None


class TemplateInDBBase(TemplateBase):
    id: UUID

    model_config = {"from_attributes": True}


class Template(TemplateInDBBase):
    pass


class TemplateInDB(TemplateInDBBase):
    pass 