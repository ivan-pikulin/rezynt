"""Rule 2.1: Incorrect Job Title Capitalization"""
import re
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class JobTitleCapitalizationRule(BaseRule):
    """Detects incorrect job title capitalization."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "low"
        self.score_impact = 2
        self.check_type = "mechanical"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for title case."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            job_title = exp.get('job_title', '').strip()
            if not job_title:
                continue
            
            # Check if not in Title Case and not all uppercase (acronyms ok)
            if job_title != job_title.title() and not job_title.isupper():
                # Ignore if contains common acronyms
                if not re.search(r'\b[A-Z]{2,}\b', job_title):
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].job_title",
                        title="Incorrect Capitalization",
                        description="Use consistent Title Case for job title",
                        fix_suggestion=job_title.title()
                    ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """Simple title case conversion."""
        original = context.get("original_text")
        if original:
            return original.title()
        return None

