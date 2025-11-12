"""Rule: Achievement Length - Detects and shortens overly long achievement bullets"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class LongBulletsRule(BaseRule):
    """Detects and shortens overly long achievement bullets via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.max_words = 25
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect long bullets and generate shortened versions."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                word_count = len(achievement.split())
                
                if word_count > self.max_words:
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Shorten this resume bullet to under {self.max_words} words while preserving key impact and achievements.

Original ({word_count} words): "{achievement}"

Set has_fix to true and provide the shortened text in fixed_text."""
                    
                    fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=200)
                    
                    fix_suggestion = None
                    if fix_response.has_fix and fix_response.fixed_text:
                        fix_suggestion = FixSuggestion(
                            type="replace",
                            field_path=f"work_experience[{i}].achievements[{j}]",
                            original_content=achievement,
                            new_content=fix_response.fixed_text
                        )
                    
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        title="Bullet Too Long",
                        description=f"Shorten bullet ({word_count} words → <{self.max_words} words)",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

