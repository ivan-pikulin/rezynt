"""Rule 3.6: Personal Pronouns"""
import re
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class PersonalPronounsRule(BaseRule):
    """Detects and removes personal pronouns."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "medium"
        self.score_impact = 3
        self.check_type = "mechanical"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for personal pronouns."""
        points = []
        
        pronoun_pattern = r'\b(I|me|my|mine|we|our|ours)\b'
        
        # Check summary
        summary = resume.get('professional_summary', '')
        if re.search(pronoun_pattern, summary, re.IGNORECASE):
            points.append(self.create_point(
                field_path="professional_summary",
                title="Contains Personal Pronouns",
                description="Remove personal pronouns from summary",
                metadata={"original_text": summary}
            ))
        
        # Check achievements
        for i, exp in enumerate(resume.get('work_experience', [])):
            pronoun_count = 0
            
            for j, achievement in enumerate(exp.get('achievements', [])):
                if re.search(pronoun_pattern, achievement, re.IGNORECASE):
                    pronoun_count += 1
            
            if pronoun_count > 0:
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].achievements",
                    title="Contains Personal Pronouns",
                    description=f"Remove pronouns from {pronoun_count} bullet(s)"
                ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM removes pronouns."""
        original = context.get("original_text")
        
        if not original:
            return None
        
        return await llm_helper.remove_pronouns(original)

