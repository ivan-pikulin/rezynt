"""Rule: Resume Length - Detects resume length issues"""
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
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Calculate total word count and check length."""
        points = []
        
        # Calculate total word count
        total_words = 0
        
        # Summary
        total_words += len((resume.get('professional_summary') or '').split())
        
        # Skills
        total_words += len(resume.get('skills') or [])
        
        # Experience
        for exp in resume.get('work_experience') or []:
            total_words += len((exp.get('short_description') or '').split())
            for ach in exp.get('achievements') or []:
                total_words += len(ach.split())
        
        # Education
        for edu in resume.get('education') or []:
            total_words += len(' '.join(edu.get('relevant_courses') or []).split())
        
        # Check against thresholds
        if total_words < AnalysisConfig.MIN_RESUME_WORDS:
            # Find first empty field to fill
            field_path = "professional_summary"
            if (resume.get('professional_summary') or '').strip():
                # If summary exists, check work experience
                experiences = resume.get('work_experience', [])
                if experiences:
                    for i, exp in enumerate(experiences):
                        if not exp.get('achievements') or len(exp.get('achievements', [])) == 0:
                            field_path = f"work_experience[{i}].achievements.new"
                            break
            
            points.append(self.create_point(
                field_path=field_path,
                title="Резюме слишком короткое",
                description=f"Резюме слишком краткое ({total_words} слов) – добавьте больше деталей"
            ))
        elif total_words > AnalysisConfig.MAX_RESUME_WORDS:
            # Point to first work experience to condense
            field_path = "work_experience[0].achievements" if resume.get('work_experience') else "professional_summary"
            
            points.append(self.create_point(
                field_path=field_path,
                title="Возобновить слишком долго",
                description=f"Резюме слишком длинное ({total_words} слов). Попробуйте сократить его."
            ))
        
        return points

