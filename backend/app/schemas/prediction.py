# ============================================================
# app/schemas/prediction.py
# Pydantic Request & Response Schemas
# ============================================================

from pydantic import BaseModel, Field, field_validator
from typing import List


# ============================================================
# REQUEST
# ============================================================

class PredictionRequest(BaseModel):
    """Request body for POST /api/v1/predict"""

    symptoms: List[str] = Field(
        ...,
        description=(
            "List of symptom column names to predict from. "
            "Use GET /api/v1/symptoms to retrieve valid values."
        ),
        min_length=1,
    )

    @field_validator("symptoms")
    @classmethod
    def validate_symptoms(cls, value):

        if not value:
            raise ValueError("Symptoms list cannot be empty.")

        # Clean and lowercase
        cleaned = [s.strip().lower() for s in value if s.strip()]

        if not cleaned:
            raise ValueError("Symptoms list cannot contain only blank values.")

        # Remove duplicates while preserving order
        seen, unique = set(), []
        for s in cleaned:
            if s not in seen:
                seen.add(s)
                unique.append(s)

        return unique

    class Config:
        json_schema_extra = {
            "example": {
                "symptoms": ["chest_pain", "fatigue", "high_fever"]
            }
        }


# ============================================================
# RESPONSE
# ============================================================

class TopPrediction(BaseModel):
    """A single disease prediction with its confidence score."""

    disease: str = Field(..., description="Predicted disease name.")
    confidence: float = Field(..., description="Confidence score as a percentage (0–100).")


class PredictionResponse(BaseModel):
    """Response body for POST /api/v1/predict"""

    status: str = Field(..., description="Always 'success' on a valid response.")
    predicted_disease: str = Field(..., description="The most likely predicted disease.")
    confidence: float = Field(..., description="Confidence of the top prediction (0–100).")
    top_predictions: List[TopPrediction] = Field(
        ..., description="Top 3 disease predictions ranked by confidence."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "predicted_disease": "Malaria",
                "confidence": 87.5,
                "top_predictions": [
                    {"disease": "Malaria",  "confidence": 87.5},
                    {"disease": "Dengue",   "confidence": 6.2},
                    {"disease": "Typhoid",  "confidence": 3.1},
                ],
            }
        }


class ErrorResponse(BaseModel):
    """Standard error response structure."""

    status: str = Field(..., description="Always 'error' on a failed response.")
    message: str = Field(..., description="Human-readable error description.")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "error",
                "message": "None of the provided symptoms are recognized.",
            }
        }