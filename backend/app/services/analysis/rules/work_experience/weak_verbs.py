"""Rule: Weak Verbs - Detects weak action verbs and suggests improvements"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class WeakVerbsRule(BaseRule):
    """Detects weak action verbs and suggests improvements via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 4
        self.premium_only = False
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect weak verbs and generate improved versions in batch."""
        points = []

        weak_verbs = [
            'helped', 'assisted', 'participated', 'involved',
            'worked on', 'dealt with', 'handled', 'did',
            'made', 'got', 'tried', 'attempted'
        ]

        # Collect all achievements with weak verbs
        achievements_to_fix = []
        achievement_metadata = []  # Store (exp_index, ach_index, achievement_text, weak_verb)

        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                ach_lower = achievement.lower()
                found_weak = None

                for weak in weak_verbs:
                    if weak in ach_lower[:30]:  # Check beginning of sentence
                        found_weak = weak
                        break

                if found_weak:
                    achievements_to_fix.append(achievement)
                    achievement_metadata.append((i, j, achievement, found_weak))

        # Batch process all achievements with weak verbs
        if achievements_to_fix:
            task_description = """Замените слабые глаголы сильными и эффективными глаголами действия в каждом пункте резюме ниже.

Для каждого достижения установите для has_fix значение true и укажите улучшенный текст в файле fixed_text."""

            fix_responses = await llm_helper.call_llm_batch(
                task_description=task_description,
                items=achievements_to_fix,
                max_tokens=2500
            )

            # Create improvement points from batch results
            for (i, j, original_achievement, weak_verb), fix_response in zip(achievement_metadata, fix_responses):
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
                    title="Использует слабый глагол",
                    description=f"Замените «{weak_verb}» более сильным глаголом действия.",
                    fix_suggestion=fix_suggestion
                ))

        return points

