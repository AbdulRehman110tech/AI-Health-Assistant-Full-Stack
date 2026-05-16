# ============================================================
# app/api/routes/history.py
# Prediction History Routes
#
# Endpoints:
#   GET /api/v1/history/{patient_id} — get patient history
# ============================================================

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
import json

from app.database.database import get_db
from app.services.history_service import get_patient_history
from app.models.patient import Patient
from app.models.user import User
from app.models.prediction_history import PredictionHistory
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/api/v1",
    tags=["History"],
)


@router.get(
    "/history/{patient_id}",
    status_code=status.HTTP_200_OK,
    summary="Get Prediction History",
    description="Returns prediction history for a patient. Only the owner can access their own history.",
    responses={
        200: {"description": "History returned successfully"},
        403: {"description": "Access denied"},
        404: {"description": "Patient not found"},
        401: {"description": "Not authenticated"},
    },
)
def get_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"status": "error", "message": f"Patient {patient_id} not found."},
        )

    # Security check — patient must belong to current logged-in user
    if patient.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"status": "error", "message": "Access denied. You can only view your own history."},
        )

    # Get history records
    records = get_patient_history(db=db, patient_id=patient_id)

    # Format response
    history = []
    for r in records:
        history.append({
            "id":                r.id,
            "predicted_disease": r.predicted_disease,
            "confidence":        r.confidence,
            "symptoms":          r.symptoms_input.split(","),
            "top_predictions":   json.loads(r.top_predictions) if r.top_predictions else [],
            "created_at":        r.created_at.isoformat() if r.created_at else None,
        })

    return {
        "status":     "success",
        "patient_id": patient_id,
        "total":      len(history),
        "history":    history,
    }