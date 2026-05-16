from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


# ============================================================
# Database URL
# ============================================================

DATABASE_URL = settings.DATABASE_URL


# ============================================================
# SQLAlchemy Engine
# ============================================================

engine = create_engine(
    DATABASE_URL
)


# ============================================================
# Session Factory
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ============================================================
# Base Class For Models
# ============================================================

Base = declarative_base()


# ============================================================
# Database Dependency
# ============================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()