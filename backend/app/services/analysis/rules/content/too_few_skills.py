"""Rule 1.12: Too Few Skills"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig


class TooFewSkillsRule(BaseRule):
    """Detects insufficient number of skills."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 4
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
        self.min_skills = AnalysisConfig.MIN_SKILLS_COUNT
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for skill count."""
        points = []
        skills = resume.get('skills', [])
        
        if len(skills) < self.min_skills:
            points.append(self.create_point(
                field_path="skills",
                message=f"Add more skills ({len(skills)} → {self.min_skills}+ skills)"
            ))
        
        return points

