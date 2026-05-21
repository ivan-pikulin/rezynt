"""Rule: Content Language - Checks that all content is in the same language"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class ContentLanguageRule(BaseRule):
    """
    Detects language inconsistencies across resume fields.
    All content should be in the same language (except proper nouns, company names, technical terms).
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 8
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Check all relevant fields for language consistency.
        Passes all fields to LLM in one request, then parses results into separate ImprovementPoints.
        """
        points = []
        
        # Collect all relevant fields
        fields_data = {}
        
        summary = resume.get('professional_summary') or ''
        if summary:
            fields_data['professional_summary'] = summary
        
        current_role = resume.get('current_role') or ''
        if current_role:
            fields_data['current_role'] = current_role
        
        # Work experience job titles and achievements
        work_exp = resume.get('work_experience', [])
        for i, exp in enumerate(work_exp):
            job_title = exp.get('job_title') or ''
            if job_title:
                fields_data[f'work_experience[{i}].job_title'] = job_title
            
            achievements = exp.get('achievements', [])
            for j, achievement in enumerate(achievements):
                if achievement:
                    fields_data[f'work_experience[{i}].achievements[{j}]'] = achievement
        
        # Education degrees and fields of study
        education = resume.get('education', [])
        for i, edu in enumerate(education):
            degree = edu.get('degree') or ''
            if degree:
                fields_data[f'education[{i}].degree'] = degree
            
            field_of_study = edu.get('field_of_study') or ''
            if field_of_study:
                fields_data[f'education[{i}].field_of_study'] = field_of_study
        
        if not fields_data:
            return points
        
        # Prepare prompt with all fields
        fields_text = '\n'.join([f'{path}: {text}' for path, text in fields_data.items()])
        
        prompt = f"""Проанализируйте язык каждого поля в этом резюме. Определите язык каждого поля и определите поля, язык которых отличается от языка большинства.

Поля:
{fields_text}

Верните объект JSON с помощью:
- «main_language»: язык, используемый в большинстве полей (например, «английский», «русский»)
- «inconsistent_fields»: список путей к полям на другом языке.

Если все поля написаны на одном языке, верните пустой список inconsistent_fields."""
        
        try:
            result = await llm_helper.call_llm_structured(prompt, max_tokens=500)
            
            if result.has_fix and result.fixed_text:
                import json
                try:
                    data = json.loads(result.fixed_text)
                    inconsistent_fields = data.get('inconsistent_fields', [])
                    
                    for field_path in inconsistent_fields:
                        if field_path in fields_data:
                            points.append(self.create_point(
                                field_path=field_path,
                                title="Языковое несоответствие",
                                description=f"Это поле написано на другом языке, чем остальная часть резюме. Весь контент должен быть на одном языке.",
                                metadata={"main_language": data.get('main_language', 'Unknown')}
                            ))
                except json.JSONDecodeError:
                    # If parsing fails, create a general warning
                    points.append(self.create_point(
                        field_path="professional_summary",
                        title="Языковое несоответствие",
                        description="Убедитесь, что все содержание резюме написано на одном языке.",
                    ))
        except Exception:
            # If LLM call fails, skip this rule
            pass
        
        return points

