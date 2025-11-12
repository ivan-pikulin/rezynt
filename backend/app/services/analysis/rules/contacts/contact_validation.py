"""Rule: Contact Validation - Validates contact information format and count"""
import re
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class ContactValidationRule(BaseRule):
    """
    Validates contact information:
    - Minimum 2 contact methods
    - Email format validation
    - Phone format validation
    - URL format validation for LinkedIn, GitHub, website
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 7
    
    def _validate_email(self, email: str) -> bool:
        """Validate email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def _validate_phone(self, phone: str) -> bool:
        """Validate phone format (basic check)."""
        # Remove common separators
        cleaned = re.sub(r'[\s\-\(\)\+]', '', phone)
        # Check if it's mostly digits and reasonable length
        return cleaned.isdigit() and 7 <= len(cleaned) <= 15
    
    def _validate_url(self, url: str) -> bool:
        """Validate URL format."""
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        return bool(re.match(pattern, url))
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check contact validation."""
        points = []
        
        personal_info = resume.get('personal_info', {})
        contacts = personal_info.get('contacts', {})
        
        # Count available contacts
        available_contacts = 0
        contact_fields = []
        
        email = (contacts.get('email') or '').strip()
        if email:
            available_contacts += 1
            contact_fields.append(('email', email))
        
        phone = (contacts.get('phone') or '').strip()
        if phone:
            available_contacts += 1
            contact_fields.append(('phone', phone))
        
        linkedin = (contacts.get('linkedin') or '').strip()
        if linkedin:
            available_contacts += 1
            contact_fields.append(('linkedin', linkedin))
        
        github = (contacts.get('github') or '').strip()
        if github:
            available_contacts += 1
            contact_fields.append(('github', github))
        
        website = (contacts.get('website') or '').strip()
        if website:
            available_contacts += 1
            contact_fields.append(('website', website))
        
        # Check minimum contacts
        if available_contacts < 2:
            points.append(self.create_point(
                field_path="personal_info.contacts.new",
                title="Insufficient Contact Methods",
                description=f"Add at least 2 ways to contact you (currently {available_contacts})"
            ))
        
        # Validate email format
        if email and not self._validate_email(email):
            points.append(self.create_point(
                field_path="personal_info.contacts.email",
                title="Invalid Email Format",
                description="Use valid email format (e.g., name@example.com)"
            ))
        
        # Validate phone format
        if phone and not self._validate_phone(phone):
            points.append(self.create_point(
                field_path="personal_info.contacts.phone",
                title="Invalid Phone Format",
                description="Use valid phone number format"
            ))
        
        # Validate URLs
        if linkedin and not self._validate_url(linkedin):
            points.append(self.create_point(
                field_path="personal_info.contacts.linkedin",
                title="Invalid LinkedIn URL",
                description="Use valid URL format (e.g., https://linkedin.com/in/username)"
            ))
        
        if github and not self._validate_url(github):
            points.append(self.create_point(
                field_path="personal_info.contacts.github",
                title="Invalid GitHub URL",
                description="Use valid URL format (e.g., https://github.com/username)"
            ))
        
        if website and not self._validate_url(website):
            points.append(self.create_point(
                field_path="personal_info.contacts.website",
                title="Invalid Website URL",
                description="Use valid URL format (e.g., https://example.com)"
            ))
        
        return points

