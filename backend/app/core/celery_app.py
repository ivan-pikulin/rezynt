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
    # Memory and resource management
    worker_max_memory_per_child=500000,  # 500MB per worker process
    worker_max_tasks_per_child=10,  # Restart worker after 10 tasks to prevent memory leaks
    task_soft_time_limit=300,  # 5 minutes soft limit
    task_time_limit=600,  # 10 minutes hard limit
    worker_prefetch_multiplier=1,  # Process one task at a time
    task_acks_late=True,  # Acknowledge tasks only after completion
    worker_disable_rate_limits=True,  # Disable rate limiting for better performance
)
