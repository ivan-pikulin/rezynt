"""Rule 3.7: Jargon and Buzzwords"""
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class BuzzwordsRule(BaseRule):
    """Detects and replaces buzzwords with specific terms via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "style"
        self.severity = "low"
        self.score_impact = 3
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect buzzwords and generate specific alternatives."""
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
        
        if summary_buzzwords:
            # Generate fix via LLM with Structured Outputs
            prompt = f"""Replace these buzzwords with concrete, specific terms and examples.

Original: "{summary_text}"
Buzzwords to replace: {', '.join(summary_buzzwords)}

Set has_fix to true and provide the improved text in fixed_text."""
            
            fix_response = await llm_helper.call_llm_structured(prompt)
            
            fix_suggestion = None
            if fix_response.has_fix and fix_response.fixed_text:
                fix_suggestion = FixSuggestion(
                    type="replace",
                    field_path="professional_summary",
                    original_content=summary_text,
                    new_content=fix_response.fixed_text
                )
            
            points.append(self.create_point(
                field_path="professional_summary",
                title="Contains Buzzwords",
                description=f"Replace buzzwords with specific terms: {', '.join(summary_buzzwords[:3])}",
                fix_suggestion=fix_suggestion
            ))
        
        # Check achievements
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                found_buzzwords = [bw for bw in buzzwords if bw in achievement.lower()]
                
                if found_buzzwords:
                    # Generate fix via LLM with Structured Outputs
                    prompt = f"""Replace these buzzwords with concrete, specific terms and examples.

Original: "{achievement}"
Buzzwords to replace: {', '.join(found_buzzwords)}

Set has_fix to true and provide the improved text in fixed_text."""
                    
                    fix_response = await llm_helper.call_llm_structured(prompt)
                    
                    fix_suggestion = None
                    if fix_response.has_fix and fix_response.fixed_text:
                        fix_suggestion = FixSuggestion(
                            type="replace",
                            field_path=f"work_experience[{i}].achievements[{j}]",
                            original_content=achievement,
                            new_content=fix_response.fixed_text
                        )
                    
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        title="Contains Buzzwords",
                        description=f"Replace: {', '.join(found_buzzwords[:2])}",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points
