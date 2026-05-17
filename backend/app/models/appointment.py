# ============================================================
# app/models/appointment.py
# Appointment ORM Model (Simulated Booking)
# ============================================================

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class Appointment(Base):

    __tablename__ = "appointments"

    id               = Column(Integer, primary_key=True, index=True)
    patient_id       = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id        = Column(Integer, ForeignKey("doctors.id",  ondelete="CASCADE"), nullable=False, index=True)
    appointment_time = Column(DateTime(timezone=True), nullable=True)
    booking_status   = Column(String(50), default="Confirmed", nullable=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient")
    doctor  = relationship("Doctor", back_populates="appointments")

    def __repr__(self):
        return f"<Appointment id={self.id} patient={self.patient_id} doctor={self.doctor_id} status={self.booking_status}>"