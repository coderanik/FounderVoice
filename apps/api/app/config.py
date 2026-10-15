from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
EXPORT_DIR = DATA_DIR / "exports"
DB_PATH = DATA_DIR / "pitchos.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "PitchOS"
    api_prefix: str = "/api"
    database_url: str = f"sqlite:///{DB_PATH}"
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"
    whisper_model: str = "whisper-1"
    # local | openai | auto — local is default (faster-whisper, no API key)
    stt_backend: str = "local"
    local_whisper_model: str = "base"
    local_whisper_device: str = "auto"  # auto | cpu | cuda
    stt_high_quality: bool = True  # higher beam for cleaner hi/en transcripts
    audio_denoise: bool = True
    audio_denoise_strength: float = 0.75  # 0..1 prop_decrease for noisereduce
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    strict_mode_default: bool = True
    demo_mode: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return Settings()
