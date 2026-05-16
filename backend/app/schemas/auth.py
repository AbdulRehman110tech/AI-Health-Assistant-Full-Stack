# ============================================================
# app/schemas/auth.py
# Authentication Request & Response Schemas
# ============================================================

from pydantic import BaseModel, EmailStr, Field


# ============================================================
# REGISTER
# ============================================================

class RegisterRequest(BaseModel):
    """Request body for POST /api/v1/auth/register"""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "securepassword123"
            }
        }


class RegisterResponse(BaseModel):
    """Response body for successful registration"""

    status: str
    message: str
    username: str
    email: str

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "User registered successfully.",
                "username": "john_doe",
                "email": "john@example.com"
            }
        }


# ============================================================
# LOGIN
# ============================================================

class LoginRequest(BaseModel):
    """Request body for POST /api/v1/auth/login"""

    username: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "password": "securepassword123"
            }
        }


class LoginResponse(BaseModel):
    """Response body for successful login"""

    status: str
    access_token: str
    token_type: str

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "access_token": "eyJhbGci...",
                "token_type": "bearer"
            }
        }