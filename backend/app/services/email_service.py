import smtplib
from dkim import dkim_sign
from email.mime.text import MIMEText
from jinja2 import Template
import logging

from app.core.config import settings

# Set up logging
logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_server = settings.email.EMAIL_HOST
        self.smtp_port = settings.email.EMAIL_PORT
        self.sender_email = settings.email.EMAIL_USERNAME
        self.sender_password = settings.email.EMAIL_PASSWORD.get_secret_value()
        self.domain = settings.email.EMAIL_DOMAIN
        self.selector = settings.email.EMAIL_DKIM_SELECTOR
        
        # Log configuration (without sensitive data)
        logger.info(f"Email service initialized with SMTP server: {self.smtp_server}:{self.smtp_port}")
        logger.info(f"Sender email: {self.sender_email}")
        logger.info(f"Domain: {self.domain}")
        
        # Загружаем приватный ключ DKIM
        self.dkim_private_key = self._load_dkim_key()
    
    def _load_dkim_key(self) -> str:
        """Загружает приватный ключ DKIM из файла"""
        try:
            with open(settings.email.EMAIL_DKIM_PRIVATE_KEY_PATH, 'r') as f:
                key_content = f.read()
                logger.info("DKIM private key loaded successfully")
                return key_content
        except FileNotFoundError:
            logger.warning(f"DKIM private key file not found at {settings.email.EMAIL_DKIM_PRIVATE_KEY_PATH}")
            return ""
        except Exception as e:
            logger.error(f"Could not load DKIM key: {e}")
            return ""
    
    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """
        Отправляет email с DKIM подписью
        
        Args:
            to_email: Email получателя
            subject: Тема письма
            body: Текст письма
            
        Returns:
            bool: True если письмо отправлено успешно, False в противном случае
        """
        try:
            logger.info(f"Attempting to send email to {to_email}")
            
            # Создаем MIME сообщение
            msg = MIMEText(body, 'html' if '<html>' in body else 'plain')
            msg['From'] = self.sender_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Добавляем DKIM подпись если ключ доступен
            if self.dkim_private_key:
                try:
                    headers = [b"from", b"to", b"subject"]
                    signature = dkim_sign(
                        message=msg.as_bytes(),
                        selector=self.selector.encode(),
                        domain=self.domain.encode(),
                        privkey=self.dkim_private_key.encode(),
                        include_headers=headers
                    )
                    
                    # Добавляем DKIM-подпись в заголовки письма
                    sig_header = signature[len("DKIM-Signature: "):].decode()
                    msg['DKIM-Signature'] = sig_header
                    logger.info("DKIM signature added successfully")
                except Exception as dkim_error:
                    logger.warning(f"Failed to add DKIM signature: {dkim_error}")
            
            # Отправляем письмо через SMTP с SSL
            logger.info(f"Connecting to SMTP server {self.smtp_server}:{self.smtp_port}")
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as smtp:
                logger.info("SMTP connection established, attempting login")
                smtp.login(self.sender_email, self.sender_password)
                logger.info("SMTP login successful")
                smtp.sendmail(self.sender_email, [to_email], msg.as_string())
                logger.info(f"Email sent successfully to {to_email}")
            
            return True
            
        except smtplib.SMTPAuthenticationError as auth_error:
            logger.error(f"SMTP Authentication failed: {auth_error}")
            logger.error(f"Error code: {auth_error.smtp_code}, Error message: {auth_error.smtp_error}")
            return False
        except smtplib.SMTPException as smtp_error:
            logger.error(f"SMTP error occurred: {smtp_error}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email: {e}")
            return False
    
    def send_confirmation_email(self, to_email: str, confirmation_token: str) -> bool:
        """
        Отправляет email для подтверждения регистрации
        
        Args:
            to_email: Email пользователя
            confirmation_token: Токен для подтверждения
            
        Returns:
            bool: True если письмо отправлено успешно
        """
        logger.info(f"Sending confirmation email to {to_email}")
        
        subject = "Подтверждение регистрации - Rezynt"
        
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
                        <a href="{{ api_url }}/api/v1/auth/confirm-email?token={{ token }}" class="button">
                            Подтвердить email
                        </a>
                    </p>
                    <p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в браузер:</p>
                    <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
                        {{ api_url }}/api/v1/auth/confirm-email?token={{ token }}
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
        
        # Создаем ссылку для подтверждения
        confirmation_url = f"{settings.API_BASE_URL}/auth/confirm-email?token={confirmation_token}"
        
        # Рендерим HTML шаблон
        html_content = Template(html_template).render(
            api_url=settings.API_BASE_URL,
            token=confirmation_token
        )
        
        return self.send_email(to_email, subject, html_content)
