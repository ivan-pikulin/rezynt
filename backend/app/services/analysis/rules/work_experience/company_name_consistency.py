"""Rule: Company Name Consistency - Checks consistency of company name format"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class CompanyNameConsistencyRule(BaseRule):
    """
    Checks consistency of company name format across all work experience entries.
    Ensures all company names use consistent format (with/without Inc., Ltd., Corp., etc.).
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Check company name format consistency.
        Passes all company names to LLM in one request, then parses results into separate ImprovementPoints.
        """
        points = []
        
        work_exp = resume.get('work_experience', [])
        if len(work_exp) < 2:
            return points
        
        # Collect all company names
        companies_data = {}
        for i, exp in enumerate(work_exp):
            company = exp.get('company') or ''
            if company:
                companies_data[f'work_experience[{i}].company'] = company
        
        if not companies_data:
            return points
        
        # Prepare prompt with all company names
        companies_text = '\n'.join([f'{path}: {name}' for path, name in companies_data.items()])
        
        prompt = f"""Analyze company name format consistency. Check if all company names use consistent format (with/without Inc., Ltd., Corp., etc.).

Company names:
{companies_text}

Return a JSON object with:
- "inconsistent_fields": list of objects with "field_path" and "fixed_text" for company names that need format fixes

If all names are consistent, return empty inconsistent_fields list.
Recommendation: Use consistent format across all company names."""
        
        try:
            result = await llm_helper.call_llm_structured(prompt, max_tokens=500)
            
            if result.has_fix and result.fixed_text:
                import json
                try:
                    data = json.loads(result.fixed_text)
                    inconsistent_fields = data.get('inconsistent_fields', [])
                    
                    for field_info in inconsistent_fields:
                        field_path = field_info.get('field_path')
                        fixed_text = field_info.get('fixed_text')
                        
                        if field_path in companies_data and fixed_text:
                            fix_suggestion = FixSuggestion(
                                type="replace",
                                field_path=field_path,
                                original_content=companies_data[field_path],
                                new_content=fixed_text
                            )
                            
                            points.append(self.create_point(
                                field_path=field_path,
                                title="Inconsistent Company Name Format",
                                description="Standardize company name format to match the rest of the resume",
                                fix_suggestion=fix_suggestion
                            ))
                except json.JSONDecodeError:
                    # If parsing fails, skip
                    pass
        except Exception:
            # If LLM call fails, skip this rule
            pass
        
        return points

