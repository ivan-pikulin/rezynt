"""Rule 1.10: Summary Too Short"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class SummaryTooShortRule(BaseRule):
    """Detects and expands too-short professional summaries via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 3
        self.min_length = AnalysisConfig.MIN_SUMMARY_LENGTH
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect short summaries and generate expanded versions."""
        points = []
        summary = resume.get('professional_summary', '').strip()
        
        if summary and len(summary) < self.min_length:
            # Get context for enrichment
            skills = resume.get('skills', [])[:5]
            latest_job = resume.get('work_experience', [{}])[0].get('job_title', '') if resume.get('work_experience') else ''
            
            # Generate fix via LLM using universal method with Structured Outputs
            prompt = f"""Expand this professional summary to at least {self.min_length} characters while keeping it focused and impactful.

Current summary: "{summary}"

Context for enrichment:
- Top skills: {', '.join(skills)}
- Latest role: {latest_job}

Set has_fix to true and provide the expanded summary in fixed_text.
If you cannot expand it meaningfully, set has_fix to false and explain in reasoning."""
            
            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=350)
            
            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="replace",
                    field_path="professional_summary",
                    original_content=summary,
                    new_content=fix_response.fixed_text
                )
            
            points.append(self.create_point(
                field_path="professional_summary",
                title="Summary Too Short",
                description=f"Expand summary ({len(summary)} → {self.min_length}+ characters)",
                fix_suggestion=fix_suggestion
            ))
        
        return points

