# ============================================================
# app/models/reminder.py
# Reminder ORM Model
# ============================================================

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class Reminder(Base):
    __tablename__ = "reminders"

    # --- Primary Key ---
    id = Column(Integer, primary_key=True, index=True)

    # --- Foreign Key ---
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # --- Reminder Data ---
    medicine_name = Column(String(150), nullable=False)
    dosage        = Column(String(100), nullable=False)
    reminder_time = Column(DateTime(timezone=True), nullable=False)
    notes         = Column(Text, nullable=True)
    
    # --- Status ---
    is_completed  = Column(Boolean, default=False, nullable=False)

    # --- Timestamps ---
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # --- Relationships ---
    patient = relationship("Patient", backref="reminders")

    def __repr__(self):
        return f"<Reminder id={self.id} medicine={self.medicine_name} patient_id={self.patient_id}>"