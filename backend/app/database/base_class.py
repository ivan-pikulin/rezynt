from typing import Any

from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    id: Any
    __name__: str

    # Generate __tablename__ automatically
    @declared_attr.directive
    def __tablename__(cls) -> str:
        # If the class has explicitly defined a tablename, use that
        if hasattr(cls, '__tablename__'):
            return cls.__tablename__
        # Otherwise generate it from the class name
        return cls.__name__.lower()

    # Add created_at and updated_at to all tables
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False) 