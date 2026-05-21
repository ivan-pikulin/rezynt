"""Rule: Missing Experience Location - Detects missing location information"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingExperienceLocationRule(BaseRule):
    """Detects missing location information in work experience."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "low"
        self.score_impact = 2
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for missing city/country."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience') or []):
            city = (exp.get('city') or '').strip()
            country = (exp.get('country') or '').strip()
            
            if not city and not country:
                company = exp.get('company', 'this position')
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].city",
                    title="Отсутствует местоположение",
                    description=f"Добавить местоположение для {company}"
                ))
        
        return points

