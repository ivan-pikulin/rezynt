from app.database.base_class import Base

def setup_relationships():
    from .user import setup_user_relationships

    setup_user_relationships()


