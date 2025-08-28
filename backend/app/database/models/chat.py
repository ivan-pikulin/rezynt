import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class MessageRole(str, enum.Enum):
    USER = "user"
    AI = "ai"


class ChatMessage(Base):
    """Model for storing resume chat messages"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship with resume
    resume = relationship("Resume", back_populates="chat_messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, resume_id={self.resume_id}, role={self.role}, created_at={self.created_at})>"
