from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker

# Async engine for main application
engine = create_async_engine(
    settings.async_database_url, 
    pool_pre_ping=True,
    pool_recycle=3600,  # Recycle connections every hour
    pool_size=10,       # Number of connections to maintain in pool
    max_overflow=20,    # Additional connections that can be created on demand
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
    pool_recycle=3600,  # Recycle connections every hour
    pool_size=5,        # Number of connections to maintain in pool
    max_overflow=10,    # Additional connections that can be created on demand
    echo=False
)
SyncSessionLocal = sessionmaker(
    sync_engine,
    expire_on_commit=False
)
