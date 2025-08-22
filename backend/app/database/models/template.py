from sqlalchemy import Column, String, Boolean, Integer
from sqlalchemy.orm import relationship
from .base import Base


class Template(Base):
    __tablename__ = 'templates'

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(100), nullable=False)
    name = Column(String(100), nullable=False)
    is_premium = Column(Boolean, default=False)

    # Relationships
    resumes = relationship("Resume", back_populates="template", lazy="select")
