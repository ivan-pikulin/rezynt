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
        logger.info(f"Creating temporary file: {temp_file_path}")
        
        with open(temp_file_path, 'wb') as temp_file:
            temp_file.write(file_content)
        logger.info(f"File content written to temporary file, size: {len(file_content)} bytes")
        
        # Initialize ParseService and parse the resume file
        logger.info("Initializing ParseService")
        parse_service = ParseService()
        logger.info("ParseService initialized successfully")
        
        logger.info("Starting resume parsing with ParseService")
        parsed_data = await parse_service.parse_resume_file(temp_file_path)
        logger.info(f"Resume parsing completed. Parsed data summary: first_name={parsed_data.first_name}, last_name={parsed_data.last_name}, experience_count={len(parsed_data.experience)}, education_count={len(parsed_data.education)}")
        
        # Create resume with all parsed data
        logger.info("Starting database operations to create resume")
        resume = await _create_resume_with_data(user_id, filename, parsed_data)
        logger.info(f"Database operations completed successfully, resume ID: {resume.id}")
        
        # Clean up temporary file
        try:
            os.remove(temp_file_path)
            logger.info(f"Temporary file removed: {temp_file_path}")
        except Exception as e:
            logger.warning(f"Failed to remove temporary file {temp_file_path}: {e}")
        
        logger.info(f"Resume processing completed for user {user_id}, resume {resume.id}")
        result = {
            'status': 'completed',
            'user_id': user_id,
            'resume_id': resume.id,
            'message': 'Resume created and processed successfully'
        }
        logger.info(f"Returning task result: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Exception in process_resume_upload task: {e}", exc_info=True)
        
        # Clean up temporary file on error
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                logger.info(f"Temporary file removed after error: {temp_file_path}")
            except Exception as cleanup_error:
                logger.warning(f"Failed to remove temporary file {temp_file_path} after error: {cleanup_error}")
        
        result = {
            'status': 'error',
            'error': str(e),
            'user_id': user_id,
            'message': f'Task failed: {str(e)}'
        }
        logger.error(f"Returning error result: {result}")
        return result


async def _create_resume_with_data(user_id: int, filename: str, parsed_data):
    """Создает резюме в базе данных со всеми данными из ParseService"""
    logger.info(f"Starting database operations for user {user_id}, filename: {filename}")
    logger.info(f"Parsed data summary: first_name={parsed_data.first_name}, last_name={parsed_data.last_name}, experience_count={len(parsed_data.experience)}, education_count={len(parsed_data.education)}, skills_count={len(parsed_data.skills)}, contacts_count={len(parsed_data.contacts)}")
    
    async with SessionLocal() as db:
        try:
            logger.info(f"Creating resume record for user {user_id}")
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
            logger.info(f"Resume record created with ID: {resume.id}")
            
            # Create personal info if available
            if parsed_data.first_name or parsed_data.last_name or parsed_data.location:
                from app.database.models.resume import ResumePersonalInfo
                
                logger.info(f"Creating personal info: first_name={parsed_data.first_name}, last_name={parsed_data.last_name}, location={parsed_data.location}")
                personal_info = ResumePersonalInfo(
                    resume_id=resume.id,
                    first_name=parsed_data.first_name,
                    last_name=parsed_data.last_name,
                    location=parsed_data.location
                )
                db.add(personal_info)
                logger.info("Personal info added to database")
            
            # Create contacts if available
            if parsed_data.contacts:
                from app.database.models.resume import ResumeContact
                
                logger.info(f"Creating {len(parsed_data.contacts)} contact entries")
                for i, contact_value in enumerate(parsed_data.contacts):
                    logger.info(f"Adding contact {i+1}: {contact_value}")
                    contact = ResumeContact(
                        resume_id=resume.id,
                        value=contact_value
                    )
                    db.add(contact)
                logger.info("All contacts added to database")
            
            # Create skills if available
            if parsed_data.skills:
                from app.database.models.resume import ResumeSkill
                
                logger.info(f"Creating {len(parsed_data.skills)} skill entries")
                for i, skill_name in enumerate(parsed_data.skills):
                    logger.info(f"Adding skill {i+1}: {skill_name}")
                    skill = ResumeSkill(
                        resume_id=resume.id,
                        name=skill_name
                    )
                    db.add(skill)
                logger.info("All skills added to database")
            
            # Create experience if available
            if parsed_data.experience:
                from app.database.models.resume import ResumeExperience
                
                logger.info(f"Creating {len(parsed_data.experience)} experience entries")
                for i, exp_data in enumerate(parsed_data.experience):
                    logger.info(f"Processing experience {i+1}: {exp_data.get('job_title', 'N/A')} at {exp_data.get('company', 'N/A')}")
                    experience = ResumeExperience(
                        resume_id=resume.id,
                        job_title=exp_data.get("job_title", ""),
                        company=exp_data.get("company", ""),
                        location=exp_data.get("location", ""),
                        start_date=exp_data.get("start_date"),
                        end_date=exp_data.get("end_date"),
                        responsibilities=exp_data.get("responsibilities", [])
                    )
                    db.add(experience)
                    logger.info(f"Experience entry {i+1} added to database")
            
            # Create education if available
            if parsed_data.education:
                from app.database.models.resume import ResumeEducation
                
                logger.info(f"Creating {len(parsed_data.education)} education entries")
                for i, edu_data in enumerate(parsed_data.education):
                    logger.info(f"Processing education {i+1}: {edu_data.get('degree', 'N/A')} at {edu_data.get('institution', 'N/A')}")
                    education = ResumeEducation(
                        resume_id=resume.id,
                        degree=edu_data.get("degree", ""),
                        institution=edu_data.get("institution", ""),
                        location=edu_data.get("location", ""),
                        graduation_date=edu_data.get("graduation_date")
                    )
                    db.add(education)
                    logger.info(f"Education entry {i+1} added to database")
            
            await db.commit()
            logger.info(f"Resume {resume.id} created successfully with all data for user {user_id}")
            logger.info(f"Final commit completed for resume {resume.id}")
            return resume
            
        except Exception as e:
            logger.error(f"Error creating resume with data in database: {e}", exc_info=True)
            await db.rollback()
            raise 
