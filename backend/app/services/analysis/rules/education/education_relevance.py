"""Rule: Education Relevance - Checks relevance of education to current role"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class EducationRelevanceRule(BaseRule):
    """
    Analyzes relevance of education to current role and industry.
    Provides warning if field of study is not relevant.
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 1
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check education relevance to current role."""
        points = []
        
        current_role = resume.get('current_role') or ''
        work_exp = resume.get('work_experience', [])
        education = resume.get('education', [])
        
        if not current_role or not education:
            return points
        
        # Build work experience summary
        work_summary = []
        for exp in work_exp[:3]:
            work_summary.append({
                'job_title': exp.get('job_title', ''),
                'achievements': exp.get('achievements', [])[:3]
            })
        
        # Check each education entry
        for i, edu in enumerate(education):
            field_of_study = edu.get('field_of_study') or ''
            degree = edu.get('degree') or ''
            
            if not field_of_study:
                continue
            
            prompt = f"""Проанализируйте, насколько это образование соответствует текущей должности кандидата и его опыту работы.

Текущая должность: {current_role}
Область обучения: {field_of_study}
Степень: {degree}
Опыт работы: {work_exp[:200] if work_exp else 'None'}

Верните JSON-объект со следующими полями:
- "is_relevant": boolean indicating if education is relevant
- "reasoning": explanation

Если образование нерелевантно, установите is_relevant в false и поясните это в reasoning."""
            
            try:
                result = await llm_helper.call_llm_structured(prompt, max_tokens=300)
                
                if result.has_fix and result.fixed_text:
                    import json
                    try:
                        data = json.loads(result.fixed_text)
                        if not data.get('is_relevant', True):
                            points.append(self.create_point(
                                field_path=f"education[{i}].field_of_study",
                                title="Образование может быть нерелевантным",
                                description=data.get('reasoning', 'Field of study may not align with current role'),
                                metadata={"severity": "low", "score_impact": 1}
                            ))
                    except json.JSONDecodeError:
                        pass
            except Exception:
                # If LLM call fails, skip this entry
                pass
        
        return points

