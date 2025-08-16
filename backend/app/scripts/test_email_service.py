#!/usr/bin/env python3
"""
Test script to test the email service directly
Run this script to send a test email and verify the service works
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.email_service import EmailService
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_email_service():
    """Test the email service by sending a test email"""
    print("=== Email Service Test ===")
    
    # Test email address (change this to your email for testing)
    test_email = "pikulin.ivan.pelikan@gmail.com"  # Change this to your email
    
    try:
        # Initialize email service
        print("Initializing EmailService...")
        email_service = EmailService()
        print("✓ EmailService initialized")
        
        # Send test email
        print(f"Sending test email to {test_email}...")
        success = email_service.send_email(
            to_email=test_email,
            subject="Test Email from Rezynt",
            body="This is a test email to verify the email service is working correctly."
        )
        
        if success:
            print("✓ Test email sent successfully!")
        else:
            print("✗ Failed to send test email")
            
    except Exception as e:
        print(f"✗ Error testing email service: {e}")
        logger.error(f"Error testing email service: {e}", exc_info=True)


def test_confirmation_email():
    """Test the confirmation email functionality"""
    print("\n=== Confirmation Email Test ===")
    
    # Test email address (change this to your email for testing)
    test_email = "pikulin.ivan.pelikan@gmail.com"  # Change this to your email
    test_token = "test-confirmation-token-12345"
    
    try:
        # Initialize email service
        print("Initializing EmailService...")
        email_service = EmailService()
        print("✓ EmailService initialized")
        
        # Send confirmation email
        print(f"Sending confirmation email to {test_email}...")
        success = email_service.send_confirmation_email(test_email, test_token)
        
        if success:
            print("✓ Confirmation email sent successfully!")
        else:
            print("✗ Failed to send confirmation email")
            
    except Exception as e:
        print(f"✗ Error testing confirmation email: {e}")
        logger.error(f"Error testing confirmation email: {e}", exc_info=True)


if __name__ == "__main__":
    test_email_service()
    test_confirmation_email()
