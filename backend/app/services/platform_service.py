import logging
import json
import asyncio
from typing import AsyncGenerator

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

    async def chat_stream(self, user_id: str, text: str, conversation_id: str = None, resume_id: str = None) -> AsyncGenerator[str, None]:
        request_data = {
            "query": text,
            "user": user_id,
            "inputs": {"resume_id": resume_id} if resume_id else {},
            "response_mode": "streaming",
            "conversation_id": conversation_id or ""
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout)) as client:
            logger.info(f"Send streaming platform request: {self.app_url} with data: {request_data}")
            
            async with client.stream(
                "POST",
                self.app_url,
                json=request_data,
                headers={
                    "Authorization": f"Bearer {self.app_key}",
                    "Content-Type": "application/json"
                }
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"HTTP {response.status_code}: {error_text}")
                    raise Exception(f"HTTP {response.status_code}: {error_text}")
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]  # Remove "data: " prefix
                        if data_str.strip() == "":
                            continue
                        
                        try:
                            data = json.loads(data_str)
                            event = data.get("event")
                            
                            if event == "agent_message":
                                answer = data.get("answer", "")
                                if answer:
                                    yield answer
                            elif event == "message_end":
                                break
                            elif event == "error":
                                error_msg = data.get("message", "Unknown error")
                                logger.error(f"Streaming error: {error_msg}")
                                raise Exception(f"Streaming error: {error_msg}")
                                
                        except json.JSONDecodeError as e:
                            logger.warning(f"Failed to parse SSE data: {data_str}, error: {e}")
                            continue
