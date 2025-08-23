from app.core.celery_app import celery_app
from app.services.email_service import EmailService
from app.services.parse_service import ParseService
from app.database.session import AsyncSessionLocal
from app.database.crud.crud_resume import resume_crud
from app.schemas.resume import ResumeUpdate, ResumePersonalInfoUpdate
import logging
import os
import tempfile
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

# Set up logging
logger = logging.getLogger(__name__)


@celery_app.task
def send_confirmation_email(email: str, token: str):
    """Отправка email с подтверждением регистрации через EmailService"""
    logger.info(f"Starting confirmation email task for {email}")
    
    try:
        email_service = EmailService()
        logger.info("EmailService initialized successfully")
        
        success = email_service.send_confirmation_email(email, token)
        
        if success:
            logger.info(f"Confirmation email sent successfully to {email}")
            return {"status": "success", "email": email}
        else:
            logger.error(f"Failed to send confirmation email to {email}")
            return {"status": "error", "email": email, "error": "Failed to send email"}
            
    except Exception as e:
        logger.error(f"Exception in send_confirmation_email task: {e}", exc_info=True)
        return {"status": "error", "email": email, "error": str(e)}


@celery_app.task(bind=True)
def process_resume_upload(self, file_path: str, user_id: int, resume_id: int):
    """Обработка загруженного резюме с помощью ParseService"""
    logger.info(f"Starting resume processing task for user {user_id}, resume {resume_id}")
    
    try:
        # Update task status to processing
        self.update_state(
            state='PROCESSING',
            meta={'status': 'processing', 'message': 'Processing resume with ParseService'}
        )
        
        # Initialize ParseService
        parse_service = ParseService()
        
        # Parse the resume file
        parsed_data = parse_service.parse_resume_file(file_path)
        
        # Update resume in database with parsed data
        asyncio.run(_update_resume_in_db(resume_id, user_id, parsed_data))
        
        # Clean up temporary file
        try:
            os.remove(file_path)
            logger.info(f"Temporary file removed: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to remove temporary file {file_path}: {e}")
        
        # Update task status to completed
        self.update_state(
            state='SUCCESS',
            meta={
                'status': 'completed',
                'message': 'Resume processed and updated successfully',
                'user_id': user_id,
                'resume_id': resume_id
            }
        )
        
        logger.info(f"Resume processing completed for user {user_id}, resume {resume_id}")
        return {
            'status': 'completed',
            'user_id': user_id,
            'resume_id': resume_id
        }
        
    except Exception as e:
        logger.error(f"Exception in process_resume_upload task: {e}", exc_info=True)
        
        # Clean up temporary file on error
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Temporary file removed after error: {file_path}")
        except Exception as cleanup_error:
            logger.warning(f"Failed to remove temporary file {file_path} after error: {cleanup_error}")
        
        # Update task status to failed
        self.update_state(
            state='FAILURE',
            meta={
                'status': 'error',
                'message': f'Failed to process resume: {str(e)}',
                'user_id': user_id,
                'resume_id': resume_id
            }
        )
        
        return {
            'status': 'error',
            'error': str(e),
            'user_id': user_id,
            'resume_id': resume_id
        }


async def _update_resume_in_db(resume_id: int, user_id: int, parsed_data):
    """Обновляет резюме в базе данных с данными из ParseService"""
    async with AsyncSessionLocal() as db:
        try:
            # Создаем объект для обновления резюме
            resume_update = ResumeUpdate(
                professional_summary=parsed_data.professional_summary
            )
            
            # Обновляем основную информацию резюме
            resume_obj = await resume_crud.get(db, id=resume_id)
            if resume_obj:
                await resume_crud.update(db, db_obj=resume_obj, obj_in=resume_update)
            
            # Обновляем персональную информацию
            if parsed_data.first_name or parsed_data.last_name or parsed_data.location:
                personal_info_update = ResumePersonalInfoUpdate(
                    first_name=parsed_data.first_name,
                    last_name=parsed_data.last_name,
                    location=parsed_data.location
                )
                await resume_crud.update_personal_info(db, resume_id=resume_id, personal_info=personal_info_update)
            
            # Обновляем контакты
            if parsed_data.contacts:
                await resume_crud.update_contacts(db, resume_id=resume_id, contacts=parsed_data.contacts)
            
            # Обновляем навыки
            if parsed_data.skills:
                await resume_crud.update_skills(db, resume_id=resume_id, skills=parsed_data.skills)
            
            # Обновляем опыт работы
            if parsed_data.experience:
                await resume_crud.update_experience(db, resume_id=resume_id, experience=parsed_data.experience)
            
            # Обновляем образование
            if parsed_data.education:
                await resume_crud.update_education(db, resume_id=resume_id, education=parsed_data.education)
            
            logger.info(f"Resume {resume_id} updated successfully with parsed data")
            
        except Exception as e:
            logger.error(f"Error updating resume {resume_id} in database: {e}", exc_info=True)
            raise 
