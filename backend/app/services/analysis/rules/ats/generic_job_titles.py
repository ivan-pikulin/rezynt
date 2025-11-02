"""Rule 2.9: Generic Job Titles"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class GenericJobTitlesRule(BaseRule):
    """Detects and suggests improvements for generic job titles."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "medium"
        self.score_impact = 4
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for generic job titles."""
        points = []
        
        # Generic titles to flag
        generic_titles = [
            'employee',
            'worker',
            'staff',
            'member',
            'associate',
            'specialist',  # Only if standalone
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            job_title = exp.get('job_title', '').strip().lower()
            
            # Check if title is too generic
            if any(generic in job_title for generic in generic_titles) and len(job_title.split()) <= 2:
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].job_title",
                    title="Generic Job Title",
                    description="Use more specific job title reflecting your actual role",
                    metadata={
                        "original_title": exp.get('job_title'),
                        "job_description": exp.get('short_description', '')
                    }
                ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM suggests better job title."""
        original_title = context.get("original_title")
        job_description = context.get("job_description", "")
        
        if not original_title:
            return None
        
        return await llm_helper.suggest_job_title(original_title, job_description)

