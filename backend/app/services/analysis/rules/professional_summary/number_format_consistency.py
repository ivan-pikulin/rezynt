"""Rule: Number Format Consistency - Checks consistency of number formatting"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class NumberFormatConsistencyRule(BaseRule):
    """
    Checks consistency of number formatting across professional summary and achievements.
    Ensures numbers are written in a consistent style (digits vs words, percentage format, etc.).
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Check number format consistency across all relevant fields.
        Passes all fields to LLM in one request, then parses results into separate ImprovementPoints.
        """
        points = []
        
        # Collect relevant fields
        fields_data = {}
        
        summary = resume.get('professional_summary') or ''
        if summary:
            fields_data['professional_summary'] = summary
        
        # Work experience achievements
        work_exp = resume.get('work_experience', [])
        for i, exp in enumerate(work_exp):
            achievements = exp.get('achievements', [])
            for j, achievement in enumerate(achievements):
                if achievement:
                    fields_data[f'work_experience[{i}].achievements[{j}]'] = achievement
        
        if not fields_data:
            return points
        
        # Prepare prompt with all fields
        fields_text = '\n'.join([f'{path}: {text}' for path, text in fields_data.items()])
        
        prompt = f"""Проанализируйте согласованность форматирования чисел в этих полях резюме. Проверьте:
– Последовательное использование цифр и слов для чисел (например, «15» и «пятнадцать»).
– Последовательный процентный формат (например, «15%» против «15 процентов» против «пятнадцати процентов»).
– Согласованный формат валюты (например, «1 тыс. долларов США», «1000 долларов США» или «1000 долларов США»).
- Согласованный формат даты

Поля:
{fields_text}

Верните объект JSON с помощью:
- «inconsistent_fields»: список объектов с «field_path» и «fixed_text» для полей, требующих исправления форматирования.

Если все поля согласованы, вернуть пустой список inconsistent_fields.
Рекомендация: используйте цифры для всех чисел >10, используйте символ «%» вместо слова «процент», используйте формат «1000 долларов США» для обозначения валюты."""
        
        try:
            result = await llm_helper.call_llm_structured(prompt, max_tokens=800)
            
            if result.has_fix and result.fixed_text:
                import json
                try:
                    data = json.loads(result.fixed_text)
                    inconsistent_fields = data.get('inconsistent_fields', [])
                    
                    for field_info in inconsistent_fields:
                        field_path = field_info.get('field_path')
                        fixed_text = field_info.get('fixed_text')
                        
                        if field_path in fields_data and fixed_text:
                            fix_suggestion = FixSuggestion(
                                type="replace",
                                field_path=field_path,
                                original_content=fields_data[field_path],
                                new_content=fixed_text
                            )
                            
                            points.append(self.create_point(
                                field_path=field_path,
                                title="Несовместимый числовой формат",
                                description="Стандартизируйте форматирование чисел, чтобы оно соответствовало остальной части резюме.",
                                fix_suggestion=fix_suggestion
                            ))
                except json.JSONDecodeError:
                    # If parsing fails, skip
                    pass
        except Exception:
            # If LLM call fails, skip this rule
            pass
        
        return points

