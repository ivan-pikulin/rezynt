"""Rule 1.8: Missing Technologies/Tools"""
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class MissingTechnologiesRule(BaseRule):
    """Detects missing technologies/tools in work experience."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "medium"
        self.score_impact = 5
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Mechanical check for technologies_tools field."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            technologies = exp.get('technologies_tools', [])
            if not technologies or len(technologies) == 0:
                job_title = exp.get('job_title', 'this role')
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].technologies_tools",
                    message=f"List technologies used in {job_title}"
                ))
        
        return points

