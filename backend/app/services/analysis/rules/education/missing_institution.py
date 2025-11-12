"""Rule: Missing Institution - Detects missing institution name"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingInstitutionRule(BaseRule):
    """Detects missing institution name in education."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 8
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for institution field."""
        points = []
        
        for i, edu in enumerate(resume.get('education') or []):
            institution = (edu.get('institution') or '').strip()
            if not institution:
                degree = edu.get('degree', 'this program')
                points.append(self.create_point(
                    field_path=f"education[{i}].institution",
                    title="Missing Institution",
                    description=f"Add institution name for {degree}"
                ))
        
        return points

