# ============================================================
# app/services/personal_info_service.py
# Personal Information & Account Management Service
# ============================================================

from sqlalchemy.orm import Session
from app.models.user import User
from app.models.patient import Patient


def get_personal_info(db: Session, user: User) -> dict:
    """
    Returns combined user + patient profile for the
    currently authenticated user.
    """
    patient: Patient | None = (
        db.query(Patient)
        .filter(Patient.user_id == user.id)
        .first()
    )

    return {
        "user_id":      user.id,
        "username":     user.username,
        "email":        user.email,
        "is_active":    user.is_active,
        "member_since": user.created_at.isoformat() if user.created_at else None,
        "patient_id":   patient.id           if patient else None,
        "full_name":    patient.full_name     if patient else None,
        "age":          patient.age           if patient else None,
        "gender":       patient.gender        if patient else None,
        "phone_number": patient.phone_number  if patient else None,
        "profile_created_at": (
            patient.created_at.isoformat()
            if patient and patient.created_at else None
        ),
    }


def update_personal_info(
    db: Session,
    user: User,
    full_name: str | None,
    age: int | None,
    gender: str | None,
    phone_number: str | None,
) -> dict:
    """
    Updates patient profile fields for the authenticated user.
    Only updates fields that are explicitly provided (not None).

    Raises:
        ValueError: if patient profile does not exist
    """
    patient: Patient | None = (
        db.query(Patient)
        .filter(Patient.user_id == user.id)
        .first()
    )

    if not patient:
        raise ValueError(
            "Patient profile not found. "
            "Please complete your profile setup first."
        )

    if full_name    is not None: patient.full_name    = full_name.strip()
    if age          is not None: patient.age          = age
    if gender       is not None: patient.gender       = gender.strip()
    if phone_number is not None: patient.phone_number = phone_number.strip()

    db.commit()
    db.refresh(patient)

    return get_personal_info(db=db, user=user)


def delete_account(db: Session, user: User) -> None:
    """
    Permanently deletes the user account and ALL related data.

    Cascade chain:
        User → Patient → PredictionHistory  (ORM cascades)
                       → MedicalReport      (DB ondelete=CASCADE)
                       → Appointment        (DB ondelete=CASCADE)
                       → Reminder           (DB ondelete=CASCADE)
    """
    db.delete(user)
    db.commit()