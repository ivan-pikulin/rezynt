import logging
import os
import tempfile
import gc

from app.core.celery_app import celery_app
from app.database.session import SyncSessionLocal
from app.services.email_service import EmailService
from app.services.parse_service import ParseService
from asgiref.sync import async_to_sync

# Set up logging
logger = logging.getLogger(__name__)




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
        
        # Safe logging with proper structure
        first_name = parsed_data.personal_info.get('first_name') if parsed_data.personal_info else None
        last_name = parsed_data.personal_info.get('last_name') if parsed_data.personal_info else None
        experience_count = len(parsed_data.work_experience) if parsed_data.work_experience else 0
        education_count = len(parsed_data.education) if parsed_data.education else 0
        logger.info(f"Resume parsing completed. Parsed data summary: first_name={first_name}, last_name={last_name}, experience_count={experience_count}, education_count={education_count}")
        
        # Clean up ParseService
        del parse_service
        gc.collect()
        
        # Update user's resume_data with parsed data
        logger.info("Starting database operations to update resume_data")
        await _update_user_resume_data(user_id, parsed_data)
        logger.info(f"Database operations completed successfully for user {user_id}")
        
        # Trigger analysis after successful resume upload
        await _generate_analysis_after_upload(user_id)
        
        # Clean up parsed data
        del parsed_data
        gc.collect()
        
        # Clean up temporary file
        try:
            os.remove(temp_file_path)
            logger.info(f"Temporary file removed: {temp_file_path}")
        except Exception as e:
            logger.warning(f"Failed to remove temporary file {temp_file_path}: {e}")
        
        logger.info(f"Resume processing completed for user {user_id}")
        result = {
            'status': 'completed',
            'user_id': user_id,
            'message': 'Resume processed and updated successfully'
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


async def _update_user_resume_data(user_id: int, parsed_data):
    """Updates user's resume_data JSONB field with parsed data from ParseService"""
    logger.info(f"Starting database operations for user {user_id}")
    
    # Convert parsed_data to dictionary matching our JSONB structure
    resume_dict = parsed_data.model_dump()
    logger.info(f"Converted parsed data to dict, keys: {list(resume_dict.keys())}")
    
    with SyncSessionLocal() as db:
        try:
            from app.database.models.user import User
            from sqlalchemy import select
            
            # Get user
            user_result = db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()
            if not user:
                raise ValueError(f"User {user_id} not found")
            
            logger.info(f"Updating resume_data for user {user_id}")
            # Update user's resume_data
            user.resume_data = resume_dict
            
            db.commit()
            logger.info(f"Resume data updated successfully for user {user_id}")

            gc.collect()
            
        except Exception as e:
            logger.error(f"Error updating resume data in database: {e}", exc_info=True)
            db.rollback()
            raise e


async def _generate_analysis_after_upload(user_id: int):
    """Generates analysis for uploaded resume"""
    from app.database.session import SessionLocal
    from app.database.crud.crud_user import user_crud
    from app.services.analysis.analysis_service import analysis_service
    
    logger.info(f"Generating analysis for user {user_id}")
    
    async with SessionLocal() as db:
        # Get user's resume data
        resume_data = await user_crud.get_resume_data(db, user_id=user_id)
        
        if not resume_data:
            logger.warning(f"No resume data found for user {user_id}")
            return
        
        # Generate analysis
        analysis_result = await analysis_service.analyze_resume(resume_data)
        
        # Save analysis to database
        await user_crud.save_analysis_result(
            db,
            user_id=user_id,
            analysis_data=analysis_result.model_dump(mode='json')
        )
        
        logger.info(f"Analysis saved for user {user_id}, score: {analysis_result.score}")
