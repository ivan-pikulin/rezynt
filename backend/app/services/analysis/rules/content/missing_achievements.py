"""Rule 1.1: Missing Achievements"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingAchievementsRule(BaseRule):
    """Detects work experience entries without achievements."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 8
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Simple mechanical check - no LLM needed."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            achievements = exp.get('achievements', [])
            
            if not achievements or len(achievements) == 0:
                job_title = exp.get('job_title', 'this role')
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements",
                    message=f"Add quantifiable achievements for {job_title}"
                ))
        
        return points

