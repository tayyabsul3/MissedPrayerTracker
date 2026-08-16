"""
Users router — create/get/update the current user's profile.
Called after login/token verification to sync user.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import verify_token
from app.models.models import UserProfile, PrayerCounts
from app.schemas.schemas import UserProfileCreate, UserProfileUpdate, UserProfileOut

router = APIRouter(prefix="/users", tags=["users"])


async def get_or_create_user(auth_user_id_val: str, db: AsyncSession) -> UserProfile:
    """Get existing user profile or create one on first login."""
    try:
        auth_uuid = uuid.UUID(auth_user_id_val) if isinstance(auth_user_id_val, str) else auth_user_id_val
    except Exception:
        auth_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, str(auth_user_id_val))

    result = await db.execute(
        select(UserProfile).where(UserProfile.auth_user_id == auth_uuid)
    )
    user = result.scalar_one_or_none()

    if not user:
        user = UserProfile(auth_user_id=auth_uuid)
        db.add(user)
        await db.flush()

        # Bootstrap empty prayer counts row
        counts = PrayerCounts(user_id=user.id)
        db.add(counts)
        await db.flush()

    return user


@router.get("/me", response_model=UserProfileOut)
async def get_me(
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's profile."""
    user = await get_or_create_user(token_data["user_id"], db)
    return user


@router.patch("/me", response_model=UserProfileOut)
async def update_me(
    body: UserProfileUpdate,
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile fields (onboarding personalisation, settings etc.)"""
    user = await get_or_create_user(token_data["user_id"], db)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.flush()
    return user
