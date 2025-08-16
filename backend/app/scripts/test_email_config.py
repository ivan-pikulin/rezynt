#!/usr/bin/env python3
"""
Test script to debug email configuration
Run this script to test email settings without sending actual emails
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings
import smtplib
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_email_config():
    """Test email configuration without sending emails"""
    print("=== Email Configuration Test ===")
    
    # Check environment variables
    print(f"EMAIL_HOST: {settings.email.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.email.EMAIL_PORT}")
    print(f"EMAIL_USERNAME: {settings.email.EMAIL_USERNAME}")
    print(f"EMAIL_PASSWORD: {'***SET***' if settings.email.EMAIL_PASSWORD.get_secret_value() else '***NOT SET***'}")
    print(f"EMAIL_DOMAIN: {settings.email.EMAIL_DOMAIN}")
    print(f"EMAIL_DKIM_SELECTOR: {settings.email.EMAIL_DKIM_SELECTOR}")
    print(f"EMAIL_DKIM_PRIVATE_KEY_PATH: {settings.email.EMAIL_DKIM_PRIVATE_KEY_PATH}")
    
    # Check if DKIM key file exists
    dkim_path = Path(settings.email.EMAIL_DKIM_PRIVATE_KEY_PATH)
    print(f"DKIM key file exists: {dkim_path.exists()}")
    
    # Test SMTP connection
    print("\n=== Testing SMTP Connection ===")
    try:
        print(f"Connecting to {settings.email.EMAIL_HOST}:{settings.email.EMAIL_PORT}")
        with smtplib.SMTP_SSL(settings.email.EMAIL_HOST, settings.email.EMAIL_PORT) as smtp:
            print("✓ SMTP connection established")
            
            # Test authentication
            print("Testing authentication...")
            smtp.login(settings.email.EMAIL_USERNAME, settings.email.EMAIL_PASSWORD.get_secret_value())
            print("✓ SMTP authentication successful")
            
            # Get server capabilities
            print("✓ SMTP server capabilities:")
            print(f"  - EHLO: {smtp.ehlo()}")
            
    except smtplib.SMTPAuthenticationError as e:
        print(f"✗ SMTP Authentication failed: {e}")
        print(f"  Error code: {e.smtp_code}")
        print(f"  Error message: {e.smtp_error}")
        print("\nPossible solutions:")
        print("1. Check if EMAIL_PASSWORD environment variable is set correctly")
        print("2. Verify the email credentials with your SMTP provider")
        print("3. Check if the email account requires app-specific passwords")
        print("4. Verify that the email account is not locked or suspended")
        
    except smtplib.SMTPConnectError as e:
        print(f"✗ SMTP Connection failed: {e}")
        print("Check if the SMTP server and port are correct")
        
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        print(f"Error type: {type(e).__name__}")


if __name__ == "__main__":
    test_email_config()
