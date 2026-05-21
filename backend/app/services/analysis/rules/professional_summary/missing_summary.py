"""Rule: Generate Missing Summary - LLM-powered generation of professional summary"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class GenerateMissingSummaryRule(BaseRule):
    """Generates professional summary via LLM when it's missing."""

    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 8
        self.premium_only = True

    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Generate summary via LLM if missing."""
        points = []
        summary = (resume.get('professional_summary') or '').strip()

        # Only generate if summary is completely missing
        if not summary or len(summary) < 20:
            # Generate summary via LLM
            import json
            work_exp = resume.get('work_experience') or []
            education = resume.get('education') or []
            skills = resume.get('skills') or []
            years = len(work_exp) * 2  # Rough estimate

            prompt = f"""Составьте профессиональное резюме (150–200 символов) для этого резюме на основе опыта и навыков кандидата.

Опыт работы: {json.dumps(work_exp[:3])}
Образование: {json.dumps(education)}
Навыки: {', '.join(skills[:10])}
Предполагаемый опыт работы: {years}

Сосредоточьтесь на ключевых сильных сторонах, областях знаний и уровне карьеры.
Установите для has_fix значение true и предоставьте профессиональное резюме в файле fixed_text."""

            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=250)

            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="replace",
                    field_path="professional_summary",
                    original_content=summary if summary else None,
                    new_content=fix_response.fixed_text
                )

            points.append(self.create_point(
                field_path="professional_summary",
                title="Создать профессиональное резюме",
                description="Профессиональное резюме, созданное искусственным интеллектом на основе вашего опыта и навыков.",
                fix_suggestion=fix_suggestion,
                metadata={"severity": "high", "score_impact": 0}  # 0 impact since MissingRequiredFieldsRule already counted it
            ))

        return points

