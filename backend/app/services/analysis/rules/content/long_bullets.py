"""Rule 1.7: Long Achievement Bullets"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class LongBulletsRule(BaseRule):
    """Detects and shortens overly long achievement bullets."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.check_type = "llm_assisted"
        self.action_type = "fix"
        self.max_words = 25
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical detection - simple word count."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                word_count = len(achievement.split())
                
                if word_count > self.max_words:
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        title="Bullet Too Long",
                        description=f"Shorten bullet ({word_count} words → <{self.max_words} words)",
                        metadata={
                            "original_text": achievement,
                            "word_count": word_count
                        }
                    ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM generates shortened version."""
        original_text = context.get("original_text")
        
        if not original_text:
            return None
        
        return await llm_helper.shorten_text(
            text=original_text,
            max_words=self.max_words,
            preserve_meaning=True
        )

