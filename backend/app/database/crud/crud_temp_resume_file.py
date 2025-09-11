from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
import os
import uuid

from app.database.crud.base import CRUDBase
from app.database.models.temp_resume_file import TempResumeFile
from app.core.config import settings


class CRUDTempResumeFile(CRUDBase[TempResumeFile, None, None]):
    
    async def create_temp_file(
        self, 
        db: AsyncSession,
        filename: str, 
        file_content: bytes,
        content_type: str
    ) -> TempResumeFile:
        """Создает временный файл и сохраняет его на диск"""
        # Генерируем уникальный ID для файла
        file_id = str(uuid.uuid4())
        
        # Создаем директорию если не существует
        os.makedirs(settings.TEMP_UPLOAD_DIR, exist_ok=True)
        
        # Путь к файлу
        file_path = os.path.join(settings.TEMP_UPLOAD_DIR, f"{file_id}_{filename}")
        
        # Сохраняем файл на диск
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        # Создаем запись в БД
        temp_file = TempResumeFile(
            file_id=file_id,
            filename=filename,
            file_path=file_path,
            file_size=len(file_content),
            content_type=content_type,
            expires_at=datetime.utcnow() + timedelta(hours=settings.TEMP_FILE_EXPIRE_HOURS)
        )
        
        db.add(temp_file)
        await db.commit()
        await db.refresh(temp_file)
        
        return temp_file
    
    async def get_by_file_id(self, db: AsyncSession, file_id: str) -> Optional[TempResumeFile]:
        """Получает временный файл по file_id"""
        result = await db.execute(
            select(TempResumeFile).where(TempResumeFile.file_id == file_id)
        )
        return result.scalar_one_or_none()
    
    async def link_to_user(self, db: AsyncSession, file_id: str, user_id: int) -> Optional[TempResumeFile]:
        """Привязывает временный файл к пользователю"""
        temp_file = await self.get_by_file_id(db, file_id)
        if temp_file and not temp_file.is_expired:
            temp_file.user_id = user_id
            await db.commit()
            await db.refresh(temp_file)
            return temp_file
        return None
    
    async def get_by_user_id(self, db: AsyncSession, user_id: int) -> Optional[TempResumeFile]:
        """Получает временный файл пользователя"""
        result = await db.execute(
            select(TempResumeFile)
            .where(TempResumeFile.user_id == user_id)
            .where(TempResumeFile.expires_at > datetime.utcnow())
        )
        return result.scalar_one_or_none()
    
    async def delete_temp_file(self, db: AsyncSession, temp_file: TempResumeFile) -> bool:
        """Удаляет временный файл с диска и из БД"""
        try:
            # Удаляем файл с диска
            if os.path.exists(temp_file.file_path):
                os.remove(temp_file.file_path)
            
            # Удаляем запись из БД
            await db.delete(temp_file)
            await db.commit()
            return True
        except Exception:
            return False
    
    async def cleanup_expired_files(self, db: AsyncSession) -> int:
        """Очищает истекшие файлы"""
        # Находим истекшие файлы
        result = await db.execute(
            select(TempResumeFile).where(TempResumeFile.expires_at <= datetime.utcnow())
        )
        expired_files = result.scalars().all()
        
        deleted_count = 0
        for temp_file in expired_files:
            if await self.delete_temp_file(db, temp_file):
                deleted_count += 1
        
        return deleted_count


temp_resume_file_crud = CRUDTempResumeFile(TempResumeFile)
