"""Rule 3.7: Jargon and Buzzwords"""
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class BuzzwordsRule(BaseRule):
    """Detects and replaces buzzwords with specific terms."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 3
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for buzzwords."""
        points = []
        
        buzzwords = [
            'synergy', 'leverage', 'paradigm', 'disruptive',
            'innovative', 'cutting-edge', 'best-in-class',
            'world-class', 'rockstar', 'ninja', 'guru',
            'think outside the box', 'game-changer',
            'strategic', 'dynamic', 'results-oriented'
        ]
        
        # Check professional summary
        summary_text = resume.get('professional_summary', '')
        summary_buzzwords = [bw for bw in buzzwords if bw in summary_text.lower()]
        
        # Check work experience
        experience_text = ''
        for exp in resume.get('work_experience', []):
            experience_text += ' ' + ' '.join(exp.get('achievements', []))
        experience_buzzwords = [bw for bw in buzzwords if bw in experience_text.lower()]
        
        # Create separate points for each section
        if summary_buzzwords:
            points.append(self.create_point(
                field_path="professional_summary",
                title="Contains Buzzwords",
                description=f"Replace buzzwords with specific terms: {', '.join(summary_buzzwords[:3])}",
                metadata={"buzzwords": summary_buzzwords, "original_text": summary_text}
            ))
        
        if experience_buzzwords:
            points.append(self.create_point(
                field_path="work_experience",
                title="Contains Buzzwords",
                description=f"Replace buzzwords with specific terms: {', '.join(experience_buzzwords[:3])}",
                metadata={"buzzwords": experience_buzzwords}
            ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM replaces buzzwords."""
        original = context.get("original_text")
        buzzwords = context.get("buzzwords", [])
        
        if not original or not buzzwords:
            return None
        
        return await llm_helper.replace_buzzwords(original, buzzwords)

