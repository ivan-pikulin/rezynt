"""Rule 3.4: Filler Phrases"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class FillerPhrasesRule(BaseRule):
    """Detects and removes filler phrases."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 2
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for filler phrases."""
        points = []
        
        filler_phrases = [
            'in order to',
            'moreover',
            'additionally',
            'furthermore',
            'as well as',
            'in addition to',
            'it should be noted that',
            'it is important to',
            'basically',
            'actually',
            'literally'
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                ach_lower = achievement.lower()
                found_fillers = [filler for filler in filler_phrases if filler in ach_lower]
                
                if found_fillers:
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        title="Contains Filler Phrases",
                        description=f"Remove filler phrase: '{found_fillers[0]}'",
                        metadata={"original_text": achievement, "fillers": found_fillers}
                    ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM removes filler phrases."""
        original = context.get("original_text")
        fillers = context.get("fillers", [])
        
        if not original or not fillers:
            return None
        
        return await llm_helper.remove_filler(original, fillers)

