# ============================================================
# app/services/history_service.py
# Prediction History Business Logic
# ============================================================

import json
from sqlalchemy.orm import Session
from app.models.prediction_history import PredictionHistory


def save_prediction(
    db: Session,
    patient_id: int,
    predicted_disease: str,
    confidence: float,
    symptoms: list,
    top_predictions: list,
) -> PredictionHistory:

    symptoms_str = ",".join(symptoms)

    top_preds_json = json.dumps([
        {"disease": str(d), "confidence": float(c)}
        for d, c in top_predictions
    ])

    record = PredictionHistory(
        patient_id        = patient_id,
        predicted_disease = str(predicted_disease),
        confidence        = float(confidence),
        symptoms_input    = symptoms_str,
        top_predictions   = top_preds_json,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def get_patient_history(
    db: Session,
    patient_id: int,
    limit: int = 20,
) -> list:

    records = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.patient_id == patient_id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(limit)
        .all()
    )

    return records