"""Rule 1.13: Too Many Skills"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class TooManySkillsRule(BaseRule):
    """Detects excessive skills and curates them via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "low"
        self.score_impact = 2
        self.max_skills = AnalysisConfig.MAX_SKILLS_COUNT
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect too many skills and generate curated list via LLM."""
        points = []
        skills = resume.get('skills', [])
        
        if len(skills) > self.max_skills:
            # Curate skills via LLM with Structured Outputs
            import json
            work_exp = resume.get('work_experience', [])
            exp_summary = []
            for exp in work_exp[:3]:
                exp_summary.append({
                    'title': exp.get('job_title', ''),
                    'achievements': exp.get('achievements', [])[:3]
                })
            
            prompt = f"""This resume has too many skills ({len(skills)}). Select the 12-15 most relevant and impactful skills based on the candidate's work experience.

Current skills: {', '.join(skills)}

Work experience: {json.dumps(exp_summary)}

Prioritize: technical skills, specialized knowledge, in-demand technologies.
Set has_fix to true and provide comma-separated curated skills in fixed_text."""
            
            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=300)
            
            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                # Parse skills as list (comma-separated from LLM response)
                new_skills_list = [s.strip() for s in fix_response.fixed_text.split(',')]
                fix_suggestion = FixSuggestion(
                    type="replace",
                    field_path="skills",
                    original_content=skills,
                    new_content=new_skills_list
                )
            
            points.append(self.create_point(
                field_path="skills",
                title="Too Many Skills",
                description=f"Focus on most relevant skills ({len(skills)} → ~15)",
                fix_suggestion=fix_suggestion
            ))
        
        return points
