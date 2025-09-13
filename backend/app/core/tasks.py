import logging
import os
import tempfile
import gc

from app.core.celery_app import celery_app
from app.core.config import settings
from app.database.models.resume import Resume
from app.database.session import SyncSessionLocal
from app.services.email_service import EmailService
from app.services.parse_service import ParseService
from app.services.platform_service import PlatformChatflow
from asgiref.sync import async_to_sync

# Set up logging
logger = logging.getLogger(__name__)


def _generate_resume_text_from_parsed(parsed_data) -> str:
    """Generate full text representation of resume using parsed_data to avoid DB IO."""
    text_parts = []

    # Name and location
    name_parts = []
    if getattr(parsed_data, 'first_name', None):
        name_parts.append(parsed_data.first_name)
    if getattr(parsed_data, 'last_name', None):
        name_parts.append(parsed_data.last_name)
    if name_parts:
        text_parts.append(f"Name: {' '.join(name_parts)}")

    if getattr(parsed_data, 'location', None):
        text_parts.append(f"Location: {parsed_data.location}")

    # Professional summary
    if getattr(parsed_data, 'professional_summary', None):
        text_parts.append(f"Professional Summary: {parsed_data.professional_summary}")

    # Contacts
    contacts = getattr(parsed_data, 'contacts', None) or []
    if contacts:
        text_parts.append(f"Contacts: {', '.join(contacts)}")

    # Skills
    skills = getattr(parsed_data, 'skills', None) or []
    if skills:
        text_parts.append(f"Skills: {', '.join(skills)}")

    # Experience
    experience = getattr(parsed_data, 'experience', None) or []
    if experience:
        text_parts.append("Experience:")
        for exp in experience:
            job_title = exp.get('job_title', '')
            company = exp.get('company', '')
            location = exp.get('location', '')
            start_date = exp.get('start_date')
            end_date = exp.get('end_date')
            responsibilities = exp.get('responsibilities', []) or []

            header = f"  - {job_title} at {company}".strip()
            if location:
                header += f" ({location})"
            if start_date:
                header += f" from {start_date}"
            if end_date:
                header += f" to {end_date}"
            text_parts.append(header)
            for resp in responsibilities:
                text_parts.append(f"    * {resp}")

    # Education
    education = getattr(parsed_data, 'education', None) or []
    if education:
        text_parts.append("Education:")
        for edu in education:
            degree = edu.get('degree', '')
            institution = edu.get('institution', '')
            location = edu.get('location', '')
            graduation_date = edu.get('graduation_date')
            header = f"  - {degree} from {institution}".strip()
            if location:
                header += f" ({location})"
            if graduation_date:
                header += f" - {graduation_date}"
            text_parts.append(header)

    return "\n".join(text_parts)


@celery_app.task(name="send_confirmation_email_task")
def send_confirmation_email_task(email: str, token: str, code: str = None):
    """Send confirmation email for registration via EmailService"""
    return async_to_sync(_send_confirmation_email_task)(email, token, code)


async def _send_confirmation_email_task(email: str, token: str, code: str = None):
    """Async implementation of confirmation email task"""
    logger.info(f"Starting confirmation email task for {email}")
    
    try:
        email_service = EmailService()
        logger.info("EmailService initialized successfully")
        
        success = email_service.send_confirmation_email(email, token, code)
        
        if success:
            logger.info(f"Confirmation email sent successfully to {email}")
            return {"status": "success", "email": email}
        else:
            logger.error(f"Failed to send confirmation email to {email}")
            return {"status": "error", "email": email, "error": "Failed to send email"}
            
    except Exception as e:
        logger.error(f"Exception in send_confirmation_email task: {e}", exc_info=True)
        return {"status": "error", "email": email, "error": str(e)}


@celery_app.task(name="send_password_reset_email_task")
def send_password_reset_email_task(email: str, token: str, code: str = None):
    """Send password reset email with token via EmailService"""
    return async_to_sync(_send_password_reset_email_task)(email, token, code)


async def _send_password_reset_email_task(email: str, token: str, code: str = None):
    """Async implementation of password reset email task"""
    logger.info(f"Starting password reset email task for {email}")
    
    try:
        email_service = EmailService()
        logger.info("EmailService initialized successfully")
        
        success = email_service.send_password_reset_email(email, token, code)
        
        if success:
            logger.info(f"Password reset email sent successfully to {email}")
            return {"status": "success", "email": email}
        else:
            logger.error(f"Failed to send password reset email to {email}")
            return {"status": "error", "email": email, "error": "Failed to send email"}
            
    except Exception as e:
        logger.error(f"Exception in send_password_reset_email task: {e}", exc_info=True)
        return {"status": "error", "email": email, "error": str(e)}


@celery_app.task(name="process_resume_upload_task")
def process_resume_upload_task(file_content: bytes, filename: str, user_id: int):
    """Process uploaded resume using ParseService"""
    return async_to_sync(_process_resume_upload_task)(file_content, filename, user_id)


async def _process_resume_upload_task(file_content: bytes, filename: str, user_id: int):
    """Async implementation of resume processing task"""
    logger.info(f"Starting resume processing task for user {user_id}, filename: {filename}")
    
    temp_file_path = None
    parse_service = None
    
    try:
        # Validate file size before processing
        file_size = len(file_content)
        logger.info(f"File size: {file_size} bytes")
        
        if file_size > ParseService.MAX_FILE_SIZE:
            raise ValueError(f"File size ({file_size} bytes) exceeds maximum allowed size ({ParseService.MAX_FILE_SIZE} bytes)")
        
        # Save uploaded file to temporary location
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, f"resume_{user_id}_{filename}")
        logger.info(f"Creating temporary file: {temp_file_path}")
        
        with open(temp_file_path, 'wb') as temp_file:
            temp_file.write(file_content)
        logger.info(f"File content written to temporary file, size: {len(file_content)} bytes")
        
        # Clear file content from memory
        del file_content
        gc.collect()
        
        # Initialize ParseService and parse the resume file
        logger.info("Initializing ParseService")
        parse_service = ParseService()
        logger.info("ParseService initialized successfully")
        
        logger.info("Starting resume parsing with ParseService")
        parsed_data = await parse_service.parse_resume_file(temp_file_path)
        logger.info(f"Resume parsing completed. Parsed data summary: first_name={parsed_data.first_name}, last_name={parsed_data.last_name}, experience_count={len(parsed_data.experience)}, education_count={len(parsed_data.education)}")
        
        # Clean up ParseService
        del parse_service
        gc.collect()
        
        # Create resume with all parsed data
        logger.info("Starting database operations to create resume")
        resume = await _create_resume_with_data(user_id, filename, parsed_data)
        logger.info(f"Database operations completed successfully, resume ID: {resume.id}")
        
        # Clean up parsed data
        del parsed_data
        gc.collect()
        
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
            'message': 'Resume created and processed successfully',
            'startup_message': getattr(resume, 'startup_message', 'Welcome aboard! I\'m your AI Writer, here to save you time and boost your chances. Let\'s start?')
        }
        logger.info(f"Returning task result: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Exception in process_resume_upload task: {e}", exc_info=True)
        
        # Clean up objects on error
        if 'file_content' in locals():
            del file_content
        if parse_service is not None:
            del parse_service
        if 'parsed_data' in locals():
            del parsed_data
        gc.collect()
        
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
    """Creates resume in database with all data from ParseService"""
    logger.info(f"Starting database operations for user {user_id}, filename: {filename}")
    logger.info(f"Parsed data summary: first_name={parsed_data.first_name}, last_name={parsed_data.last_name}, experience_count={len(parsed_data.experience)}, education_count={len(parsed_data.education)}, skills_count={len(parsed_data.skills)}, contacts_count={len(parsed_data.contacts)}")
    
    with SyncSessionLocal() as db:
        try:
            # Check user's plan and existing resumes
            from app.database.models.user import User
            from app.database.models.resume import Resume as ResumeModel
            from sqlalchemy import select
            
            # Get user
            user_result = db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()
            if not user:
                raise ValueError(f"User {user_id} not found")
            
            # Get user's existing resumes count
            resumes_result = db.execute(select(ResumeModel).where(ResumeModel.user_id == user_id))
            existing_resumes = resumes_result.scalars().all()
            
            # Check if user is on free plan and already has a resume
            if not user.is_premium and len(existing_resumes) >= 1:
                raise ValueError("Free plan users can only create one resume. Please upgrade to premium to create additional resumes.")
            
            logger.info(f"Creating resume record for user {user_id}")
            # Extract name from filename without extension
            name_without_extension = os.path.splitext(filename)[0]
            
            # Create resume with parsed data
            resume = Resume(
                title=name_without_extension,
                template_slug=settings.VALID_TEMPLATE_SLUGS[0],  # Use first template as default
                professional_summary=parsed_data.professional_summary or "",
                user_id=user_id,
                from_upload=True
            )
            
            db.add(resume)
            db.commit()
            db.refresh(resume)
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
            
            db.commit()
            logger.info(f"Resume {resume.id} created successfully with all data for user {user_id}")
            logger.info(f"Getting startup message from platform for resume {resume.id}")

            resume_text = _generate_resume_text_from_parsed(parsed_data)
            logger.info(f"Generated resume text for platform, length: {len(resume_text)} characters")

            platform_chatflow = PlatformChatflow(
                app_key=settings.PLATFORM_UPLOAD_APP_KEY,
                app_url=settings.PLATFORM_APP_URL,
                timeout=settings.PLATFORM_TIMEOUT
            )
            logger.info(f"Calling get_startup_message with user_id={user_id}, resume_id={resume.id}")
            startup_message, conversation_id = await platform_chatflow.get_startup_message(
                user_id=str(user_id),
                resume_id=str(resume.id),
                resume_text=resume_text
            )

            logger.info(f"Received startup message from platform: {startup_message[:100]}...")
            logger.info(f"Received conversation_id from platform: '{conversation_id}' (type: {type(conversation_id)})")

            # Store message on the in-memory object for returning via Celery result
            resume.startup_message = startup_message
            resume.conversation_id = conversation_id
            db.commit()
            logger.info(f"Updated conversation_id for resume {resume.id}: {conversation_id}")

            gc.collect()
            
            return resume
            
        except Exception as e:
            logger.error(f"Error creating resume with data in database: {e}", exc_info=True)
            db.rollback()
            raise e
