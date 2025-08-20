from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base
import uuid


class Template(Base):
    __tablename__ = 'templates'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), nullable=False)
    name = Column(String(100), nullable=False)
    is_premium = Column(Boolean, default=False)

    # Relationships
    resumes = relationship("Resume", back_populates="template", lazy="select")
