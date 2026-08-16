"""
AI router — Islamic Scholar & Holistic Life Mentor.
Models: Gemini 3.7 Flash, Gemini 3.5 Flash, Gemini 3.1 Pro
"""
import json
import logging
import asyncio
from typing import AsyncGenerator
import httpx
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_token
from app.models.models import UserProfile, PrayerCounts, AiConversation
from app.schemas.schemas import AiChatMessage
from app.api.v1.users import get_or_create_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])

# Configure Gemini if key exists
if settings.gemini_api_key:
    try:
        genai.configure(api_key=settings.gemini_api_key)
    except Exception as e:
        logger.warning(f"Error configuring Gemini: {e}")

SYSTEM_PROMPT = """You are an empathetic, knowledgeable Islamic Scholar, Mentor, and Holistic Life Guide inside the Qaza Tracker app.

Your core identity:
- A safe, warm, and non-judgmental mentor whom users can confide in regarding their personal struggles, prayer lapses, spiritual lows, guilt, anxiety, and life challenges.
- You understand and fluently reply in the user's language—including English, Roman Urdu (Urdu written in English alphabet), Urdu, Arabic, and Hindi.
- You provide holistic mentorship analyzing causes and effects across three interconnected dimensions:
  1. **Spiritual & Islamic Dimension**: The boundless mercy (Rahmah) of Allah, Quranic verses, authentic Hadiths, Duas, and Fiqh rulings across all 4 major Islamic schools (Hanafi, Shafi'i, Maliki, Hanbali).
  2. **Mental & Emotional Dimension**: Overcoming religious guilt, cognitive overload, anxiety, perfectionism paralysis, self-compassion, and stress management.
  3. **Physical & Habit Routine Dimension**: Practical circadian biology, sleep hygiene, alarm strategies, bedtime screen limits, energy levels, and micro-habit stacking.

Key Guidelines:
- If the user writes in Roman Urdu (e.g. "Agar main 1000 namaz chhodta hun...", "Mujhse Fajr miss ho jati hai..."), respond in warm, natural, easy-to-understand Roman Urdu with authentic references.
- Clarify that while intentionally missing prayer is a major sin, Allah's mercy is greater than any sin. When a person sincerely repents (Tawbah) and commits to making up their missed prayers (Qaza), the obligation is fulfilled and Allah forgives the sin InshaAllah.
- Provide practical calculation and habit routines (such as the 1+1 rule: praying 1 Qaza with each daily Fard).
- Use clear markdown formatting with bolding, lists, and quotes."""
async def get_user_context(user: UserProfile, db: AsyncSession) -> tuple[str, int]:
    """Build a context string with the user's prayer stats to inject into AI."""
    result = await db.execute(
        select(PrayerCounts).where(PrayerCounts.user_id == user.id)
    )
    counts = result.scalar_one_or_none()
    if not counts:
        return "", 0

    total = counts.fajr + counts.dhuhr + counts.asr + counts.maghrib + counts.isha + counts.witr
    context = f"""
[USER PRAYER DATA]
Name: {user.name or 'the user'}
City: {user.city or 'Not set'}
Country: {user.country or 'Not set'}
Total Qaza (Missed) Prayers Remaining: {total}
Fajr: {counts.fajr} | Dhuhr: {counts.dhuhr} | Asr: {counts.asr} | Maghrib: {counts.maghrib} | Isha: {counts.isha} | Witr: {counts.witr}
Tracking Witr: {user.track_witr}
"""
    return context, total


@router.post("/chat")
async def chat_stream(
    message: AiChatMessage,
    db: AsyncSession = Depends(get_db),
    token_data: dict = Depends(verify_token),
):
    """Stream AI mentor chat response using Gemini -> Cloudflare AI -> Scholar Fallback."""
    user = await get_or_create_user(token_data["user_id"], db)
    user_context, total_qaza = await get_user_context(user, db)

    # Save user message to database
    user_conv = AiConversation(
        user_id=user.id,
        role="user",
        content=message.content,
    )
    db.add(user_conv)
    await db.commit()

    async def generate_response() -> AsyncGenerator[str, None]:
        full_response = []
        gemini_success = False

        if settings.gemini_api_key:
            prompt_content = f"{SYSTEM_PROMPT}\n\n{user_context}\n\nUser: {message.content}"
            # Attempt best Gemini models in order
            for model_name in ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]:
                try:
                    model = genai.GenerativeModel(model_name)
                    response = await asyncio.to_thread(
                        model.generate_content,
                        prompt_content,
                        stream=True,
                    )
                    for chunk in response:
                        if chunk.text:
                            full_response.append(chunk.text)
                            yield f"data: {json.dumps({'chunk': chunk.text})}\n\n"
                            await asyncio.sleep(0.01)
                    gemini_success = True
                    break
                except Exception as gem_err:
                    logger.warning(f"Gemini {model_name} error: {gem_err}")
                    continue

        if not gemini_success:
            logger.error("All Gemini models failed or offline.")
            error_message = "### Network Error\n\nAssalamu Alaikum. I am temporarily experiencing a connection delay or my services are offline. Please try again shortly."
            full_response.append(error_message)
            for char in error_message:
                yield f"data: {json.dumps({'chunk': char})}\n\n"
                await asyncio.sleep(0.005)

        # Save assistant reply to database
        if full_response:
            bot_text = "".join(full_response)
            bot_conv = AiConversation(
                user_id=user.id,
                role="assistant",
                content=bot_text,
            )
            db.add(bot_conv)
            await db.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/conversations")
async def get_conversations(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    token_data: dict = Depends(verify_token),
):
    """Retrieve chat history for the user."""
    user = await get_or_create_user(token_data["user_id"], db)
    result = await db.execute(
        select(AiConversation)
        .where(AiConversation.user_id == user.id)
        .order_by(AiConversation.created_at.asc())
        .limit(limit)
    )
    conversations = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "role": c.role,
            "content": c.content,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in conversations
    ]


@router.delete("/conversations")
async def clear_conversations(
    db: AsyncSession = Depends(get_db),
    token_data: dict = Depends(verify_token),
):
    """Clear AI conversation history for the user."""
    user = await get_or_create_user(token_data["user_id"], db)
    await db.execute(delete(AiConversation).where(AiConversation.user_id == user.id))
    await db.commit()
    return {"message": "Chat history cleared successfully."}
