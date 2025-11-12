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
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect passive voice and generate active voice versions."""
        points = []
        
        # Common passive voice indicators
        passive_indicators = [
            'was ', 'were ', 'been ', 'being ',
            'was developed', 'was created', 'was implemented',
            'were used', 'were applied', 'been completed'
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                ach_lower = achievement.lower()
                
                if any(indicator in ach_lower for indicator in passive_indicators):
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Convert this resume bullet from passive voice to active voice.

Original: "{achievement}"

Set has_fix to true and provide the active voice version in fixed_text."""
                    
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
                        title="Uses Passive Voice",
                        description="Convert to active voice for stronger impact",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

