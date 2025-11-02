"""Rule 2.7: Skills Not Mentioned in Experience"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class SkillsNotInExperienceRule(BaseRule):
    """Detects skills not demonstrated in work experience."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "medium"
        self.score_impact = 4
        self.check_type = "llm_assisted"
        self.action_type = "go_to_edit"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check if skills are mentioned in experience."""
        points = []
        skills = resume.get('skills', [])
        
        # Collect all text from experience
        experience_text = ""
        for exp in resume.get('work_experience', []):
            experience_text += " " + exp.get('job_title', '')
            experience_text += " " + exp.get('short_description', '')
            for ach in exp.get('achievements', []):
                experience_text += " " + ach
            for tech in exp.get('technologies_tools', []):
                experience_text += " " + tech
        
        experience_text_lower = experience_text.lower()
        
        unmentioned_skills = []
        for skill in skills:
            if skill.lower() not in experience_text_lower:
                unmentioned_skills.append(skill)
        
        # Flag if more than 30% skills are unmentioned
        if len(unmentioned_skills) > len(skills) * 0.3:
            # Point for skills section - to remove unmentioned
            points.append(self.create_point(
                field_path="skills",
                title="Skills Not Demonstrated",
                description=f"Remove {len(unmentioned_skills)} skills not demonstrated in experience",
                metadata={"unmentioned_skills": unmentioned_skills[:5]}
            ))
            
            # Point for work experience - to add skill demonstrations
            points.append(self.create_point(
                field_path="work_experience",
                title="Demonstrate Listed Skills",
                description="Add examples demonstrating your listed skills in work experience",
                metadata={"unmentioned_skills": unmentioned_skills[:5]}
            ))
        
        return points

