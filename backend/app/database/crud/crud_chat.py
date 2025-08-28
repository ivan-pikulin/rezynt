from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import ChatMessage, MessageRole


class ChatMessageManager:
    """CRUD operations for chat messages"""
    
    async def create_message(
        self, 
        db: AsyncSession, 
        resume_id: int, 
        role: MessageRole, 
        content: str
    ) -> ChatMessage:
        """Create a new chat message"""
        message = ChatMessage(
            resume_id=resume_id,
            role=role,
            content=content
        )
        db.add(message)
        await db.flush()
        return message
    
    async def get_messages(
        self, 
        db: AsyncSession, 
        resume_id: int, 
        limit: int = 20, 
        offset: int = 0
    ) -> List[ChatMessage]:
        """Get chat messages for a resume with pagination"""
        query = select(ChatMessage).where(
            ChatMessage.resume_id == resume_id
        ).order_by(desc(ChatMessage.created_at)).offset(offset).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_message_count(self, db: AsyncSession, resume_id: int) -> int:
        """Get total count of messages for a resume"""
        query = select(ChatMessage).where(ChatMessage.resume_id == resume_id)
        result = await db.execute(query)
        return len(result.scalars().all())
    
    async def get_recent_messages(
        self, 
        db: AsyncSession, 
        resume_id: int, 
        limit: int = 5
    ) -> List[ChatMessage]:
        """Get recent messages for context (chronological order)"""
        query = select(ChatMessage).where(
            ChatMessage.resume_id == resume_id
        ).order_by(desc(ChatMessage.created_at)).limit(limit)
        
        result = await db.execute(query)
        messages = result.scalars().all()
        return list(reversed(messages))  # Return in chronological order


# Create singleton instance
chat_message_manager = ChatMessageManager()
