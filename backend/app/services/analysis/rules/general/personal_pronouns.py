"""Rule: Personal Pronouns - Detects and removes personal pronouns"""
import re
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class PersonalPronounsRule(BaseRule):
    """Detects and removes personal pronouns via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 3
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect personal pronouns and generate versions without them."""
        points = []
        
        pronoun_pattern = r'\b(I|me|my|mine|we|our|ours)\b'
        
        # Check summary
        summary = resume.get('professional_summary', '')
        if summary and re.search(pronoun_pattern, summary, re.IGNORECASE):
            # Generate fix via LLM with Structured Outputs
            prompt = f"""Remove personal pronouns (I, me, my, mine, we, our, ours) from this text while maintaining clarity.

Original: "{summary}"

Set has_fix to true and provide the version without pronouns in fixed_text."""
            
            fix_response = await llm_helper.call_llm_structured(prompt)
            
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
                title="Contains Personal Pronouns",
                description="Remove personal pronouns from summary",
                fix_suggestion=fix_suggestion
            ))
        
        # Check achievements
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                if re.search(pronoun_pattern, achievement, re.IGNORECASE):
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Remove personal pronouns (I, me, my, mine, we, our, ours) from this text while maintaining clarity.

Original: "{achievement}"

Set has_fix to true and provide the version without pronouns in fixed_text."""
                    
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
                        title="Contains Personal Pronouns",
                        description="Remove personal pronouns",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

