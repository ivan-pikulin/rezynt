"""Rule: Achievement Length - Detects and shortens overly long achievement bullets"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class AchivementLengthRule(BaseRule):
    """Detects and shortens overly long achievement bullets via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.premium_only = True
        self.max_words = 25
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect long bullets and generate shortened versions."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                word_count = len(achievement.split())
                
                if word_count > self.max_words:
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Сократите этот список резюме до {self.max_words} слов, сохранив при этом ключевые результаты и достижения.

Оригинал ({word_count} слов): "{achievement}"

Установите для has_fix значение true и укажите сокращенный текст в фиксированном_тексте."""
                    
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
                        title="Пуля слишком длинная",
                        description=f"Сократить маркер ({word_count} слов → <{self.max_words} слов)",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

