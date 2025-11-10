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
        
        subject = "Email Confirmation - Rezynt"
        
        # Choose template based on whether we have verification code
        if verification_code:
            # Modern template with code
            html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Email Confirmation</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Welcome to Rezynt!</h1>
<h2 style="color:#333;margin-bottom:20px">Confirm your email</h2>
<p style="color:#666;line-height:1.6;margin-bottom:30px">Thank you for signing up! To complete your registration, please confirm your email address using one of the methods below:</p>

<!-- Verification Code Section -->
<div style="background-color:#f8f9fa;border:2px solid #e9ecef;border-radius:8px;padding:25px;margin:30px 0;text-align:center">
<h3 style="color:#333;margin:0 0 15px 0;font-size:18px">Verification Code</h3>
<div style="background-color:white;border:2px solid #4caf50;border-radius:8px;padding:20px;margin:15px 0;display:inline-block">
<span style="font-size:32px;font-weight:bold;color:#4caf50;letter-spacing:8px;font-family:monospace">{{ code }}</span>
</div>
<p style="color:#666;margin:15px 0 0 0;font-size:14px">Copy this code and paste it in the verification form</p>
</div>

<div style="text-align:center;margin:30px 0">
<p style="color:#666;margin-bottom:15px">Or click the button below:</p>
<a href="{{ api_url }}/api/v1/auth/confirm-email?token={{ token }}" style="display:inline-block;padding:15px 30px;background-color:#4caf50;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">Confirm Email</a>
</div>

<div style="background-color:#fff3cd;border:1px solid #ffeaa7;border-radius:4px;padding:15px;margin:30px 0">
<p style="margin:0;color:#856404;font-size:14px"><strong>Alternative link:</strong> If the button doesn't work, copy and paste this link:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:10px 0;font-family:monospace;font-size:12px">{{ api_url }}/api/v1/auth/confirm-email?token={{ token }}</p>
</div>

<p style="color:#666;font-size:14px;line-height:1.6">The verification code is valid for 15 minutes. If you didn't sign up for our service, please ignore this email.</p>
<p style="text-align:center;color:#999;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px">&copy; 2025 Rezynt. All rights reserved.</p>
</div>
</body>
</html>"""
        else:
            # Original template without code
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
        
        subject = "Password Reset - Rezynt"
        
        # Choose template based on whether we have verification code
        if verification_code:
            # Modern template with code
            html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Password Reset</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Password Reset</h1>
<h2 style="color:#333;margin-bottom:20px">Reset your password</h2>
<p style="color:#666;line-height:1.6;margin-bottom:30px">You received this email because a password reset was requested for your Rezynt account. Use one of the methods below to reset your password:</p>

<!-- Verification Code Section -->
<div style="background-color:#f8f9fa;border:2px solid #e9ecef;border-radius:8px;padding:25px;margin:30px 0;text-align:center">
<h3 style="color:#333;margin:0 0 15px 0;font-size:18px">Verification Code</h3>
<div style="background-color:white;border:2px solid #4caf50;border-radius:8px;padding:20px;margin:15px 0;display:inline-block">
<span style="font-size:32px;font-weight:bold;color:#4caf50;letter-spacing:8px;font-family:monospace">{{ code }}</span>
</div>
<p style="color:#666;margin:15px 0 0 0;font-size:14px">Copy this code and paste it in the password reset form</p>
</div>

<div style="text-align:center;margin:30px 0">
<p style="color:#666;margin-bottom:15px">Or click the button below:</p>
<a href="{{ frontend_url }}/auth/reset-password?token={{ token }}" style="display:inline-block;padding:15px 30px;background-color:#4caf50;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px">Reset Password</a>
</div>

<div style="background-color:#fff3cd;border:1px solid #ffeaa7;border-radius:4px;padding:15px;margin:30px 0">
<p style="margin:0;color:#856404;font-size:14px"><strong>Alternative link:</strong> If the button doesn't work, copy and paste this link:</p>
<p style="word-break:break-all;background-color:#f0f0f0;padding:10px;border-radius:4px;margin:10px 0;font-family:monospace;font-size:12px">{{ frontend_url }}/auth/reset-password?token={{ token }}</p>
</div>

<div style="background-color:#ffe6e6;border:1px solid #ffb3b3;border-radius:4px;padding:15px;margin:30px 0">
<p style="margin:0;color:#d63031;font-size:14px"><strong>Important:</strong> This code and link are valid for 15 minutes only. If you didn't request a password reset, please ignore this email and your account will remain secure.</p>
</div>

<p style="text-align:center;color:#999;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px">&copy; 2025 Rezynt. All rights reserved.</p>
</div>
</body>
</html>"""
        else:
            # Original template without code
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
        
        subject = "Confirm Email Change - Rezynt"
        
        html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Confirm Email Change</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">Confirm Email Change</h1>
<h2 style="color:#333;margin-bottom:20px">Verify your new email address</h2>
<p style="color:#666;line-height:1.6;margin-bottom:30px">You are changing your email address for your Rezynt account. To complete this change, please enter the verification code below:</p>

<!-- Verification Code Section -->
<div style="background-color:#f8f9fa;border:2px solid #e9ecef;border-radius:8px;padding:25px;margin:30px 0;text-align:center">
<h3 style="color:#333;margin:0 0 15px 0;font-size:18px">Verification Code</h3>
<div style="background-color:white;border:2px solid #4caf50;border-radius:8px;padding:20px;margin:15px 0;display:inline-block">
<span style="font-size:32px;font-weight:bold;color:#4caf50;letter-spacing:8px;font-family:monospace">{{ code }}</span>
</div>
<p style="color:#666;margin:15px 0 0 0;font-size:14px">Copy this code and paste it in the email change form</p>
</div>

<div style="background-color:#ffe6e6;border:1px solid #ffb3b3;border-radius:4px;padding:15px;margin:30px 0">
<p style="margin:0;color:#d63031;font-size:14px"><strong>Important:</strong> This code is valid for 15 minutes only. If you didn't request this email change, please ignore this email and your account will remain secure.</p>
</div>

<p style="text-align:center;color:#999;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px">&copy; 2025 Rezynt. All rights reserved.</p>
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
        
        subject = f"New Onboarding Completed - {user_email}"
        
        html_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Onboarding Completed</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f4f4f4">
<div style="max-width:600px;margin:0 auto;background-color:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
<h1 style="color:#4caf50;text-align:center;margin-bottom:30px">New User Onboarding</h1>
<h2 style="color:#333;margin-bottom:20px">User Information</h2>
<div style="background-color:#f8f9fa;border-left:4px solid #4caf50;padding:15px;margin:20px 0">
<p style="margin:5px 0"><strong>User ID:</strong> {{ user_id }}</p>
<p style="margin:5px 0"><strong>Email:</strong> {{ user_email }}</p>
</div>

<h3 style="color:#333;margin-top:30px;margin-bottom:15px">Onboarding Responses</h3>
<div style="background-color:#ffffff;border:1px solid #e9ecef;border-radius:4px;padding:20px;margin:20px 0">
<div style="margin-bottom:20px">
<p style="margin:5px 0;color:#666;font-size:14px"><strong>Work Experience:</strong></p>
<p style="margin:5px 0;padding:10px;background-color:#f8f9fa;border-radius:4px">{{ experience }}</p>
</div>
<div style="margin-bottom:20px">
<p style="margin:5px 0;color:#666;font-size:14px"><strong>Job Search Status:</strong></p>
<p style="margin:5px 0;padding:10px;background-color:#f8f9fa;border-radius:4px">{{ job_search_status }}</p>
</div>
<div style="margin-bottom:20px">
<p style="margin:5px 0;color:#666;font-size:14px"><strong>Background Field:</strong></p>
<p style="margin:5px 0;padding:10px;background-color:#f8f9fa;border-radius:4px">{{ background_field }}</p>
</div>
<div style="margin-bottom:0">
<p style="margin:5px 0;color:#666;font-size:14px"><strong>Resume Goal:</strong></p>
<p style="margin:5px 0;padding:10px;background-color:#f8f9fa;border-radius:4px">{{ resume_goal }}</p>
</div>
</div>

<p style="text-align:center;color:#999;font-size:12px;margin-top:40px;border-top:1px solid #eee;padding-top:20px">&copy; 2025 Rezynt. All rights reserved.</p>
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