"""Rule 1.9: Missing Professional Summary"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingSummaryRule(BaseRule):
    """Detects missing professional summary."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 6
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for professional_summary."""
        points = []
        summary = resume.get('professional_summary', '').strip()
        if not summary or len(summary) < 20:
            points.append(self.create_point(
                field_path="professional_summary",
                title="Missing Professional Summary",
                description="Add a compelling professional summary (2-3 sentences)"
            ))
        
        return points

