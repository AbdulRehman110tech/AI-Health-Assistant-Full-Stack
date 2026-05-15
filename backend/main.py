# ============================================================
# main.py
# FastAPI Application Entry Point
# Place this file at: backend/main.py
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import health
from app.api.routes import prediction

# ============================================================
# 1. CREATE THE FASTAPI APPLICATION
# ============================================================
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================================================
# 2. CONFIGURE CORS MIDDLEWARE
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 3. REGISTER ROUTE FILES
# ============================================================
app.include_router(health.router)
app.include_router(prediction.router)

# ============================================================
# 4. ROOT ENDPOINT
# ============================================================
@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "http://127.0.0.1:8000/docs",
        "health": "http://127.0.0.1:8000/api/v1/health/",
    }

# ============================================================
# 5. DIRECT RUN SUPPORT
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )