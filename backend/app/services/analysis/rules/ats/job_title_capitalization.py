"""Rule 2.1: Incorrect Job Title Capitalization"""
import re
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class JobTitleCapitalizationRule(BaseRule):
    """Detects incorrect job title capitalization and fixes mechanically."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "low"
        self.score_impact = 2
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check and fix for title case."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            job_title = exp.get('job_title', '').strip()
            if not job_title:
                continue
            
            # Check if not in Title Case and not all uppercase (acronyms ok)
            if job_title != job_title.title() and not job_title.isupper():
                # Ignore if contains common acronyms
                if not re.search(r'\b[A-Z]{2,}\b', job_title):
                    # Generate mechanical fix
                    fix_suggestion = FixSuggestion(
                        type="replace",
                        field_path=f"work_experience[{i}].job_title",
                        original_content=job_title,
                        new_content=job_title.title()
                    )
                    
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].job_title",
                        title="Incorrect Capitalization",
                        description="Use consistent Title Case for job title",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

