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
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect weak verbs and generate improved versions."""
        points = []
        
        weak_verbs = [
            'helped', 'assisted', 'participated', 'involved',
            'worked on', 'dealt with', 'handled', 'did',
            'made', 'got', 'tried', 'attempted'
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                ach_lower = achievement.lower()
                found_weak = None
                
                for weak in weak_verbs:
                    if weak in ach_lower[:30]:  # Check beginning of sentence
                        found_weak = weak
                        break
                
                if found_weak:
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Replace weak verbs with strong, impactful action verbs in this resume bullet.

Achievement: "{achievement}"
Weak verb detected: "{found_weak}"

Set has_fix to true and provide the improved text in fixed_text."""
                    
                    fix_response = await llm_helper.call_llm_structured(prompt)
                    
                    fix_suggestion = None
                    if fix_response.has_fix and fix_response.fixed_text:
                        fix_suggestion = FixSuggestion(
                            type="replace",
                            field_path=f"work_experience[{i}].achievements[{j}]",
                            original_content=achievement,
                            new_content=fix_response.fixed_text
                        )
                    
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        title="Uses Weak Verb",
                        description=f"Replace '{found_weak}' with a stronger action verb",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

