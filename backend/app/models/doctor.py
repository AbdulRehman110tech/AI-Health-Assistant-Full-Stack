# ============================================================
# app/models/doctor.py
# Doctor ORM Model
# ============================================================

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class Doctor(Base):

    __tablename__ = "doctors"

    id                  = Column(Integer, primary_key=True, index=True)
    full_name           = Column(String(100), nullable=False, index=True)
    specialization      = Column(String(100), nullable=False, index=True)
    hospital_name       = Column(String(150), nullable=False)
    years_of_experience = Column(Integer,     nullable=False)
    availability_status = Column(Boolean,     default=True, nullable=False)
    consultation_fee    = Column(Float,       nullable=False)
    profile_image       = Column(String(255), nullable=True)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())

    appointments = relationship("Appointment", back_populates="doctor")

    def __repr__(self):
        return f"<Doctor id={self.id} name={self.full_name} spec={self.specialization}>"