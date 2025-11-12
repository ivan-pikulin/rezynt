"""Rule: Missing Keywords - Detects missing industry keywords"""
import json
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class MissingKeywordsRule(BaseRule):
    """Detects missing industry keywords and suggests additions via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "high"
        self.score_impact = 7
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect missing keywords via LLM and generate suggestions."""
        points = []
        
        # Determine job title from latest experience
        work_exp = resume.get('work_experience', [])
        if not work_exp:
            return points
        
        latest_job = work_exp[0]
        job_title = latest_job.get('job_title', 'Professional')
        
        # Prepare context
        summary = resume.get('professional_summary') or ''
        skills = resume.get('skills') or []
        exp_text = " ".join([
            " ".join(exp.get('achievements') or []) 
            for exp in work_exp[:3]
        ])
        
        # Detect missing keywords via LLM with Structured Outputs
        prompt = f"""Analyze if this resume has appropriate industry-standard keywords for a {job_title} role.

Summary: {summary}
Current skills: {', '.join(skills)}
Experience highlights: {exp_text[:500]}

Task:
1. Identify 3-5 missing industry-standard keywords/technologies for this role
2. If found, set has_fix to true and in fixed_text provide JSON with:
   - missing_keywords: list of keyword strings (each starting with capital letter)
   - suggested_addition: comma-separated string of keywords to add (each starting with capital letter)

Format: Capitalize first letter of each skill/keyword (e.g., "Python", "Machine Learning", "Docker").

If no keywords are missing, set has_fix to false and explain in reasoning."""
        
        result = await llm_helper.call_llm_structured(prompt, max_tokens=400)
        
        if result.has_fix and result.fixed_text:
            try:
                # Parse JSON from fixed_text
                data = json.loads(result.fixed_text)
                missing_keywords = data.get('missing_keywords', [])
                suggested_addition = data.get('suggested_addition', '')
                
                if missing_keywords and suggested_addition:
                    fix_suggestion = FixSuggestion(
                        type="add",
                        field_path="skills",
                        new_content=suggested_addition
                    )
                    
                    keywords_list = ", ".join(missing_keywords[:5])
                    points.append(self.create_point(
                        field_path="skills",
                        title="Missing Industry Keywords",
                        description=f"Consider adding relevant keywords: {keywords_list}",
                        fix_suggestion=fix_suggestion,
                        metadata={"missing_keywords": missing_keywords}
                    ))
            except json.JSONDecodeError:
                # If parsing fails, skip this point
                pass
        
        return points

