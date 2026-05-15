# ============================================================
# app/core/config.py
# App-wide configuration
# ============================================================

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # --- App Identity ---
    APP_NAME: str = "AI Health Assistant API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Backend API for AI-powered disease prediction"

    # --- Environment ---
    DEBUG: bool = True

    # --- Server ---
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # --- CORS ---
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# This is the object main.py imports
settings = Settings()