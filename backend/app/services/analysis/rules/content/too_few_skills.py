"""Rule 1.12: Too Few Skills"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class TooFewSkillsRule(BaseRule):
    """Detects insufficient skills and suggests additions via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 4
        self.min_skills = AnalysisConfig.MIN_SKILLS_COUNT
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect insufficient skills and generate suggestions via LLM."""
        points = []
        skills = resume.get('skills', [])
        
        if len(skills) < self.min_skills:
            # Suggest skills via LLM with Structured Outputs
            import json
            work_exp = resume.get('work_experience', [])
            exp_summary = []
            for exp in work_exp[:3]:
                exp_summary.append({
                    'title': exp.get('job_title', ''),
                    'description': exp.get('short_description', ''),
                    'achievements': exp.get('achievements', [])[:3]
                })
            
            prompt = f"""Suggest 5-10 relevant technical skills for this candidate based on their work experience.

Current skills: {', '.join(skills)}

Work experience: {json.dumps(exp_summary)}

Return only skills NOT already listed. Focus on technical skills and tools commonly used in their role.
Set has_fix to true and provide comma-separated skills in fixed_text (e.g., "Python, Docker, Kubernetes, AWS")."""
            
            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=200)
            
            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="add",
                    field_path="skills",
                    new_content=fix_response.fixed_text
                )
            
            points.append(self.create_point(
                field_path="skills",
                title="Too Few Skills",
                description=f"Add more relevant skills (currently {len(skills)}, recommended {self.min_skills}+)",
                fix_suggestion=fix_suggestion
            ))
        
        return points
