from typing import Any, Dict

from app.api.deps import VerifiedUser
from fastapi import APIRouter

router = APIRouter()


@router.post("/send-message")
async def send_message(
    message: str,
    user: VerifiedUser
) -> Dict[str, Any]:
    """
    Send message to chat.
    """
    # TODO: Implement actual message sending
    return {"message": "Message sent"}
