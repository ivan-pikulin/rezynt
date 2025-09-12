from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker

# Async engine for main application
engine = create_async_engine(
    settings.async_database_url, 
    pool_pre_ping=True,
    echo=False
)
SessionLocal = async_sessionmaker(
    engine, 
    expire_on_commit=False
)

# Sync engine for Celery tasks (to avoid async event loop conflicts)
sync_engine = create_engine(
    settings.sync_database_url,  # Use sync database URL
    pool_pre_ping=True,
    echo=False
)
SyncSessionLocal = sessionmaker(
    sync_engine,
    expire_on_commit=False
)
