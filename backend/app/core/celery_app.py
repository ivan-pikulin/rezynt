from celery import Celery
from app.core.config import settings

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
)
