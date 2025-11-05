"""Configuration for resume analysis engine"""


class AnalysisConfig:
    """Configuration values for resume analysis"""
    
    # Content thresholds
    MIN_SUMMARY_LENGTH = 100
    MAX_SUMMARY_LENGTH = 500
    MIN_SKILLS_COUNT = 6
    MAX_SKILLS_COUNT = 15
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
    # Scoring logic: Start with MAX and subtract penalties using exponential decay
    # Formula: score = MIN + (MAX - MIN) * exp(-k * penalty_ratio)
    # - Penalties decrease score quickly near 100, slower near minimum
    # - Score never goes below MIN_SCORE_RATIO * MAX (asymptotic floor)
    # - See scoring.py for implementation details
    MAX_SECTION_SCORES = {
        'content': 100,
        'ats': 60,
        'style': 40
    }
    
    # Scoring behavior configuration
    MIN_SCORE_RATIO = 0.15      # Minimum score as ratio of max (15% floor)
    DECAY_COEFFICIENT = 2.5     # How fast score drops (higher = more aggressive)
    # Examples with DECAY_COEFFICIENT = 2.5:
    # - 10 points penalty / 100 max → ~92 score (8% drop)
    # - 30 points penalty / 100 max → ~70 score (30% drop)
    # - 100 points penalty / 100 max → ~35 score (65% drop)
    # - 200 points penalty / 100 max → ~20 score (approaches 15 floor)
    
    # LLM settings
    ENABLE_LLM_CHECKS = True
    LLM_MODEL = "gpt-4.1-mini"
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

