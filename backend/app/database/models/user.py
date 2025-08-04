from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from .base import Base

class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, nullable=False, default=False)
    last_login = Column(TIMESTAMP(timezone=True), nullable=True)
