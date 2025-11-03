from datetime import datetime
from typing import Any, Dict, Optional, List

from pydantic import BaseModel


# Nested schemas for resume data
class Contacts(BaseModel):
    """Contact information schema"""
    email: Optional[str] = None
    phone: Optional[str] = None
    telegram: Optional[str] = None
    whatsapp: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None


class PersonalInfo(BaseModel):
    """Personal information schema"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    current_role: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    photo_url: Optional[str] = None
    contacts: Optional[Contacts] = None


class WorkExperience(BaseModel):
    """Work experience schema"""
    job_title: Optional[str] = None
    company: Optional[str] = None
    short_description: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    start_date: Optional[str] = None  # Format: "Month YYYY" or "YYYY-MM-DD"
    end_date: Optional[str] = None  # Format: "Month YYYY" or "YYYY-MM-DD" or null for current
    responsibilities: Optional[List[str]] = None
    achievements: Optional[List[str]] = None
    technologies_tools: Optional[List[str]] = None


class Education(BaseModel):
    """Education schema"""
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    start_date: Optional[str] = None  # Format: "Month YYYY"
    end_date: Optional[str] = None  # Format: "Month YYYY"
    relevant_courses: Optional[List[str]] = None


class Language(BaseModel):
    """Language proficiency schema"""
    language: Optional[str] = None
    proficiency: Optional[str] = None  # e.g., "Native", "Fluent", "Intermediate", "Basic"


class Award(BaseModel):
    """Award/achievement schema"""
    title: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None  # Format: "Month YYYY"
    description: Optional[str] = None


# Main resume data schema (JSONB structure)
class ResumeData(BaseModel):
    """Complete resume data structure stored in User.resume_data JSONB field"""
    personal_info: Optional[PersonalInfo] = None
    professional_summary: Optional[str] = None
    skills: Optional[List[str]] = None
    work_experience: Optional[List[WorkExperience]] = None
    education: Optional[List[Education]] = None
    languages_spoken: Optional[List[Language]] = None
    awards: Optional[List[Award]] = None


# API request/response schemas
class ResumeUpdate(BaseModel):
    """Schema for PUT /api/v1/resume endpoint - full resume update"""
    personal_info: Optional[PersonalInfo] = None
    professional_summary: Optional[str] = None
    skills: Optional[List[str]] = None
    work_experience: Optional[List[WorkExperience]] = None
    education: Optional[List[Education]] = None
    languages_spoken: Optional[List[Language]] = None
    awards: Optional[List[Award]] = None


class ResumeResponse(BaseModel):
    """Schema for resume API responses"""
    personal_info: Optional[PersonalInfo] = None
    professional_summary: Optional[str] = None
    skills: Optional[List[str]] = None
    work_experience: Optional[List[WorkExperience]] = None
    education: Optional[List[Education]] = None
    languages_spoken: Optional[List[Language]] = None
    awards: Optional[List[Award]] = None


# PDF Export Schema
class PDFExportRequest(BaseModel):
    """Schema for PDF export request"""
    html_content: Optional[str] = None
    filename: Optional[str] = None
    template_slug: Optional[str] = None  # Options: nume, luma, alto, vero


# OpenAI Structured Output Schema for resume parsing
class OpenAIStructuredResume(BaseModel):
    """Schema for OpenAI structured output when parsing resumes"""
    personal_info: Optional[PersonalInfo] = None
    professional_summary: Optional[str] = None
    skills: Optional[List[str]] = None
    work_experience: Optional[List[WorkExperience]] = None
    education: Optional[List[Education]] = None
    languages_spoken: Optional[List[Language]] = None
    awards: Optional[List[Award]] = None

