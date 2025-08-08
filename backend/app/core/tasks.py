from app.core.celery_app import celery_app
from app.services.email_service import EmailService


@celery_app.task
def send_confirmation_email(email: str, token: str):
    """Отправка email с подтверждением регистрации через EmailService"""
    email_service = EmailService()
    try:
        success = email_service.send_confirmation_email(email, token)
        if success:
            return {"status": "success", "email": email}
        else:
            return {"status": "error", "email": email, "error": "Failed to send email"}
    except Exception as e:
        return {"status": "error", "email": email, "error": str(e)} 
