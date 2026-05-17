# ============================================================
# app/api/routes/history.py
# Prediction History Routes
#
# Endpoints:
#   GET /api/v1/history — get current logged-in patient history
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
    "/history",
    status_code=status.HTTP_200_OK,
    summary="Get My Prediction History",
    description="Returns prediction history for the currently logged-in patient. No parameters needed.",
    responses={
        200: {"description": "History returned successfully"},
        404: {"description": "Patient profile not found"},
        401: {"description": "Not authenticated"},
    },
)
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Automatically find patient linked to logged-in user
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"status": "error", "message": "Patient profile not found. Please contact support."},
        )

    records = get_patient_history(db=db, patient_id=patient.id)

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
        "patient_id": patient.id,
        "total":      len(history),
        "history":    history,
    }