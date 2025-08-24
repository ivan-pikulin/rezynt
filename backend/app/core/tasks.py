import asyncio
import logging
import os
import tempfile

from asgiref.sync import async_to_sync
from app.core.celery_app import celery_app
from app.database.crud.crud_resume import resume_crud
from app.database.session import SessionLocal
from app.database.crud.crud_resume import resume_manager
from app.schemas.resume import ResumePersonalInfoUpdate, ResumeUpdate, ResumeCreate
from app.services.email_service import EmailService
from app.services.parse_service import ParseService

# Set up logging
logger = logging.getLogger(__name__)


@celery_app.task(name="send_confirmation_email_task")
def send_confirmation_email_task(email: str, token: str):
    """Отправка email с подтверждением регистрации через EmailService"""
    async_to_sync(_send_confirmation_email_task)(email, token)


async def _send_confirmation_email_task(email: str, token: str):
    """Async implementation of confirmation email task"""
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


@celery_app.task(name="process_resume_upload_task")
def process_resume_upload_task(file_content: bytes, filename: str, user_id: int):
    """Обработка загруженного резюме с помощью ParseService"""
    return async_to_sync(_process_resume_upload_task)(file_content, filename, user_id)


async def _process_resume_upload_task(file_content: bytes, filename: str, user_id: int):
    """Async implementation of resume processing task"""
    logger.info(f"Starting resume processing task for user {user_id}, filename: {filename}")
    
    temp_file_path = None
    
    try:
        # Create resume first
        resume = await _create_resume_in_db(user_id, filename)
        
        # Save uploaded file to temporary location
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, f"resume_{resume.id}_{filename}")
        
        with open(temp_file_path, 'wb') as temp_file:
            temp_file.write(file_content)
        
        # Initialize ParseService
        parse_service = ParseService()
        
        # Parse the resume file
        parsed_data = parse_service.parse_resume_file(temp_file_path)
        
        # Update resume in database with parsed data
        await _update_resume_in_db(resume.id, user_id, parsed_data)
        
        # Clean up temporary file
        try:
            os.remove(temp_file_path)
            logger.info(f"Temporary file removed: {temp_file_path}")
        except Exception as e:
            logger.warning(f"Failed to remove temporary file {temp_file_path}: {e}")
        
        logger.info(f"Resume processing completed for user {user_id}, resume {resume.id}")
        return {
            'status': 'completed',
            'user_id': user_id,
            'resume_id': resume.id
        }
        
    except Exception as e:
        logger.error(f"Exception in process_resume_upload task: {e}", exc_info=True)
        
        # Clean up temporary file on error
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                logger.info(f"Temporary file removed after error: {temp_file_path}")
            except Exception as cleanup_error:
                logger.warning(f"Failed to remove temporary file {temp_file_path} after error: {cleanup_error}")
        
        return {
            'status': 'error',
            'error': str(e),
            'user_id': user_id
        }


async def _create_resume_in_db(user_id: int, filename: str):
    """Создает резюме в базе данных"""
    async with SessionLocal() as db:
        try:
            # Create resume with default template
            resume_create = ResumeCreate(
                title=f"Resume from {filename}",
                template_id=1,  # Default template
                professional_summary=""
            )
            
            resume = await resume_manager.create_resume(db, obj_in=resume_create, user_id=user_id)
            logger.info(f"Resume {resume.id} created successfully for user {user_id}")
            return resume
            
        except Exception as e:
            logger.error(f"Error creating resume in database: {e}", exc_info=True)
            raise


async def _update_resume_in_db(resume_id: int, user_id: int, parsed_data):
    """Обновляет резюме в базе данных с данными из ParseService"""
    async with SessionLocal() as db:
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
            personal_info_data = {}
            if parsed_data.first_name:
                personal_info_data['first_name'] = parsed_data.first_name
            if parsed_data.last_name:
                personal_info_data['last_name'] = parsed_data.last_name
            if parsed_data.location:
                personal_info_data['location'] = parsed_data.location
            
            if personal_info_data:
                personal_info_update = ResumePersonalInfoUpdate(**personal_info_data)
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
