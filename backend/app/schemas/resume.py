from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class ResumeBase(BaseModel):
    title: str
    template_id: UUID
    content: Dict[str, Any]
    conversation_id: Optional[str] = None


class ResumeCreate(BaseModel):
    title: str
    template_id: UUID
    content: Dict[str, Any]


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[UUID] = None
    content: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None


class ResumeInDBBase(ResumeBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Resume(ResumeInDBBase):
    pass


class ResumeInDB(ResumeInDBBase):
    pass


class ResumeWithTemplate(ResumeInDBBase):
    template: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
