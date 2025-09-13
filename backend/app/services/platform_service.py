import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

import httpx
from pydantic import BaseModel, ConfigDict

logger = logging.getLogger(__name__)

class PlatformMessage(BaseModel):
    model_config = ConfigDict(extra='allow')
    
    text: str
    conversation_id: str = None

class PlatformMessageResponse(BaseModel):
    model_config = ConfigDict(extra='allow')
    
    id: str
    conversation_id: str
    inputs: Dict[str, Any] = {}
    query: str
    message: Optional[List[Dict[str, Any]]] = []
    message_tokens: Optional[int] = None
    answer: str
    answer_tokens: Optional[int] = None
    provider_response_latency: Optional[float] = None
    from_source: Optional[str] = None
    from_end_user_id: Optional[str] = None
    from_account_id: Optional[str] = None
    message_files: List[Dict[str, Any]] = []
    feedbacks: List[Any] = []
    workflow_run_id: Optional[str] = None
    annotation: Optional[Any] = None
    annotation_hit_history: Optional[Any] = None
    retriever_resources: List[Dict[str, Any]] = []
    agent_thoughts: List[Dict[str, Any]] = []
    metadata: Dict[str, Any] = {}
    status: Optional[str] = None
    error: Optional[str] = None
    parent_message_id: Optional[str] = None
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

    async def chat(self, user_id: str, text: str, conversation_id: str = None, inputs: Dict[str, Any] = None) -> PlatformMessage:
        request_data = {
            "query": text,
            "user": user_id,
            "inputs": inputs or {},
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
            
            # Read response as JSON
            response_data = response.json()
            logger.debug(f"Dify response: {response_data}")
            
            # Extract data from response
            answer = response_data.get("answer", "")
            conversation_id = response_data.get("conversation_id")

            return PlatformMessage(text=answer, conversation_id=conversation_id)

    async def chat_stream(self, user_id: str, text: str, conversation_id: str = None, inputs: Dict[str, Any] = None) -> AsyncGenerator[tuple[str, str], None]:
        """
        Stream chat response and yield (chunk, conversation_id) tuples.
        Returns the conversation_id from the first message event.
        """
        request_data = {
            "query": text,
            "user": user_id,
            "inputs": inputs or {},
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
        conversation_id: str, 
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
            "limit": limit,
            "conversation_id": conversation_id
        }
        
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

    async def get_startup_message(self, user_id: str, resume_id: str, resume_text: str) -> tuple[str, str]:
        """
        Get startup message from AI after resume processing using streaming mode.
        Returns tuple of (message, conversation_id).
        """
        logger.info(f"get_startup_message called with user_id={user_id}, resume_id={resume_id}, resume_text_length={len(resume_text)}")
        
        request_data = {
            "query": "Here is my resume, what do you think about it?",
            "user": user_id,
            "inputs": {
                "resume_id": resume_id,
                "resume": resume_text
            },
            "response_mode": "streaming",
            "conversation_id": ""
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout)) as client:
            logger.info(f"Send startup message (streaming) request to platform: {self.app_url}")

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

                collected_answer_parts: list[str] = []
                current_conversation_id: Optional[str] = None

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "":
                            continue
                        try:
                            data = json.loads(data_str)
                            event = data.get("event")

                            if event == "agent_message":
                                chunk = data.get("answer", "")
                                if chunk:
                                    collected_answer_parts.append(chunk)
                                if not current_conversation_id:
                                    current_conversation_id = data.get("conversation_id")
                                logger.debug(f"agent_message event: chunk_length={len(chunk)}, conversation_id={data.get('conversation_id')}")
                            elif event == "message_end":
                                current_conversation_id = data.get("conversation_id", current_conversation_id)
                                logger.info(f"message_end event: final_conversation_id={current_conversation_id}")
                                break
                            elif event == "error":
                                error_msg = data.get("message", "Unknown error")
                                logger.error(f"Streaming error: {error_msg}")
                                raise Exception(f"Streaming error: {error_msg}")
                            else:
                                logger.debug(f"Unknown event: {event}, data: {data}")
                        except json.JSONDecodeError as e:
                            logger.warning(f"Failed to parse SSE data: {data_str}, error: {e}")
                            continue

                answer = "".join(collected_answer_parts).strip()
                if not answer:
                    answer = "Welcome aboard! I'm your AI Writer, here to save you time and boost your chances. Let's start?"
                
                logger.info(f"get_startup_message completed. Answer length: {len(answer)}, conversation_id: '{current_conversation_id}'")
                return answer, (current_conversation_id or "")