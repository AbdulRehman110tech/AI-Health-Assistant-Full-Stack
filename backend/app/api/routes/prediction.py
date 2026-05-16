# ============================================================
# app/api/routes/prediction.py
# Prediction API Routes
# ============================================================

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    TopPrediction,
)
from app.services.prediction_service import (
    predict_disease,
    get_top_predictions,
    get_symptom_list,
    symptom_columns,
)
from app.database.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.prediction_history import PredictionHistory
from app.services.history_service import save_prediction

router = APIRouter(
    prefix="/api/v1",
    tags=["Prediction"],
)


@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Disease From Symptoms",
    description=(
        "Submit a list of symptom column names (e.g. `chest_pain`, `fatigue`). "
        "Returns the most likely disease, confidence percentage, "
        "and top 3 alternative predictions. "
        "Use **GET /api/v1/symptoms** to retrieve all valid symptom names."
    ),
    responses={
        200: {"description": "Prediction successful"},
        400: {"description": "No valid symptoms recognized"},
        422: {"description": "Request validation failed (e.g. empty list)"},
        500: {"description": "Internal prediction error"},
    },
)
def predict(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valid_symptoms = [s for s in request.symptoms if s in symptom_columns]

    if not valid_symptoms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": "error",
                "message": "None of the provided symptoms are recognized.",
            },
        )

    try:
        predicted_disease, confidence = predict_disease(valid_symptoms)
        top_preds = get_top_predictions(valid_symptoms, top_n=3)

        top_predictions = [
            TopPrediction(disease=d, confidence=c)
            for d, c in top_preds
        ]

        # --- Save to database if patient profile exists ---
        patient = db.query(Patient).filter(
            Patient.user_id == current_user.id
        ).first()

        print(f"[DEBUG] current_user.id = {current_user.id}")
        print(f"[DEBUG] patient found = {patient}")

        if patient:
            try:
                save_prediction(
                    db=db,
                    patient_id=patient.id,
                    predicted_disease=predicted_disease,
                    confidence=confidence,
                    symptoms=valid_symptoms,
                    top_predictions=top_preds,
                )
                print(f"[DEBUG] Prediction saved for patient {patient.id}")
            except Exception as save_error:
                print(f"[DEBUG] Save failed: {save_error}")

        return PredictionResponse(
            status="success",
            predicted_disease=predicted_disease,
            confidence=confidence,
            top_predictions=top_predictions,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Prediction failed: {str(e)}"},
        )


@router.get(
    "/symptoms",
    status_code=status.HTTP_200_OK,
    summary="List All Valid Symptoms",
    description="Returns the complete list of symptoms the model was trained on.",
    responses={
        200: {"description": "Symptoms list returned successfully"},
        500: {"description": "Could not load symptoms from model"},
    },
)
def symptoms():
    try:
        symptom_pairs = get_symptom_list()
        return {
            "status":   "success",
            "total":    len(symptom_pairs),
            "symptoms": [
                {"display": display, "value": raw}
                for display, raw in symptom_pairs
            ],
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Could not load symptoms: {str(e)}"},
        )