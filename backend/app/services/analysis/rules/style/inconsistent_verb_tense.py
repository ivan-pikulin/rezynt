"""Rule 3.1: Inconsistent Verb Tense"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class InconsistentVerbTenseRule(BaseRule):
    """Detects inconsistent verb tense in achievements and fixes via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 5
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect tense issues and generate correctly-tensed versions."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            # Determine if current position
            end_date = exp.get('end_date', '').lower()
            is_current = end_date in ['present', 'current', 'now', ''] or not end_date
            
            achievements = exp.get('achievements', [])
            if not achievements:
                continue
            
            # Simple heuristic: check first word of each achievement
            present_verbs = ['lead', 'manage', 'develop', 'implement', 'create', 'design', 'build']
            past_verbs = ['led', 'managed', 'developed', 'implemented', 'created', 'designed', 'built']
            
            # Check each achievement
            for j, achievement in enumerate(achievements):
                ach_lower = achievement.lower()[:30]
                
                has_present = any(verb in ach_lower for verb in present_verbs)
                has_past = any(verb in ach_lower for verb in past_verbs)
                
                # Determine if tense is wrong
                wrong_tense = (is_current and has_past) or (not is_current and has_present)
                
                if wrong_tense:
                    # Generate fix via LLM with Structured Outputs
                    expected_tense = "present" if is_current else "past"
                    prompt = f"""Convert this achievement to {expected_tense} tense (for {'current' if is_current else 'previous'} role).

Achievement: "{achievement}"

Set has_fix to true and provide the correctly tensed text in fixed_text."""
                    
                    fix_response = await llm_helper.call_llm_structured(prompt)
                    
                    fix_suggestion = None
                    if fix_response.has_fix and fix_response.fixed_text:
                        fix_suggestion = FixSuggestion(
                            type="replace",
                            field_path=f"work_experience[{i}].achievements[{j}]",
                            original_content=achievement,
                            new_content=fix_response.fixed_text
                        )
                    
                    expected = "present" if is_current else "past"
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        title="Wrong Verb Tense",
                        description=f"Use {expected} tense for {'current' if is_current else 'past'} role",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points
