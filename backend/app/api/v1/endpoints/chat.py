from typing import Any, Dict, List, Optional
from pydantic import BaseModel

from app.api.deps import VerifiedUser, get_db
from app.services import PlatformChatflow
from app.core.config import settings
from app.database.crud.crud_resume import resume_crud, message_crud
from app.schemas.resume import Message, MessageList
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import json

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
    Send message to chat.
    """
    # Получаем резюме
    resume_obj = await resume_crud.get(db, id=request.resume_id)
    if not resume_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Проверяем, что резюме принадлежит пользователю
    if resume_obj.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Сохраняем сообщение пользователя
    user_message = await message_crud.create_message(
        db, 
        resume_id=request.resume_id, 
        role="user", 
        content=request.message
    )
    
    # Создаем агента платформы
    platform_chatflow = PlatformChatflow(
        app_key=settings.PLATFORM_APP_KEY,
        app_url=settings.PLATFORM_APP_URL,
        timeout=settings.PLATFORM_TIMEOUT
    )
    
    response = await platform_chatflow.chat(
        user_id=str(user.id),
        text=request.message,
        conversation_id=resume_obj.conversation_id,
        resume_id=str(request.resume_id)
    )
    
    # Сохраняем ответ бота
    bot_message = await message_crud.create_message(
        db, 
        resume_id=request.resume_id, 
        role="assistant", 
        content=response.text
    )
    
    # Обновляем conversation_id в резюме, если он изменился
    if response.conversation_id and response.conversation_id != resume_obj.conversation_id:
        from app.schemas.resume import ResumeUpdate
        update_data = ResumeUpdate(conversation_id=response.conversation_id)
        await resume_crud.update(db, db_obj=resume_obj, obj_in=update_data)
    
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
    Send message to chat with streaming response.
    """
    # Получаем резюме
    resume_obj = await resume_crud.get(db, id=request.resume_id)
    if not resume_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Проверяем, что резюме принадлежит пользователю
    if resume_obj.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Сохраняем сообщение пользователя
    user_message = await message_crud.create_message(
        db, 
        resume_id=request.resume_id, 
        role="user", 
        content=request.message
    )
    
    # Создаем агента платформы
    platform_chatflow = PlatformChatflow(
        app_key=settings.PLATFORM_APP_KEY,
        app_url=settings.PLATFORM_APP_URL,
        timeout=settings.PLATFORM_TIMEOUT
    )
    
    async def generate_stream():
        full_response = ""
        new_conversation_id = None
        
        try:
            async for chunk, conversation_id in platform_chatflow.chat_stream(
                user_id=str(user.id),
                text=request.message,
                conversation_id=resume_obj.conversation_id,
                resume_id=str(request.resume_id)
            ):
                full_response += chunk
                new_conversation_id = conversation_id
                # Send chunk as SSE
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            # Save the complete response
            await message_crud.create_message(
                db, 
                resume_id=request.resume_id, 
                role="assistant", 
                content=full_response
            )
            
            # Update conversation_id if it changed
            if new_conversation_id and new_conversation_id != resume_obj.conversation_id:
                from app.schemas.resume import ResumeUpdate
                update_data = ResumeUpdate(conversation_id=new_conversation_id)
                await resume_crud.update(db, db_obj=resume_obj, obj_in=update_data)
            
            # Send end signal
            yield f"data: {json.dumps({'end': True})}\n\n"
            
        except Exception as e:
            # Send error signal
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
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


@router.get("/messages/{resume_id}", response_model=MessageList)
async def get_messages(
    resume_id: int,
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(10, ge=1, le=50),
    cursor: Optional[int] = Query(None, description="Message ID to start from (for pagination)"),
    direction: str = Query("backward", description="Direction: 'backward' for older messages, 'forward' for newer")
) -> MessageList:
    """
    Get messages for a specific resume with cursor-based pagination.
    
    - Use cursor=null for latest messages (initial load)
    - Use cursor=message_id&direction=backward for older messages
    - Use cursor=message_id&direction=forward for newer messages (if needed)
    """
    # Получаем резюме
    resume_obj = await resume_crud.get(db, id=resume_id)
    if not resume_obj:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Проверяем, что резюме принадлежит пользователю
    if resume_obj.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Получаем сообщения в зависимости от параметров
    if cursor is None:
        # Initial load - get latest messages
        messages = await message_crud.get_latest_messages_by_resume_id(
            db, 
            resume_id=resume_id, 
            limit=limit
        )
    elif direction == "backward":
        # Get older messages before cursor
        messages = await message_crud.get_older_messages_by_resume_id(
            db, 
            resume_id=resume_id, 
            before_message_id=cursor,
            limit=limit
        )
    else:
        # Forward pagination (if needed in future)
        raise HTTPException(status_code=400, detail="Forward pagination not implemented yet")
    
    # Получаем общее количество сообщений
    total = await message_crud.get_messages_count_by_resume_id(db, resume_id=resume_id)
    
    # Определяем, есть ли еще сообщения
    has_more = len(messages) == limit
    
    return MessageList(
        messages=messages,
        total=total,
        has_more=has_more
    )
