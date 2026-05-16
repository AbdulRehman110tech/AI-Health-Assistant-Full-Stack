# ============================================================
# app/models/patient.py
# Patient ORM Model
# ============================================================

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class Patient(Base):

    __tablename__ = "patients"

    # --- Primary Key ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Foreign Key ---
    # unique=True enforces one-to-one with User
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # --- Profile ---
    full_name    = Column(String(100), nullable=False)
    age          = Column(Integer,     nullable=True)
    gender       = Column(String(10),  nullable=True)
    phone_number = Column(String(20),  nullable=True)

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
    user = relationship("User", back_populates="patient")

    # cascade ensures predictions are deleted when patient is deleted
    predictions = relationship(
        "PredictionHistory",
        back_populates="patient",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Patient id={self.id} full_name={self.full_name}>"