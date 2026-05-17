# ============================================================
# app/services/doctor_service.py
# Doctor Recommendation & Appointment Logic
# ============================================================

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.doctor import Doctor
from app.models.appointment import Appointment


def get_doctors(
    db: Session,
    specialization: str = None,
    search: str = None,
    available_only: bool = False,
) -> list:
    """
    Returns filtered doctor list.
    - specialization: filter by specialization
    - search: search by doctor name
    - available_only: only available doctors
    """
    query = db.query(Doctor)

    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))

    if search:
        query = query.filter(Doctor.full_name.ilike(f"%{search}%"))

    if available_only:
        query = query.filter(Doctor.availability_status == True)

    return query.order_by(Doctor.years_of_experience.desc()).all()


def book_appointment(
    db: Session,
    patient_id: int,
    doctor_id: int,
    appointment_time: datetime = None,
) -> Appointment:
    """
    Simulated appointment booking.
    Creates appointment record and returns confirmation.
    """

    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise ValueError(f"Doctor {doctor_id} not found.")

    appointment = Appointment(
        patient_id       = patient_id,
        doctor_id        = doctor_id,
        appointment_time = appointment_time or datetime.now(timezone.utc),
        booking_status   = "Confirmed",
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment


def get_patient_appointments(db: Session, patient_id: int) -> list:
    """Returns all appointments for a patient."""
    return (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .order_by(Appointment.created_at.desc())
        .all()
    )