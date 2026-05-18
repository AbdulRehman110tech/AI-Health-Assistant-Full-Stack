# ============================================================
# app/services/reminder_service.py
# Reminder Business Logic
# ============================================================

from sqlalchemy.orm import Session
from app.models.reminder import Reminder
from app.schemas.reminder_schema import ReminderCreate

def create_reminder(db: Session, patient_id: int, data: ReminderCreate) -> Reminder:
    new_reminder = Reminder(
        patient_id=patient_id,
        medicine_name=data.medicine_name,
        dosage=data.dosage,
        reminder_time=data.reminder_time,
        notes=data.notes,
    )
    db.add(new_reminder)
    db.commit()
    db.refresh(new_reminder)
    return new_reminder

def get_patient_reminders(db: Session, patient_id: int) -> list:
    return (
        db.query(Reminder)
        .filter(Reminder.patient_id == patient_id)
        .order_by(Reminder.reminder_time.asc())
        .all()
    )

def delete_reminder(db: Session, reminder_id: int, patient_id: int) -> bool:
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id, 
        Reminder.patient_id == patient_id
    ).first()
    
    if not reminder:
        return False
        
    db.delete(reminder)
    db.commit()
    return True

def toggle_reminder_status(db: Session, reminder_id: int, patient_id: int) -> Reminder:
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id, 
        Reminder.patient_id == patient_id
    ).first()
    
    if not reminder:
        return None
        
    reminder.is_completed = not reminder.is_completed
    db.commit()
    db.refresh(reminder)
    return reminder