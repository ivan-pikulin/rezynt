import smtplib
import dkim
from email.mime.text import MIMEText
from jinja2 import Template
import logging

from app.core.config import settings

# Set up logging
logger = logging.getLogger(__name__)


class EmailService:
    SMTP_TIMEOUT_SECONDS = 10

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
        logger.info(f"DKIM selector: {self.selector}")
        
        # Load DKIM private key
        self.dkim_private_key = self._load_dkim_private_key()
    
    def _load_dkim_private_key(self) -> str:
        """Loads DKIM private key from file"""
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
        Sends email with DKIM signature
        
        Args:
            to_email: Recipient email
            subject: Email subject
            body: Email body
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            logger.info(f"Attempting to send email to {to_email}")
            
            # Create MIME message as in test_email_send.py
            msg = MIMEText(body, 'html')
            msg['From'] = f"Резинт <{self.sender_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add DKIM signature if private key is available
            if self.dkim_private_key:
                # Headers to sign
                headers = [b"from", b"to", b"subject"]
                
                # Create DKIM signature as in test_email_send.py
                signature = dkim.sign(
                    message=msg.as_bytes(),
                    selector=self.selector.encode(),
                    domain=self.domain.encode(),
                    privkey=self.dkim_private_key.encode(),
                    include_headers=headers
                )
                
                # Add DKIM signature to message headers
                sig_header = signature[len("DKIM-Signature: "):].decode()
                msg['DKIM-Signature'] = sig_header
                logger.info("DKIM signature added to message headers")
            else:
                logger.warning("No DKIM private key available - sending without DKIM signature")
            
            logger.info(f"Connecting to SMTP server {self.smtp_server}:{self.smtp_port}")
            smtp_class = smtplib.SMTP_SSL if self.smtp_port == 465 else smtplib.SMTP
            with smtp_class(
                self.smtp_server,
                self.smtp_port,
                timeout=self.SMTP_TIMEOUT_SECONDS,
            ) as smtp:
                if self.smtp_port != 465:
                    smtp.starttls()
                logger.info("SMTP connection established, attempting login")
                smtp.login(self.sender_email, self.sender_password)
                logger.info("SMTP login successful")
                
                # Send email
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
    
    def send_confirmation_email(self, to_email: str, confirmation_token: str, verification_code: str = None) -> bool:
        """
        Sends confirmation email for registration
        
        Args:
            to_email: User email
            confirmation_token: Confirmation token
            verification_code: Optional 6-digit verification code
            
        Returns:
            bool: True if email sent successfully
        """
        logger.info(f"Sending confirmation email to {to_email}")
        
        subject = "Подтверждение электронной почты - Резинт"
        
        # Choose template based on whether we have verification code
        if verification_code:
            # Modern template with code
            html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Подтверждение электронной почты</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Добро пожаловать в Резинт!</h1>
<h2 style="color:#333;margin-bottom:20px">Подтвердите электронную почту</h2>
<p style="color:#666;line-height:1.6;margin-bottom:30px">Спасибо за регистрацию! Чтобы завершить ее, подтвердите адрес электронной почты одним из способов ниже:</p>

<!-- Verification Code Section -->
<div style="background-color:#f8f9fa;border:2px solid #e9ecef;border-radius:8px;padding:25px;margin:30px 0;text-align:center">
<h3 style="color:#333;margin:0 0 15px 0;font-size:18px">Код подтверждения</h3>
<div style="background-color:white;border:2px solid #4caf50;border-radius:8px;padding:20px;margin:15px 0;display:inline-block">
<span style="font-size:32px;font-weight:bold;color:#4caf50;letter-spacing:8px;font-family:monospace">{{ code }}</span>
</div>
<p style="color:#666;margin:15px 0 0 0;font-size:14px">Скопируйте этот код и вставьте его в форму подтверждения</p>
</div>

<div style="text-align:center;margin:30px 0">
<p style="color:#666;margin-bottom:15px">Или нажмите кнопку ниже:</p>
<a href="{{ api_url }}/api/v1/auth/confirm-email?token={{ token }}" style="display:inline-block;padding:15px 30px;background-color:#4caf50;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">Подтвердить email</a>
</div>

<div style="background-color:#fff3cd;border:1px solid #ffeaa7;border-radius:4px;padding:15px;margin:30px 0">
<p style="margin:0;color:#856404;font-size:14px"><strong>Альтернативная ссылка:</strong> если кнопка не работает, скопируйте и вставьте эту ссылку:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:10px 0;font-family:monospace;font-size:12px">{{ api_url }}/api/v1/auth/confirm-email?token={{ token }}</p>
</div>

<p style="color:#666;font-size:14px;line-height:1.6">Код подтверждения действителен 15 минут. Если вы не регистрировались в нашем сервисе, просто проигнорируйте это письмо.</p>
<p style="text-align:center;color:#999;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px">&copy; 2025 Резинт. Все права защищены.</p>
</div>
</body>
</html>"""
        else:
            # Original template without code
            html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Подтверждение электронной почты</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:20px">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Добро пожаловать в Резинт!</h1>
<h2 style="color:#333">Подтвердите электронную почту</h2>
<p>Спасибо за регистрацию! Чтобы завершить ее, подтвердите адрес электронной почты.</p>
<p style="text-align:center;margin:30px 0">
<a href="{{ api_url }}/api/v1/auth/confirm-email?token={{ token }}" style="display:inline-block;padding:12px 24px;background-color:#4caf50;color:white;text-decoration:none;border-radius:4px;font-weight:bold">Подтвердить email</a>
</p>
<p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в браузер:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:20px 0">{{ api_url }}/api/v1/auth/confirm-email?token={{ token }}</p>
<p>Если вы не регистрировались в нашем сервисе, просто проигнорируйте это письмо.</p>
<p style="text-align:center;color:#666;font-size:12px;margin-top:30px">&copy; 2025 Резинт. Все права защищены.</p>
</div>
</body>
</html>"""
        
        # Render HTML template
        template_vars = {
            'api_url': settings.API_BASE_URL,
            'token': confirmation_token
        }
        if verification_code:
            template_vars['code'] = verification_code
            
        html_content = Template(html_template).render(**template_vars)
        
        logger.info(f"Confirmation email HTML content generated, length: {len(html_content)}")
        result = self.send_email(to_email, subject, html_content)
        logger.info(f"Confirmation email send result: {result}")
        return result

    def send_password_reset_email(self, to_email: str, reset_token: str, verification_code: str = None) -> bool:
        """
        Sends password reset email
        
        Args:
            to_email: User email
            reset_token: Password reset token
            verification_code: Optional 6-digit verification code
            
        Returns:
            bool: True if email sent successfully
        """
        logger.info(f"Sending password reset email to {to_email}")
        
        subject = "Сброс пароля - Резинт"
        
        # Choose template based on whether we have verification code
        if verification_code:
            # Modern template with code
            html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Сброс пароля</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Сброс пароля</h1>
<h2 style="color:#333;margin-bottom:20px">Сбросьте пароль</h2>
<p style="color:#666;line-height:1.6;margin-bottom:30px">Это письмо отправлено, потому что для вашего аккаунта Резинт был запрошен сброс пароля. Используйте один из способов ниже, чтобы сбросить пароль:</p>

<!-- Verification Code Section -->
<div style="background-color:#f8f9fa;border:2px solid #e9ecef;border-radius:8px;padding:25px;margin:30px 0;text-align:center">
<h3 style="color:#333;margin:0 0 15px 0;font-size:18px">Код подтверждения</h3>
<div style="background-color:white;border:2px solid #4caf50;border-radius:8px;padding:20px;margin:15px 0;display:inline-block">
<span style="font-size:32px;font-weight:bold;color:#4caf50;letter-spacing:8px;font-family:monospace">{{ code }}</span>
</div>
<p style="color:#666;margin:15px 0 0 0;font-size:14px">Скопируйте этот код и вставьте его в форму сброса пароля</p>
</div>

<div style="text-align:center;margin:30px 0">
<p style="color:#666;margin-bottom:15px">Или нажмите кнопку ниже:</p>
<a href="{{ frontend_url }}/auth/reset-password?token={{ token }}" style="display:inline-block;padding:15px 30px;background-color:#4caf50;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">Сбросить пароль</a>
</div>

<div style="background-color:#fff3cd;border:1px solid #ffeaa7;border-radius:4px;padding:15px;margin:30px 0">
<p style="margin:0;color:#856404;font-size:14px"><strong>Альтернативная ссылка:</strong> если кнопка не работает, скопируйте и вставьте эту ссылку:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:10px 0;font-family:monospace;font-size:12px">{{ frontend_url }}/auth/reset-password?token={{ token }}</p>
</div>

<div style="background-color:#ffe6e6;border:1px solid #ffb3b3;border-radius:4px;padding:15px;margin:30px 0">
<p style="margin:0;color:#d63031;font-size:14px"><strong>Важно:</strong> этот код и ссылка действительны только 15 минут. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо — ваш аккаунт останется в безопасности.</p>
</div>

<p style="text-align:center;color:#999;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px">&copy; 2025 Резинт. Все права защищены.</p>
</div>
</body>
</html>"""
        else:
            # Original template without code
            html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Сброс пароля</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:20px">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Сброс пароля</h1>
<h2 style="color:#333">Запрос на сброс пароля</h2>
<p>Это письмо отправлено, потому что для вашего аккаунта Резинт был запрошен сброс пароля.</p>
<p style="text-align:center;margin:30px 0">
<a href="{{ frontend_url }}/auth/reset-password?token={{ token }}" style="display:inline-block;padding:12px 24px;background-color:#4caf50;color:white;text-decoration:none;border-radius:4px;font-weight:bold">Сбросить пароль</a>
</p>
<p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в браузер:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:20px 0">{{ frontend_url }}/auth/reset-password?token={{ token }}</p>
<p><strong>Важно:</strong> эта ссылка действительна только 1 час. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
<p style="text-align:center;color:#666;font-size:12px;margin-top:30px">&copy; 2025 Резинт. Все права защищены.</p>
</div>
</body>
</html>"""
        
        # Render HTML template
        template_vars = {
            'frontend_url': settings.FRONTEND_BASE_URL,
            'token': reset_token
        }
        if verification_code:
            template_vars['code'] = verification_code
            
        html_content = Template(html_template).render(**template_vars)
        
        logger.info(f"Password reset email HTML content generated, length: {len(html_content)}")
        result = self.send_email(to_email, subject, html_content)
        logger.info(f"Password reset email send result: {result}")
        return result
    
    def send_email_change_confirmation(self, to_email: str, token: str, verification_code: str) -> bool:
        """
        Sends email change confirmation email
        
        Args:
            to_email: New email address
            token: Email change token
            verification_code: 6-digit verification code
            
        Returns:
            bool: True if email sent successfully
        """
        logger.info(f"Sending email change confirmation to {to_email}")
        
        subject = "Подтвердите смену email - Резинт"
        
        html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Подтверждение смены email</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Подтверждение смены email</h1>
<h2 style="color:#333;margin-bottom:20px">Подтвердите новый адрес электронной почты</h2>
<p style="color:#666;line-height:1.6;margin-bottom:30px">Вы меняете адрес электронной почты для аккаунта Резинт. Чтобы завершить изменение, введите код подтверждения ниже:</p>

<!-- Verification Code Section -->
<div style="background-color:#f8f9fa;border:2px solid #e9ecef;border-radius:8px;padding:25px;margin:30px 0;text-align:center">
<h3 style="color:#333;margin:0 0 15px 0;font-size:18px">Код подтверждения</h3>
<div style="background-color:white;border:2px solid #4caf50;border-radius:8px;padding:20px;margin:15px 0;display:inline-block">
<span style="font-size:32px;font-weight:bold;color:#4caf50;letter-spacing:8px;font-family:monospace">{{ code }}</span>
</div>
<p style="color:#666;margin:15px 0 0 0;font-size:14px">Скопируйте этот код и вставьте его в форму смены email</p>
</div>

<div style="background-color:#ffe6e6;border:1px solid #ffb3b3;border-radius:4px;padding:15px;margin:30px 0">
<p style="margin:0;color:#d63031;font-size:14px"><strong>Важно:</strong> этот код действителен только 15 минут. Если вы не запрашивали смену email, просто проигнорируйте это письмо — ваш аккаунт останется в безопасности.</p>
</div>

<p style="text-align:center;color:#999;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px">&copy; 2025 Резинт. Все права защищены.</p>
</div>
</body>
</html>"""
        
        # Render HTML template
        template_vars = {
            'code': verification_code
        }
            
        html_content = Template(html_template).render(**template_vars)
        
        logger.info(f"Email change confirmation HTML content generated, length: {len(html_content)}")
        result = self.send_email(to_email, subject, html_content)
        logger.info(f"Email change confirmation send result: {result}")
        return result
    
    def send_onboarding_notification(self, user_email: str, user_id: int, responses: dict) -> bool:
        """
        Sends onboarding completion notification to admin
        
        Args:
            user_email: Email of the user who completed onboarding
            user_id: ID of the user
            responses: Dictionary with onboarding responses
            
        Returns:
            bool: True if email sent successfully
        """
        logger.info(f"Sending onboarding notification for user {user_email}")
        
        subject = f"Завершен новый онбординг - {user_email}"
        
        html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Онбординг завершен</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Онбординг нового пользователя</h1>
<h2 style="color:#333;margin-bottom:20px">Информация о пользователе</h2>
<div style="background-color:#f8f9fa;border-left:4px solid #4caf50;padding:15px;margin:20px 0">
<p style="margin:5px 0"><strong>ID пользователя:</strong> {{ user_id }}</p>
<p style="margin:5px 0"><strong>Email:</strong> {{ user_email }}</p>
</div>

<h3 style="color:#333;margin-top:30px;margin-bottom:15px">Ответы онбординга</h3>
<div style="background-color:#ffffff;border:1px solid #e9ecef;border-radius:4px;padding:20px;margin:20px 0">
<div style="margin-bottom:20px">
<p style="margin:5px 0;color:#666;font-size:14px"><strong>Опыт работы:</strong></p>
<p style="margin:5px 0;padding:10px;background-color:#f8f9fa;border-radius:4px">{{ experience }}</p>
</div>
<div style="margin-bottom:20px">
<p style="margin:5px 0;color:#666;font-size:14px"><strong>Статус поиска работы:</strong></p>
<p style="margin:5px 0;padding:10px;background-color:#f8f9fa;border-radius:4px">{{ job_search_status }}</p>
</div>
<div style="margin-bottom:20px">
<p style="margin:5px 0;color:#666;font-size:14px"><strong>Сфера опыта:</strong></p>
<p style="margin:5px 0;padding:10px;background-color:#f8f9fa;border-radius:4px">{{ background_field }}</p>
</div>
<div style="margin-bottom:0">
<p style="margin:5px 0;color:#666;font-size:14px"><strong>Цель резюме:</strong></p>
<p style="margin:5px 0;padding:10px;background-color:#f8f9fa;border-radius:4px">{{ resume_goal }}</p>
</div>
</div>

<p style="text-align:center;color:#999;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px">&copy; 2025 Резинт. Все права защищены.</p>
</div>
</body>
</html>"""
        
        # Render HTML template
        template_vars = {
            'user_id': user_id,
            'user_email': user_email,
            'experience': responses.get('experience', 'N/A'),
            'job_search_status': responses.get('job_search_status', 'N/A'),
            'background_field': responses.get('background_field', 'N/A'),
            'resume_goal': responses.get('resume_goal', 'N/A')
        }
            
        html_content = Template(html_template).render(**template_vars)
        
        logger.info(f"Onboarding notification HTML content generated, length: {len(html_content)}")
        result = self.send_email("pikulin.ivan.pelikan@gmail.com", subject, html_content)
        logger.info(f"Onboarding notification send result: {result}")
        return result

    def send_paid_access_email(self, to_email: str, password: str) -> bool:
        """
        Sends paid access credentials after a successful payment.
        """
        logger.info(f"Sending paid access email to {to_email}")

        subject = "Доступ к Резинт активирован"

        html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Доступ активирован</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Доступ активирован</h1>
<p style="color:#333;line-height:1.6;margin-bottom:20px">Оплата прошла успешно. Платные функции Резинт доступны в вашем текущем аккаунте.</p>
<div style="background-color:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:20px;margin:25px 0">
<p style="margin:6px 0;color:#333"><strong>Логин:</strong> {{ email }}</p>
<p style="margin:6px 0;color:#333"><strong>Пароль:</strong> {{ password }}</p>
</div>
<p style="color:#666;line-height:1.6;margin-bottom:0">Вы уже авторизованы в сервисе. Эти данные нужны, чтобы вернуться в аккаунт позже или с другого устройства.</p>
<p style="text-align:center;color:#999;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px">&copy; 2026 Резинт. Все права защищены.</p>
</div>
</body>
</html>"""

        html_content = Template(html_template).render({
            "email": to_email,
            "password": password,
        })

        result = self.send_email(to_email, subject, html_content)
        logger.info(f"Paid access email send result: {result}")
        return result
