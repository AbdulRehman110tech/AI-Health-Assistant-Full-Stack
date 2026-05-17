# ============================================================
# app/api/routes/doctors.py
#
# Endpoints:
#   GET  /api/v1/doctors              — list/filter doctors
#   POST /api/v1/doctors/book         — book appointment
#   GET  /api/v1/doctors/appointments — patient appointments
# ============================================================

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.services.doctor_service import get_doctors, book_appointment, get_patient_appointments

router = APIRouter(prefix="/api/v1/doctors", tags=["Doctors"])


class BookingRequest(BaseModel):
    doctor_id:        int
    appointment_time: Optional[datetime] = None


@router.get("/", status_code=200, summary="List Doctors")
def list_doctors(
    specialization: Optional[str] = None,
    search:         Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctors = get_doctors(db, specialization, search, available_only)
    return {
        "status": "success",
        "total":  len(doctors),
        "doctors": [
            {
                "id":                  d.id,
                "full_name":           d.full_name,
                "specialization":      d.specialization,
                "hospital_name":       d.hospital_name,
                "years_of_experience": d.years_of_experience,
                "availability_status": d.availability_status,
                "consultation_fee":    d.consultation_fee,
            }
            for d in doctors
        ],
    }


@router.post("/book", status_code=201, summary="Book Appointment")
def book(
    request: BookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Patient profile not found."})

    try:
        appt = book_appointment(db, patient.id, request.doctor_id, request.appointment_time)
        return {
            "status":  "success",
            "message": "Appointment Booked Successfully",
            "appointment_id":  appt.id,
            "booking_status":  appt.booking_status,
            "appointment_time": appt.appointment_time.isoformat(),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"status": "error", "message": str(e)})


@router.get("/appointments", status_code=200, summary="My Appointments")
def my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Patient profile not found."})

    appointments = get_patient_appointments(db, patient.id)
    return {
        "status": "success",
        "total":  len(appointments),
        "appointments": [
            {
                "id":               a.id,
                "doctor_id":        a.doctor_id,
                "doctor_name":      a.doctor.full_name,
                "specialization":   a.doctor.specialization,
                "hospital":         a.doctor.hospital_name,
                "appointment_time": a.appointment_time.isoformat() if a.appointment_time else None,
                "booking_status":   a.booking_status,
                "created_at":       a.created_at.isoformat() if a.created_at else None,
            }
            for a in appointments
        ],
    }