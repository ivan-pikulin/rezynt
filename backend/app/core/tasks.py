from app.core.celery_app import celery_app
from app.services.email_service import EmailService
from markitdown import MarkItDown
import logging
import os
import tempfile
from pathlib import Path

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
    """Обработка загруженного резюме с помощью markitdown"""
    logger.info(f"Starting resume processing task for user {user_id}, resume {resume_id}")
    
    try:
        # Update task status to processing
        self.update_state(
            state='PROCESSING',
            meta={'status': 'processing', 'message': 'Processing resume with markitdown'}
        )
        
        # Initialize markitdown
        md = MarkItDown(enable_plugins=False)
        
        # Process the resume
        result = md.convert(file_path)
        
        # Extract text content
        text_content = result.text_content
        
        # Update task status to completed
        self.update_state(
            state='SUCCESS',
            meta={
                'status': 'completed',
                'message': 'Resume processed successfully',
                'text_content': text_content,
                'user_id': user_id,
                'resume_id': resume_id
            }
        )
        
        logger.info(f"Resume processing completed for user {user_id}, resume {resume_id}")
        return {
            'status': 'completed',
            'text_content': text_content,
            'user_id': user_id,
            'resume_id': resume_id
        }
        
    except Exception as e:
        logger.error(f"Exception in process_resume_upload task: {e}", exc_info=True)
        
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
