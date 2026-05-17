# ============================================================
# app/models/medical_report.py
# MedicalReport ORM Model
# ============================================================

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class MedicalReport(Base):

    __tablename__ = "medical_reports"

    id                 = Column(Integer, primary_key=True, index=True)
    patient_id         = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    original_file_name = Column(String(255), nullable=False)
    stored_file_name   = Column(String(255), nullable=False, unique=True)
    file_type          = Column(String(10),  nullable=False)
    file_path          = Column(String(500), nullable=False)
    upload_timestamp   = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient")

    def __repr__(self):
        return f"<MedicalReport id={self.id} file={self.original_file_name}>"