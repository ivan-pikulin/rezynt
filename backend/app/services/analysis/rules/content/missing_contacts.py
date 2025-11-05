"""Rule 1.14: Missing Contact Information"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingContactsRule(BaseRule):
    """Detects missing essential contact information."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 8
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for email and phone."""
        points = []
        personal_info = resume.get('personal_info', {})
        contacts = personal_info.get('contacts', {})
        
        if not contacts.get('email'):
            points.append(self.create_point(
                field_path="personal_info.contacts.email",
                title="Missing Email",
                description="Add your email address",
                metadata={"severity": "high", "score_impact": 8}
            ))
        
        if not contacts.get('phone'):
            points.append(self.create_point(
                field_path="personal_info.contacts.phone",
                title="Missing Phone Number",
                description="Add your phone number",
                metadata={"severity": "medium", "score_impact": 5}
            ))
        
        return points

