"""Rule: Summary Length - Validates professional summary length and improves it via LLM"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class SummaryLengthRule(BaseRule):
    """Detects professional summaries that are too short or too long and fixes them via LLM."""

    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 3
        self.premium_only = True
        self.min_length = AnalysisConfig.MIN_SUMMARY_LENGTH
        self.max_length = AnalysisConfig.MAX_SUMMARY_LENGTH

    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check summary length and generate fixes if needed."""
        points = []
        summary = (resume.get('professional_summary') or '').strip()

        # Skip if summary is missing completely (handled by missing_required_fields)
        if not summary or len(summary) < 20:
            return []

        # Check if too short
        if len(summary) < self.min_length:
            # Get context for enrichment
            skills = resume.get('skills', [])[:5]
            latest_job = resume.get('work_experience', [{}])[0].get('job_title', '') if resume.get('work_experience') else ''

            prompt = f"""Расширьте это профессиональное summary минимум до {self.min_length} символов, сохранив фокус и выразительность.

Текущее резюме: "{summary}"

Контекст для расширения:
- Главные навыки: {', '.join(skills)}
- Последняя должность: {latest_job}

Установите has_fix в true и верните расширенный summary в fixed_text.
Если расширить его содержательно нельзя, установите has_fix в false и объясните это в reasoning."""

            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=350)

            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="replace",
                    field_path="professional_summary",
                    original_content=summary,
                    new_content=fix_response.fixed_text
                )

            points.append(self.create_point(
                field_path="professional_summary",
                title="Резюме слишком короткое",
                description=f"Расширьте свое резюме, чтобы сделать его более впечатляющим и продемонстрировать свой опыт ({len(summary)} → {self.min_length}+ символов)",
                fix_suggestion=fix_suggestion,
                metadata={"severity": "low", "score_impact": 3}
            ))

        # Check if too long
        elif len(summary) > self.max_length:
            prompt = f"""Сократите это профессиональное summary до {self.max_length} символов, сохранив самые важные пункты.

Текущее резюме ({len(summary)} символов): "{summary}"

Установите has_fix в true и верните сокращенное summary в fixed_text."""

            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=300)

            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="replace",
                    field_path="professional_summary",
                    original_content=summary,
                    new_content=fix_response.fixed_text
                )

            points.append(self.create_point(
                field_path="professional_summary",
                title="Резюме слишком длинное",
                description=f"Сократите свое резюме, чтобы оно было целенаправленным и легко читаемым ({len(summary)} → <{self.max_length} символов)",
                fix_suggestion=fix_suggestion,
                metadata={"severity": "low", "score_impact": 2}
            ))

        return points

