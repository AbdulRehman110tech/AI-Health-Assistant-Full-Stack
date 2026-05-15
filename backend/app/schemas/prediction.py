# ============================================================
# app/schemas/prediction.py
# Pydantic schemas for prediction request and response
# ============================================================

from pydantic import BaseModel, field_validator
from typing import List, Tuple


# ============================================================
# REQUEST SCHEMA
# What the frontend sends TO the API
# ============================================================

class PredictionRequest(BaseModel):
    """
    Request body for POST /api/v1/predict

    Example JSON the frontend sends:
    {
        "symptoms": ["chest_pain", "fatigue", "high_fever"]
    }
    """

    symptoms: List[str]

    @field_validator("symptoms")
    @classmethod
    def symptoms_must_not_be_empty(cls, value):
        if not value:
            raise ValueError("Symptoms list cannot be empty.")
        if len(value) < 1:
            raise ValueError("At least one symptom must be provided.")
        # Strip whitespace from each symptom
        return [s.strip() for s in value if s.strip()]

    class Config:
        json_schema_extra = {
            "example": {
                "symptoms": ["chest_pain", "fatigue", "high_fever"]
            }
        }


# ============================================================
# RESPONSE SCHEMA
# What the API sends BACK to the frontend
# ============================================================

class TopPrediction(BaseModel):
    """Single disease prediction with confidence score."""
    disease: str
    confidence: float


class PredictionResponse(BaseModel):
    """
    Response body for POST /api/v1/predict

    Example JSON the API returns:
    {
        "predicted_disease": "Malaria",
        "confidence": 87.5,
        "top_predictions": [
            {"disease": "Malaria",  "confidence": 87.5},
            {"disease": "Dengue",   "confidence": 6.2},
            {"disease": "Typhoid",  "confidence": 3.1}
        ]
    }
    """

    predicted_disease: str
    confidence: float
    top_predictions: List[TopPrediction]

    class Config:
        json_schema_extra = {
            "example": {
                "predicted_disease": "Malaria",
                "confidence": 87.5,
                "top_predictions": [
                    {"disease": "Malaria",  "confidence": 87.5},
                    {"disease": "Dengue",   "confidence": 6.2},
                    {"disease": "Typhoid",  "confidence": 3.1}
                ]
            }
        }