from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
import re
import unicodedata
import cyrtranslit


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # Project settings
    PROJECT_NAME: str = "Family Tree API"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]  # Frontend URL

    # Security settings
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database settings
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    # MinIO settings
    MINIO_HOST: str
    MINIO_PORT: int
    MINIO_ROOT_USER: str
    MINIO_ROOT_PASSWORD: str
    MINIO_BUCKET_NAME: str = "family-tree"
    MINIO_SECURE: bool = False

    @property
    def sync_database_url(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def async_database_url(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def minio_endpoint(self) -> str:
        return f"{self.MINIO_HOST}:{self.MINIO_PORT}"

    @property
    def minio_access_key(self) -> str:
        return self.MINIO_ROOT_USER

    @property
    def minio_secret_key(self) -> str:
        return self.MINIO_ROOT_PASSWORD

    @property
    def minio_secure(self) -> bool:
        return self.MINIO_SECURE

    @property
    def minio_bucket_name(self) -> str:
        return self.MINIO_BUCKET_NAME


def slugify(value: str) -> str:
    value = cyrtranslit.to_latin(str(value), 'ru')
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^a-zA-Z0-9]+', '-', value)
    value = value.strip('-').lower()
    return value


settings = Settings()