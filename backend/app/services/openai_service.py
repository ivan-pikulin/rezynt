import logging
from typing import Any, Dict, List, Optional

import httpx
from app.core.config import settings
from app.schemas.resume import ChatResumeResponse, UnifiedResume
from openai import OpenAI

logger = logging.getLogger(__name__)




class ResumeChatService:
    """Service for resume chat via OpenAI structured output"""
    
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.openai.OPENAI_API_KEY,
            http_client=httpx.Client(proxy=settings.openai.OPENAI_PROXY_URL)
        )
    
    async def chat_with_resume(
        self, 
        user_message: str, 
        resume: UnifiedResume, 
        chat_history: List[Dict[str, str]]
    ) -> ChatResumeResponse:
        """
        Sends user message to resume chat and gets response with updates
        
        Args:
            user_message: User message
            resume: Current resume
            chat_history: Message history (last N messages)
            
        Returns:
            ChatResumeResponse: Response with message and resume updates
        """
        try:
            # Log input parameters
            logger.info(f"Starting chat with resume ID: {resume.id}, user message length: {len(user_message)}")
            logger.info(f"Chat history messages count: {len(chat_history)}")
            logger.info(f"Resume data - Title: {resume.title}, First Name: {resume.first_name}, Last Name: {resume.last_name}")
            logger.info(f"Resume has {len(resume.experience)} experience entries, {len(resume.education)} education entries")
            logger.info(f"Resume has {len(resume.skills)} skills, {len(resume.contacts)} contacts")
            
            # Build prompt with resume and history
            system_prompt = self._build_system_prompt(resume, chat_history)
            
            # Log the prompt for debugging
            logger.info(f"System prompt length: {len(system_prompt)} characters")
            logger.info(f"System prompt: {system_prompt}")
            logger.info(f"User message: {user_message}")
            
            # Send request to OpenAI
            response = self.client.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                response_format=ChatResumeResponse,
                temperature=0.3,
                max_tokens=10000
            )
            
            # Get structured response
            chat_response = response.choices[0].message.parsed
            
            # Log the response for debugging
            logger.info(f"Chat response received: message length={len(chat_response.message)}")
            logger.info(f"AI message: {chat_response.message}")
            if chat_response.resume_updates:
                logger.info(f"Resume updates provided: {list(chat_response.resume_updates.__dict__.keys())}")
                logger.info(f"Resume updates: {chat_response.resume_updates}")
            else:
                logger.info("No resume updates provided")
            
            return chat_response
            
        except Exception as e:
            logger.error(f"Error in resume chat: {e}", exc_info=True)
            # Return basic response in case of error
            return ChatResumeResponse(
                message="Sorry, an error occurred while processing your request. Please try again.",
                resume_updates=None
            )
    
    def _build_system_prompt(self, resume: UnifiedResume, chat_history: List[Dict[str, str]]) -> str:
        """
        Builds system prompt with resume information and chat history
        
        Args:
            resume: Current resume
            chat_history: Message history
            
        Returns:
            str: System prompt for OpenAI
        """
        # Resume information
        resume_info = f"""
CURRENT RESUME:
ID: {resume.id}
Title: {resume.title}
First Name: {resume.first_name or 'Not specified'}
Last Name: {resume.last_name or 'Not specified'}
Location: {resume.location or 'Not specified'}

PROFESSIONAL SUMMARY:
{resume.professional_summary or 'Not specified'}

CONTACTS:
{', '.join(resume.contacts) if resume.contacts else 'Not specified'}

SKILLS:
{', '.join(resume.skills) if resume.skills else 'Not specified'}

WORK EXPERIENCE:
"""
        
        for i, exp in enumerate(resume.experience, 1):
            resume_info += f"""
{i}. {exp.job_title} at {exp.company}
   Location: {exp.location or 'Not specified'}
   Period: {exp.start_date.strftime('%Y-%m-%d') if exp.start_date else 'Not specified'} - {exp.end_date.strftime('%Y-%m-%d') if exp.end_date else 'Present'}
   Responsibilities: {', '.join(exp.responsibilities) if exp.responsibilities else 'Not specified'}
"""
        
        resume_info += """
EDUCATION:
"""
        
        for i, edu in enumerate(resume.education, 1):
            resume_info += f"""
{i}. {edu.degree} at {edu.institution}
   Location: {edu.location or 'Not specified'}
   Graduation Date: {edu.graduation_date.strftime('%Y-%m-%d') if edu.graduation_date else 'Not specified'}
"""
        
        # Chat history
        history_info = ""
        if chat_history:
            history_info = "\n\nCHAT HISTORY:\n"
            for msg in chat_history:
                role = "User" if msg["role"] == "user" else "Assistant"
                history_info += f"{role}: {msg['content']}\n"
        
        # Main prompt
        system_prompt = f"""You are an AI assistant for resume editing. Your task is to help the user improve their resume.

{resume_info}{history_info}

RULES:
1. Respond in Russian language
2. Be polite and professional
3. Analyze the user's request and suggest specific resume improvements
4. In the "message" field, write a clear explanation of what you changed
5. In the "resume_updates" field, specify only the fields that need to be updated
6. Use YYYY-MM-DD format for dates
7. If the user asks to add new experience/education, create the complete structure
8. If the user asks to modify existing experience/education, specify only the changed fields
9. Don't add information that is not in the user's request
10. If the request is not related to resume, politely redirect the conversation to resume topics

AVAILABLE FIELDS FOR UPDATES:
- first_name, last_name, location
- professional_summary
- contacts (array of strings)
- skills (array of strings)
- experience (array of objects with fields: job_title, company, location, start_date, end_date, responsibilities)
- education (array of objects with fields: degree, institution, location, graduation_date)

Example response:
{{
    "message": "I updated your professional experience by adding a new Senior Developer position.",
    "resume_updates": {{
        "experience": [
            {{
                "job_title": "Senior Developer",
                "company": "TechCorp",
                "location": "New York, NY",
                "start_date": "2023-01-01",
                "end_date": null,
                "responsibilities": ["Web application development", "Team leadership"]
            }}
        ]
    }}
}}"""
        
        return system_prompt
