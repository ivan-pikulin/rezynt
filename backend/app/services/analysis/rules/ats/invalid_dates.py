"""Rule 2.3: Invalid Date Ranges"""
from datetime import datetime
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class InvalidDatesRule(BaseRule):
    """Detects invalid or missing dates in work experience."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "high"
        self.score_impact = 6
        self.check_type = "mechanical"
        self.action_type = "go_to_edit"
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string using common formats."""
        formats = [
            "%Y-%m-%d",      # 2020-01-15
            "%Y/%m/%d",      # 2020/01/15
            "%b %Y",         # Jan 2020
            "%B %Y",         # January 2020
            "%m/%Y",         # 01/2020
            "%Y-%m",         # 2020-01
            "%Y",            # 2020
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        raise ValueError(f"Unable to parse date: {date_str}")
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for missing or invalid dates."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience', [])):
            start_date_str = exp.get('start_date', '')
            end_date_str = exp.get('end_date', '')
            
            if not start_date_str:
                points.append(self.create_point(
                    field_path=f"work_experience[{i}].start_date",
                    title="Missing Start Date",
                    description="Add start date for this position"
                ))
                continue
            
            try:
                start_date = self._parse_date(start_date_str)
                
                # If end_date exists and is not "Present", validate
                if end_date_str and end_date_str.lower() not in ['present', 'current', 'now']:
                    end_date = self._parse_date(end_date_str)
                    
                    # Check if start_date > end_date
                    if start_date > end_date:
                        points.append(self.create_point(
                            field_path=f"work_experience[{i}]",
                            title="Invalid Date Range",
                            description="Start date is after end date - please correct"
                        ))
            except (ValueError, Exception):
                points.append(self.create_point(
                    field_path=f"work_experience[{i}]",
                    title="Inconsistent Date Format",
                    description="Use consistent date format (e.g., 'Jan 2020')"
                ))
        
        return points

