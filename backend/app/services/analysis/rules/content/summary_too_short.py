"""Rule 1.10: Summary Too Short"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class SummaryTooShortRule(BaseRule):
    """Detects and expands too-short professional summaries."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 3
        self.check_type = "llm"
        self.action_type = "fix"
        self.min_length = AnalysisConfig.MIN_SUMMARY_LENGTH
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for length."""
        points = []
        summary = resume.get('professional_summary', '').strip()
        
        if summary and len(summary) < self.min_length:
            points.append(self.create_point(
                field_path="professional_summary",
                message=f"Expand summary ({len(summary)} → {self.min_length}+ characters)",
                metadata={"current_length": len(summary), "original_text": summary}
            ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM expands summary."""
        original = context.get("original_text")
        
        if not original:
            return None
        
        return await llm_helper.expand_summary(original, self.min_length)

