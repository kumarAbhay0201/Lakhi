from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    backend_cors_origins: str = "http://localhost:3000"
    video_max_upload_size_bytes: int = 500 * 1024 * 1024
    video_max_duration_seconds: float = 180.0
    video_probe_timeout_seconds: float = 15.0
    video_upload_concurrency: int = 2
    ffprobe_path: str = "ffprobe"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.backend_cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
