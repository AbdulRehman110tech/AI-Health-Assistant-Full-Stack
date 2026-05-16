# ============================================================
# app/models/prediction_history.py
# PredictionHistory ORM Model
# ============================================================

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class PredictionHistory(Base):

    __tablename__ = "prediction_history"

    # --- Primary Key ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Foreign Key ---
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # --- Prediction Results ---
    predicted_disease = Column(String(100), nullable=False)
    confidence        = Column(Float,       nullable=False)

    # --- Symptoms (comma-separated string) ---
    # Example: "chest_pain,fatigue,high_fever"
    symptoms_input = Column(Text, nullable=False)

    # --- Top 3 Predictions (JSON string) ---
    # Example: '[{"disease": "Malaria", "confidence": 87.5}]'
    top_predictions = Column(Text, nullable=True)

    # --- Timestamp ---
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,                 # indexed for fast history queries
    )

    # --- Relationships ---
    patient = relationship("Patient", back_populates="predictions")

    def __repr__(self):
        return (
            f"<PredictionHistory id={self.id} "
            f"disease={self.predicted_disease} "
            f"confidence={self.confidence}>"
        )