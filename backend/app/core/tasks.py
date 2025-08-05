import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from app.core.celery_app import celery_app
from app.core.config import settings


@celery_app.task
def send_confirmation_email(email: str, token: str):
    """Отправка email с подтверждением регистрации"""
    
    # HTML шаблон письма
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Подтверждение регистрации</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Добро пожаловать в Rezynt!</h1>
            </div>
            <div class="content">
                <h2>Подтвердите ваш email</h2>
                <p>Спасибо за регистрацию! Для завершения процесса регистрации, пожалуйста, подтвердите ваш email адрес.</p>
                <p style="text-align: center;">
                    <a href="{{ frontend_url }}/auth/register_confirm?token={{ token }}" class="button">
                        Подтвердить email
                    </a>
                </p>
                <p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в браузер:</p>
                <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
                    {{ frontend_url }}/auth/register_confirm?token={{ token }}
                </p>
                <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Rezynt. Все права защищены.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Текстовый шаблон письма
    text_template = """
    Добро пожаловать в Rezynt!
    
    Подтвердите ваш email
    
    Спасибо за регистрацию! Для завершения процесса регистрации, пожалуйста, подтвердите ваш email адрес.
    
    Перейдите по ссылке: {{ frontend_url }}/auth/register_confirm?token={{ token }}
    
    Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
    
    © 2024 Rezynt. Все права защищены.
    """
    
    # Рендерим шаблоны
    html_content = Template(html_template).render(
        frontend_url=settings.FRONTEND_URL,
        token=token
    )
    text_content = Template(text_template).render(
        frontend_url=settings.FRONTEND_URL,
        token=token
    )
    
    # Создаем сообщение
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Подтверждение регистрации - Rezynt'
    msg['From'] = settings.email.email_username
    msg['To'] = email
    
    # Добавляем части сообщения
    text_part = MIMEText(text_content, 'plain', 'utf-8')
    html_part = MIMEText(html_content, 'html', 'utf-8')
    
    msg.attach(text_part)
    msg.attach(html_part)
    
    # Отправляем письмо
    try:
        with smtplib.SMTP_SSL(settings.email.email_host, settings.email.email_port) as server:
            server.login(settings.email.email_username, settings.email.email_password.get_secret_value())
            server.send_message(msg)
        return {"status": "success", "email": email}
    except Exception as e:
        return {"status": "error", "email": email, "error": str(e)} 