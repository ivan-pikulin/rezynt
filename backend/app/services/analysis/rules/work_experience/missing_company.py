"""Rule: Missing Company - Detects missing company name"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingCompanyRule(BaseRule):
    """Detects missing company name in work experience."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 8
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for company field."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience') or []):
            company = (exp.get('company') or '').strip()
            if not company:
                job_title = exp.get('job_title', 'this position')
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].company",
                    title="Missing Company Name",
                    description=f"Add company name for {job_title}"
                ))
        
        return points

