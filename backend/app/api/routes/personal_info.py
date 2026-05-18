# ============================================================
# app/api/routes/personal_info.py
#
# Endpoints:
#   GET    /api/v1/me/        — get personal + patient info
#   PUT    /api/v1/me/update  — update patient profile fields
#   DELETE /api/v1/me/delete  — permanently delete account
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional

from app.database.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.personal_info_service import (
    get_personal_info,
    update_personal_info,
    delete_account,
)

router = APIRouter(
    prefix="/api/v1/me",
    tags=["Personal Info"],
)


# ============================================================
# SCHEMA — Update Request
# All fields optional: only provided fields are updated.
# ============================================================

class UpdateProfileRequest(BaseModel):
    full_name:    Optional[str] = Field(None, max_length=100)
    age:          Optional[int] = Field(None, ge=1, le=150)
    gender:       Optional[str] = Field(None, max_length=10)
    phone_number: Optional[str] = Field(None, max_length=20)

    class Config:
        json_schema_extra = {
            "example": {
                "full_name":    "Ali Hassan",
                "age":          28,
                "gender":       "Male",
                "phone_number": "+92-300-1234567",
            }
        }


# ============================================================
# GET /api/v1/me/
# ============================================================

@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Get Personal Information",
    description="Returns the authenticated user's account + patient profile.",
    responses={
        200: {"description": "Profile returned successfully"},
        401: {"description": "Not authenticated"},
    },
)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    info = get_personal_info(db=db, user=current_user)
    return {"status": "success", "data": info}


# ============================================================
# PUT /api/v1/me/update
# ============================================================

@router.put(
    "/update",
    status_code=status.HTTP_200_OK,
    summary="Update Personal Information",
    description=(
        "Updates the patient profile fields of the authenticated user. "
        "Only fields included in the request body are updated. "
        "Omitted fields remain unchanged."
    ),
    responses={
        200: {"description": "Profile updated successfully"},
        400: {"description": "Patient profile not found"},
        401: {"description": "Not authenticated"},
        500: {"description": "Update failed"},
    },
)
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        updated = update_personal_info(
            db=db,
            user=current_user,
            full_name=request.full_name,
            age=request.age,
            gender=request.gender,
            phone_number=request.phone_number,
        )
        return {
            "status":  "success",
            "message": "Profile updated successfully.",
            "data":    updated,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"status": "error", "message": str(e)},
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Update failed: {str(e)}"},
        )


# ============================================================
# DELETE /api/v1/me/delete
# ============================================================

@router.delete(
    "/delete",
    status_code=status.HTTP_200_OK,
    summary="Delete Account",
    description=(
        "Permanently deletes the authenticated user's account "
        "and ALL related data. This action is IRREVERSIBLE."
    ),
    responses={
        200: {"description": "Account deleted successfully"},
        401: {"description": "Not authenticated"},
        500: {"description": "Deletion failed"},
    },
)
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        delete_account(db=db, user=current_user)
        return {
            "status":  "success",
            "message": "Your account and all associated data have been permanently deleted.",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Account deletion failed: {str(e)}"},
        )