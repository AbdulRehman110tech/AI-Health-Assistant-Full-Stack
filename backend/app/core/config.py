# ============================================================
# app/core/config.py
# Centralized Application Configuration
# ============================================================

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # --------------------------------------------------------
    # App Identity
    # --------------------------------------------------------

    APP_NAME: str = "AI Health Assistant API"

    APP_VERSION: str = "1.0.0"

    APP_DESCRIPTION: str = (
        "## AI Health Assistant\n\n"
        "A FastAPI backend for AI-powered disease prediction "
        "using a trained Random Forest Classifier.\n\n"
        "### Features\n"
        "- Disease prediction from symptoms\n"
        "- Confidence scoring\n"
        "- Top 3 alternative predictions\n"
        "- Full symptom list retrieval\n\n"
        "### How To Use\n"
        "1. Call `GET /api/v1/symptoms` to get valid symptom names\n"
        "2. Call `POST /api/v1/predict` with selected symptoms\n"
        "3. Receive predicted disease with confidence scores"
    )

    # --------------------------------------------------------
    # Environment
    # --------------------------------------------------------

    DEBUG: bool = True

    # --------------------------------------------------------
    # Server Configuration
    # --------------------------------------------------------

    HOST: str = "127.0.0.1"

    PORT: int = 8000

    # --------------------------------------------------------
    # Database Configuration
    # --------------------------------------------------------

    DATABASE_URL: str
# --------------------------------------------------------
    # JWT Configuration
    # --------------------------------------------------------

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENROUTER_API_KEY: str


    # --------------------------------------------------------
    # CORS Configuration
    # --------------------------------------------------------

    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # --------------------------------------------------------
    # Environment File Configuration
    # --------------------------------------------------------

    class Config:

        env_file = ".env"

        env_file_encoding = "utf-8"


# Global settings object
settings = Settings()

