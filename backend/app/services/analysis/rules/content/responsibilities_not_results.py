"""Rule 1.3: Responsibilities Instead of Results"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class ResponsibilitiesNotResultsRule(BaseRule):
    """Converts responsibilities into impact-oriented achievements."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 5
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detects responsibility-oriented language."""
        points = []
        responsibility_phrases = [
            'responsible for',
            'worked on',
            'duties included',
            'in charge of',
            'tasked with',
            'managed to',
            'helped with'
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                text_lower = achievement.lower()
                if any(phrase in text_lower for phrase in responsibility_phrases):
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        message="Rewrite to focus on results and impact, not just duties",
                        metadata={"original_text": achievement}
                    ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM converts to results-oriented text."""
        original = context.get("original_text")
        
        if not original:
            return None
        
        return await llm_helper.convert_to_results(original)

