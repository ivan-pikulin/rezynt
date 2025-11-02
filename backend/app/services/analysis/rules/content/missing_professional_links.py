"""Rule 1.15: Missing Professional Links"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingProfessionalLinksRule(BaseRule):
    """Detects missing professional profile links."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 3
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for professional links."""
        points = []
        personal_info = resume.get('personal_info', {})
        contacts = personal_info.get('contacts', {})
        
        has_linkedin = contacts.get('linkedin')
        has_github = contacts.get('github')
        has_website = contacts.get('website')
        
        if not any([has_linkedin, has_github, has_website]):
            points.append(self.create_point(
                field_path="personal_info.contacts",
                message="Add at least one professional link (LinkedIn/GitHub/Portfolio)"
            ))
        
        return points

