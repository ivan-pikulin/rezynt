"""Rule 1.13: Too Many Skills"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig


class TooManySkillsRule(BaseRule):
    """Detects excessive number of skills."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
        self.max_skills = AnalysisConfig.MAX_SKILLS_COUNT
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for skill count."""
        points = []
        skills = resume.get('skills', [])
        
        if len(skills) > self.max_skills:
            points.append(self.create_point(
                field_path="skills",
                message=f"Focus on top skills ({len(skills)} → <{self.max_skills} skills)"
            ))
        
        return points

