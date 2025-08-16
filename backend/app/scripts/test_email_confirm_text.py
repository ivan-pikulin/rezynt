#!/usr/bin/env python3
"""
Test script to test the confirmation email as plain text
Run this script to send a test confirmation email in plain text format
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

import logging

from app.services.email_service import EmailService
from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_confirmation_email_text():
    """Test the confirmation email functionality with plain text"""
    print("\n=== Confirmation Email Text Test ===")
    
    # Test email address (change this to your email for testing)
    test_email = "pikulin.ivan.pelikan@gmail.com"  # Change this to your email
    test_token = "test-confirmation-token-12345"
    
    try:
        # Initialize email service
        print("Initializing EmailService...")
        email_service = EmailService()
        print("✓ EmailService initialized")
        
        # Create plain text version of confirmation email
        subject = "Подтверждение регистрации - Rezynt"
        
        text_template = """
Добро пожаловать в Rezynt!

Подтвердите ваш email

Спасибо за регистрацию! Для завершения процесса регистрации, пожалуйста, подтвердите ваш email адрес.

Для подтверждения перейдите по ссылке:
{{ api_url }}/auth/confirm-email?token={{ token }}

Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.

---
© 2025 Rezynt. Все права защищены.
        """
        
        # Render text content
        text_content = text_template.format(
            api_url=settings.API_BASE_URL,
            token=test_token
        )
        
        print(f"Text content length: {len(text_content)}")
        print(f"Text content preview: {text_content[:200]}...")
        
        # Send confirmation email as plain text
        print(f"Sending confirmation email (plain text) to {test_email}...")
        success = email_service.send_email(test_email, subject, text_content)
        
        if success:
            print("✓ Confirmation email (plain text) sent successfully!")
        else:
            print("✗ Failed to send confirmation email (plain text)")
            
    except Exception as e:
        print(f"✗ Error testing confirmation email (plain text): {e}")
        logger.error(f"Error testing confirmation email (plain text): {e}", exc_info=True)


if __name__ == "__main__":
    test_confirmation_email_text()
