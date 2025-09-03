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
            msg['From'] = f"Rezynt <{self.sender_email}>"
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
            
            # Send email via smtplib with SSL as in test_email_send.py
            logger.info(f"Connecting to SMTP server {self.smtp_server}:{self.smtp_port}")
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as smtp:
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
    
    def send_confirmation_email(self, to_email: str, confirmation_token: str) -> bool:
        """
        Sends confirmation email for registration
        
        Args:
            to_email: User email
            confirmation_token: Confirmation token
            
        Returns:
            bool: True if email sent successfully
        """
        logger.info(f"Sending confirmation email to {to_email}")
        
        subject = "Email Confirmation - Rezynt"
        
        # HTML template for email
        html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Email Confirmation</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:20px">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Welcome to Rezynt!</h1>
<h2 style="color:#333">Confirm your email</h2>
<p>Thank you for signing up! To complete your registration, please confirm your email address.</p>
<p style="text-align:center;margin:30px 0">
<a href="{{ api_url }}/api/v1/auth/confirm-email?token={{ token }}" style="display:inline-block;padding:12px 24px;background-color:#4caf50;color:white;text-decoration:none;border-radius:4px;font-weight:bold">Confirm Email</a>
</p>
<p>If the button doesn't work, copy and paste the following link into your browser:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:20px 0">{{ api_url }}/api/v1/auth/confirm-email?token={{ token }}</p>
<p>If you didn't sign up for our service, please ignore this email.</p>
<p style="text-align:center;color:#666;font-size:12px;margin-top:30px">&copy; 2025 Rezynt. All rights reserved.</p>
</div>
</body>
</html>"""
        
        # Render HTML template
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
        Sends password reset email
        
        Args:
            to_email: User email
            reset_token: Password reset token
            
        Returns:
            bool: True if email sent successfully
        """
        logger.info(f"Sending password reset email to {to_email}")
        
        subject = "Password Reset - Rezynt"
        
        # HTML template for email
        html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Password Reset</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:20px">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Password Reset</h1>
<h2 style="color:#333">Password Reset Request</h2>
<p>You received this email because a password reset was requested for your Rezynt account.</p>
<p style="text-align:center;margin:30px 0">
<a href="{{ frontend_url }}/auth/reset-password?token={{ token }}" style="display:inline-block;padding:12px 24px;background-color:#4caf50;color:white;text-decoration:none;border-radius:4px;font-weight:bold">Reset Password</a>
</p>
<p>If the button doesn't work, copy and paste the following link into your browser:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:20px 0">{{ frontend_url }}/auth/reset-password?token={{ token }}</p>
<p><strong>Important:</strong> This link is valid for 1 hour only. If you didn't request a password reset, please ignore this email.</p>
<p style="text-align:center;color:#666;font-size:12px;margin-top:30px">&copy; 2025 Rezynt. All rights reserved.</p>
</div>
</body>
</html>"""
        
        # Render HTML template
        html_content = Template(html_template).render(
            frontend_url=settings.FRONTEND_BASE_URL,
            token=reset_token
        )
        
        logger.info(f"Password reset email HTML content generated, length: {len(html_content)}")
        result = self.send_email(to_email, subject, html_content)
        logger.info(f"Password reset email send result: {result}")
        return result
