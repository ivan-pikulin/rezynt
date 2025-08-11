from typing import Any, Dict
from uuid import UUID
from pydantic import BaseModel

from app.api.deps import VerifiedUser, get_db
from app.services import PlatformAgent
from app.core.config import settings
from app.database.crud.crud_resume import resume
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


class SendMessageRequest(BaseModel):
    message: str
    resume_id: UUID


@router.post("/send-message")
async def send_message(
    request: SendMessageRequest,
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Send message to chat.
    """
    # Получаем резюме
    resume_obj = await resume.get(db, id=request.resume_id)
    if not resume_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Проверяем, что резюме принадлежит пользователю
    if resume_obj.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Создаем агента платформы
    platform_agent = PlatformAgent(
        app_key=settings.PLATFORM_APP_KEY,
        app_url=settings.PLATFORM_APP_URL,
        timeout=settings.PLATFORM_TIMEOUT
    )
    
    # Отправляем сообщение
    try:
        response = await platform_agent.chat(
            user_id=str(user.id),
            text=request.message,
            conversation_id=resume_obj.conversation_id
        )
        
        # Обновляем conversation_id в резюме, если он изменился
        if response.conversation_id and response.conversation_id != resume_obj.conversation_id:
            resume_obj.conversation_id = response.conversation_id
            await resume.update(db, db_obj=resume_obj, obj_in={"conversation_id": response.conversation_id})
        
        return {
            "message": "Message sent successfully",
            "response": response.text,
            "conversation_id": response.conversation_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")
