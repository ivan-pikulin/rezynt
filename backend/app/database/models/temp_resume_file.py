from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database.base_class import Base


class TempResumeFile(Base):
    __tablename__ = "temp_resume_files"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, unique=True, index=True, nullable=False)  # UUID для файла
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Путь к файлу на диске
    file_size = Column(Integer, nullable=False)
    content_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)  # TTL для автоочистки
    user_id = Column(Integer, ForeignKey("users.id", ondelete='CASCADE'), nullable=True)  # Привязка к пользователю после регистрации
    
    # Relationship
    user = relationship("User", back_populates="temp_resume_files")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Автоматически устанавливаем время истечения
        if not self.expires_at:
            self.expires_at = datetime.utcnow() + timedelta(hours=24)
    
    @property
    def is_expired(self) -> bool:
        """Проверяет, истек ли файл"""
        return datetime.utcnow() > self.expires_at
    
    @property
    def is_linked_to_user(self) -> bool:
        """Проверяет, привязан ли файл к пользователю"""
        return self.user_id is not None
