"""Scoring calculations for resume analysis"""
from typing import List, Tuple

from app.schemas.analysis import AnalysisSection, ImprovementPoint
from app.services.analysis.config import AnalysisConfig


def calculate_section_score(
    improvement_points: List[ImprovementPoint],
    max_section_score: int
) -> Tuple[int, int]:
    """
    Calculate section score based on improvement points.
    
    Args:
        improvement_points: List of detected issues
        max_section_score: Maximum possible score for section
    
    Returns:
        (current_score, total_impact): Current score and total potential gain
    """
    total_impact = sum(point.score_impact for point in improvement_points)
    current_score = max(0, max_section_score - total_impact)
    
    return current_score, total_impact


def calculate_overall_score(sections: List[AnalysisSection]) -> int:
    """
    Calculate overall score (0-100) based on section weights.
    
    Weights:
        - Content & Structure: 50%
        - ATS Optimization: 30%
        - Style & Grammar: 20%
    
    Args:
        sections: List of analysis sections with scores
    
    Returns:
        Overall score (0-100)
    """
    weights = AnalysisConfig.SECTION_WEIGHTS
    max_scores = AnalysisConfig.MAX_SECTION_SCORES
    
    total_score = 0.0
    for section in sections:
        if section.id in max_scores and max_scores[section.id] > 0:
            section_percentage = (section.current_points / max_scores[section.id]) * 100
            total_score += section_percentage * weights[section.id]
    
    return int(total_score)


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

