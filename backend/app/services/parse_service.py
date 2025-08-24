import logging
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
    """Структура данных для парсинга резюме через OpenAI"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    professional_summary: Optional[str] = None
    contacts: List[str] = []
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []


class ParseService:
    """Сервис для парсинга резюме с использованием OpenAI structured output"""
    
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.openai.OPENAI_API_KEY,
            http_client=httpx.Client(proxies=settings.openai.OPENAI_PROXY_URL)
        )
        self.md = MarkItDown(enable_plugins=False)
    
    def parse_resume_file(self, file_path: str) -> ParsedResumeData:
        """
        Парсит файл резюме и возвращает структурированные данные
        
        Args:
            file_path: Путь к файлу резюме
            
        Returns:
            ParsedResumeData: Структурированные данные резюме
        """
        try:
            # Читаем файл через markitdown
            logger.info(f"Processing file: {file_path}")
            result = self.md.convert(file_path)
            text_content = result.text_content
            
            if not text_content:
                logger.warning("No text content extracted from file")
                return ParsedResumeData()
            
            # Парсим через OpenAI с structured output
            parsed_data = self._parse_with_openai_structured(text_content)
            
            logger.info("Resume parsing completed successfully")
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error parsing resume file: {e}", exc_info=True)
            raise
    
    def _parse_with_openai_structured(self, text_content: str) -> ParsedResumeData:
        """
        Парсит текст резюме через OpenAI с structured output используя OpenAIStructuredResume schema
        
        Args:
            text_content: Текст резюме
            
        Returns:
            ParsedResumeData: Структурированные данные
        """
        try:
            # Используем OpenAI Structured Outputs с Pydantic моделью
            response = self.client.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a resume parser. Extract structured information from the resume text.
                        
                        Rules:
                        - Extract only the information that is clearly present in the text
                        - For dates, use YYYY-MM-DD format or null if not specified
                        - For experience and education, include all available fields
                        - For contacts, extract emails, phones, and other contact information as strings
                        - For skills, extract technical skills, soft skills, and tools as strings
                        - Keep the original text as much as possible, don't add information that's not in the resume
                        - If a field is not present in the resume, set it to null or empty list
                        """
                    },
                    {
                        "role": "user",
                        "content": f"<resume>{text_content}</resume>"
                    }
                ],
                response_format=OpenAIStructuredResume,
                temperature=0.1
            )
            
            # Получаем структурированные данные
            structured_data = response.choices[0].message.parsed
            
            # Преобразуем в ParsedResumeData
            return self._convert_structured_to_parsed(structured_data)
            
        except Exception as e:
            logger.error(f"Error in OpenAI structured parsing: {e}", exc_info=True)
            # Возвращаем пустые данные в случае ошибки
            return ParsedResumeData()
    
    def _convert_structured_to_parsed(self, structured_data: OpenAIStructuredResume) -> ParsedResumeData:
        """
        Преобразует OpenAIStructuredResume в ParsedResumeData
        
        Args:
            structured_data: Структурированные данные от OpenAI
            
        Returns:
            ParsedResumeData: Преобразованные данные
        """
        return ParsedResumeData(
            first_name=structured_data.first_name,
            last_name=structured_data.last_name,
            location=structured_data.location,
            professional_summary=structured_data.professional_summary,
            contacts=structured_data.contacts,
            skills=structured_data.skills,
            experience=[
                {
                    "job_title": exp.job_title,
                    "company": exp.company,
                    "location": exp.location,
                    "start_date": exp.start_date,
                    "end_date": exp.end_date,
                    "responsibilities": exp.responsibilities
                }
                for exp in structured_data.experience
            ],
            education=[
                {
                    "degree": edu.degree,
                    "institution": edu.institution,
                    "location": edu.location,
                    "graduation_date": edu.graduation_date
                }
                for edu in structured_data.education
            ]
        )
    
    def parse_resume_to_unified(self, file_path: str, user_id: int, title: str = "Parsed Resume") -> Dict[str, Any]:
        """
        Парсит файл резюме и возвращает данные в формате UnifiedResume
        
        Args:
            file_path: Путь к файлу резюме
            user_id: ID пользователя
            title: Заголовок резюме
            
        Returns:
            Dict[str, Any]: Данные в формате UnifiedResume
        """
        parsed_data = self.parse_resume_file(file_path)
        
        # Преобразуем даты из строк в datetime объекты
        experience = []
        for exp in parsed_data.experience:
            start_date = None
            end_date = None
            
            if exp.get("start_date"):
                try:
                    start_date = datetime.strptime(exp["start_date"], "%Y-%m-%d")
                except ValueError:
                    start_date = None
            
            if exp.get("end_date"):
                try:
                    end_date = datetime.strptime(exp["end_date"], "%Y-%m-%d")
                except ValueError:
                    end_date = None
            
            experience.append({
                "job_title": exp.get("job_title", ""),
                "company": exp.get("company", ""),
                "location": exp.get("location", ""),
                "start_date": start_date,
                "end_date": end_date,
                "responsibilities": exp.get("responsibilities", [])
            })
        
        education = []
        for edu in parsed_data.education:
            graduation_date = None
            
            if edu.get("graduation_date"):
                try:
                    graduation_date = datetime.strptime(edu["graduation_date"], "%Y-%m-%d")
                except ValueError:
                    graduation_date = None
            
            education.append({
                "degree": edu.get("degree", ""),
                "institution": edu.get("institution", ""),
                "location": edu.get("location", ""),
                "graduation_date": graduation_date
            })
        
        # Возвращаем данные в формате UnifiedResume
        return {
            "user_id": user_id,
            "title": title,
            "first_name": parsed_data.first_name,
            "last_name": parsed_data.last_name,
            "location": parsed_data.location,
            "professional_summary": parsed_data.professional_summary,
            "contacts": parsed_data.contacts,
            "skills": parsed_data.skills,
            "experience": experience,
            "education": education
        }
    
    def test_structured_output(self, sample_text: str = None) -> Dict[str, Any]:
        """
        Тестирует OpenAI Structured Outputs с примером текста
        
        Args:
            sample_text: Пример текста резюме для тестирования
            
        Returns:
            Dict[str, Any]: Результат парсинга
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
            # Тестируем structured output
            structured_data = self._parse_with_openai_structured(sample_text)
            
            # Преобразуем в словарь для удобства
            result = {
                "first_name": structured_data.first_name,
                "last_name": structured_data.last_name,
                "location": structured_data.location,
                "professional_summary": structured_data.professional_summary,
                "contacts": structured_data.contacts,
                "skills": structured_data.skills,
                "experience_count": len(structured_data.experience),
                "education_count": len(structured_data.education),
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
