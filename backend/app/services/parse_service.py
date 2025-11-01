import logging
import os
import gc
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from app.core.config import settings
from app.schemas.resume import OpenAIStructuredResume
from markitdown import MarkItDown
from openai import OpenAI
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class ParsedResumeData(BaseModel):
    """Data structure for resume parsing via OpenAI - matches ResumeData JSONB structure"""
    personal_info: Optional[Dict[str, Any]] = None
    professional_summary: Optional[str] = None
    skills: Optional[List[str]] = None
    work_experience: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    languages_spoken: Optional[List[Dict[str, Any]]] = None
    awards: Optional[List[Dict[str, Any]]] = None


class ParseService:
    """Service for resume parsing using OpenAI structured output"""
    
    # Maximum file size in bytes (10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.openai.OPENAI_API_KEY,
            http_client=httpx.Client(proxy=settings.openai.OPENAI_PROXY_URL)
        )
        self.md = MarkItDown(enable_plugins=False)
    
    async def parse_resume_file(self, file_path: str) -> ParsedResumeData:
        """
        Parses resume file and returns structured data
        
        Args:
            file_path: Path to resume file
            
        Returns:
            ParsedResumeData: Structured resume data
        """
        try:
            # Validate file size before processing
            file_size = os.path.getsize(file_path)
            logger.info(f"Processing file: {file_path}, size: {file_size} bytes")
            
            if file_size > self.MAX_FILE_SIZE:
                raise ValueError(f"File size ({file_size} bytes) exceeds maximum allowed size ({self.MAX_FILE_SIZE} bytes)")
            
            # Read file via markitdown
            result = self.md.convert(file_path)
            text_content = result.text_content
            
            # Clean up markitdown result immediately
            del result
            gc.collect()
            
            logger.info(f"Text content extracted, length: {len(text_content) if text_content else 0} characters")
            
            if not text_content:
                logger.warning("No text content extracted from file")
                return ParsedResumeData()
            
            # Limit text content length to prevent OpenAI token limits
            if len(text_content) > 50000:  # Roughly 12-15k tokens
                logger.warning(f"Text content too long ({len(text_content)} chars), truncating to 50000 chars")
                text_content = text_content[:50000] + "..."
            
            # Parse via OpenAI with structured output
            parsed_data = await self._parse_with_openai_structured(text_content)
            
            # Clean up text content
            del text_content
            gc.collect()
            
            logger.info("Resume parsing completed successfully")
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error parsing resume file: {e}", exc_info=True)
            # Force garbage collection on error
            gc.collect()
            raise
    
    async def _parse_with_openai_structured(self, text_content: str) -> ParsedResumeData:
        """
        Parses resume text via OpenAI with structured output using OpenAIStructuredResume schema
        
        Args:
            text_content: Resume text
            
        Returns:
            ParsedResumeData: Structured data
        """
        try:
            # Use OpenAI Structured Outputs with Pydantic model
            response = self.client.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a resume parser. Extract structured information from the resume text.
                        
                        Rules:
                        - Extract only the information that is clearly present in the text
                        - For dates, use format like "Month YYYY" (e.g., "June 2024") or "YYYY-MM-DD"
                        - Personal info should include: first_name, last_name, current_role, city, country, photo_url (if available)
                        - Contacts should be a nested object with: email, phone, telegram, whatsapp, linkedin, github, website, twitter, instagram
                        - Work experience should include: job_title, company, short_description, city, country, start_date, end_date, responsibilities (list), achievements (list), technologies_tools (list)
                        - Education should include: institution, degree, field_of_study, city, country, start_date, end_date, relevant_courses (list)
                        - Languages should be extracted with language name and proficiency level
                        - Awards should include: title, issuer, date, description
                        - Keep the original text as much as possible, don't add information that's not in the resume
                        - If a field is not present in the resume, set it to null or empty list/array
                        - Split location into city and country when possible
                        """
                    },
                    {
                        "role": "user",
                        "content": f"<resume>{text_content}</resume>"
                    }
                ],
                response_format=OpenAIStructuredResume,
                temperature=0.1,
                max_tokens=4000  # Limit response size
            )
            
            # Get structured data
            structured_data = response.choices[0].message.parsed
            
            # Clean up response object immediately
            del response
            gc.collect()
            
            logger.info(f"Structured data received, processing...")
            
            # Convert to ParsedResumeData
            parsed_data = self._convert_structured_to_parsed(structured_data)
            
            # Clean up structured data
            del structured_data
            gc.collect()
            
            logger.info(f"Parsed data conversion completed")
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error in OpenAI structured parsing: {e}", exc_info=True)
            # Force garbage collection on error
            gc.collect()
            # Return empty data in case of error
            return ParsedResumeData()
    
    def _convert_structured_to_parsed(self, structured_data: OpenAIStructuredResume) -> ParsedResumeData:
        """
        Converts OpenAIStructuredResume to ParsedResumeData (new JSONB structure)
        
        Args:
            structured_data: Structured data from OpenAI
            
        Returns:
            ParsedResumeData: Converted data matching JSONB structure
        """
        # Convert personal_info
        personal_info_dict = None
        if structured_data.personal_info:
            pi = structured_data.personal_info
            contacts_dict = None
            if pi.contacts:
                contacts_dict = pi.contacts.model_dump()
            
            personal_info_dict = {
                "first_name": pi.first_name,
                "last_name": pi.last_name,
                "current_role": pi.current_role,
                "city": pi.city,
                "country": pi.country,
                "photo_url": pi.photo_url,
                "contacts": contacts_dict
            }
        
        # Convert work_experience
        work_experience_list = [exp.model_dump() for exp in structured_data.work_experience] if structured_data.work_experience else None
        
        # Convert education
        education_list = [edu.model_dump() for edu in structured_data.education] if structured_data.education else None
        
        # Convert languages_spoken
        languages_list = [lang.model_dump() for lang in structured_data.languages_spoken] if structured_data.languages_spoken else None
        
        # Convert awards
        awards_list = [award.model_dump() for award in structured_data.awards] if structured_data.awards else None
        
        return ParsedResumeData(
            personal_info=personal_info_dict,
            professional_summary=structured_data.professional_summary,
            skills=structured_data.skills if structured_data.skills else None,
            work_experience=work_experience_list,
            education=education_list,
            languages_spoken=languages_list,
            awards=awards_list
        )
    
    
    async def test_structured_output(self, sample_text: str = None) -> Dict[str, Any]:
        """
        Tests OpenAI Structured Outputs with sample text
        
        Args:
            sample_text: Sample resume text for testing
            
        Returns:
            Dict[str, Any]: Parsing result
        """
        if sample_text is None:
            sample_text = """
            John Doe
            Software Engineer
            john.doe@email.com | +1-555-0123
            
            SUMMARY
            Experienced software engineer with 5 years of experience in Python development.
            
            EXPERIENCE
            Senior Developer at TechCorp (2020-2023)
            - Developed web applications using Python and Django
            - Led team of 3 developers
            
            Junior Developer at StartupInc (2018-2020)
            - Built REST APIs using FastAPI
            - Worked with PostgreSQL databases
            
            EDUCATION
            Bachelor of Science in Computer Science
            University of Technology (2018)
            
            SKILLS
            Python, Django, FastAPI, PostgreSQL, Git
            """
        
        try:
            # Test structured output
            structured_data = await self._parse_with_openai_structured(sample_text)
            
            # Convert to dictionary for convenience
            result = {
                "personal_info": structured_data.personal_info,
                "professional_summary": structured_data.professional_summary,
                "skills": structured_data.skills,
                "work_experience_count": len(structured_data.work_experience) if structured_data.work_experience else 0,
                "education_count": len(structured_data.education) if structured_data.education else 0,
                "languages_count": len(structured_data.languages_spoken) if structured_data.languages_spoken else 0,
                "awards_count": len(structured_data.awards) if structured_data.awards else 0,
                "success": True
            }
            
            logger.info(f"Structured output test successful: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Structured output test failed: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }
