from app.core.config import settings
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

engine = create_async_engine(
    settings.async_database_url, 
    pool_pre_ping=True,
    echo=False
)
SessionLocal = async_sessionmaker(
    engine, 
    expire_on_commit=False
)
