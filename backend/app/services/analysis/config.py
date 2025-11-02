"""Configuration for resume analysis engine"""


class AnalysisConfig:
    """Configuration values for resume analysis"""
    
    # Content thresholds
    MIN_SUMMARY_LENGTH = 100
    MAX_SUMMARY_LENGTH = 500
    MIN_SKILLS_COUNT = 8
    MAX_SKILLS_COUNT = 20
    MAX_BULLET_WORDS = 25
    MIN_RESUME_WORDS = 300
    MAX_RESUME_WORDS = 1500
    
    # Date thresholds
    EMPLOYMENT_GAP_MONTHS = 6
    
    # Section weights for overall score calculation
    SECTION_WEIGHTS = {
        'content': 0.50,  # 50%
        'ats': 0.30,      # 30%
        'style': 0.20     # 20%
    }
    
    # Maximum possible scores per section
    # Note: These are target maximums. The actual max_points for each section
    # is calculated dynamically by summing all possible score_impact values
    # from rules in that section. Current score = max_points - sum(detected_impacts)
    MAX_SECTION_SCORES = {
        'content': 100,
        'ats': 60,
        'style': 40
    }
    
    # LLM settings
    ENABLE_LLM_CHECKS = True
    LLM_MODEL = "gpt-4o-mini"
    LLM_TEMPERATURE = 0.3
    
    # Cache settings
    CACHE_TTL = 300  # 5 minutes
    USE_REDIS = True
    
    # Score labels
    SCORE_LABELS = {
        (90, 100): ("Excellent", "Outstanding resume!"),
        (80, 89): ("Strong", "Almost perfect!"),
        (60, 79): ("Good", "Looking solid!"),
        (40, 59): ("Fair", "You're on the right track!"),
        (0, 39): ("Weak", "Let's work on it!")
    }
    
    @classmethod
    def get_score_label(cls, score: int) -> tuple[str, str]:
        """Get label and subtitle for a given score"""
        for (min_score, max_score), (label, subtitle) in cls.SCORE_LABELS.items():
            if min_score <= score <= max_score:
                return label, subtitle
        return "Weak", "Let's work on it!"

