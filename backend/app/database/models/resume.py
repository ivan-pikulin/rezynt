from sqlalchemy import (TIMESTAMP, Boolean, Column, Date, ForeignKey, Integer,
                        String, Text)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class Resume(Base):
    __tablename__ = 'resumes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(100), nullable=False)
    template_id = Column(Integer, ForeignKey('templates.id'), nullable=False)
    professional_summary = Column(Text, nullable=True)
    conversation_id = Column(String(255), nullable=True)
    from_upload = Column(Boolean, nullable=False, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="resumes", lazy="select")
    template = relationship("Template", back_populates="resumes", lazy="select")
    personal_info = relationship("ResumePersonalInfo", back_populates="resume", uselist=False, cascade="all, delete-orphan", lazy="select")
    contacts = relationship("ResumeContact", back_populates="resume", cascade="all, delete-orphan", order_by="ResumeContact.id", lazy="select")
    skills = relationship("ResumeSkill", back_populates="resume", cascade="all, delete-orphan", order_by="ResumeSkill.id", lazy="select")
    experience = relationship("ResumeExperience", back_populates="resume", cascade="all, delete-orphan", order_by="ResumeExperience.id", lazy="select")
    education = relationship("ResumeEducation", back_populates="resume", cascade="all, delete-orphan", order_by="ResumeEducation.id", lazy="select")
    exports = relationship("ResumeExport", back_populates="resume", cascade="all, delete-orphan", lazy="select")
    chat_messages = relationship("ChatMessage", back_populates="resume", cascade="all, delete-orphan", order_by="ChatMessage.created_at", lazy="select")



class ResumePersonalInfo(Base):
    __tablename__ = 'resume_personal_info'

    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False, unique=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)

    # Relationships
    resume = relationship("Resume", back_populates="personal_info", lazy="select")


class ResumeContact(Base):
    __tablename__ = 'resume_contacts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    value = Column(String(255), nullable=False)

    # Relationships
    resume = relationship("Resume", back_populates="contacts", lazy="select")


class ResumeSkill(Base):
    __tablename__ = 'resume_skills'

    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(255), nullable=False)

    # Relationships
    resume = relationship("Resume", back_populates="skills", lazy="select")


class ResumeExperience(Base):
    __tablename__ = 'resume_experience'

    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    responsibilities = Column(JSONB, nullable=True)  # Array of strings

    # Relationships
    resume = relationship("Resume", back_populates="experience", lazy="select")


class ResumeEducation(Base):
    __tablename__ = 'resume_education'

    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    degree = Column(String(255), nullable=False)
    institution = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    graduation_date = Column(Date, nullable=True)

    # Relationships
    resume = relationship("Resume", back_populates="education", lazy="select")


class ResumeExport(Base):
    __tablename__ = 'resume_exports'

    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    export_format = Column(String(50), nullable=False)
    exported_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    file_size = Column(Integer, nullable=True)
    export_settings = Column(JSONB, nullable=True)

    # Relationships
    resume = relationship("Resume", back_populates="exports", lazy="select")


 
