# ============================================================
# app/models/user.py
# User ORM Model
# ============================================================

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class User(Base):

    __tablename__ = "users"

    # --- Primary Key ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Identity (unique + indexed for fast lookup) ---
    username = Column(String(50),  unique=True, nullable=False, index=True)
    email    = Column(String(255), unique=True, nullable=False, index=True)

    # --- Security ---
    hashed_password = Column(String(255), nullable=False)

    # --- Account Status ---
    is_active = Column(Boolean, default=True, nullable=False)

    # --- Timestamps ---
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=True,
    )

    # --- Relationships ---
    # cascade="all, delete-orphan" means if User is deleted,
    # their Patient profile is also deleted automatically
    patient = relationship(
        "Patient",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<User id={self.id} username={self.username} active={self.is_active}>"