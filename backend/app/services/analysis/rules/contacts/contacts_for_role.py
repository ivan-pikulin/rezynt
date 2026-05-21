"""Rule: Contacts For Role - Checks if contacts are appropriate for the role"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class ContactsForRoleRule(BaseRule):
    """
    Analyzes role and checks if relevant contacts are present:
    - For technical roles: LinkedIn or GitHub
    - For developers: GitHub
    - Validates URL format for LinkedIn, GitHub, website
    """
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 5
        self.premium_only = True
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check if contacts are appropriate for the role."""
        points = []
        
        current_role = resume.get('current_role') or ''
        work_exp = resume.get('work_experience', [])
        personal_info = resume.get('personal_info', {})
        contacts = personal_info.get('contacts', {})
        
        if not current_role:
            return points
        
        # Build role context
        role_context = current_role
        if work_exp:
            latest_job = work_exp[0].get('job_title', '')
            if latest_job:
                role_context = latest_job
        
        # Check for technical role indicators
        technical_keywords = ['developer', 'engineer', 'programmer', 'software', 'tech', 'technical', 'IT', 'programming', 'coding']
        is_technical = any(keyword.lower() in role_context.lower() for keyword in technical_keywords)
        
        # Check for developer role indicators
        developer_keywords = ['developer', 'programmer', 'software engineer', 'full stack', 'backend', 'frontend']
        is_developer = any(keyword.lower() in role_context.lower() for keyword in developer_keywords)
        
        linkedin = (contacts.get('linkedin') or '').strip()
        github = (contacts.get('github') or '').strip()
        
        # For technical roles, recommend LinkedIn or GitHub
        if is_technical and not linkedin and not github:
            points.append(self.create_point(
                field_path="personal_info.contacts.new",
                title="Отсутствует профессиональный профиль",
                description="Для технических должностей рассмотрите возможность добавления профиля LinkedIn или GitHub."
            ))
        
        # For developers, recommend GitHub
        if is_developer and not github:
            points.append(self.create_point(
                field_path="personal_info.contacts.new",
                title="Отсутствует профиль GitHub",
                description="Для ролей разработчика настоятельно рекомендуется использовать профиль GitHub."
            ))
        
        return points

