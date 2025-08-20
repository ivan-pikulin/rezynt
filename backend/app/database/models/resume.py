from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, Text, Boolean, Date, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base
import uuid


class Resume(Base):
    __tablename__ = 'resumes'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(100), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey('templates.id'), nullable=False)
    professional_summary = Column(Text, nullable=True)
    conversation_id = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="resumes", lazy="select")
    template = relationship("Template", back_populates="resumes", lazy="select")
    personal_info = relationship("ResumePersonalInfo", back_populates="resume", uselist=False, cascade="all, delete-orphan", lazy="select")
    skills = relationship("ResumeSkill", back_populates="resume", cascade="all, delete-orphan", order_by="ResumeSkill.order_index", lazy="select")
    experience = relationship("ResumeExperience", back_populates="resume", cascade="all, delete-orphan", order_by="ResumeExperience.order_index", lazy="select")
    education = relationship("ResumeEducation", back_populates="resume", cascade="all, delete-orphan", order_by="ResumeEducation.order_index", lazy="select")
    exports = relationship("ResumeExport", back_populates="resume", cascade="all, delete-orphan", lazy="select")


class ResumePersonalInfo(Base):
    __tablename__ = 'resume_personal_info'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False, unique=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    middle_name = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)

    # Relationships
    resume = relationship("Resume", back_populates="personal_info", lazy="select")


class ResumeSkill(Base):
    __tablename__ = 'resume_skills'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(255), nullable=False)
    order_index = Column(Integer, default=0)

    # Relationships
    resume = relationship("Resume", back_populates="skills", lazy="select")


class ResumeExperience(Base):
    __tablename__ = 'resume_experience'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    responsibilities = Column(JSONB, nullable=True)  # Array of strings
    order_index = Column(Integer, default=0)

    # Relationships
    resume = relationship("Resume", back_populates="experience", lazy="select")


class ResumeEducation(Base):
    __tablename__ = 'resume_education'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    degree = Column(String(255), nullable=False)
    institution = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    graduation_date = Column(Date, nullable=True)
    order_index = Column(Integer, default=0)

    # Relationships
    resume = relationship("Resume", back_populates="education", lazy="select")


class ResumeExport(Base):
    __tablename__ = 'resume_exports'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    export_format = Column(String(50), nullable=False)
    exported_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    file_size = Column(Integer, nullable=True)
    export_settings = Column(JSONB, nullable=True)

    # Relationships
    resume = relationship("Resume", back_populates="exports", lazy="select") 
