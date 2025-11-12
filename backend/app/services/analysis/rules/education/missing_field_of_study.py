"""Rule: Missing Field of Study - Detects missing field of study"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingFieldOfStudyRule(BaseRule):
    """Detects missing field of study in education."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 4
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for field_of_study."""
        points = []
        
        for i, edu in enumerate(resume.get('education') or []):
            field = (edu.get('field_of_study') or '').strip()
            if not field:
                points.append(self.create_point(
                    field_path=f"education[{i}].field_of_study",
                    title="Missing Field of Study",
                    description="Add your major or specialization"
                ))
        
        return points

