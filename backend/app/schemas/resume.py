from datetime import datetime, date
from typing import Any, Dict, Optional, List
from uuid import UUID

from pydantic import BaseModel


# Personal Info Schemas
class ResumePersonalInfoBase(BaseModel):
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    phone: str
    email: str
    location: str


class ResumePersonalInfoCreate(ResumePersonalInfoBase):
    resume_id: Optional[UUID] = None


class ResumePersonalInfoUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None


class ResumePersonalInfo(ResumePersonalInfoBase):
    id: UUID
    resume_id: UUID

    model_config = {"from_attributes": True}


# Skill Schemas
class ResumeSkillBase(BaseModel):
    name: str
    order_index: Optional[int] = 0


class ResumeSkillCreate(BaseModel):
    name: str
    resume_id: Optional[UUID] = None
    order_index: Optional[int] = None





class ResumeSkillUpdate(BaseModel):
    name: Optional[str] = None
    order_index: Optional[int] = None


class ResumeSkill(ResumeSkillBase):
    id: UUID
    resume_id: UUID

    model_config = {"from_attributes": True}


# Experience Schemas
class ResumeExperienceBase(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    responsibilities: Optional[List[str]] = None
    order_index: Optional[int] = 0


class ResumeExperienceCreate(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    responsibilities: Optional[List[str]] = None
    resume_id: Optional[UUID] = None
    order_index: Optional[int] = None





class ResumeExperienceUpdate(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    responsibilities: Optional[List[str]] = None
    order_index: Optional[int] = None


class ResumeExperience(ResumeExperienceBase):
    id: UUID
    resume_id: UUID

    model_config = {"from_attributes": True}


# Education Schemas
class ResumeEducationBase(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    graduation_date: Optional[date] = None
    order_index: Optional[int] = 0


class ResumeEducationCreate(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    graduation_date: Optional[date] = None
    resume_id: Optional[UUID] = None
    order_index: Optional[int] = None





class ResumeEducationUpdate(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    location: Optional[str] = None
    graduation_date: Optional[date] = None
    order_index: Optional[int] = None


class ResumeEducation(ResumeEducationBase):
    id: UUID
    resume_id: UUID

    model_config = {"from_attributes": True}


# Export Schemas
class ResumeExportBase(BaseModel):
    export_format: str
    file_size: Optional[int] = None
    export_settings: Optional[Dict[str, Any]] = None


class ResumeExportCreate(BaseModel):
    export_format: str
    file_size: Optional[int] = None
    export_settings: Optional[Dict[str, Any]] = None
    resume_id: Optional[UUID] = None





class ResumeExportUpdate(BaseModel):
    export_format: Optional[str] = None
    file_size: Optional[int] = None
    export_settings: Optional[Dict[str, Any]] = None


class ResumeExport(ResumeExportBase):
    id: UUID
    resume_id: UUID
    exported_at: datetime

    model_config = {"from_attributes": True}


# Main Resume Schemas
class ResumeBase(BaseModel):
    title: str
    template_id: UUID
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None


class ResumeCreate(BaseModel):
    title: str
    template_id: UUID
    professional_summary: Optional[str] = None


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[UUID] = None
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None


# Partial update for flexible field updates
class ResumePartialUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[UUID] = None
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None
    personal_info: Optional[ResumePersonalInfoUpdate] = None


class ResumeInDBBase(ResumeBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class Resume(ResumeInDBBase):
    personal_info: Optional[ResumePersonalInfo] = None
    skills: List[ResumeSkill] = []
    experience: List[ResumeExperience] = []
    education: List[ResumeEducation] = []
    exports: List[ResumeExport] = []


class ResumeInDB(ResumeInDBBase):
    pass


class ResumeWithTemplate(ResumeInDBBase):
    template: Optional[Dict[str, Any]] = None
    personal_info: Optional[ResumePersonalInfo] = None
    skills: List[ResumeSkill] = []
    experience: List[ResumeExperience] = []
    education: List[ResumeEducation] = []

    model_config = {"from_attributes": True}
