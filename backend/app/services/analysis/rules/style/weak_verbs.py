"""Rule 3.2: Weak Action Verbs"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class WeakVerbsRule(BaseRule):
    """Detects weak action verbs and suggests improvements."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 4
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect weak verbs in achievements."""
        points = []
        
        weak_verbs = [
            'helped', 'assisted', 'participated', 'involved',
            'worked on', 'dealt with', 'handled', 'did',
            'made', 'got', 'tried', 'attempted'
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            weak_achievements = []
            
            for j, achievement in enumerate(exp.get('achievements', [])):
                ach_lower = achievement.lower()
                found_weak = None
                
                for weak in weak_verbs:
                    if weak in ach_lower[:30]:  # Check beginning of sentence
                        found_weak = weak
                        break
                
                if found_weak:
                    weak_achievements.append((j, achievement, found_weak))
            
            # If multiple weak verbs found, create improvement point
            if len(weak_achievements) >= 2:
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements",
                    message=f"Replace weak verbs with stronger alternatives in {len(weak_achievements)} bullets",
                    metadata={"weak_achievements": weak_achievements}
                ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM improves verbs."""
        original = context.get("original_text")
        
        if not original:
            return None
        
        return await llm_helper.improve_verb(original)

