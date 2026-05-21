"""Rule: Missing Keywords - Detects missing industry keywords"""
import json
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class MissingKeywordsRule(BaseRule):
    """Detects missing industry keywords and suggests additions via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "high"
        self.score_impact = 7
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect missing keywords via LLM and generate suggestions."""
        points = []
        
        # Determine job title from latest experience
        work_exp = resume.get('work_experience', [])
        if not work_exp:
            return points
        
        latest_job = work_exp[0]
        job_title = latest_job.get('job_title', 'Professional')
        
        # Prepare context
        summary = resume.get('professional_summary') or ''
        skills = resume.get('skills') or []
        exp_text = " ".join([
            " ".join(exp.get('achievements') or []) 
            for exp in work_exp[:3]
        ])
        
        # Detect missing keywords via LLM with Structured Outputs
        prompt = f"""Проанализируйте, содержит ли это резюме подходящие отраслевые ключевые слова для роли {job_title}.

Резюме: {summary}
Текущие навыки: {', '.join(skills)}
Ключевые моменты опыта: {exp_text[:500]}

Задача:
1. Определите 3-5 недостающих отраслевых ключевых слов или технологий для этой роли
2. Если такие слова найдены, установите has_fix в true и в fixed_text верните JSON со следующими полями:
   - missing_keywords: список ключевых слов (каждое должно начинаться с заглавной буквы)
   - suggested_addition: строка с ключевыми словами через запятую, которые нужно добавить (каждое должно начинаться с заглавной буквы)

Format: Capitalize first letter of each skill/keyword (e.g., "Python", "Machine Learning", "Docker").

Если недостающих ключевых слов нет, установите has_fix в false и объясните это в reasoning."""
        
        result = await llm_helper.call_llm_structured(prompt, max_tokens=400)
        
        if result.has_fix and result.fixed_text:
            try:
                # Parse JSON from fixed_text
                data = json.loads(result.fixed_text)
                missing_keywords = data.get('missing_keywords', [])
                suggested_addition = data.get('suggested_addition', '')
                
                if missing_keywords and suggested_addition:
                    fix_suggestion = FixSuggestion(
                        type="add",
                        field_path="skills",
                        new_content=suggested_addition
                    )
                    
                    keywords_list = ", ".join(missing_keywords[:5])
                    points.append(self.create_point(
                        field_path="skills",
                        title="Отсутствуют ключевые слова отрасли",
                        description=f"Рассмотрите возможность добавления релевантных ключевых слов: {keywords_list}.",
                        fix_suggestion=fix_suggestion,
                        metadata={"missing_keywords": missing_keywords}
                    ))
            except json.JSONDecodeError:
                # If parsing fails, skip this point
                pass
        
        return points

