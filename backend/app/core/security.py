"""
JWT verification middleware for Qaza Tracker.
Verifies the Bearer token on every protected route.
"""
import logging
from typing import Optional
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

JWT_SECRET = settings.neon_auth_secret or "qaza_tracker_production_jwt_secret_key_2026"
ALGORITHM = "HS256"


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    """
    Dependency: verifies the JWT bearer token.
    Returns the decoded payload with user id on success.
    Raises 401 on failure.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_aud": False, "verify_exp": True},
        )
        user_id = payload.get("sub") or payload.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user identifier",
            )
        return {"user_id": user_id, "payload": payload}
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
