"""Rule: Achievements Without Metrics - Detects achievements without quantifiable metrics"""
import re
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class AchievementsWithoutMetricsRule(BaseRule):
    """Detects achievements without quantifiable metrics and adds them via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 6
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect missing metrics and generate fixes via LLM in batch."""
        points = []

        # Metric patterns for quick detection
        metric_patterns = [
            r'\d+%',           # 25%
            r'\$\d+',          # $50K
            r'\d+[KMB]',       # 10K, 5M
            r'\d+x',           # 2x
            r'\d+\s*(users|clients|projects|hours|days|teams|members|revenue|sales|cost|time|speed|performance)',
        ]

        # Collect all achievements without metrics
        achievements_to_fix = []
        achievement_metadata = []  # Store (exp_index, ach_index, achievement_text)

        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                # Quick mechanical check
                has_metric = any(
                    re.search(pattern, achievement, re.IGNORECASE)
                    for pattern in metric_patterns
                )

                if not has_metric and len(achievement) > 10:
                    achievements_to_fix.append(achievement)
                    achievement_metadata.append((i, j, achievement))

        # Batch process all achievements without metrics in single LLM call
        if achievements_to_fix:
            task_description = """Добавьте конкретные количественные показатели к каждому достижению ниже. Включите цифры, проценты, суммы в долларах или измеримые результаты.

Если вы можете добавить метрики для каждого достижения, установите для has_fix значение true и предоставьте улучшенный текст в фиксированном_тексте.
Если это невозможно, установите для has_fix значение false и объясните почему."""

            fix_responses = await llm_helper.call_llm_batch(
                task_description=task_description,
                items=achievements_to_fix,
                max_tokens=3000  # Larger token limit for batch processing
            )

            # Create improvement points from batch results
            for (i, j, original_achievement), fix_response in zip(achievement_metadata, fix_responses):
                fix_suggestion = None
                if fix_response.has_fix and fix_response.fixed_text:
                    fix_suggestion = FixSuggestion(
                        type="replace",
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        original_content=original_achievement,
                        new_content=fix_response.fixed_text
                    )

                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements[{j}]",
                    title="Отсутствующие метрики",
                    description="Добавьте конкретные показатели для количественной оценки вашего воздействия.",
                    fix_suggestion=fix_suggestion
                ))

        return points

