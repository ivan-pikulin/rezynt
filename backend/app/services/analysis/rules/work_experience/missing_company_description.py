"""Rule: Missing Company Description - Detects missing company or project descriptions"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingCompanyDescriptionRule(BaseRule):
    """Detects missing company or project descriptions."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for description field."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience') or []):
            description = (exp.get('short_description') or '').strip()
            if not description or len(description) < 10:
                company = exp.get('company', 'the company')
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].short_description",
                    title="Отсутствует описание компании",
                    description=f"Добавьте контекст о {company} или проекте"
                ))
        
        return points

