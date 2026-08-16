"""
Push notifications router — VAPID subscription management.
"""
import json
import logging
from pywebpush import webpush, WebPushException
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_token
from app.models.models import PushSubscription
from app.schemas.schemas import PushSubscriptionCreate, PushSubscriptionOut
from app.api.v1.users import get_or_create_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/vapid-public-key")
async def get_vapid_public_key():
    """Return the VAPID public key for the frontend to subscribe with."""
    return {"public_key": settings.vapid_public_key}


@router.post("/subscribe", response_model=PushSubscriptionOut, status_code=201)
async def subscribe(
    body: PushSubscriptionCreate,
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Store a push subscription (upsert on endpoint)."""
    user = await get_or_create_user(token_data["user_id"], db)

    stmt = pg_insert(PushSubscription).values(
        user_id=user.id,
        endpoint=body.endpoint,
        p256dh_key=body.p256dh_key,
        auth_key=body.auth_key,
    ).on_conflict_do_update(
        index_elements=["user_id", "endpoint"],
        set_={"p256dh_key": body.p256dh_key, "auth_key": body.auth_key},
    ).returning(PushSubscription)

    result = await db.execute(stmt)
    await db.flush()
    return result.scalar_one()


@router.delete("/unsubscribe")
async def unsubscribe(
    endpoint: str,
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Remove a push subscription."""
    user = await get_or_create_user(token_data["user_id"], db)
    result = await db.execute(
        select(PushSubscription).where(
            PushSubscription.user_id == user.id,
            PushSubscription.endpoint == endpoint,
        )
    )
    sub = result.scalar_one_or_none()
    if sub:
        await db.delete(sub)
        await db.flush()
    return {"status": "unsubscribed"}


@router.post("/test")
async def send_test_notification(
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Send a test push notification to all user's subscriptions."""
    user = await get_or_create_user(token_data["user_id"], db)
    result = await db.execute(
        select(PushSubscription).where(PushSubscription.user_id == user.id)
    )
    subs = result.scalars().all()

    if not subs:
        raise HTTPException(status_code=404, detail="No push subscriptions found")

    payload = json.dumps({
        "title": "🕌 Qaza Tracker",
        "body": "Notifications are working! May Allah make it easy for you.",
        "icon": "/icons/icon-192.png",
        "url": "/dashboard",
    })

    sent = 0
    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh_key, "auth": sub.auth_key},
                },
                data=payload,
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={"sub": settings.vapid_email},
            )
            sent += 1
        except WebPushException as e:
            logger.warning(f"Push failed for sub {sub.id}: {e}")

    return {"sent": sent, "total": len(subs)}


async def send_push_to_user(user_id, message: dict, db: AsyncSession):
    """Internal helper: send push notification to all user's subscriptions."""
    result = await db.execute(
        select(PushSubscription).where(PushSubscription.user_id == user_id)
    )
    subs = result.scalars().all()

    payload = json.dumps(message)
    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh_key, "auth": sub.auth_key},
                },
                data=payload,
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={"sub": settings.vapid_email},
            )
        except WebPushException as e:
            logger.warning(f"Push failed: {e}")
