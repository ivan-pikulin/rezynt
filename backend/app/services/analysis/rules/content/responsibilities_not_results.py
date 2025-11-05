"""Rule 1.3: Responsibilities Instead of Results"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class ResponsibilitiesNotResultsRule(BaseRule):
    """Converts responsibilities into impact-oriented achievements via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 5
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect responsibility-oriented language and generate results-focused fixes."""
        points = []
        responsibility_phrases = [
            'responsible for',
            'worked on',
            'duties included',
            'in charge of',
            'tasked with',
            'managed to',
            'helped with'
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                text_lower = achievement.lower()
                if any(phrase in text_lower for phrase in responsibility_phrases):
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Rewrite this resume bullet to focus on results and impact rather than just responsibilities. Use strong action verbs and emphasize outcomes achieved.

Original: "{achievement}"

Set has_fix to true and provide the results-oriented text in fixed_text."""
                    
                    fix_response = await llm_helper.call_llm_structured(prompt)
                    
                    fix_suggestion = None
                    if fix_response.has_fix and fix_response.fixed_text:
                        fix_suggestion = FixSuggestion(
                            type="replace",
                            field_path=f"work_experience[{i}].achievements[{j}]",
                            new_content=fix_response.fixed_text
                        )
                    
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        title="Focuses on Responsibilities",
                        description="Rewrite to focus on results and impact, not just duties",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

