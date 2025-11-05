"""Rule 2.8: Resume Length Issues"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig


class ResumeLengthRule(BaseRule):
    """Detects resume length issues (too short or too long)."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "low"
        self.score_impact = 3
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Calculate total word count and check length."""
        points = []
        
        # Calculate total word count
        total_words = 0
        
        # Summary
        total_words += len(resume.get('professional_summary', '').split())
        
        # Skills
        total_words += len(resume.get('skills', []))
        
        # Experience
        for exp in resume.get('work_experience', []):
            total_words += len(exp.get('short_description', '').split())
            for ach in exp.get('achievements', []):
                total_words += len(ach.split())
        
        # Education
        for edu in resume.get('education', []):
            total_words += len(' '.join(edu.get('relevant_courses', [])).split())
        
        # Check against thresholds
        if total_words < AnalysisConfig.MIN_RESUME_WORDS:
            points.append(self.create_point(
                field_path="resume",
                title="Resume Too Short",
                description=f"Resume is too brief ({total_words} words) - add more details"
            ))
        elif total_words > AnalysisConfig.MAX_RESUME_WORDS:
            points.append(self.create_point(
                field_path="resume",
                title="Resume Too Long",
                description=f"Resume is too long ({total_words} words) - consider condensing"
            ))
        
        return points

