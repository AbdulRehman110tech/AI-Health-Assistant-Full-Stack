# ============================================================
# app/api/routes/reminders.py
# Medication Reminders Routes
# ============================================================

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.schemas.reminder_schema import ReminderCreate
from app.services.reminder_service import (
    create_reminder, 
    get_patient_reminders, 
    delete_reminder, 
    toggle_reminder_status
)

router = APIRouter(
    prefix="/api/v1/reminders",
    tags=["Reminders"],
)

# Helper function mirroring your reports.py architecture
def get_patient_or_404(db: Session, user_id: int):
    patient = db.query(Patient).filter(Patient.user_id == user_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail={"status": "error", "message": "Patient profile not found."}
        )
    return patient

@router.post("/", status_code=status.HTTP_201_CREATED, summary="Create a new reminder")
def add_reminder(
    reminder_data: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = get_patient_or_404(db, current_user.id)
    
    try:
        record = create_reminder(db=db, patient_id=patient.id, data=reminder_data)
        return {
            "status": "success",
            "message": "Reminder created successfully",
            "reminder": {
                "id": record.id,
                "medicine_name": record.medicine_name,
                "dosage": record.dosage,
                "reminder_time": record.reminder_time.isoformat(),
            }
        }
    except ValueError as e: # Catching the Pydantic validation error gracefully
        raise HTTPException(status_code=400, detail={"status": "error", "message": str(e)})

@router.get("/", status_code=status.HTTP_200_OK, summary="List my reminders")
def list_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = get_patient_or_404(db, current_user.id)
    records = get_patient_reminders(db, patient.id)
    
    return {
        "status": "success",
        "total": len(records),
        "reminders": [
            {
                "id": r.id,
                "medicine_name": r.medicine_name,
                "dosage": r.dosage,
                "reminder_time": r.reminder_time.isoformat(),
                "notes": r.notes,
                "is_completed": r.is_completed,
            }
            for r in records
        ]
    }

@router.patch("/{reminder_id}/toggle", summary="Toggle reminder completion status")
def toggle_status(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = get_patient_or_404(db, current_user.id)
    record = toggle_reminder_status(db, reminder_id, patient.id)
    
    if not record:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Reminder not found or unauthorized."})
        
    return {
        "status": "success", 
        "message": f"Reminder marked as {'completed' if record.is_completed else 'pending'}.",
        "is_completed": record.is_completed
    }

@router.delete("/{reminder_id}", summary="Delete a reminder")
def remove_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = get_patient_or_404(db, current_user.id)
    success = delete_reminder(db, reminder_id, patient.id)
    
    if not success:
        raise HTTPException(status_code=404, detail={"status": "error", "message": "Reminder not found or unauthorized."})
        
    return {"status": "success", "message": "Reminder deleted successfully."}