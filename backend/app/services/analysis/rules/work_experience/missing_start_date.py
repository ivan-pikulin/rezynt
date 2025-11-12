"""Rule: Missing Start Date - Detects missing start date"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingStartDateRule(BaseRule):
    """Detects missing start date in work experience."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 8
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for start_date field."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience') or []):
            start_date = (exp.get('start_date') or '').strip()
            if not start_date:
                company = exp.get('company', 'this position')
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].start_date",
                    title="Missing Start Date",
                    description=f"Add start date for {company}"
                ))
        
        return points

