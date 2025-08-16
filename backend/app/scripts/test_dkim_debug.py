#!/usr/bin/env python3
"""
Debug script to test DKIM signature creation for confirmation emails
Run this script to analyze DKIM signature issues
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template

from app.services.email_service import EmailService
from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_dkim_signature():
    """Test DKIM signature creation for confirmation email"""
    print("=== DKIM Signature Debug Test ===")
    
    test_email = "pikulin.ivan.pelikan@gmail.com"
    test_token = "test-confirmation-token-12345"
    
    try:
        # Initialize email service
        print("Initializing EmailService...")
        email_service = EmailService()
        print("✓ EmailService initialized")
        
        # Create the same HTML content as confirmation email
        html_template = """<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Подтверждение регистрации</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Добро пожаловать в Rezynt!</h1>
        </div>
        <div style="padding: 20px;">
            <h2 style="color: #333; margin-top: 0;">Подтвердите ваш email</h2>
            <p>Спасибо за регистрацию! Для завершения процесса регистрации, пожалуйста, подтвердите ваш email адрес.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ api_url }}/auth/confirm-email?token={{ token }}" 
                   style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Подтвердить email
                </a>
            </div>
            <p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в браузер:</p>
            <div style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px; margin: 20px 0;">
                {{ api_url }}/auth/confirm-email?token={{ token }}
            </div>
            <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px; background-color: #f9f9f9;">
            <p style="margin: 0;">&copy; 2025 Rezynt. Все права защищены.</p>
        </div>
    </div>
</body>
</html>"""
        
        # Render HTML content
        html_content = Template(html_template).render(
            api_url=settings.API_BASE_URL,
            token=test_token
        )
        
        print(f"HTML content length: {len(html_content)}")
        print(f"HTML content preview: {html_content[:200]}...")
        
        # Create MIME message manually
        msg = MIMEMultipart('alternative')
        msg['From'] = email_service.sender_email
        msg['To'] = test_email
        msg['Subject'] = "Подтверждение регистрации - Rezynt"
        
        # Add Message-ID
        import uuid
        msg['Message-ID'] = f"<{uuid.uuid4()}@{email_service.domain}>"
        
        # Add Date header
        from email.utils import formatdate
        msg['Date'] = formatdate(localtime=True)
        
        # Add Return-Path
        msg['Return-Path'] = email_service.sender_email
        
        # Add HTML content
        html_part = MIMEText(html_content, 'html', 'utf-8')
        html_part.add_header('Content-Type', 'text/html; charset=utf-8')
        msg.attach(html_part)
        
        print("✓ MIME message created")
        
        # Test DKIM signature creation
        print("Creating DKIM signature...")
        dkim_signature = email_service._create_dkim_signature(msg)
        
        if dkim_signature:
            print("✓ DKIM signature created successfully")
            print(f"DKIM signature length: {len(dkim_signature)}")
            print(f"DKIM signature preview: {dkim_signature[:100]}...")
            
            # Add DKIM signature to message
            msg['DKIM-Signature'] = dkim_signature
            print("✓ DKIM signature added to message headers")
            
            # Show final message structure
            print("\n=== Final Message Headers ===")
            for header, value in msg.items():
                if header.lower() in ['dkim-signature', 'from', 'to', 'subject', 'date', 'message-id', 'return-path', 'content-type']:
                    print(f"{header}: {value}")
            
            # Test message serialization
            message_str = msg.as_string()
            print(f"\nFinal message size: {len(message_str)} bytes")
            
        else:
            print("✗ Failed to create DKIM signature")
            
    except Exception as e:
        print(f"✗ Error in DKIM debug test: {e}")
        logger.error(f"Error in DKIM debug test: {e}", exc_info=True)


if __name__ == "__main__":
    test_dkim_signature()
