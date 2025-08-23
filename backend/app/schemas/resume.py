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


# Unified Resume Experience and Education schemas
class UnifiedResumeExperience(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    responsibilities: List[str] = []

    @field_validator('start_date', mode='before')
    @classmethod
    def validate_start_date(cls, v):
        return parse_date(v)

    @field_validator('end_date', mode='before')
    @classmethod
    def validate_end_date(cls, v):
        return parse_date(v)


class UnifiedResumeEducation(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    graduation_date: Optional[date] = None

    @field_validator('graduation_date', mode='before')
    @classmethod
    def validate_graduation_date(cls, v):
        return parse_date(v)


# Partial update for flexible field updates
class ResumePartialUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[int] = None
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None
    
    # UnifiedResume fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    contacts: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[UnifiedResumeExperience]] = None
    education: Optional[List[UnifiedResumeEducation]] = None


# Main Resume Schemas
class ResumeBase(BaseModel):
    title: str
    template_id: Optional[int] = None
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None


class ResumeCreate(BaseModel):
    title: str
    template_id: Optional[int] = None
    professional_summary: Optional[str] = None


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[int] = None
    professional_summary: Optional[str] = None
    conversation_id: Optional[str] = None


class ResumeInDBBase(ResumeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class Resume(ResumeInDBBase):
    # UnifiedResume structure
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    contacts: List[str] = []
    skills: List[str] = []
    experience: List[UnifiedResumeExperience] = []
    education: List[UnifiedResumeEducation] = []

    model_config = {"from_attributes": True}


class ResumeList(ResumeInDBBase):
    """Schema for listing resumes"""
    pass


class ResumeInDB(ResumeInDBBase):
    pass


class ResumeWithTemplate(ResumeInDBBase):
    template: Optional[Template] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    contacts: List[str] = []
    skills: List[str] = []
    experience: List[UnifiedResumeExperience] = []
    education: List[UnifiedResumeEducation] = []

    model_config = {"from_attributes": True, "arbitrary_types_allowed": True}


# Legacy schemas for database compatibility (simplified)
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


class ResumeExportBase(BaseModel):
    format: str
    status: str
    file_path: Optional[str] = None


class ResumeExportCreate(BaseModel):
    format: str
    status: str
    file_path: Optional[str] = None
    resume_id: Optional[int] = None


class ResumeExportUpdate(BaseModel):
    format: Optional[str] = None
    status: Optional[str] = None
    file_path: Optional[str] = None


class ResumeExport(ResumeExportBase):
    id: int
    resume_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


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


# PDF Export Schema
class PDFExportRequest(BaseModel):
    """Schema for PDF export request"""
    html_content: str
    filename: Optional[str] = None


# Unified Resume Schema - единый объект резюме
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
