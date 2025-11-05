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
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for missing achievements in work experience."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            # Check both achievements and responsibilities for backward compatibility
            achievements = exp.get('achievements', [])
            responsibilities = exp.get('responsibilities', [])
            
            # If neither has content, flag it
            if (not achievements or len(achievements) == 0) and (not responsibilities or len(responsibilities) == 0):
                job_title = exp.get('job_title', 'this role')
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements",
                    title="Missing Achievements",
                    description=f"Add quantifiable achievements for {job_title}"
                ))
        
        return points

