# ============================================================
# app/services/report_service.py
# Medical Report Upload & Retrieval Logic
# ============================================================

import os
import uuid
from sqlalchemy.orm import Session
from app.models.medical_report import MedicalReport

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "uploads", "reports"
)

ALLOWED_TYPES = {"pdf", "png", "jpg", "jpeg"}


def get_upload_dir() -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    return UPLOAD_DIR


def save_report(
    db: Session,
    patient_id: int,
    original_filename: str,
    file_content: bytes,
    file_type: str,
) -> MedicalReport:
    """
    Saves uploaded file to disk and stores metadata in database.
    """

    if file_type.lower() not in ALLOWED_TYPES:
        raise ValueError(f"File type '{file_type}' not allowed. Use: {ALLOWED_TYPES}")

    upload_dir = get_upload_dir()

    # Generate unique filename to avoid conflicts
    unique_name = f"{uuid.uuid4().hex}_{original_filename}"
    file_path   = os.path.join(upload_dir, unique_name)

    # Save file to disk
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Save metadata to database
    report = MedicalReport(
        patient_id         = patient_id,
        original_file_name = original_filename,
        stored_file_name   = unique_name,
        file_type          = file_type.lower(),
        file_path          = file_path,
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def get_patient_reports(db: Session, patient_id: int) -> list:
    """Returns all reports for a specific patient."""
    return (
        db.query(MedicalReport)
        .filter(MedicalReport.patient_id == patient_id)
        .order_by(MedicalReport.upload_timestamp.desc())
        .all()
    )


def get_report_by_id(db: Session, report_id: int, patient_id: int):
    """
    Returns a single report.
    Verifies it belongs to the requesting patient.
    """
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()

    if not report:
        raise ValueError("Report not found.")

    if report.patient_id != patient_id:
        raise PermissionError("Access denied.")

    return report