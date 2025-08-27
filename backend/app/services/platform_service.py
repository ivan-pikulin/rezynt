import logging
import json
import asyncio
from typing import AsyncGenerator, List, Optional, Dict, Any

import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class PlatformMessage(BaseModel):
    text: str
    conversation_id: str = None


class PlatformMessageFile(BaseModel):
    id: str
    type: str
    url: str
    belongs_to: str


class PlatformAgentThought(BaseModel):
    id: str
    message_id: str
    position: int
    thought: str
    observation: str
    tool: str
    tool_input: str
    created_at: int
    message_files: List[str] = []


class PlatformRetrieverResource(BaseModel):
    position: int
    dataset_id: str
    dataset_name: str
    document_id: str
    document_name: str
    segment_id: str
    score: float
    content: str


class PlatformMessageResponse(BaseModel):
    id: str
    conversation_id: str
    inputs: Dict[str, Any] = {}
    query: str
    answer: str
    message_files: List[PlatformMessageFile] = []
    feedback: Optional[Dict[str, Any]] = None
    retriever_resources: List[PlatformRetrieverResource] = []
    agent_thoughts: List[PlatformAgentThought] = []
    created_at: int


class PlatformMessagesResponse(BaseModel):
    limit: int
    has_more: bool
    data: List[PlatformMessageResponse]

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

    async def chat_stream(self, user_id: str, text: str, conversation_id: str = None, resume_id: str = None) -> AsyncGenerator[tuple[str, str], None]:
        """
        Stream chat response and yield (chunk, conversation_id) tuples.
        Returns the conversation_id from the first message event.
        """
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
                
                current_conversation_id = conversation_id
                
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
                                # Capture conversation_id from the first message
                                if not current_conversation_id:
                                    current_conversation_id = data.get("conversation_id")
                                if answer:
                                    yield (answer, current_conversation_id or "")
                            elif event == "message_end":
                                # Update conversation_id from message_end event
                                current_conversation_id = data.get("conversation_id", current_conversation_id)
                                break
                            elif event == "error":
                                error_msg = data.get("message", "Unknown error")
                                logger.error(f"Streaming error: {error_msg}")
                                raise Exception(f"Streaming error: {error_msg}")
                                
                        except json.JSONDecodeError as e:
                            logger.warning(f"Failed to parse SSE data: {data_str}, error: {e}")
                            continue

    async def get_messages(
        self, 
        user_id: str, 
        conversation_id: str = None, 
        first_id: str = None, 
        limit: int = 20
    ) -> PlatformMessagesResponse:
        """
        Get conversation history messages from platform.
        """
        # Construct the messages API URL
        messages_url = self.app_url.replace('/chat-messages', '/messages')
        
        params = {
            "user": user_id,
            "limit": limit
        }
        
        if conversation_id:
            params["conversation_id"] = conversation_id
        
        if first_id:
            params["first_id"] = first_id

        async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout)) as client:
            logger.info(f"Get platform messages: {messages_url} with params: {params}")
            response = await client.get(
                messages_url,
                params=params,
                headers={
                    "Authorization": f"Bearer {self.app_key}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"HTTP {response.status_code}: {response.text}")
                raise Exception(f"HTTP {response.status_code}: {response.text}")
            
            response_data = response.json()
            logger.debug(f"Platform messages response: {response_data}")
            
            return PlatformMessagesResponse(**response_data)
