# ============================================================
# app/api/routes/prediction.py
# Prediction API Route
# ============================================================

from fastapi import APIRouter, HTTPException
from app.schemas.prediction import PredictionRequest, PredictionResponse, TopPrediction
from app.services.prediction_service import predict_disease, get_top_predictions, get_symptom_list

router = APIRouter(
    prefix="/api/v1",
    tags=["Prediction"],
)


# ============================================================
# POST /api/v1/predict
# Accepts symptoms, returns disease prediction
# ============================================================

@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict Disease",
    description="Send a list of symptom names and receive the predicted disease with confidence scores.",
)
def predict(request: PredictionRequest):
    """
    Route Layer → Service Layer → ML Model Layer

    1. Receives symptom list from frontend
    2. Passes to prediction_service
    3. Returns structured prediction response
    """

    try:
        # --- Call service layer ---
        predicted_disease, confidence = predict_disease(request.symptoms)
        top_preds = get_top_predictions(request.symptoms, top_n=3)

        # --- Build top predictions list ---
        top_predictions = [
            TopPrediction(disease=disease, confidence=conf)
            for disease, conf in top_preds
        ]

        # --- Return structured response ---
        return PredictionResponse(
            predicted_disease=predicted_disease,
            confidence=confidence,
            top_predictions=top_predictions,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# ============================================================
# GET /api/v1/symptoms
# Returns all available symptoms
# ============================================================

@router.get(
    "/symptoms",
    summary="Get All Symptoms",
    description="Returns the full list of symptoms the model was trained on.",
)
def symptoms():
    """
    Returns all available symptoms as a list of objects
    with display name and raw column name.
    """

    try:
        symptom_pairs = get_symptom_list()

        return {
            "total": len(symptom_pairs),
            "symptoms": [
                {"display": display, "value": raw}
                for display, raw in symptom_pairs
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not load symptoms: {str(e)}"
        )