import logging

import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class PlatformMessage(BaseModel):
    text: str
    conversation_id: str = None

class PlatformChatflow:
    def __init__(self, app_key: str, app_url: str, timeout: int = 60):
        self.app_key = app_key
        self.app_url = app_url
        self.timeout = timeout

    async def chat(self, user_id: str, text: str, conversation_id: str = None, resume_id: str = None) -> PlatformMessage:
        request_data = {
            "query": text,
            "user": user_id,
            "inputs": {"resume_id": resume_id} if resume_id else {},
            "response_mode": "blocking",
            "conversation_id": conversation_id or ""
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout)) as client:
            logger.info(f"Send platform request: {self.app_url} with data: {request_data}")
            response = await client.post(
                self.app_url,
                json=request_data,
                headers={
                    "Authorization": f"Bearer {self.app_key}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"HTTP {response.status_code}: {response.text}")
                raise Exception(f"HTTP {response.status_code}: {response.text}")
            
            # Читаем ответ как JSON
            response_data = response.json()
            logger.debug(f"Dify response: {response_data}")
            
            # Извлекаем данные из ответа
            answer = response_data.get("answer", "")
            conversation_id = response_data.get("conversation_id")

            return PlatformMessage(text=answer, conversation_id=conversation_id)
