from app.core.celery_app import celery_app
from app.services.email_service import EmailService
import logging

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
