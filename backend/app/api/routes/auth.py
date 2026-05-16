# ============================================================
# app/api/routes/auth.py
# Authentication API Routes
#
# Endpoints:
#   POST /api/v1/auth/register  — create new user account
#   POST /api/v1/auth/login     — login and get JWT token
# ============================================================

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.models.user import User
from fastapi.security import OAuth2PasswordRequestForm

from app.database.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
)
from app.services.auth_service import register_user, login_user

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


# ============================================================
# POST /api/v1/auth/register
# ============================================================

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="Creates a new user account. Username and email must be unique.",
    responses={
        201: {"description": "User registered successfully"},
        400: {"description": "Username or email already exists"},
        500: {"description": "Internal server error"},
    },
)
def register(request: RegisterRequest, db: Session = Depends(get_db)):

    try:
        user = register_user(
            db=db,
            username=request.username,
            email=request.email,
            password=request.password,
        )

        return RegisterResponse(
            status="success",
            message="User registered successfully.",
            username=user.username,
            email=user.email,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"status": "error", "message": str(e)},
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Registration failed: {str(e)}"},
        )


# ============================================================
# POST /api/v1/auth/login
# ============================================================

@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Login User",
    description="Authenticates user credentials and returns a JWT access token.",
    responses={
        200: {"description": "Login successful, token returned"},
        401: {"description": "Invalid username or password"},
        500: {"description": "Internal server error"},
    },
)
def login(request: LoginRequest, db: Session = Depends(get_db)):

    try:
        token = login_user(
            db=db,
            username=request.username,
            password=request.password,
        )

        return LoginResponse(
            status="success",
            access_token=token,
            token_type="bearer",
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"status": "error", "message": str(e)},
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"status": "error", "message": f"Login failed: {str(e)}"},
        )
    

# ============================================================
# GET /api/v1/auth/me
# ============================================================

@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Get Current User",
    description="Returns the currently logged-in user's profile.",
)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }

# ============================================================
# POST /api/v1/auth/token  (OAuth2 form-based login for Swagger)
# ============================================================

@router.post("/token", include_in_schema=False)
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        access_token = login_user(
            db=db,
            username=form_data.username,
            password=form_data.password,
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )