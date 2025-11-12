"""Rule: Capitalization Consistency - Checks consistency of capitalization across similar fields"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class CapitalizationConsistencyRule(BaseRule):
    """
    Checks capitalization consistency across similar fields:
    - Names (first_name, last_name): consistent style
    - Job titles: consistent capitalization
    - Achievements: consistent sentence start style
    - Skills: consistent capitalization
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """
        Check capitalization consistency across all relevant fields.
        Passes all fields to LLM in one request, then parses results into separate ImprovementPoints.
        """
        points = []
        
        # Collect relevant fields
        fields_data = {}
        
        # Names
        personal_info = resume.get('personal_info', {})
        first_name = personal_info.get('first_name') or ''
        last_name = personal_info.get('last_name') or ''
        if first_name:
            fields_data['personal_info.first_name'] = first_name
        if last_name:
            fields_data['personal_info.last_name'] = last_name
        
        # Job titles
        work_exp = resume.get('work_experience', [])
        for i, exp in enumerate(work_exp):
            job_title = exp.get('job_title') or ''
            if job_title:
                fields_data[f'work_experience[{i}].job_title'] = job_title
        
        # Achievements (first few words)
        for i, exp in enumerate(work_exp):
            achievements = exp.get('achievements', [])
            for j, achievement in enumerate(achievements[:3]):  # Limit to first 3 per position
                if achievement:
                    fields_data[f'work_experience[{i}].achievements[{j}]'] = achievement
        
        # Skills
        skills = resume.get('skills', [])
        if skills:
            fields_data['skills'] = ', '.join(skills[:10])  # Limit to first 10
        
        if not fields_data:
            return points
        
        # Prepare prompt with all fields
        fields_text = '\n'.join([f'{path}: {text}' for path, text in fields_data.items()])
        
        prompt = f"""Analyze capitalization consistency across these resume fields. Check for:
- Names (first_name, last_name): consistent style (Title Case, UPPERCASE, or lowercase)
- Job titles: consistent capitalization style
- Achievements: consistent sentence start style (first letter capitalized)
- Skills: consistent capitalization style

Fields:
{fields_text}

Return a JSON object with:
- "inconsistent_fields": list of objects with "field_path" and "fixed_text" for fields that need capitalization fixes

If all fields are consistent, return empty inconsistent_fields list.
Recommendation: Use Title Case for names and job titles, capitalize first letter for sentences."""
        
        try:
            result = await llm_helper.call_llm_structured(prompt, max_tokens=800)
            
            if result.has_fix and result.fixed_text:
                import json
                try:
                    data = json.loads(result.fixed_text)
                    inconsistent_fields = data.get('inconsistent_fields', [])
                    
                    for field_info in inconsistent_fields:
                        field_path = field_info.get('field_path')
                        fixed_text = field_info.get('fixed_text')
                        
                        if field_path in fields_data and fixed_text:
                            # Handle skills differently (it's a list)
                            if field_path == 'skills':
                                # Parse fixed skills back to list
                                fixed_skills = [s.strip() for s in fixed_text.split(',')]
                                original_skills = skills[:10]
                                fix_suggestion = FixSuggestion(
                                    type="replace",
                                    field_path="skills",
                                    original_content=original_skills,
                                    new_content=fixed_skills
                                )
                            else:
                                fix_suggestion = FixSuggestion(
                                    type="replace",
                                    field_path=field_path,
                                    original_content=fields_data[field_path],
                                    new_content=fixed_text
                                )
                            
                            points.append(self.create_point(
                                field_path=field_path,
                                title="Inconsistent Capitalization",
                                description="Standardize capitalization to match the rest of the resume",
                                fix_suggestion=fix_suggestion
                            ))
                except json.JSONDecodeError:
                    # If parsing fails, skip
                    pass
        except Exception:
            # If LLM call fails, skip this rule
            pass
        
        return points

