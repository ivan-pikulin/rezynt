"""Rule: Generic Job Titles - Detects and suggests improvements for generic job titles"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class GenericJobTitlesRule(BaseRule):
    """Detects and suggests improvements for generic job titles via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "medium"
        self.score_impact = 4
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect generic job titles and generate specific alternatives."""
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
                original_title = exp.get('job_title')
                job_description = exp.get('short_description', '')
                achievements = exp.get('achievements', [])[:3]
                
                # Generate fix via LLM with Structured Outputs
                prompt = f"""Suggest a more specific, industry-standard job title for this role.

Current title: "{original_title}"
Job description: "{job_description}"
Key achievements: {', '.join(achievements) if achievements else 'N/A'}

Set has_fix to true and provide the suggested specific title in fixed_text."""
                
                fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=100)
                
                fix_suggestion = None
                if fix_response.has_fix and fix_response.fixed_text:
                    fix_suggestion = FixSuggestion(
                        type="replace",
                        field_path=f"work_experience[{i}].job_title",
                        original_content=original_title,
                        new_content=fix_response.fixed_text
                    )
                
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].job_title",
                    title="Generic Job Title",
                    description="Use more specific job title reflecting your actual role",
                    fix_suggestion=fix_suggestion
                ))
        
        return points

