import asyncio
import logging
import os
import tempfile

from app.core.celery_app import celery_app
from app.database.crud.crud_resume import resume_crud
from app.database.session import engine
from app.database.crud.crud_resume import resume_manager
from app.database.models.resume import Resume
from app.schemas.resume import ResumePersonalInfoUpdate, ResumeUpdate, ResumeCreate
from app.services.email_service import EmailService
from app.services.parse_service import ParseService
from sqlalchemy.orm import Session, sessionmaker

# Set up logging
logger = logging.getLogger(__name__)

# Create synchronous session for Celery tasks
SyncSessionLocal = sessionmaker(
    bind=engine.sync_engine,
    expire_on_commit=False
)


@celery_app.task(name="send_confirmation_email_task")
def send_confirmation_email_task(email: str, token: str):
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


@celery_app.task(name="process_resume_upload_task")
def process_resume_upload_task(file_content: bytes, filename: str, user_id: int):
    """Обработка загруженного резюме с помощью ParseService"""
    logger.info(f"Starting resume processing task for user {user_id}, filename: {filename}")
    
    temp_file_path = None
    
    try:
        # Create resume first
        resume = _create_resume_in_db(user_id, filename)
        
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
        _update_resume_in_db(resume.id, user_id, parsed_data)
        
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


def _create_resume_in_db(user_id: int, filename: str):
    """Создает резюме в базе данных"""
    db = SyncSessionLocal()
    try:
        # Create resume directly using the model
        resume = Resume(
            title=f"Resume from {filename}",
            template_id=1,  # Default template
            professional_summary="",
            user_id=user_id
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        logger.info(f"Resume {resume.id} created successfully for user {user_id}")
        return resume
        
    except Exception as e:
        logger.error(f"Error creating resume in database: {e}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()


def _update_resume_in_db(resume_id: int, user_id: int, parsed_data):
    """Обновляет резюме в базе данных с данными из ParseService"""
    db = SyncSessionLocal()
    try:
        # Get the resume
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise ValueError(f"Resume {resume_id} not found")
        
        # Update professional summary
        if parsed_data.professional_summary:
            resume.professional_summary = parsed_data.professional_summary
        
        # Update personal info if available
        if parsed_data.first_name or parsed_data.last_name or parsed_data.location:
            from app.database.models.resume import ResumePersonalInfo
            
            # Get or create personal info
            personal_info = db.query(ResumePersonalInfo).filter(
                ResumePersonalInfo.resume_id == resume_id
            ).first()
            
            if not personal_info:
                personal_info = ResumePersonalInfo(resume_id=resume_id)
                db.add(personal_info)
            
            if parsed_data.first_name:
                personal_info.first_name = parsed_data.first_name
            if parsed_data.last_name:
                personal_info.last_name = parsed_data.last_name
            if parsed_data.location:
                personal_info.location = parsed_data.location
        
        # Update contacts if available
        if parsed_data.contacts:
            from app.database.models.resume import ResumeContact
            
            # Clear existing contacts
            db.query(ResumeContact).filter(ResumeContact.resume_id == resume_id).delete()
            
            # Add new contacts
            for contact_value in parsed_data.contacts:
                contact = ResumeContact(
                    resume_id=resume_id,
                    value=contact_value
                )
                db.add(contact)
        
        # Update skills if available
        if parsed_data.skills:
            from app.database.models.resume import ResumeSkill
            
            # Clear existing skills
            db.query(ResumeSkill).filter(ResumeSkill.resume_id == resume_id).delete()
            
            # Add new skills
            for skill_name in parsed_data.skills:
                skill = ResumeSkill(
                    resume_id=resume_id,
                    name=skill_name
                )
                db.add(skill)
        
        # Update experience if available
        if parsed_data.experience:
            from app.database.models.resume import ResumeExperience
            
            # Clear existing experience
            db.query(ResumeExperience).filter(ResumeExperience.resume_id == resume_id).delete()
            
            # Add new experience
            for exp_data in parsed_data.experience:
                experience = ResumeExperience(
                    resume_id=resume_id,
                    job_title=exp_data.job_title,
                    company=exp_data.company,
                    location=exp_data.location,
                    start_date=exp_data.start_date,
                    end_date=exp_data.end_date,
                    responsibilities=exp_data.responsibilities
                )
                db.add(experience)
        
        # Update education if available
        if parsed_data.education:
            from app.database.models.resume import ResumeEducation
            
            # Clear existing education
            db.query(ResumeEducation).filter(ResumeEducation.resume_id == resume_id).delete()
            
            # Add new education
            for edu_data in parsed_data.education:
                education = ResumeEducation(
                    resume_id=resume_id,
                    degree=edu_data.degree,
                    institution=edu_data.institution,
                    location=edu_data.location,
                    graduation_date=edu_data.graduation_date
                )
                db.add(education)
        
        db.commit()
        logger.info(f"Resume {resume_id} updated successfully with parsed data")
        
    except Exception as e:
        logger.error(f"Error updating resume {resume_id} in database: {e}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close() 
