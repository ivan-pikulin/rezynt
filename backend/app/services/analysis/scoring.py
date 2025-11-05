"""Scoring calculations for resume analysis"""
import math
from typing import List, Tuple

from app.schemas.analysis import AnalysisSection, ImprovementPoint
from app.services.analysis.config import AnalysisConfig


def calculate_section_score(
    improvement_points: List[ImprovementPoint],
    max_section_score: int
) -> Tuple[int, int]:
    """
    Calculate section score using exponential decay formula.
    
    Score starts at max_section_score and decreases exponentially based on penalties.
    The more issues found, the lower the score, but it never reaches zero.
    
    Formula: score = MIN + (MAX - MIN) * exp(-k * penalty_ratio)
    
    Where:
    - penalty_ratio = total_penalty / expected_max_penalty
    - k = decay coefficient (higher = faster drop near max score)
    - MIN = minimum asymptotic score (floor)
    
    Args:
        improvement_points: List of detected issues
        max_section_score: Maximum possible score for section
    
    Returns:
        (current_score, total_impact): Current score and total potential gain
    """
    total_impact = sum(point.score_impact for point in improvement_points)
    
    if total_impact == 0:
        return max_section_score, 0
    
    # Get configuration from AnalysisConfig
    MIN_SCORE_RATIO = AnalysisConfig.MIN_SCORE_RATIO
    DECAY_COEFFICIENT = AnalysisConfig.DECAY_COEFFICIENT
    
    # Expected max penalty is roughly 1.5x the section max
    # (assumes you could have more issues than the max score)
    expected_max_penalty = max_section_score * 1.5
    
    # Calculate penalty ratio (0 to 1+)
    penalty_ratio = total_impact / expected_max_penalty
    
    # Calculate minimum score
    min_score = max_section_score * MIN_SCORE_RATIO
    
    # Exponential decay formula
    # When penalty_ratio = 0 → score = max_section_score
    # When penalty_ratio increases → score drops quickly at first, then slowly
    # When penalty_ratio → infinity → score → min_score
    current_score = min_score + (max_section_score - min_score) * math.exp(-DECAY_COEFFICIENT * penalty_ratio)
    
    return int(current_score), total_impact


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

