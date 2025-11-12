"""Rule: Skills Not In Experience - Detects skills not demonstrated in work experience"""
import json
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class SkillsNotInExperienceRule(BaseRule):
    """Detects skills not demonstrated in work experience and suggests additions via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "medium"
        self.score_impact = 4
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect orphaned skills and generate achievement suggestions via LLM."""
        points = []
        skills = resume.get('skills', [])
        work_exp = resume.get('work_experience', [])
        
        if not skills or not work_exp:
            return points
        
        # Build experience text
        experience_text = ""
        for exp in work_exp:
            experience_text += " " + (exp.get('job_title') or '')
            experience_text += " " + (exp.get('short_description') or '')
            for ach in exp.get('achievements') or []:
                experience_text += " " + (ach or '')
            for tech in exp.get('technologies_tools') or []:
                experience_text += " " + (tech or '')
        
        # Detect orphaned skills via LLM with Structured Outputs
        prompt = f"""Analyze if these skills are mentioned or demonstrated in the work experience.

Skills claimed: {', '.join(skills)}

Work experience text: {experience_text[:1000]}

Task:
1. Identify skills NOT found in the experience
2. For each orphaned skill, suggest a brief achievement that demonstrates it
3. If found, set has_fix to true and in fixed_text provide JSON with:
   - orphaned_skills: list of skill names
   - suggestions: list of objects with skill, field_path, and addition (achievement text)

If no orphaned skills found, set has_fix to false."""
        
        result = await llm_helper.call_llm_structured(prompt, max_tokens=600)
        
        if result.has_fix and result.fixed_text:
            try:
                # Parse JSON from fixed_text
                data = json.loads(result.fixed_text)
                suggestions = data.get('suggestions', [])
                
                # Create improvement point for each suggestion
                for suggestion in suggestions[:3]:  # Limit to top 3
                    skill = suggestion.get('skill', '')
                    field_path = suggestion.get('field_path', 'work_experience[0].achievements')
                    addition = suggestion.get('addition', '')
                    
                    if skill and addition:
                        fix_suggestion = FixSuggestion(
                            type="add",
                            field_path=field_path,
                            new_content=addition
                        )
                        
                        points.append(self.create_point(
                            field_path=field_path,
                            title=f"Skill Not Demonstrated: {skill}",
                            description=f"Add example of using {skill} in your experience",
                            fix_suggestion=fix_suggestion
                        ))
            except json.JSONDecodeError:
                # If parsing fails, skip
                pass
        
        return points

