"""Rule: Achievements Not Responsibilities - Detects responsibility-oriented language"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class AchievementsNotResponsibilitiesRule(BaseRule):
    """Detects responsibility-oriented language in achievements and converts to impact-oriented results via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 5
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect responsibility-oriented language and generate results-focused fixes."""
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
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Перепишите этот пункт резюме, чтобы сосредоточиться на результатах и ​​влиянии, а не только на обязанностях. Используйте сильные глаголы действия и подчеркивайте достигнутые результаты.

Оригинал: "{achievement}"

Установите для has_fix значение true и предоставьте текст, ориентированный на результат, в поле fixed_text."""
                    
                    fix_response = await llm_helper.call_llm_structured(prompt)
                    
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
                        title="Фокусируется на обязанностях",
                        description="Перепишите, чтобы сосредоточиться на результатах и ​​влиянии, а не только на обязанностях.",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

