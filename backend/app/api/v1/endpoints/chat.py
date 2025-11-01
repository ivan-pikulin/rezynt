import json
import logging
from typing import Any, Dict, Optional

from app.api.deps import VerifiedUser, get_db
from app.schemas.resume import ChatMessageList
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter()


class SendMessageRequest(BaseModel):
    message: str


@router.post("/send-message")
async def send_message(
    request: SendMessageRequest,
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Send message to chat.
    Note: Platform integration removed. This endpoint needs to be reimplemented based on new requirements.
    """
    raise HTTPException(
        status_code=501,
        detail="Chat functionality needs to be reimplemented for new resume structure"
    )


@router.post("/send-message-stream")
async def send_message_stream(
    request: SendMessageRequest,
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db)
):
    """
    Send message to chat with streaming response.
    Note: Platform integration removed. This endpoint needs to be reimplemented based on new requirements.
    """
    raise HTTPException(
        status_code=501,
        detail="Chat streaming functionality needs to be reimplemented for new resume structure"
    )


@router.get("/messages", response_model=ChatMessageList)
async def get_messages(
    user: VerifiedUser,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=50),
    first_id: Optional[str] = Query(None, description="Message ID to start from (for pagination)")
) -> ChatMessageList:
    """
    Get chat messages for current user.
    Note: Platform integration removed. This endpoint needs to be reimplemented based on new requirements.
    """
    raise HTTPException(
        status_code=501,
        detail="Chat messages functionality needs to be reimplemented for new resume structure"
    )
