"""Rule: Skills Count - Validates number of skills and generates suggestions via LLM"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig
from app.services.analysis.llm_helper import llm_helper


class SkillsCountRule(BaseRule):
    """Detects too few or too many skills and generates appropriate suggestions via LLM."""

    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 4
        self.min_skills = AnalysisConfig.MIN_SKILLS_COUNT
        self.max_skills = AnalysisConfig.MAX_SKILLS_COUNT

    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check skills count and generate suggestions via LLM."""
        points = []
        skills = resume.get('skills', [])

        # Too few skills
        if len(skills) < self.min_skills:
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
Set has_fix to true and provide comma-separated skills in fixed_text (e.g., "Python, Docker, Kubernetes, AWS").
Format: Capitalize first letter of each skill (e.g., "Python", "Machine Learning", "Docker")."""

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
                description=f"Add more relevant skills to strengthen your profile and improve ATS matching (currently {len(skills)}, recommended {self.min_skills}+)",
                fix_suggestion=fix_suggestion,
                metadata={"severity": "medium", "score_impact": 4}
            ))

        # Too many skills
        elif len(skills) > self.max_skills:
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
Set has_fix to true and provide comma-separated curated skills in fixed_text.
Format: Capitalize first letter of each skill (e.g., "Python", "Machine Learning", "Docker")."""

            fix_response = await llm_helper.call_llm_structured(prompt, max_tokens=300)

            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                # Parse skills as list
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
                description=f"Focus on your most relevant skills to avoid overwhelming recruiters and improve resume clarity ({len(skills)} → ~{self.max_skills})",
                fix_suggestion=fix_suggestion,
                metadata={"severity": "low", "score_impact": 2}
            ))

        return points
