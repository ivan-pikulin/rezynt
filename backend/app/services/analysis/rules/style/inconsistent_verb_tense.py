"""Rule 3.1: Inconsistent Verb Tense"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class InconsistentVerbTenseRule(BaseRule):
    """Detects inconsistent verb tense in achievements."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 5
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Simple heuristic check for verb tense."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            # Determine if current position
            end_date = exp.get('end_date', '').lower()
            is_current = end_date in ['present', 'current', 'now', ''] or not end_date
            
            achievements = exp.get('achievements', [])
            if not achievements:
                continue
            
            # Simple heuristic: check first word of each achievement
            present_verbs = ['lead', 'manage', 'develop', 'implement', 'create']
            past_verbs = ['led', 'managed', 'developed', 'implemented', 'created']
            
            has_present = any(
                any(verb in ach.lower()[:20] for verb in present_verbs)
                for ach in achievements
            )
            has_past = any(
                any(verb in ach.lower()[:20] for verb in past_verbs)
                for ach in achievements
            )
            
            mixed_tenses = has_present and has_past
            wrong_tense = (is_current and not has_present) or (not is_current and has_present)
            
            if mixed_tenses or wrong_tense:
                expected = "present" if is_current else "past"
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements",
                    message=f"Use {expected} tense consistently for this {'current' if is_current else 'past'} role"
                ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM fixes verb tense."""
        # Note: This would need the full achievements list and expected tense
        return None

