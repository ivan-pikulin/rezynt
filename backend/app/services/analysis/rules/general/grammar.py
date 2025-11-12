"""Rule: Grammar - Checks grammar and style consistency across all text fields"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class GrammarRule(BaseRule):
    """
    Detects grammar and style issues across all text fields.
    Checks for: grammar errors, capitalization consistency, verb tense consistency, number format consistency.
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Check grammar and style for each text field separately.
        Generates fixes for each field that needs correction.
        """
        points = []
        
        # Fields to check
        text_fields = []
        
        # Professional summary
        summary = resume.get('professional_summary') or ''
        if summary:
            text_fields.append(('professional_summary', summary))
        
        # Work experience achievements
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                if achievement:
                    text_fields.append((f'work_experience[{i}].achievements[{j}]', achievement))
        
        # Check each field separately
        for field_path, text in text_fields:
            prompt = f"""Check this text for grammar and style issues:
- Grammar and spelling errors
- Capitalization consistency
- Verb tense consistency
- Number format consistency

Text: "{text}"

If issues are found, set has_fix to true and provide the corrected text in fixed_text.
If no issues, set has_fix to false."""
            
            fix_response = await llm_helper.call_llm_structured(prompt)
            
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="replace",
                    field_path=field_path,
                    original_content=text,
                    new_content=fix_response.fixed_text
                )
                
                points.append(self.create_point(
                    field_path=field_path,
                    title="Grammar and Style Issues",
                    description=fix_response.reasoning or "Fix grammar and style issues",
                    fix_suggestion=fix_suggestion
                ))
        
        return points

