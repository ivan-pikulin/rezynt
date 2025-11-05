"""Rule 3.8: Missing Action Verbs"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class MissingActionVerbsRule(BaseRule):
    """Detects bullets not starting with strong action verbs and fixes them via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 4
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect bullets without action verbs and generate improved versions."""
        points = []
        
        # Strong action verbs (past and present tense)
        action_verbs = [
            'led', 'managed', 'developed', 'implemented', 'created',
            'designed', 'built', 'architected', 'optimized', 'increased',
            'reduced', 'improved', 'launched', 'delivered', 'achieved',
            'lead', 'manage', 'develop', 'implement', 'create',
            'design', 'build', 'architect', 'optimize', 'increase',
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                # Skip empty or whitespace-only achievements
                if not achievement or not achievement.strip():
                    continue
                    
                words = achievement.split()
                if not words:  # Skip if no words after split
                    continue
                    
                first_word = words[0].lower().strip('.,;:-')
                
                if first_word not in action_verbs:
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Rewrite this bullet to start with a strong action verb.

Original: "{achievement}"

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
                        title="Missing Action Verb",
                        description="Start with a strong action verb",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points
