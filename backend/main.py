# ============================================================
# main.py
# FastAPI Application Entry Point
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
#from app.api.routes import health, prediction
from app.api.routes import health, prediction, auth
from app.api.routes import health, prediction, auth, history

# ============================================================
# TAGS METADATA
# Controls section order and descriptions in Swagger UI
# ============================================================

tags_metadata = [
    {
        "name": "Health",
        "description": "Server health check. Use to confirm the API is running.",
    },
    {
        "name": "Prediction",
        "description": (
            "AI-powered disease prediction endpoints. "
            "Send symptoms, receive disease predictions with confidence scores."
        ),
    },
    {
        "name": "Root",
        "description": "Root endpoint. Returns API info and useful links.",
    },
]

# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    contact={
        "name": "AI Health Assistant — Semester Project",
    },
    license_info={
        "name": "MIT",
    },
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================================================
# CORS MIDDLEWARE
# Allows React frontend (port 3000) to call this backend (port 8000)
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# REGISTER ROUTES
# ============================================================

app.include_router(health.router)
app.include_router(prediction.router)
app.include_router(auth.router)
app.include_router(history.router)

# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/", tags=["Root"], summary="API Root")
def root():
    """
    Returns API name, version, and links to docs and health check.
    """
    return {
        "app":     settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs":    "http://127.0.0.1:8000/docs",
        "health":  "http://127.0.0.1:8000/api/v1/health/",
        "predict": "http://127.0.0.1:8000/api/v1/predict",
    }

# ============================================================
# DIRECT RUN SUPPORT
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )