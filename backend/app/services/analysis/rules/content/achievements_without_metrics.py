"""Rule 1.2: Achievements Without Metrics"""
import re
from typing import List, Optional

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.llm_helper import llm_helper


class AchievementsWithoutMetricsRule(BaseRule):
    """Detects achievements without quantifiable metrics and adds them."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 6
        self.check_type = "llm"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Detection uses heuristics for speed/cost, but could enhance with LLM."""
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
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].achievements[{j}]",
                        title="Missing Metrics",
                        description="Add specific metrics to quantify your impact",
                        metadata={"original_text": achievement}
                    ))
        
        return points
    
    async def get_fix(self, context: dict) -> Optional[str]:
        """LLM generates version with metrics."""
        original = context.get("original_text")
        
        if not original:
            return None
        
        return await llm_helper.add_metrics_to_achievement(
            achievement=original,
            prompt=(
                "Add specific quantifiable metrics (percentages, dollar amounts, "
                "numbers of users/projects, time saved) to make this achievement "
                "more concrete and impressive. Keep the core message the same."
            )
        )

