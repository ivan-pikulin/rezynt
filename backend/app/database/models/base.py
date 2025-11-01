from app.database.base_class import Base

def setup_relationships():
    """Import all models to ensure they are registered with SQLAlchemy"""
    from .user import User
    from .temp_resume_file import TempResumeFile
