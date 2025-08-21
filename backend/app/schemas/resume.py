from datetime import datetime, date
from typing import Any, Dict, Optional, List, Union
from uuid import UUID

from pydantic import BaseModel, field_validator
from app.schemas.template import Template


def parse_date(value: Union[str, date, None]) -> Optional[date]:
    """Parse date from string or return date object"""
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError(f"Invalid date format: {value}. Expected YYYY-MM-DD")
    raise ValueError(f"Invalid date type: {type(value)}")


# Personal Info Schemas
class ResumePersonalInfoBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None


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

    @field_validator('start_date', mode='before')
    @classmethod
    def validate_start_date(cls, v):
        return parse_date(v)

    @field_validator('end_date', mode='before')
    @classmethod
    def validate_end_date(cls, v):
        return parse_date(v)


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

    @field_validator('start_date', mode='before')
    @classmethod
    def validate_start_date(cls, v):
        return parse_date(v)

    @field_validator('end_date', mode='before')
    @classmethod
    def validate_end_date(cls, v):
        return parse_date(v)


class ResumeExperienceUpdate(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    responsibilities: Optional[List[str]] = None
    order_index: Optional[int] = None

    @field_validator('start_date', mode='before')
    @classmethod
    def validate_start_date(cls, v):
        return parse_date(v)

    @field_validator('end_date', mode='before')
    @classmethod
    def validate_end_date(cls, v):
        return parse_date(v)


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

    @field_validator('graduation_date', mode='before')
    @classmethod
    def validate_graduation_date(cls, v):
        return parse_date(v)


class ResumeEducationCreate(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    graduation_date: Optional[date] = None
    resume_id: Optional[UUID] = None
    order_index: Optional[int] = None

    @field_validator('graduation_date', mode='before')
    @classmethod
    def validate_graduation_date(cls, v):
        return parse_date(v)


class ResumeEducationUpdate(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    location: Optional[str] = None
    graduation_date: Optional[date] = None
    order_index: Optional[int] = None

    @field_validator('graduation_date', mode='before')
    @classmethod
    def validate_graduation_date(cls, v):
        return parse_date(v)


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

    model_config = {"from_attributes": True}


class ResumeList(ResumeInDBBase):
    """Schema for listing resumes without exports to avoid lazy loading issues"""
    personal_info: Optional[ResumePersonalInfo] = None
    skills: List[ResumeSkill] = []
    experience: List[ResumeExperience] = []
    education: List[ResumeEducation] = []


class ResumeInDB(ResumeInDBBase):
    pass


class ResumeWithTemplate(ResumeInDBBase):
    template: Optional[Template] = None
    personal_info: Optional[ResumePersonalInfo] = None
    skills: List[ResumeSkill] = []
    experience: List[ResumeExperience] = []
    education: List[ResumeEducation] = []

    model_config = {"from_attributes": True, "arbitrary_types_allowed": True}


# OpenAI Structured Output Schemas
class OpenAIResumePersonalInfo(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    middleName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None


class OpenAIResumeSkill(BaseModel):
    name: str


class OpenAIResumeExperience(BaseModel):
    jobTitle: str
    company: str
    location: Optional[str] = None
    startDate: str
    endDate: Optional[str] = None
    isCurrent: bool
    responsibilities: Optional[List[str]] = None


class OpenAIResumeEducation(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    graduationDate: Optional[str] = None


class OpenAIResumeUpdate(BaseModel):
    personalInfo: Optional[OpenAIResumePersonalInfo] = None
    professionalSummary: Optional[str] = None
    skills: Optional[List[OpenAIResumeSkill]] = None
    experience: Optional[List[OpenAIResumeExperience]] = None
    education: Optional[List[OpenAIResumeEducation]] = None
