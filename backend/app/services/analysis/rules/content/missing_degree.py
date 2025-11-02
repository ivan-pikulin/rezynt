"""Rule 1.5: Missing Degree in Education"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingDegreeRule(BaseRule):
    """Detects missing degree information in education."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 7
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for degree field."""
        points = []
        
        for i, edu in enumerate(resume.get('education', [])):
            degree = edu.get('degree', '').strip()
            if not degree:
                institution = edu.get('institution', 'this program')
                points.append(self.create_point(
                    field_path=f"education[{i}].degree",
                    message=f"Specify degree for {institution}"
                ))
        
        return points

