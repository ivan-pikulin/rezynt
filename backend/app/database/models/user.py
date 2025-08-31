from sqlalchemy import Column, String, TIMESTAMP, Boolean, Integer, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    has_completed_onboarding = Column(Boolean, default=False, nullable=False)
    onboarding_responses = Column(JSON, nullable=True)
    credits = Column(Integer, default=100, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan", lazy="select")
