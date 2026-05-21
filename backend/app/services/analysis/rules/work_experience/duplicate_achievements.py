"""Rule: Duplicate Achievements - Detects duplicate achievements across different positions"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class DuplicateAchievementsRule(BaseRule):
    """
    Detects duplicate achievements across different work experience positions.
    Passes all achievements to LLM in one request, then parses results into separate ImprovementPoints.
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 4
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Check for duplicate achievements across all positions.
        Passes all achievements to LLM simultaneously, then parses results.
        """
        points = []
        
        work_exp = resume.get('work_experience', [])
        if len(work_exp) < 2:
            return points
        
        # Collect all achievements with their positions
        achievements_data = {}
        for i, exp in enumerate(work_exp):
            achievements = exp.get('achievements', [])
            for j, achievement in enumerate(achievements):
                if achievement:
                    achievements_data[f'work_experience[{i}].achievements[{j}]'] = {
                        'text': achievement,
                        'job_title': exp.get('job_title', ''),
                        'company': exp.get('company', '')
                    }
        
        if len(achievements_data) < 2:
            return points
        
        # Prepare prompt with all achievements
        achievements_text = '\n'.join([
            f'{path} ({info["job_title"]} at {info["company"]}): {info["text"]}'
            for path, info in achievements_data.items()
        ])
        
        prompt = f"""Проанализируйте эти достижения с разных рабочих позиций. Определите достижения, которые повторяются или очень похожи на разных позициях.

Достижения:
{achievements_text}

Верните объект JSON с помощью:
- "duplicate_groups": список групп, где каждая группа содержит "field_paths" (список) и "suggested_unique_texts" (список уникальных формулировок для каждой позиции)

Если дубликаты не найдены, верните пустой список дубликатов_групп."""
        
        try:
            result = await llm_helper.call_llm_structured(prompt, max_tokens=1000)
            
            if result.has_fix and result.fixed_text:
                import json
                try:
                    data = json.loads(result.fixed_text)
                    duplicate_groups = data.get('duplicate_groups', [])
                    
                    for group in duplicate_groups:
                        field_paths = group.get('field_paths', [])
                        suggested_texts = group.get('suggested_unique_texts', [])
                        
                        # Create improvement point for each duplicate
                        for field_path, suggested_text in zip(field_paths, suggested_texts):
                            if field_path in achievements_data and suggested_text:
                                fix_suggestion = FixSuggestion(
                                    type="replace",
                                    field_path=field_path,
                                    original_content=achievements_data[field_path]['text'],
                                    new_content=suggested_text
                                )
                                
                                points.append(self.create_point(
                                    field_path=field_path,
                                    title="Повторяющееся достижение",
                                    description="Сделайте это достижение уникальным для этой должности",
                                    fix_suggestion=fix_suggestion
                                ))
                except json.JSONDecodeError:
                    # If parsing fails, skip
                    pass
        except Exception:
            # If LLM call fails, skip this rule
            pass
        
        return points

