from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel


class FixSuggestion(BaseModel):
    """Structured fix suggestion that can be auto-applied"""
    type: Literal['replace', 'add', 'delete']  # Type of fix operation
    field_path: str  # Exact JSON path to field
    original_content: Optional[Union[str, List[str]]] = None  # Original value before fix (for diff display)
    new_content: Optional[Union[str, List[str]]] = None  # New value (for replace/add)


class ImprovementPoint(BaseModel):
    """Single improvement suggestion for resume analysis"""
    id: str  # Unique point ID (e.g., "exp_0_no_achievements")
    rule_id: str  # Rule identifier (e.g., "missing_achievements")
    section_id: Literal['content', 'ats', 'style']  # Section category
    field_path: str  # JSON path (e.g., "work_experience[0].achievements")
    title: str  # Short title of the issue
    description: str  # Detailed description of the issue
    score_impact: int  # Points added if fixed (0-10)
    severity: Literal['high', 'medium', 'low']  # Severity level
    fix_suggestion: Optional[FixSuggestion] = None  # Structured fix (if available)
    metadata: Optional[Dict[str, Any]] = None  # Additional context
    is_fixed: bool = False  # Flag indicating if fix has been applied
    premium_only: bool = False  # Flag indicating if this point is only for premium users


class AnalysisSection(BaseModel):
    """Analysis section with improvement points"""
    id: Literal['content', 'ats', 'style']  # Section identifier
    title: str  # Display title
    current_points: int  # Current points (max_points - sum(score_impact))
    max_points: int  # Maximum achievable points
    percentage: int  # Completion percentage (0-100)
    status: Literal['NeedsWork', 'Good', 'Strong']  # Section status
    improvement_points: List[ImprovementPoint]  # List of improvements


class AnalysisResult(BaseModel):
    """Complete analysis result for a resume"""
    score: int  # Overall score (0-100)
    label: str  # 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'
    subtitle: str  # Motivational message
    sections: List[AnalysisSection]  # Analysis sections
    total_improvements: int  # Total number of suggestions
    potential_score: int  # Score if all improvements applied
    generated_at: datetime  # Timestamp

