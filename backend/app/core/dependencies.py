# ============================================================
# app/core/dependencies.py
# Reusable FastAPI Dependencies
#
# PURPOSE:
# - Extract and verify JWT token from request header
# - Return current logged-in user
# - Protect any route by adding get_current_user dependency
# ============================================================

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import verify_access_token
from app.database.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.prediction_history import PredictionHistory

# ============================================================
# OAuth2 SCHEME
# Tells FastAPI to look for token in:
# Authorization: Bearer <token>
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


# ============================================================
# GET CURRENT USER
# Add this as a dependency to any route you want to protect.
#
# Usage in a route:
#   def my_route(current_user: User = Depends(get_current_user)):
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts JWT token from Authorization header.
    Verifies token and returns the current logged-in User.

    Raises 401 if token is missing, invalid, or expired.
    """

    # Verify the token
    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "status": "error",
                "message": "Invalid or expired token. Please login again."
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract username from token payload
    username: str = payload.get("sub")

    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "status": "error",
                "message": "Token payload invalid."
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Find user in database
    user = db.query(User).filter(User.username == username).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "status": "error",
                "message": "User no longer exists."
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user