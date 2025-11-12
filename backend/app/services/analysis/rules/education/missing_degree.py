"""Rule: Missing Degree - Detects missing degree information"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingDegreeRule(BaseRule):
    """Detects missing degree information in education."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 4
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for degree field."""
        points = []
        
        for i, edu in enumerate(resume.get('education') or []):
            degree = (edu.get('degree') or '').strip()
            if not degree:
                institution = edu.get('institution', 'this program')
                points.append(self.create_point(
                    field_path=f"education[{i}].degree",
                    title="Missing Degree",
                    description=f"Specify degree for {institution}"
                ))
        
        return points

