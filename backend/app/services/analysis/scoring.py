"""Scoring calculations for resume analysis"""
from typing import List, Tuple

from app.schemas.analysis import AnalysisSection, ImprovementPoint


def calculate_section_score(
    improvement_points: List[ImprovementPoint]
) -> Tuple[int, int]:
    """
    Calculate section score by subtracting penalties from 100.
    
    Simple linear subtraction: score = max(0, 100 - total_penalty)
    
    Args:
        improvement_points: List of detected issues
    
    Returns:
        (current_score, total_impact): Current score and total potential gain
    """
    total_impact = sum(point.score_impact for point in improvement_points)
    current_score = max(0, 100 - total_impact)
    
    return current_score, total_impact


def calculate_overall_score(sections: List[AnalysisSection]) -> int:
    """
    Calculate overall score (0-100) by subtracting all penalties from 100.
    
    Each improvement point directly reduces the overall score by its score_impact.
    
    Args:
        sections: List of analysis sections with scores
    
    Returns:
        Overall score (0-100)
    """
    if not sections:
        return 100
    
    # Sum all penalties from all improvement points across all sections
    total_penalty = sum(
        point.score_impact 
        for section in sections 
        for point in section.improvement_points
    )
    
    return max(0, 100 - total_penalty)


def get_section_status(percentage: int) -> str:
    """
    Determine section status based on percentage.
    
    Args:
        percentage: Section completion percentage (0-100)
    
    Returns:
        Status: 'Strong', 'Good', or 'NeedsWork'
    """
    if percentage >= 80:
        return "Strong"
    elif percentage >= 60:
        return "Good"
    else:
        return "NeedsWork"

