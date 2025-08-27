import json
from typing import Any, Dict, Optional

from app.api.deps import VerifiedUser, get_db
from app.core.config import settings
from app.database.crud.crud_resume import resume_manager
from app.schemas.resume import ChatMessage, ChatMessageList
from app.services import PlatformChatflow
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


class SendMessageRequest(BaseModel):
    message: str
    resume_id: int


@router.post("/send-message")
async def send_message(
    request: SendMessageRequest,
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Send message to chat via platform.
    """
    # Получаем резюме
    resume_obj = await resume_manager.get_resume_by_id(db, resume_id=request.resume_id)
    if not resume_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Проверяем, что резюме принадлежит пользователю
    if resume_obj.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Создаем агента платформы с соответствующим ключом
    app_key = settings.PLATFORM_UPLOAD_APP_KEY if resume_obj.from_upload else settings.PLATFORM_SCRATCH_APP_KEY
    platform_chatflow = PlatformChatflow(
        app_key=app_key,
        app_url=settings.PLATFORM_APP_URL,
        timeout=settings.PLATFORM_TIMEOUT
    )
    
    response = await platform_chatflow.chat(
        user_id=str(user.id),
        text=request.message,
        conversation_id=resume_obj.conversation_id,
        resume_id=str(request.resume_id)
    )
    
    # Обновляем conversation_id в резюме, если он изменился
    if response.conversation_id and response.conversation_id != resume_obj.conversation_id:
        await resume_manager.update_conversation_id(db, resume_id=request.resume_id, conversation_id=response.conversation_id)
    
    return {
        "message": "Message sent successfully",
        "response": response.text,
        "conversation_id": response.conversation_id
    }


@router.post("/send-message-stream")
async def send_message_stream(
    request: SendMessageRequest,
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db)
):
    """
    Send message to chat with streaming response via platform.
    """
    # Получаем резюме
    resume_obj = await resume_manager.get_resume_by_id(db, resume_id=request.resume_id)
    if not resume_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Проверяем, что резюме принадлежит пользователю
    if resume_obj.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Создаем агента платформы с соответствующим ключом
    app_key = settings.PLATFORM_UPLOAD_APP_KEY if resume_obj.from_upload else settings.PLATFORM_SCRATCH_APP_KEY
    platform_chatflow = PlatformChatflow(
        app_key=app_key,
        app_url=settings.PLATFORM_APP_URL,
        timeout=settings.PLATFORM_TIMEOUT
    )
    
    async def generate_stream():
        new_conversation_id = None
        async for chunk, conversation_id in platform_chatflow.chat_stream(
            user_id=str(user.id),
            text=request.message,
            conversation_id=resume_obj.conversation_id,
            resume_id=str(request.resume_id)
        ):
            new_conversation_id = conversation_id
            # Send chunk as SSE
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        
        # Update conversation_id if it changed
        if new_conversation_id and new_conversation_id != resume_obj.conversation_id:
            await resume_manager.update_conversation_id(db, resume_id=request.resume_id, conversation_id=new_conversation_id)
        
        # Send end signal
        yield f"data: {json.dumps({'end': True})}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )


@router.get("/messages/{resume_id}", response_model=ChatMessageList)
async def get_messages(
    resume_id: int,
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=50),
    first_id: Optional[str] = Query(None, description="Message ID to start from (for pagination)")
) -> ChatMessageList:
    """
    Get messages for a specific resume from platform.
    
    - Use first_id=null for latest messages (initial load)
    - Use first_id=message_id for older messages (pagination)
    """
    # Получаем резюме
    resume_obj = await resume_manager.get_resume_by_id(db, resume_id=resume_id)
    if not resume_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Проверяем, что резюме принадлежит пользователю
    if resume_obj.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Создаем агента платформы с соответствующим ключом
    app_key = settings.PLATFORM_UPLOAD_APP_KEY if resume_obj.from_upload else settings.PLATFORM_SCRATCH_APP_KEY
    platform_chatflow = PlatformChatflow(
        app_key=app_key,
        app_url=settings.PLATFORM_APP_URL,
        timeout=settings.PLATFORM_TIMEOUT
    )
    
    # Получаем сообщения с платформы
    platform_response = await platform_chatflow.get_messages(
        user_id=str(user.id),
        conversation_id=resume_obj.conversation_id,
        first_id=first_id,
        limit=limit
    )
    
    # Преобразуем сообщения платформы в наш формат
    messages = []
    for platform_msg in platform_response.data:
        # Добавляем сообщение пользователя
        messages.append(ChatMessage(
            id=f"{platform_msg.id}_user",
            role="user",
            content=platform_msg.query,
            created_at=platform_msg.created_at,
            conversation_id=platform_msg.conversation_id
        ))
        
        # Добавляем ответ ассистента
        messages.append(ChatMessage(
            id=f"{platform_msg.id}_assistant",
            role="assistant",
            content=platform_msg.answer,
            created_at=platform_msg.created_at,
            conversation_id=platform_msg.conversation_id
        ))
    
    return ChatMessageList(
        messages=messages,
        has_more=platform_response.has_more,
        limit=platform_response.limit
    )
