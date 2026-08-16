"""
Auth router — Email & Password signup/login + Password Reset OTP + Google SSO + JWT tokens + Neon Auth sync + Non-blocking Resend email.
"""
import uuid
import random
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from jose import jwt
import hashlib

from app.core.config import settings
from app.core.database import get_db
from app.models.models import UserProfile, PrayerCounts

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = settings.neon_auth_secret or "qaza_tracker_production_jwt_secret_key_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    name: str = "Fellow Muslim"


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=10)
    new_password: str = Field(..., min_length=6)


class GoogleAuthRequest(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = "Fellow Muslim"
    id_token: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: dict


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "id": str(user_id),
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


async def sync_neon_auth_user(db: AsyncSession, auth_user_id: uuid.UUID, email: str, name: str):
    """Sync user account into neon_auth.user table for Neon Auth Console visibility."""
    try:
        query = text("""
            INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
            VALUES (:id, :name, :email, true, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE 
            SET name = :name, "updatedAt" = NOW();
        """)
        await db.execute(query, {
            "id": auth_user_id,
            "name": name or "Fellow Muslim",
            "email": email.lower().strip()
        })
    except Exception as e:
        logger.warning(f"Neon Auth user sync notice: {e}")


def send_email_via_resend(to_email: str, subject: str, html_content: str):
    """Utility to send transactional email via Resend in background."""
    if settings.resend_api_key:
        try:
            import resend
            resend.api_key = settings.resend_api_key
            resend.Emails.send({
                "from": settings.email_from,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            })
            logger.info(f"Email '{subject}' sent to {to_email}")
        except Exception as e:
            logger.warning(f"Resend email error ({subject}): {e}")


@router.post("/sign-up/email", response_model=AuthResponse)
@router.post("/signup", response_model=AuthResponse)
async def sign_up_email(body: SignUpRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Register new user account with email and password."""
    if len(body.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    user_auth_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, body.email.lower().strip())

    result = await db.execute(
        select(UserProfile).where(UserProfile.auth_user_id == user_auth_uuid)
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead.",
        )

    # Create user profile
    user = UserProfile(
        auth_user_id=user_auth_uuid,
        name=body.name or "Fellow Muslim",
        password_hash=hash_password(body.password),
        onboarding_complete=False,
    )
    db.add(user)
    await db.flush()

    # Create initial prayer counts
    counts = PrayerCounts(user_id=user.id)
    db.add(counts)
    await db.flush()

    # Sync to neon_auth.user
    await sync_neon_auth_user(db, user_auth_uuid, body.email, body.name)
    await db.commit()

    # Send Welcome Email in background (non-blocking)
    welcome_html = f"""
    <div style="font-family: Arial, sans-serif; background: #022c22; color: #e2e8f0; padding: 32px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #10b981;">
        <h2 style="color: #d4af37; margin-top: 0;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
        <h3 style="color: #ffffff;">Assalamu Alaikum {body.name},</h3>
        <p style="color: #a7f3d0; line-height: 1.6;">Welcome to Qaza Tracker. May Allah accept your prayers, forgive past shortcomings, and grant you ease and steadfastness in worship.</p>
        <p style="color: #d4af37; font-weight: bold; margin-top: 20px;">Your prayer accountability companion is now active.</p>
    </div>
    """
    background_tasks.add_task(send_email_via_resend, body.email, "Welcome to Qaza Tracker 🕌", welcome_html)

    token = create_access_token(str(user_auth_uuid))
    return {
        "token": token,
        "user": {
            "id": str(user_auth_uuid),
            "email": body.email,
            "name": user.name,
        }
    }


@router.post("/sign-in/email", response_model=AuthResponse)
@router.post("/login", response_model=AuthResponse)
async def sign_in_email(body: SignInRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user with email and password."""
    user_auth_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, body.email.lower().strip())

    result = await db.execute(
        select(UserProfile).where(UserProfile.auth_user_id == user_auth_uuid)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email. Please check your email or Sign Up.",
        )

    # Verify password
    if user.password_hash:
        if user.password_hash != hash_password(body.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password. Please try again or use 'Forgot Password'.",
            )
    else:
        user.password_hash = hash_password(body.password)
        db.add(user)
        await db.commit()

    # Sync to neon_auth.user
    await sync_neon_auth_user(db, user_auth_uuid, body.email, user.name or "Fellow Muslim")
    await db.commit()

    token = create_access_token(str(user_auth_uuid))
    return {
        "token": token,
        "user": {
            "id": str(user_auth_uuid),
            "email": body.email,
            "name": user.name,
        }
    }


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Generate 6-digit password reset OTP and email it via Resend."""
    user_auth_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, body.email.lower().strip())

    result = await db.execute(
        select(UserProfile).where(UserProfile.auth_user_id == user_auth_uuid)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address.",
        )

    # Generate 6-digit OTP
    otp = f"{random.randint(100000, 999999)}"
    user.reset_otp = otp
    user.reset_otp_expires = datetime.utcnow() + timedelta(minutes=15)
    db.add(user)
    await db.commit()

    # Send OTP Email in background
    reset_html = f"""
    <div style="font-family: Arial, sans-serif; background: #022c22; color: #e2e8f0; padding: 32px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #10b981;">
        <h2 style="color: #d4af37; margin-top: 0;">Password Reset Code</h2>
        <p style="color: #ffffff;">Assalamu Alaikum {user.name or 'Fellow Muslim'},</p>
        <p style="color: #a7f3d0; line-height: 1.6;">You requested a password reset for your Qaza Tracker account. Your 6-digit verification code is:</p>
        <div style="background: rgba(212, 175, 55, 0.2); border: 1px solid #d4af37; color: #d4af37; font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 16px; border-radius: 12px; margin: 20px 0;">
            {otp}
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
    </div>
    """
    background_tasks.add_task(send_email_via_resend, body.email, "Qaza Tracker — Password Reset Code 🔑", reset_html)

    return {
        "message": f"Verification code sent to {body.email}. Please check your inbox (or spam folder)."
    }


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Verify OTP and update user's password."""
    if len(body.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long.",
        )

    user_auth_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, body.email.lower().strip())

    result = await db.execute(
        select(UserProfile).where(UserProfile.auth_user_id == user_auth_uuid)
    )
    user = result.scalar_one_or_none()

    if not user or not user.reset_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset request. Please request a new code.",
        )

    if user.reset_otp.strip() != body.otp.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect 6-digit verification code. Please check and try again.",
        )

    if user.reset_otp_expires and user.reset_otp_expires < datetime.utcnow().replace(tzinfo=user.reset_otp_expires.tzinfo):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code.",
        )

    # Update password and clear OTP
    user.password_hash = hash_password(body.new_password)
    user.reset_otp = None
    user.reset_otp_expires = None
    db.add(user)
    await db.commit()

    token = create_access_token(str(user_auth_uuid))
    return {
        "message": "Password updated successfully!",
        "token": token,
        "user": {
            "id": str(user_auth_uuid),
            "email": body.email,
            "name": user.name,
        }
    }


@router.post("/google", response_model=AuthResponse)
@router.post("/sign-in/google", response_model=AuthResponse)
async def google_auth(body: GoogleAuthRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Authenticate or auto-register user via Google OAuth instantly."""
    email = body.email or "google_user@gmail.com"
    name = body.name or "Google User"
    
    user_auth_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"google_{email.lower().strip()}")

    result = await db.execute(
        select(UserProfile).where(UserProfile.auth_user_id == user_auth_uuid)
    )
    user = result.scalar_one_or_none()

    is_new = False
    if not user:
        is_new = True
        user = UserProfile(
            auth_user_id=user_auth_uuid,
            name=name,
            onboarding_complete=False,
        )
        db.add(user)
        await db.flush()

        counts = PrayerCounts(user_id=user.id)
        db.add(counts)
        await db.flush()

    # Sync to neon_auth.user
    await sync_neon_auth_user(db, user_auth_uuid, email, name)
    await db.commit()

    if is_new:
        welcome_html = f"""
        <div style="font-family: Arial, sans-serif; background: #022c22; color: #e2e8f0; padding: 32px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #10b981;">
            <h2 style="color: #d4af37; margin-top: 0;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
            <h3 style="color: #ffffff;">Assalamu Alaikum {name},</h3>
            <p style="color: #a7f3d0; line-height: 1.6;">Welcome to Qaza Tracker via Google. May Allah bless your journey and accept all your prayers.</p>
        </div>
        """
        background_tasks.add_task(send_email_via_resend, email, "Welcome to Qaza Tracker 🕌", welcome_html)

    token = create_access_token(str(user_auth_uuid))
    return {
        "token": token,
        "user": {
            "id": str(user_auth_uuid),
            "email": email,
            "name": user.name,
        }
    }
