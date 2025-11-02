"""Rule 1.11: Summary Too Long"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class SummaryTooLongRule(BaseRule):
    """Detects and condenses too-long professional summaries."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.check_type = "llm"
        self.action_type = "fix"
        self.max_length = AnalysisConfig.MAX_SUMMARY_LENGTH
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for length."""
        points = []
        summary = resume.get('professional_summary', '').strip()
        
        if len(summary) > self.max_length:
            points.append(self.create_point(
                field_path="professional_summary",
                message=f"Condense summary ({len(summary)} → <{self.max_length} characters)",
                metadata={"current_length": len(summary), "original_text": summary}
            ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM condenses summary."""
        original = context.get("original_text")
        
        if not original:
            return None
        
        return await llm_helper.condense_summary(original, self.max_length)

