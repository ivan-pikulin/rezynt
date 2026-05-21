"""Rule: Skills Count - Validates number of skills and generates suggestions via LLM"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class SkillsCountRule(BaseRule):
    """Detects too few or too many skills and generates appropriate suggestions via LLM."""

    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 4
        self.premium_only = True
        self.min_skills = AnalysisConfig.MIN_SKILLS_COUNT
        self.max_skills = AnalysisConfig.MAX_SKILLS_COUNT

    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check skills count and generate suggestions via LLM."""
        points = []
        skills = resume.get('skills') or []

        # Too few skills
        if len(skills) < self.min_skills:
            import json
            work_exp = resume.get('work_experience') or []
            exp_summary = []
            for exp in work_exp[:3]:
                exp_summary.append({
                    'title': exp.get('job_title', ''),
                    'description': exp.get('short_description', ''),
                    'achievements': exp.get('achievements', [])[:3]
                })

            prompt = f"""Предложите 5-10 подходящих технических навыков для этого кандидата на основе его опыта работы.

Текущие навыки: {', '.join(skills)}

Опыт работы: {json.dumps(exp_summary)}

Возвращайте только навыки, которых еще нет в списке. Сосредоточьтесь на технических навыках и инструментах, которые обычно используются в этой роли.
Установите has_fix в true и укажите навыки через запятую в fixed_text (например, "Python, Docker, Kubernetes, AWS").
Формат: пишите первый символ каждого навыка с заглавной буквы (например, "Python", "Machine Learning", "Docker")."""

            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=200)

            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="add",
                    field_path="skills",
                    new_content=fix_response.fixed_text
                )

            points.append(self.create_point(
                field_path="skills",
                title="Слишком мало навыков",
                description=f"Добавьте больше подходящих навыков, чтобы усилить свой профиль и улучшить соответствие ATS (сейчас {len(skills)}, рекомендуется {self.min_skills}+)",
                fix_suggestion=fix_suggestion,
                metadata={"severity": "medium", "score_impact": 4}
            ))

        # Too many skills
        elif len(skills) > self.max_skills:
            import json
            work_exp = resume.get('work_experience', [])
            exp_summary = []
            for exp in work_exp[:3]:
                exp_summary.append({
                    'title': exp.get('job_title', ''),
                    'achievements': exp.get('achievements', [])[:3]
                })

            prompt = f"""В этом резюме слишком много навыков ({len(skills)}). Выберите 12-15 самых релевантных и значимых навыков на основе опыта работы кандидата.

Текущие навыки: {', '.join(skills)}

Опыт работы: {json.dumps(exp_summary)}

В приоритете: технические навыки, специализированные знания, востребованные технологии.
Установите has_fix в true и укажите отобранные навыки через запятую в fixed_text.
Формат: пишите первый символ каждого навыка с заглавной буквы (например, "Python", "Machine Learning", "Docker")."""

            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=300)

            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                # Parse skills as list
                new_skills_list = [s.strip() for s in fix_response.fixed_text.split(',')]
                fix_suggestion = FixSuggestion(
                    type="replace",
                    field_path="skills",
                    original_content=skills,
                    new_content=new_skills_list
                )

            points.append(self.create_point(
                field_path="skills",
                title="Слишком много навыков",
                description=f"Сосредоточьтесь на своих наиболее важных навыках, чтобы не перегружать рекрутеров и сделать резюме более понятным ({len(skills)} → ~{self.max_skills})",
                fix_suggestion=fix_suggestion,
                metadata={"severity": "low", "score_impact": 2}
            ))

        return points

