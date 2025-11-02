"""Rule 3.8: Missing Action Verbs"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class MissingActionVerbsRule(BaseRule):
    """Detects bullets not starting with strong action verbs."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 4
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check if bullets start with action verbs."""
        points = []
        
        # Strong action verbs (past and present tense)
        action_verbs = [
            'led', 'managed', 'developed', 'implemented', 'created',
            'designed', 'built', 'architected', 'optimized', 'increased',
            'reduced', 'improved', 'launched', 'delivered', 'achieved',
            'lead', 'manage', 'develop', 'implement', 'create',
            'design', 'build', 'architect', 'optimize', 'increase',
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            weak_bullets = []
            
            for j, achievement in enumerate(exp.get('achievements', [])):
                # Skip empty or whitespace-only achievements
                if not achievement or not achievement.strip():
                    continue
                    
                words = achievement.split()
                if not words:  # Skip if no words after split
                    continue
                    
                first_word = words[0].lower().strip('.,;:-')
                
                if first_word not in action_verbs:
                    weak_bullets.append((j, achievement))
            
            if len(weak_bullets) >= 2:
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements",
                    message=f"{len(weak_bullets)} bullets don't start with action verbs",
                    metadata={"weak_bullets": weak_bullets[:3]}
                ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM adds action verbs."""
        original = context.get("original_text")
        
        if not original:
            return None
        
        return await llm_helper.improve_verb(original)

