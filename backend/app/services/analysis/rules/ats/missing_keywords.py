"""Rule 2.2: Missing Important Keywords"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingKeywordsRule(BaseRule):
    """Suggests relevant keywords based on role."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "high"
        self.score_impact = 7
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Simple keyword matching - could be enhanced with LLM."""
        points = []
        current_role = resume.get('personal_info', {}).get('current_role', '')
        skills = resume.get('skills', [])
        
        # Common tech keywords by domain
        keyword_sets = {
            'data': ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Analytics'],
            'ml': ['PyTorch', 'TensorFlow', 'Scikit-learn', 'Deep Learning', 'NLP'],
            'machine learning': ['PyTorch', 'TensorFlow', 'Scikit-learn', 'Deep Learning', 'NLP'],
            'backend': ['API', 'REST', 'Database', 'Docker', 'Kubernetes'],
            'frontend': ['React', 'Vue', 'Angular', 'TypeScript', 'CSS'],
            'devops': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Azure', 'GCP'],
        }
        
        role_lower = current_role.lower()
        missing_keywords = []
        
        for domain, keywords in keyword_sets.items():
            if domain in role_lower:
                for keyword in keywords:
                    if not any(keyword.lower() in skill.lower() for skill in skills):
                        missing_keywords.append(keyword)
        
        if missing_keywords:
            points.append(self.create_point(
                field_path="skills",
                message=f"Consider adding: {', '.join(missing_keywords[:5])}",
                metadata={"suggested_keywords": missing_keywords}
            ))
        
        return points

