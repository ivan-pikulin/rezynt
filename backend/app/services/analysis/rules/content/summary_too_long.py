"""Rule 1.11: Summary Too Long"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class SummaryTooLongRule(BaseRule):
    """Detects and condenses too-long professional summaries via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.max_length = AnalysisConfig.MAX_SUMMARY_LENGTH
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect long summaries and generate condensed versions."""
        points = []
        summary = resume.get('professional_summary', '').strip()
        
        if len(summary) > self.max_length:
            # Generate fix via LLM with Structured Outputs
            prompt = f"""Condense this professional summary to under {self.max_length} characters while keeping the most important points.

Current summary ({len(summary)} characters): "{summary}"

Set has_fix to true and provide the condensed summary in fixed_text."""
            
            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=300)
            
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
                title="Summary Too Long",
                description=f"Condense summary ({len(summary)} → <{self.max_length} characters)",
                fix_suggestion=fix_suggestion
            ))
        
        return points

