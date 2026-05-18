# ============================================================
# app/schemas/reminder_schema.py
# Pydantic Schemas for Reminders
# ============================================================

from pydantic import BaseModel, validator
from datetime import datetime, timezone
from typing import Optional

class ReminderCreate(BaseModel):
    medicine_name: str
    dosage: str
    reminder_time: datetime
    notes: Optional[str] = None

    @validator("reminder_time")
    def check_future_time(cls, v):
        # Convert both to UTC to ensure accurate comparison, handling naive/aware datetimes
        now = datetime.now(timezone.utc)
        v_utc = v.astimezone(timezone.utc) if v.tzinfo else v.replace(tzinfo=timezone.utc)
        
        if v_utc < now:
            raise ValueError("Reminder time must be in the future. Past dates are not allowed.")
        return v