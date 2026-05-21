"""Rule: Passive Voice - Detects passive voice and converts to active"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class PassiveVoiceRule(BaseRule):
    """Detects passive voice and converts to active via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 4
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect passive voice and generate active voice versions in batch."""
        points = []

        # Common passive voice indicators
        passive_indicators = [
            'was ', 'were ', 'been ', 'being ',
            'was developed', 'was created', 'was implemented',
            'were used', 'were applied', 'been completed'
        ]

        # Collect all achievements with passive voice
        achievements_to_fix = []
        achievement_metadata = []  # Store (exp_index, ach_index, achievement_text)

        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                ach_lower = achievement.lower()

                if any(indicator in ach_lower for indicator in passive_indicators):
                    achievements_to_fix.append(achievement)
                    achievement_metadata.append((i, j, achievement))

        # Batch process all achievements with passive voice
        if achievements_to_fix:
            task_description = """Преобразуйте каждый пункт резюме ниже из пассивного залога в активный.

Для каждого достижения установите для has_fix значение true и укажите активную голосовую версию в фиксированном_тексте."""

            fix_responses = await llm_helper.call_llm_batch(
                task_description=task_description,
                items=achievements_to_fix,
                max_tokens=2500
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
                    title="Использует пассивный залог",
                    description="Преобразование в активный залог для более сильного воздействия",
                    fix_suggestion=fix_suggestion
                ))

        return points

