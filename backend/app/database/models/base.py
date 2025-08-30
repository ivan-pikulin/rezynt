from app.database.base_class import Base

def setup_relationships():
    from .user import User
    from .resume import Resume
