"""Rule 3.5: Passive Voice"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class PassiveVoiceRule(BaseRule):
    """Detects passive voice and converts to active."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 4
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect passive voice patterns."""
        points = []
        
        # Common passive voice indicators
        passive_indicators = [
            'was ', 'were ', 'been ', 'being ',
            'was developed', 'was created', 'was implemented',
            'were used', 'were applied', 'been completed'
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            passive_achievements = []
            
            for j, achievement in enumerate(exp.get('achievements', [])):
                ach_lower = achievement.lower()
                
                if any(indicator in ach_lower for indicator in passive_indicators):
                    passive_achievements.append((j, achievement))
            
            if passive_achievements:
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements",
                    message=f"Convert {len(passive_achievements)} bullet(s) to active voice",
                    metadata={"passive_achievements": passive_achievements}
                ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM converts to active voice."""
        original = context.get("original_text")
        
        if not original:
            return None
        
        return await llm_helper.remove_passive_voice(original)

