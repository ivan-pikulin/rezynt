"""Configuration for resume analysis engine"""


class AnalysisConfig:
    """Configuration values for resume analysis"""
    
    # Content thresholds
    MIN_SUMMARY_LENGTH = 100
    MAX_SUMMARY_LENGTH = 500
    MIN_SKILLS_COUNT = 6
    MAX_SKILLS_COUNT = 15
    MIN_ACHIEVEMENTS_COUNT = 3
    MAX_ACHIEVEMENTS_COUNT = 8
    MAX_BULLET_WORDS = 25
    MIN_RESUME_WORDS = 300
    MAX_RESUME_WORDS = 1500
    
    # Date thresholds
    EMPLOYMENT_GAP_MONTHS = 6
    
    # LLM settings
    ENABLE_LLM_CHECKS = True
    LLM_MODEL = "gpt-4.1-mini"
    LLM_TEMPERATURE = 0.3
    
    # Cache settings
    CACHE_TTL = 300  # 5 minutes
    USE_REDIS = True
    
    # Score labels
    SCORE_LABELS = {
        (90, 100): ("Отлично", "Отличное резюме!"),
        (80, 89): ("Сильное", "Почти идеально!"),
        (60, 79): ("Хорошо", "Выглядит уверенно!"),
        (40, 59): ("Средне", "Вы на верном пути!"),
        (0, 39): ("Слабо", "Давайте поработаем над ним!")
    }
    
    @classmethod
    def get_score_label(cls, score: int) -> tuple[str, str]:
        """Get label and subtitle for a given score"""
        for (min_score, max_score), (label, subtitle) in cls.SCORE_LABELS.items():
            if min_score <= score <= max_score:
                return label, subtitle
        return "Слабо", "Давайте поработаем над ним!"
