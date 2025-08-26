import smtplib
import dkim
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
        logger.info(f"Sender password: {self.sender_password}")
        logger.info(f"Domain: {self.domain}")
        logger.info(f"DKIM selector: {self.selector}")
        
        # Загружаем приватный ключ DKIM
        self.dkim_private_key = self._load_dkim_key()
    
    def _load_dkim_key(self) -> str:
        """Загружает приватный ключ DKIM из файла"""
        try:
            with open(settings.email.EMAIL_DKIM_PRIVATE_KEY_PATH, 'r') as f:
                key_content = f.read()
                logger.info(f"DKIM private key loaded successfully from {settings.email.EMAIL_DKIM_PRIVATE_KEY_PATH}")
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
            
            # Создаем MIME сообщение как в test_email_send.py
            msg = MIMEText(body, 'html')
            msg['From'] = self.sender_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Добавляем DKIM подпись если есть приватный ключ
            if self.dkim_private_key:
                # Заголовки, которые надо подписать
                headers = [b"from", b"to", b"subject"]
                
                # Создаем DKIM-подпись как в test_email_send.py
                signature = dkim.sign(
                    message=msg.as_bytes(),
                    selector=self.selector.encode(),
                    domain=self.domain.encode(),
                    privkey=self.dkim_private_key.encode(),
                    include_headers=headers
                )
                
                # Добавляем DKIM-подпись в заголовки письма
                sig_header = signature[len("DKIM-Signature: "):].decode()
                msg['DKIM-Signature'] = sig_header
                logger.info("DKIM signature added to message headers")
            else:
                logger.warning("No DKIM private key available - sending without DKIM signature")
            
            # Отправляем письмо через smtplib с SSL как в test_email_send.py
            logger.info(f"Connecting to SMTP server {self.smtp_server}:{self.smtp_port}")
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as smtp:
                logger.info("SMTP connection established, attempting login")
                smtp.login(self.sender_email, self.sender_password)
                logger.info("SMTP login successful")
                
                # Отправляем письмо
                smtp.sendmail(msg['From'], [msg['To']], msg.as_string())
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
        html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Подтверждение регистрации</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:20px">
<h1 style="color:#4CAF50;text-align:center;margin-bottom:30px">Добро пожаловать в Rezynt!</h1>
<h2 style="color:#333">Подтвердите ваш email</h2>
<p>Спасибо за регистрацию! Для завершения процесса регистрации, пожалуйста, подтвердите ваш email адрес.</p>
<p style="text-align:center;margin:30px 0">
<a href="{{ api_url }}/auth/confirm-email?token={{ token }}" style="display:inline-block;padding:12px 24px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:4px;font-weight:bold">Подтвердить email</a>
</p>
<p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в браузер:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:20px 0">{{ api_url }}/auth/confirm-email?token={{ token }}</p>
<p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
<p style="text-align:center;color:#666;font-size:12px;margin-top:30px">&copy; 2025 Rezynt. Все права защищены.</p>
</div>
</body>
</html>"""
        
        # Рендерим HTML шаблон
        html_content = Template(html_template).render(
            api_url=settings.API_BASE_URL,
            token=confirmation_token
        )
        
        logger.info(f"Confirmation email HTML content generated, length: {len(html_content)}")
        result = self.send_email(to_email, subject, html_content)
        logger.info(f"Confirmation email send result: {result}")
        return result

    def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """
        Отправляет email для сброса пароля
        
        Args:
            to_email: Email пользователя
            reset_token: Токен для сброса пароля
            
        Returns:
            bool: True если письмо отправлено успешно
        """
        logger.info(f"Sending password reset email to {to_email}")
        
        subject = "Сброс пароля - Rezynt"
        
        # HTML шаблон письма
        html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Сброс пароля</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:20px">
<h1 style="color:#2196F3;text-align:center;margin-bottom:30px">Сброс пароля</h1>
<h2 style="color:#333">Запрос на сброс пароля</h2>
<p>Вы получили это письмо, потому что был отправлен запрос на сброс пароля для вашей учетной записи Rezynt.</p>
<p style="text-align:center;margin:30px 0">
<a href="{{ frontend_url }}/auth/reset-password?token={{ token }}" style="display:inline-block;padding:12px 24px;background-color:#2196F3;color:white;text-decoration:none;border-radius:4px;font-weight:bold">Сбросить пароль</a>
</p>
<p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в браузер:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:20px 0">{{ frontend_url }}/auth/reset-password?token={{ token }}</p>
<p><strong>Внимание:</strong> Эта ссылка действительна только 1 час. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
<p style="text-align:center;color:#666;font-size:12px;margin-top:30px">&copy; 2025 Rezynt. Все права защищены.</p>
</div>
</body>
</html>"""
        
        # Рендерим HTML шаблон
        html_content = Template(html_template).render(
            frontend_url=settings.FRONTEND_BASE_URL,
            token=reset_token
        )
        
        logger.info(f"Password reset email HTML content generated, length: {len(html_content)}")
        result = self.send_email(to_email, subject, html_content)
        logger.info(f"Password reset email send result: {result}")
        return result
