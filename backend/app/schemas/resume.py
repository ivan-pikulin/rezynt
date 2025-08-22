from datetime import datetime, date
from typing import Any, Dict, Optional, List, Union

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
    location: Optional[str] = None


class ResumePersonalInfoCreate(ResumePersonalInfoBase):
    resume_id: Optional[int] = None


class ResumePersonalInfoUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None


class ResumePersonalInfo(ResumePersonalInfoBase):
    id: int
    resume_id: int

    model_config = {"from_attributes": True}


# Contact Schemas
class ResumeContactBase(BaseModel):
    value: str


class ResumeContactCreate(BaseModel):
    value: str
    resume_id: Optional[int] = None


class ResumeContactUpdate(BaseModel):
    value: Optional[str] = None


class ResumeContact(ResumeContactBase):
    id: int
    resume_id: int

    model_config = {"from_attributes": True}


# Skill Schemas
class ResumeSkillBase(BaseModel):
    name: str


class ResumeSkillCreate(BaseModel):
    name: str
    resume_id: Optional[int] = None


class ResumeSkillUpdate(BaseModel):
    name: Optional[str] = None


class ResumeSkill(ResumeSkillBase):
    id: int
    resume_id: int

    model_config = {"from_attributes": True}


# Experience Schemas
class ResumeExperienceBase(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    responsibilities: Optional[List[str]] = None

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
    responsibilities: Optional[List[str]] = None
    resume_id: Optional[int] = None

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
    responsibilities: Optional[List[str]] = None

    @field_validator('start_date', mode='before')
    @classmethod
    def validate_start_date(cls, v):
        return parse_date(v)

    @field_validator('end_date', mode='before')
    @classmethod
    def validate_end_date(cls, v):
        return parse_date(v)


class ResumeExperience(ResumeExperienceBase):
    id: int
    resume_id: int

    model_config = {"from_attributes": True}


# Education Schemas
class ResumeEducationBase(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    graduation_date: Optional[date] = None

    @field_validator('graduation_date', mode='before')
    @classmethod
    def validate_graduation_date(cls, v):
        return parse_date(v)


class ResumeEducationCreate(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    graduation_date: Optional[date] = None
    resume_id: Optional[int] = None

    @field_validator('graduation_date', mode='before')
    @classmethod
    def validate_graduation_date(cls, v):
        return parse_date(v)


class ResumeEducationUpdate(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    location: Optional[str] = None
    graduation_date: Optional[date] = None

    @field_validator('graduation_date', mode='before')
    @classmethod
    def validate_graduation_date(cls, v):
        return parse_date(v)


class ResumeEducation(ResumeEducationBase):
    id: int
    resume_id: int

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
    resume_id: Optional[int] = None


class ResumeExportUpdate(BaseModel):
    export_format: Optional[str] = None
    file_size: Optional[int] = None
    export_settings: Optional[Dict[str, Any]] = None


class ResumeExport(ResumeExportBase):
    id: int
    resume_id: int
    exported_at: datetime

    model_config = {"from_attributes": True}


# Main Resume Schemas
class ResumeBase(BaseModel):
    title: str
    template_id: int
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None


class ResumeCreate(BaseModel):
    title: str
    template_id: int
    professional_summary: Optional[str] = None


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[int] = None
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None


# Partial update for flexible field updates
class ResumePartialUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[int] = None
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None
    personal_info: Optional[ResumePersonalInfoUpdate] = None


class ResumeInDBBase(ResumeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class Resume(ResumeInDBBase):
    personal_info: Optional[ResumePersonalInfo] = None
    contacts: List[ResumeContact] = []
    skills: List[ResumeSkill] = []
    experience: List[ResumeExperience] = []
    education: List[ResumeEducation] = []
    exports: List[ResumeExport] = []

    model_config = {"from_attributes": True}


class ResumeList(ResumeInDBBase):
    """Schema for listing resumes without exports to avoid lazy loading issues"""
    personal_info: Optional[ResumePersonalInfo] = None
    contacts: List[ResumeContact] = []
    skills: List[ResumeSkill] = []
    experience: List[ResumeExperience] = []
    education: List[ResumeEducation] = []


class ResumeInDB(ResumeInDBBase):
    pass


class ResumeWithTemplate(ResumeInDBBase):
    template: Optional[Template] = None
    personal_info: Optional[ResumePersonalInfo] = None
    contacts: List[ResumeContact] = []
    skills: List[ResumeSkill] = []
    experience: List[ResumeExperience] = []
    education: List[ResumeEducation] = []

    model_config = {"from_attributes": True, "arbitrary_types_allowed": True}


# OpenAI Structured Output Schemas
class OpenAIResumePersonalInfo(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    location: Optional[str] = None


class OpenAIResumeContact(BaseModel):
    value: str


class OpenAIResumeSkill(BaseModel):
    name: str


class OpenAIResumeExperience(BaseModel):
    jobTitle: str
    company: str
    location: Optional[str] = None
    startDate: str
    endDate: Optional[str] = None
    responsibilities: Optional[List[str]] = None


class OpenAIResumeEducation(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    graduationDate: Optional[str] = None


class OpenAIResumeUpdate(BaseModel):
    personalInfo: Optional[OpenAIResumePersonalInfo] = None
    contacts: Optional[List[OpenAIResumeContact]] = None
    professionalSummary: Optional[str] = None
    skills: Optional[List[OpenAIResumeSkill]] = None
    experience: Optional[List[OpenAIResumeExperience]] = None
    education: Optional[List[OpenAIResumeEducation]] = None


# Unified Resume Schema - единый объект резюме
class UnifiedResumeExperience(BaseModel):
    job_title: str
    company: str
    location: str
    start_date: datetime
    end_date: Optional[datetime] = None
    responsibilities: List[str] = []

    def dict(self, *args, **kwargs):
        return {
            "job_title": self.job_title,
            "company": self.company,
            "location": self.location,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "responsibilities": self.responsibilities
        }


class UnifiedResumeEducation(BaseModel):
    degree: str
    institution: str
    location: str
    graduation_date: Optional[datetime] = None

    def dict(self, *args, **kwargs):
        return {
            "degree": self.degree,
            "institution": self.institution,
            "location": self.location,
            "graduation_date": self.graduation_date.isoformat() if self.graduation_date else None
        }


class UnifiedResume(BaseModel):
    # Основная информация
    id: int
    user_id: int
    title: str
    template_id: Optional[int] = None
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Персональная информация
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    
    # Контакты и навыки
    contacts: List[str] = []
    skills: List[str] = []
    
    # Опыт и образование
    experience: List[UnifiedResumeExperience] = []
    education: List[UnifiedResumeEducation] = []
    
    def to_json(self) -> Dict[str, Any]:
        """Преобразует объект в JSON для возврата в API"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "template_id": self.template_id,
            "professional_summary": self.professional_summary,
            "conversation_id": self.conversation_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "location": self.location,
            "contacts": self.contacts,
            "skills": self.skills,
            "experience": [
                {
                    "job_title": exp.job_title,
                    "company": exp.company,
                    "location": exp.location,
                    "start_date": exp.start_date.isoformat() if exp.start_date else None,
                    "end_date": exp.end_date.isoformat() if exp.end_date else None,
                    "responsibilities": exp.responsibilities
                }
                for exp in self.experience
            ],
            "education": [
                {
                    "degree": edu.degree,
                    "institution": edu.institution,
                    "location": edu.location,
                    "graduation_date": edu.graduation_date.isoformat() if edu.graduation_date else None
                }
                for edu in self.education
            ]
        }


# AI Update Schema for JSON files from ai/ folder
class AIResumeUpdate(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    template_id: Optional[int] = None
    professional_summary: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    contacts: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
