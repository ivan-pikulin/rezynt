"""Rule: Achievements Without Metrics - Detects achievements without quantifiable metrics"""
import re
from typing import List

from app.schemas.analysis import FixSuggestion, ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class AchievementsWithoutMetricsRule(BaseRule):
    """Detects achievements without quantifiable metrics and adds them via LLM."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 6
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detect missing metrics and generate fixes via LLM in one pass."""
        points = []
        
        # Metric patterns for quick detection
        metric_patterns = [
            r'\d+%',           # 25%
            r'\$\d+',          # $50K
            r'\d+[KMB]',       # 10K, 5M
            r'\d+x',           # 2x
            r'\d+\s*(users|clients|projects|hours|days|teams|members|revenue|sales|cost|time|speed|performance)',
        ]
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            for j, achievement in enumerate(exp.get('achievements', [])):
                # Quick mechanical check
                has_metric = any(
                    re.search(pattern, achievement, re.IGNORECASE) 
                    for pattern in metric_patterns
                )
                
                if not has_metric and len(achievement) > 10:
                    # Generate fix via LLM using universal method with Structured Outputs
                    prompt = f"""Add specific quantifiable metrics to this achievement. Include numbers, percentages, dollar amounts, or measurable outcomes.

Achievement: "{achievement}"

If you can add metrics, set has_fix to true and provide the improved text in fixed_text.
If not possible, set has_fix to false and explain why in reasoning."""
                    
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
                        title="Missing Metrics",
                        description="Add specific metrics to quantify your impact",
                        fix_suggestion=fix_suggestion
                    ))
        
        return points

