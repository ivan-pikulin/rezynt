from celery import Celery
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Log Redis configuration
logger.info(f"Celery Redis URL: {settings.redis.redis_url}")

celery_app = Celery(
    "rezynt",
    broker=settings.redis.redis_url,
    backend=settings.redis.redis_url,
    include=["app.core.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,  # Results expire after 1 hour
    task_track_started=True,  # Track when tasks start
    task_ignore_result=False,  # Don't ignore results
)
