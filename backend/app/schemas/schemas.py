from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from datetime import datetime
import uuid


# ─── User Profile ──────────────────────────────────────────────
class UserProfileCreate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    track_witr: bool = True
    quran_language: str = "en.sahih"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    track_witr: Optional[bool] = None
    quran_language: Optional[str] = None
    daily_reminder_time: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    onboarding_complete: Optional[bool] = None

class UserProfileOut(BaseModel):
    id: uuid.UUID
    auth_user_id: Union[uuid.UUID, str]
    name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    track_witr: bool = True
    quran_language: str = "en.sahih"
    onboarding_complete: bool = False
    daily_reminder_time: Optional[str] = "21:00"
    notifications_enabled: bool = False
    joined_at: datetime

    class Config:
        from_attributes = True


# ─── Prayer Counts ─────────────────────────────────────────────
class PrayerCountsOut(BaseModel):
    fajr: int = 0
    dhuhr: int = 0
    asr: int = 0
    maghrib: int = 0
    isha: int = 0
    witr: int = 0
    updated_at: datetime

    class Config:
        from_attributes = True

class PrayerCountsUpdate(BaseModel):
    fajr: Optional[int] = None
    dhuhr: Optional[int] = None
    asr: Optional[int] = None
    maghrib: Optional[int] = None
    isha: Optional[int] = None
    witr: Optional[int] = None


# ─── Daily Log ─────────────────────────────────────────────────
class DailyLogEntry(BaseModel):
    prayer_name: str
    status: str  # prayed | missed | pending

class DailyLogUpdate(BaseModel):
    entries: list[DailyLogEntry]

class DailyLogOut(BaseModel):
    log_date: str
    prayers: dict[str, str]  # prayer_name -> status


# ─── Prayer History ────────────────────────────────────────────
class PrayerHistoryCreate(BaseModel):
    prayer_name: str
    event_type: str  # completed | added | reset
    amount: int

class PrayerHistoryOut(BaseModel):
    id: uuid.UUID
    prayer_name: str
    event_type: str
    amount: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Push Notifications ────────────────────────────────────────
class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh_key: str
    auth_key: str

class PushSubscriptionOut(BaseModel):
    id: uuid.UUID
    endpoint: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── AI Chat ───────────────────────────────────────────────────
class AiChatMessage(BaseModel):
    content: str
    include_prayer_context: bool = True

class AiChatResponse(BaseModel):
    role: str = "assistant"
    content: str

class AiImageRequest(BaseModel):
    prompt: str
    style: Optional[str] = "islamic_art"


# ─── Quran Bookmarks ───────────────────────────────────────────
class QuranBookmarkCreate(BaseModel):
    surah_num: int
    ayah_num: int
    note: Optional[str] = None

class QuranBookmarkOut(BaseModel):
    id: uuid.UUID
    surah_num: int
    ayah_num: int
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
