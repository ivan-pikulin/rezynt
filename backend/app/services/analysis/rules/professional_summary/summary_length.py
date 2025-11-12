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

            prompt = f"""Expand this professional summary to at least {self.min_length} characters while keeping it focused and impactful.

Current summary: "{summary}"

Context for enrichment:
- Top skills: {', '.join(skills)}
- Latest role: {latest_job}

Set has_fix to true and provide the expanded summary in fixed_text.
If you cannot expand it meaningfully, set has_fix to false and explain in reasoning."""

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
                title="Summary Too Short",
                description=f"Expand your summary to make it more impactful and showcase your expertise ({len(summary)} → {self.min_length}+ characters)",
                fix_suggestion=fix_suggestion,
                metadata={"severity": "low", "score_impact": 3}
            ))

        # Check if too long
        elif len(summary) > self.max_length:
            prompt = f"""Condense this professional summary to under {self.max_length} characters while keeping the most important points.

Current summary ({len(summary)} characters): "{summary}"

Set has_fix to true and provide the condensed summary in fixed_text."""

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
                title="Summary Too Long",
                description=f"Condense your summary to keep it focused and easy to read ({len(summary)} → <{self.max_length} characters)",
                fix_suggestion=fix_suggestion,
                metadata={"severity": "low", "score_impact": 2}
            ))

        return points

