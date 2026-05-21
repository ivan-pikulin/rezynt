"""Rule: Date Validation - Validates date format and logic"""
from datetime import datetime
from typing import List

from app.schemas.analysis import ImprovementPoint
from app.services.analysis.rules.base import BaseRule


class DateValidationRule(BaseRule):
    """Validates date format and logic for work experience."""
    
    def __init__(self):
        super().__init__()
        self.section_id = "content"
        self.severity = "high"
        self.score_impact = 7
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
    
    async def check(self, resume: dict) -> List[ImprovementPoint]:
        """Check date format and logic."""
        points = []
        
        for i, exp in enumerate(resume.get('work_experience') or []):
            start_date_str = (exp.get('start_date') or '').strip()
            end_date_str = (exp.get('end_date') or '').strip()
            
            # Check start date format
            if start_date_str:
                try:
                    start_date = self._parse_date(start_date_str)
                    # Check if date is in future
                    if start_date > datetime.now():
                        points.append(self.create_point(
                            field_path=f"work_experience[{i}].start_date",
                            title="Неверная дата начала",
                            description="Дата начала не может быть в будущем."
                        ))
                except ValueError:
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].start_date",
                        title="Неверный формат даты",
                        description="Используйте формат ГГГГ-ММ или «Месяц ГГГГ»."
                    ))
            
            # Check end date format and logic
            if end_date_str and end_date_str.lower() not in ['present', 'current', 'now', '']:
                try:
                    end_date = self._parse_date(end_date_str)
                    # Check if date is in future
                    if end_date > datetime.now():
                        points.append(self.create_point(
                            field_path=f"work_experience[{i}].end_date",
                            title="Неверная дата окончания",
                            description="Дата окончания не может быть в будущем."
                        ))
                    
                    # Check if start_date < end_date
                    if start_date_str:
                        try:
                            start_date = self._parse_date(start_date_str)
                            if start_date >= end_date:
                                points.append(self.create_point(
                                    field_path=f"work_experience[{i}].end_date",
                                    title="Неверный диапазон дат",
                                    description="Дата окончания должна быть позже даты начала."
                                ))
                        except ValueError:
                            pass
                except ValueError:
                    points.append(self.create_point(
                        field_path=f"work_experience[{i}].end_date",
                        title="Неверный формат даты",
                        description="Используйте формат ГГГГ-ММ или «Месяц ГГГГ»."
                    ))
        
        return points

