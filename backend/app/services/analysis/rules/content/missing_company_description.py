"""Rule 1.4: Missing Company/Project Description"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingCompanyDescriptionRule(BaseRule):
    """Detects missing company or project descriptions."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 3
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for description field."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            description = exp.get('short_description', '').strip()
            if not description or len(description) < 10:
                company = exp.get('company', 'the company')
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].short_description",
                    message=f"Add context about {company} or project"
                ))
        
        return points

