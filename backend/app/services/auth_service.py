# ============================================================
# app/services/auth_service.py
# Authentication Business Logic
# ============================================================

from sqlalchemy.orm import Session
from app.models.user import User
from app.models.patient import Patient
from app.models.prediction_history import PredictionHistory
from app.core.security import hash_password, verify_password, create_access_token


def register_user(db: Session, username: str, email: str, password: str) -> User:
    """
    Registers a new user and auto-creates a linked patient profile.
    """

    # Check duplicate username
    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username:
        raise ValueError("Username already registered.")

    # Check duplicate email
    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        raise ValueError("Email already registered.")

    # Hash password
    hashed = hash_password(password)

    # Create user
    new_user = User(
        username=username,
        email=email,
        hashed_password=hashed,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-create patient profile
    patient = Patient(
        user_id   = new_user.id,
        full_name = new_user.username,
    )
    db.add(patient)
    db.commit()

    return new_user


def login_user(db: Session, username: str, password: str) -> str:
    """
    Authenticates user and returns JWT token.
    """

    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise ValueError("Invalid username or password.")

    if not verify_password(password, user.hashed_password):
        raise ValueError("Invalid username or password.")

    token = create_access_token(data={"sub": user.username})

    return token