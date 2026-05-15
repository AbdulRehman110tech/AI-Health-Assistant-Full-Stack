# ============================================================
# app/api/routes/health.py
# Health check endpoint
# ============================================================

from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(
    prefix="/api/v1/health",
    tags=["Health"],
)


@router.get("/", summary="Health Check")
def health_check():
    return {
        "status": "ok",
        "message": "AI Health Assistant API is running",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }