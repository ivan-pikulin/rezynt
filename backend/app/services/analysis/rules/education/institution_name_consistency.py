"""Rule: Institution Name Consistency - Checks consistency of institution name format"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class InstitutionNameConsistencyRule(BaseRule):
    """
    Checks consistency of institution name format across all education entries.
    Ensures all institution names use consistent format (full name vs abbreviation).
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 1
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Check institution name format consistency.
        Passes all institution names to LLM in one request, then parses results into separate ImprovementPoints.
        """
        points = []
        
        education = resume.get('education', [])
        if len(education) < 2:
            return points
        
        # Collect all institution names
        institutions_data = {}
        for i, edu in enumerate(education):
            institution = edu.get('institution') or ''
            if institution:
                institutions_data[f'education[{i}].institution'] = institution
        
        if not institutions_data:
            return points
        
        # Prepare prompt with all institution names
        institutions_text = '\n'.join([f'{path}: {name}' for path, name in institutions_data.items()])
        
        prompt = f"""Analyze institution name format consistency. Check if all institution names use consistent format (full name vs abbreviation).

Institution names:
{institutions_text}

Return a JSON object with:
- "inconsistent_fields": list of objects with "field_path" and "fixed_text" for institution names that need format fixes

If all names are consistent, return empty inconsistent_fields list.
Recommendation: Use consistent format across all institution names."""
        
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
                        
                        if field_path in institutions_data and fixed_text:
                            fix_suggestion = FixSuggestion(
                                type="replace",
                                field_path=field_path,
                                original_content=institutions_data[field_path],
                                new_content=fixed_text
                            )
                            
                            points.append(self.create_point(
                                field_path=field_path,
                                title="Inconsistent Institution Name Format",
                                description="Standardize institution name format to match the rest of the resume",
                                fix_suggestion=fix_suggestion
                            ))
                except json.JSONDecodeError:
                    # If parsing fails, skip
                    pass
        except Exception:
            # If LLM call fails, skip this rule
            pass
        
        return points

