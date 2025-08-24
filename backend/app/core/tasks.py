import logging
import os
import tempfile

from app.core.celery_app import celery_app
from app.database.models.resume import Resume
from app.database.session import SessionLocal
from app.services.email_service import EmailService
from app.services.parse_service import ParseService
from asgiref.sync import async_to_sync

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
    async_to_sync(_process_resume_upload_task)(file_content, filename, user_id)


async def _process_resume_upload_task(file_content: bytes, filename: str, user_id: int):
    """Async implementation of resume processing task"""
    logger.info(f"Starting resume processing task for user {user_id}, filename: {filename}")
    
    temp_file_path = None
    
    try:
        # Save uploaded file to temporary location
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, f"resume_{user_id}_{filename}")
        
        with open(temp_file_path, 'wb') as temp_file:
            temp_file.write(file_content)
        
        # Initialize ParseService and parse the resume file
        parse_service = ParseService()
        parsed_data = parse_service.parse_resume_file(temp_file_path)
        
        # Create resume with all parsed data
        resume = await _create_resume_with_data(user_id, filename, parsed_data)
        
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


async def _create_resume_with_data(user_id: int, filename: str, parsed_data):
    """Создает резюме в базе данных со всеми данными из ParseService"""
    async with SessionLocal() as db:
        try:
            # Create resume with parsed data
            resume = Resume(
                title=f"Resume from {filename}",
                template_id=1,  # Default template
                professional_summary=parsed_data.professional_summary or "",
                user_id=user_id
            )
            
            db.add(resume)
            await db.commit()
            await db.refresh(resume)
            
            # Create personal info if available
            if parsed_data.first_name or parsed_data.last_name or parsed_data.location:
                from app.database.models.resume import ResumePersonalInfo
                
                personal_info = ResumePersonalInfo(
                    resume_id=resume.id,
                    first_name=parsed_data.first_name,
                    last_name=parsed_data.last_name,
                    location=parsed_data.location
                )
                db.add(personal_info)
            
            # Create contacts if available
            if parsed_data.contacts:
                from app.database.models.resume import ResumeContact
                
                for contact_value in parsed_data.contacts:
                    contact = ResumeContact(
                        resume_id=resume.id,
                        value=contact_value
                    )
                    db.add(contact)
            
            # Create skills if available
            if parsed_data.skills:
                from app.database.models.resume import ResumeSkill
                
                for skill_name in parsed_data.skills:
                    skill = ResumeSkill(
                        resume_id=resume.id,
                        name=skill_name
                    )
                    db.add(skill)
            
            # Create experience if available
            if parsed_data.experience:
                from app.database.models.resume import ResumeExperience
                
                for exp_data in parsed_data.experience:
                    experience = ResumeExperience(
                        resume_id=resume.id,
                        job_title=exp_data.job_title,
                        company=exp_data.company,
                        location=exp_data.location,
                        start_date=exp_data.start_date,
                        end_date=exp_data.end_date,
                        responsibilities=exp_data.responsibilities
                    )
                    db.add(experience)
            
            # Create education if available
            if parsed_data.education:
                from app.database.models.resume import ResumeEducation
                
                for edu_data in parsed_data.education:
                    education = ResumeEducation(
                        resume_id=resume.id,
                        degree=edu_data.degree,
                        institution=edu_data.institution,
                        location=edu_data.location,
                        graduation_date=edu_data.graduation_date
                    )
                    db.add(education)
            
            await db.commit()
            logger.info(f"Resume {resume.id} created successfully with all data for user {user_id}")
            return resume
            
        except Exception as e:
            logger.error(f"Error creating resume with data in database: {e}", exc_info=True)
            await db.rollback()
            raise 
