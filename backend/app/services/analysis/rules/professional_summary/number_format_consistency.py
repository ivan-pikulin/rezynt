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
        
        prompt = f"""Analyze number formatting consistency across these resume fields. Check for:
- Consistent use of digits vs words for numbers (e.g., "15" vs "fifteen")
- Consistent percentage format (e.g., "15%" vs "15 percent" vs "fifteen percent")
- Consistent currency format (e.g., "$1K" vs "$1,000" vs "$1000")
- Consistent date format

Fields:
{fields_text}

Return a JSON object with:
- "inconsistent_fields": list of objects with "field_path" and "fixed_text" for fields that need formatting fixes

If all fields are consistent, return empty inconsistent_fields list.
Recommendation: Use digits for all numbers >10, use "%" symbol instead of word "percent", use "$1,000" format for currency."""
        
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
                                title="Inconsistent Number Format",
                                description="Standardize number formatting to match the rest of the resume",
                                fix_suggestion=fix_suggestion
                            ))
                except json.JSONDecodeError:
                    # If parsing fails, skip
                    pass
        except Exception:
            # If LLM call fails, skip this rule
            pass
        
        return points

