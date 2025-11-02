from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel


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
    check_type: Literal['mechanical', 'llm', 'llm_assisted']  # How the check is performed
    action_type: Literal['go_to_edit', 'fix', 'both']  # Available user actions
    fix_suggestion: Optional[str] = None  # LLM-generated fix (if available)
    metadata: Optional[Dict[str, Any]] = None  # Additional context


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


class ApplyFixRequest(BaseModel):
    """Request schema for applying a fix to an improvement point"""
    point_id: str  # ID of the improvement point
    field_path: str  # Field path to apply the fix


class ApplyFixResponse(BaseModel):
    """Response schema for applied fix"""
    original: str  # Original text
    fixed: str  # Fixed text
    field_path: str  # Field path where fix was applied

