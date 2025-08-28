from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr
import re
import unicodedata
import cyrtranslit


class EmailSettings(BaseSettings):
    EMAIL_HOST: str
    EMAIL_PORT: int
    EMAIL_USERNAME: str
    EMAIL_PASSWORD: SecretStr
    EMAIL_DOMAIN: str = "rezynt.com"
    EMAIL_DKIM_SELECTOR: str = "mail"
    EMAIL_DKIM_PRIVATE_KEY_PATH: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf8", extra="ignore")


class RedisSettings(BaseSettings):
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf8", extra="ignore")

    @property
    def redis_url(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


class OpenAISettings(BaseSettings):
    OPENAI_API_KEY: str
    OPENAI_PROXY_URL: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf8", extra="ignore")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # Project settings
    PROJECT_NAME: str = "Rezynt API"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    FRONTEND_BASE_URL: str
    API_BASE_URL: str

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

    # Email settings
    email: EmailSettings = EmailSettings()

    # Redis settings
    redis: RedisSettings = RedisSettings()

    # OpenAI settings
    openai: OpenAISettings = OpenAISettings()

    # Platform settings
    PLATFORM_SCRATCH_APP_KEY: str
    PLATFORM_UPLOAD_APP_KEY: str
    PLATFORM_APP_URL: str
    PLATFORM_TIMEOUT: int = 60
    
    # API Key for AI endpoints
    APP_API_KEY: str
    
    # PDF settings
    PDF_WATERMARK_PATH: str = "app/static/watermarks/watermark.svg"
    
    # Chat settings
    CHAT_HISTORY_MESSAGES_LIMIT: int = 5

    @property
    def sync_database_url(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def async_database_url(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


def slugify(value: str) -> str:
    value = cyrtranslit.to_latin(str(value), 'ru')
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^a-zA-Z0-9]+', '-', value)
    value = value.strip('-').lower()
    return value


settings = Settings()