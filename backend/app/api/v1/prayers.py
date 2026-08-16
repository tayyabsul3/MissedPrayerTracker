"""
Prayers router — qaza counts, daily logs, history.
"""
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.database import get_db
from app.core.security import verify_token
from app.models.models import UserProfile, PrayerCounts, DailyLog, PrayerHistory
from app.schemas.schemas import (
    PrayerCountsOut, PrayerCountsUpdate,
    DailyLogOut, DailyLogUpdate,
    PrayerHistoryCreate, PrayerHistoryOut,
)
from app.api.v1.users import get_or_create_user

router = APIRouter(prefix="/prayers", tags=["prayers"])

PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha", "witr"]


# ─── Prayer Counts ─────────────────────────────────────────────

@router.get("/counts", response_model=PrayerCountsOut)
async def get_counts(
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    user = await get_or_create_user(token_data["user_id"], db)
    result = await db.execute(
        select(PrayerCounts).where(PrayerCounts.user_id == user.id)
    )
    counts = result.scalar_one_or_none()
    if not counts:
        counts = PrayerCounts(user_id=user.id)
        db.add(counts)
        await db.flush()
    return counts


@router.patch("/counts", response_model=PrayerCountsOut)
async def update_counts(
    body: PrayerCountsUpdate,
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    user = await get_or_create_user(token_data["user_id"], db)
    result = await db.execute(
        select(PrayerCounts).where(PrayerCounts.user_id == user.id)
    )
    counts = result.scalar_one_or_none()
    if not counts:
        counts = PrayerCounts(user_id=user.id)
        db.add(counts)

    for field, value in body.model_dump(exclude_unset=True).items():
        new_val = max(0, value)  # Never go below 0
        setattr(counts, field, new_val)

    await db.flush()
    return counts


# ─── Daily Log ─────────────────────────────────────────────────

@router.get("/daily/{log_date}", response_model=DailyLogOut)
async def get_daily_log(
    log_date: date,
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    user = await get_or_create_user(token_data["user_id"], db)
    result = await db.execute(
        select(DailyLog)
        .where(DailyLog.user_id == user.id, DailyLog.log_date == log_date)
    )
    logs = result.scalars().all()

    prayers = {p: "pending" for p in PRAYER_NAMES}
    for log in logs:
        prayers[log.prayer_name] = log.status

    return DailyLogOut(log_date=str(log_date), prayers=prayers)


@router.patch("/daily/{log_date}", response_model=DailyLogOut)
async def update_daily_log(
    log_date: date,
    body: DailyLogUpdate,
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    user = await get_or_create_user(token_data["user_id"], db)

    for entry in body.entries:
        if entry.prayer_name not in PRAYER_NAMES:
            raise HTTPException(status_code=400, detail=f"Invalid prayer: {entry.prayer_name}")
        if entry.status not in ["prayed", "missed", "pending"]:
            raise HTTPException(status_code=400, detail=f"Invalid status: {entry.status}")

        # Upsert via raw SQL for PostgreSQL ON CONFLICT
        stmt = pg_insert(DailyLog).values(
            user_id=user.id,
            log_date=log_date,
            prayer_name=entry.prayer_name,
            status=entry.status,
        ).on_conflict_do_update(
            index_elements=["user_id", "log_date", "prayer_name"],
            set_={"status": entry.status},
        )
        await db.execute(stmt)

    await db.flush()
    return await get_daily_log(log_date, token_data, db)


# ─── Prayer History ────────────────────────────────────────────

@router.get("/history", response_model=list[PrayerHistoryOut])
async def get_history(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    user = await get_or_create_user(token_data["user_id"], db)
    result = await db.execute(
        select(PrayerHistory)
        .where(PrayerHistory.user_id == user.id)
        .order_by(desc(PrayerHistory.created_at))
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


@router.post("/history", response_model=PrayerHistoryOut, status_code=201)
async def add_history(
    body: PrayerHistoryCreate,
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    user = await get_or_create_user(token_data["user_id"], db)
    entry = PrayerHistory(
        user_id=user.id,
        prayer_name=body.prayer_name,
        event_type=body.event_type,
        amount=body.amount,
    )
    db.add(entry)
    await db.flush()
    return entry
