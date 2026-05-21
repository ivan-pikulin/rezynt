"""Rule: Employment Gaps - Detects significant employment gaps"""
from datetime import datetime
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule
from app.services.analysis.config import AnalysisConfig


class EmploymentGapsRule(BaseRule):
    """Detects significant employment gaps."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "medium"
        self.score_impact = 3
        self.premium_only = False
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string using common formats."""
        formats = [
            "%Y-%m-%d", "%Y/%m/%d", "%b %Y", "%B %Y",
            "%m/%Y", "%Y-%m", "%Y",
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        raise ValueError(f"Unable to parse date: {date_str}")
    
    def _months_between(self, date1: datetime, date2: datetime) -> int:
        """Calculate number of months between two dates."""
        return (date1.year - date2.year) * 12 + (date1.month - date2.month)
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for employment gaps."""
        points = []
        experiences = resume.get('work_experience', [])
        
        if len(experiences) < 2:
            return points
        
        # Create a map of experience to original index
        exp_to_index = {id(exp): idx for idx, exp in enumerate(experiences)}
        
        # Sort by start_date
        def get_sort_date(exp):
            try:
                return self._parse_date(exp.get('start_date', '1900-01-01'))
            except:
                return datetime(1900, 1, 1)
        
        sorted_exp = sorted(experiences, key=get_sort_date, reverse=True)
        
        for i in range(len(sorted_exp) - 1):
            current = sorted_exp[i]
            previous = sorted_exp[i + 1]
            
            try:
                # End date of previous job
                prev_end_str = previous.get('end_date', '')
                if prev_end_str.lower() in ['present', 'current', 'now']:
                    continue
                    
                prev_end = self._parse_date(prev_end_str)
                current_start = self._parse_date(current.get('start_date'))
                
                # Calculate gap in months
                gap_months = self._months_between(current_start, prev_end)
                
                # Flag if gap > configured threshold
                if gap_months > AnalysisConfig.EMPLOYMENT_GAP_MONTHS:
                    # Point to the later job (current) where user can add explanation
                    current_index = exp_to_index[id(current)]
                    
                    points.append(self.create_point(
                        field_path=f"work_experience[{current_index}].short_description",
                        title="Обнаружен разрыв в занятости",
                        description=f"Обнаружен разрыв в {gap_months} месяца – рассмотрите возможность добавления объяснения",
                        metadata={"gap_months": gap_months}
                    ))
            except (ValueError, Exception):
                continue
        
        return points

