"""Rule 2.5: Inconsistent Date Formats"""
import re
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class InconsistentDateFormatsRule(BaseRule):
    """Detects inconsistent date formats across resume."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "ats"
        self.severity = "medium"
        self.score_impact = 3
        self.check_type = "mechanical"
        self.action_type = "fix"
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check for multiple date formats."""
        points = []
        
        # Collect dates by section
        work_dates = []
        edu_dates = []
        
        # Collect work experience dates
        for exp in resume.get('work_experience', []):
            if exp.get('start_date'):
                work_dates.append(exp['start_date'])
            if exp.get('end_date'):
                work_dates.append(exp['end_date'])
        
        # Collect education dates
        for edu in resume.get('education', []):
            if edu.get('start_date'):
                edu_dates.append(edu['start_date'])
            if edu.get('end_date'):
                edu_dates.append(edu['end_date'])
        
        all_dates = work_dates + edu_dates
        
        if len(all_dates) < 2:
            return points
        
        # Define date format patterns
        formats = {
            'YYYY-MM-DD': r'^\d{4}-\d{2}-\d{2}$',
            'Mon YYYY': r'^[A-Za-z]{3}\s\d{4}$',
            'Month YYYY': r'^[A-Za-z]+\s\d{4}$',
            'MM/YYYY': r'^\d{2}/\d{4}$',
        }
        
        # Detect formats
        detected_formats = set()
        for date_str in all_dates:
            date_lower = date_str.lower()
            if date_lower in ['present', 'current', 'now']:
                continue
            for fmt_name, pattern in formats.items():
                if re.match(pattern, date_str):
                    detected_formats.add(fmt_name)
                    break
        
        # If more than one format detected, create points
        if len(detected_formats) > 1:
            formats_str = ', '.join(detected_formats)
            
            if work_dates:
                points.append(self.create_point(
                    field_path="work_experience",
                    title="Inconsistent Date Formats",
                    description=f"Standardize date format in work experience (found: {formats_str})"
                ))
            
            if edu_dates:
                points.append(self.create_point(
                    field_path="education",
                    title="Inconsistent Date Formats",
                    description=f"Standardize date format in education (found: {formats_str})"
                ))
        
        return points

