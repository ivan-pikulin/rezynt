"""Rule: Filler Phrases - Detects and removes filler phrases"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class FillerPhrasesRule(BaseRule):
    """Detects and removes filler phrases via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect filler phrases and generate cleaner versions."""
        points = []
        
        filler_phrases = [
            'in order to',
            'moreover',
            'additionally',
            'furthermore',
            'as well as',
            'in addition to',
            'it should be noted that',
            'it is important to',
            'basically',
            'actually',
            'literally'
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                ach_lower = achievement.lower()
                found_fillers = [filler for filler in filler_phrases if filler in ach_lower]
                
                if found_fillers:
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Удалите фразы-вставки, чтобы сделать текст более кратким и эффектным.

Оригинал: "{achievement}"
Фразы-вставки, которые следует удалить: {', '.join(found_fillers)}.

Установите для has_fix значение true и предоставьте улучшенный текст в фиксированном_тексте."""
                    
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
                        title="Содержит дополнительные фразы",
                        description=f"Удалить фразу-заполнитель: '{found_fillers[0]}'",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

