"""Rule 1.9: Missing Professional Summary"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class MissingSummaryRule(BaseRule):
    """Detects missing professional summary and generates one via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 6
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect missing summary and generate one via LLM."""
        points = []
        summary = resume.get('professional_summary', '').strip()
        
        if not summary or len(summary) < 20:
            # Generate summary via LLM with Structured Outputs
            import json
            work_exp = resume.get('work_experience', [])
            education = resume.get('education', [])
            skills = resume.get('skills', [])
            years = len(work_exp) * 2  # Rough estimate
            
            prompt = f"""Generate a professional summary (150-200 characters) for this resume based on the candidate's experience and skills.

Work Experience: {json.dumps(work_exp[:3])}
Education: {json.dumps(education)}
Skills: {', '.join(skills[:10])}
Estimated years of experience: {years}

Focus on key strengths, expertise areas, and career level.
Set has_fix to true and provide the professional summary in fixed_text."""
            
            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=250)
            
            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="add" if not summary else "replace",
                    field_path="professional_summary",
                    new_content=fix_response.fixed_text
                )
            
            points.append(self.create_point(
                field_path="professional_summary",
                title="Missing Professional Summary",
                description="Add a compelling professional summary highlighting your expertise",
                fix_suggestion=fix_suggestion
            ))
        
        return points
