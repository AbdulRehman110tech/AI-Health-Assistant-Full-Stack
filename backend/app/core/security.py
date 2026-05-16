# ============================================================
# app/core/security.py
# Password Hashing + JWT Token Utilities
# ============================================================

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hashes a plain text password using bcrypt."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ============================================================
# JWT TOKEN CREATION
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Creates a signed JWT access token.

    Args:
        data:          dict containing user info (e.g. {"sub": "username"})
        expires_delta: optional custom expiry duration

    Returns:
        encoded JWT token string
    """

    to_encode = data.copy()

    # Set expiry time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    # Sign and encode the token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


# ============================================================
# JWT TOKEN VERIFICATION
# ============================================================

def verify_access_token(token: str) -> Optional[dict]:
    """
    Verifies and decodes a JWT token.

    Args:
        token: JWT token string from request header

    Returns:
        decoded payload dict if valid, None if invalid/expired
    """

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload

    except JWTError:
        return None