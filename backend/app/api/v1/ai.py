"""
AI router — Gemini chat with Islamic Scholar & Holistic Life Mentor persona + Cloudflare image gen.
Features empathetic spiritual, psychological, and physical cause-and-effect guidance.
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
from sqlalchemy import select, desc

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_token
from app.models.models import UserProfile, PrayerCounts, AiConversation
from app.schemas.schemas import AiChatMessage, AiImageRequest
from app.api.v1.users import get_or_create_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])

# Configure Gemini
if settings.gemini_api_key:
    try:
        genai.configure(api_key=settings.gemini_api_key)
    except Exception as e:
        logger.warning(f"Error configuring Gemini: {e}")

SYSTEM_PROMPT = """You are an empathetic, knowledgeable Islamic Scholar, Mentor, and Holistic Life Guide inside the Qaza Tracker app.

Your core identity:
- A safe, warm, and non-judgmental mentor whom users can confide in regarding their personal struggles, prayer lapses, spiritual lows, guilt, anxiety, and life challenges.
- You provide holistic mentorship analyzing causes and effects across three interconnected dimensions:
  1. **Spiritual & Islamic Dimension**: The boundless mercy (Rahmah) of Allah, Quranic verses, authentic Hadiths, Duas, and Fiqh rulings across all 4 major Islamic schools.
  2. **Mental & Emotional Dimension**: Overcoming religious guilt, cognitive overload, anxiety, perfectionism paralysis, self-compassion, and stress management.
  3. **Physical & Habit Routine Dimension**: Practical circadian biology, sleep hygiene, alarm strategies, bedtime screen limits, energy levels, and micro-habit stacking.

Guidelines:
- When a user shares a struggle (e.g. missing Fajr, feeling guilty, overwhelmed with Qaza debt, losing motivation), structure your response clearly:
  - **Empathetic Understanding**: Validate their feelings warmly with Islamic reassurance.
  - **Root Causes & Solutions (Spiritual, Mental & Physical)**: Give practical, holistic advice.
  - **Actionable Step Today**: 1-2 small, achievable steps to implement immediately.
- If prayer statistics are provided, reference them naturally with encouragement.
- Always respond in the user's language (English, Urdu, Arabic, Turkish, etc.).
- Use markdown formatting with clear headings, bullet points, and authentic Quran/Hadith citations."""


def get_scholar_fallback_response(query: str, total_qaza: int = 0) -> str:
    """Holistic Islamic mentor response when API key quota is limited."""
    q = query.lower()
    
    if "fajr" in q or "wake" in q or "sleep" in q:
        return (
            "### Assalamu Alaikum wa Rahmatullahi wa Barakatuh,\n\n"
            "I completely understand how difficult waking up for Fajr can feel—please know that struggling does not make you a bad Muslim; your intention to improve is beloved to Allah.\n\n"
            "#### 1. 🌿 Spiritual Dimension\n"
            "- **The Hadith**: The Prophet ﷺ said: *'Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.'* (Sahih al-Bukhari)\n"
            "- **Dua before sleep**: Recite the last 2 Ayahs of Surah Al-Baqarah and make the intention that your sleep is for Allah's sake.\n\n"
            "#### 2. 🧠 Mental & Emotional Dimension\n"
            "- Release the bedtime anxiety of 'What if I miss it again?'. Give your heart peace through Istighfar before closing your eyes.\n\n"
            "#### 3. ⏰ Physical & Habit Dimension\n"
            "- Place your alarm clock or phone **across the room**, requiring you to stand up to silence it.\n"
            "- Avoid heavy meals and blue-light screens 45 minutes before sleep.\n\n"
            "Take it one day at a time, and remember every effort you make is rewarded!"
        )
    elif "how" in q and ("qaza" in q or "missed" in q or "calculate" in q or "make up" in q):
        return (
            "### Assalamu Alaikum wa Rahmatullahi wa Barakatuh,\n\n"
            "May Allah reward your sincere intention to fulfill your past obligations.\n\n"
            "#### 1. 📖 Islamic Ruling\n"
            "According to the majority consensus of classical scholars (Hanafi, Shafi'i, Maliki, and Hanbali), missed obligatory prayers remains an owed obligation that should be made up with consistent devotion.\n\n"
            "#### 2. 🎯 Practical Habit Plan (1+1 Rule)\n"
            "- Offer **1 Qaza prayer along with each daily Fard prayer** (e.g. 1 missed Fajr before or after today's Fajr). This completes 5 Qaza daily without burnout.\n"
            f"- With your current **{total_qaza} missed prayers recorded**, offering just 5 Qaza per day will fulfill over 150 prayers every single month, InshaAllah!"
        )
    elif "guilt" in q or "tired" in q or "overwhelm" in q or "hopeless" in q or "sin" in q:
        return (
            "### Bismillah ir-Rahman ir-Rahim,\n\n"
            "Dear brother/sister, never lose hope in the infinite Mercy of Allah. The very sorrow in your heart over missed prayers is a sign of living Iman (faith).\n\n"
            "#### 1. 💫 Spiritual Comfort\n"
            "Allah says in the Holy Quran:\n"
            "> *'Say, O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.'* (Surah Az-Zumar: 53)\n\n"
            "#### 2. 🧠 Mental Perspective\n"
            "Shaytan seeks to paralyze you through hopelessness. Counteract this by celebrating small wins: one prayer prayed on time is an immense victory.\n\n"
            "How are you feeling right now? Feel free to share what is weighing on your mind, and let us break it down step-by-step together."
        )
    else:
        return (
            "### Assalamu Alaikum wa Rahmatullahi wa Barakatuh,\n\n"
            "Welcome! I am your Islamic Mentor and spiritual companion. You can talk to me openly about:\n"
            "- Overcoming prayer struggles (Fajr, consistency, Khushu)\n"
            "- Fiqh rulings on Qaza and Salah across all Islamic schools\n"
            "- Practical habit routines and managing spiritual dips\n"
            "- Personal problems, anxiety, or life challenges\n\n"
            "How can I support and guide you today?"
        )


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
    """Stream AI mentor chat response using Gemini 3.5 Flash with holistic advice."""
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
        try:
            if not settings.gemini_api_key:
                fallback = get_scholar_fallback_response(message.content, total_qaza)
                for char in fallback:
                    yield f"data: {json.dumps({'chunk': char})}\n\n"
                    await asyncio.sleep(0.005)
                full_response.append(fallback)
            else:
                prompt_content = f"{SYSTEM_PROMPT}\n\n{user_context}\n\nUser: {message.content}"
                
                try:
                    model = genai.GenerativeModel("gemini-3.5-flash")
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
                except Exception as model_err:
                    logger.warning(f"Primary model error: {model_err}, attempting fallback model...")
                    try:
                        fallback_model = genai.GenerativeModel("gemini-3-flash-preview")
                        response = await asyncio.to_thread(
                            fallback_model.generate_content,
                            prompt_content,
                            stream=True,
                        )
                        for chunk in response:
                            if chunk.text:
                                full_response.append(chunk.text)
                                yield f"data: {json.dumps({'chunk': chunk.text})}\n\n"
                                await asyncio.sleep(0.01)
                    except Exception as quota_err:
                        logger.warning(f"Gemini quota/error: {quota_err}. Using scholar mentor engine.")
                        fallback = get_scholar_fallback_response(message.content, total_qaza)
                        for char in fallback:
                            yield f"data: {json.dumps({'chunk': char})}\n\n"
                            await asyncio.sleep(0.005)
                        full_response.append(fallback)

        except Exception as e:
            logger.error(f"Error in chat streaming: {e}")
            err_msg = get_scholar_fallback_response(message.content, total_qaza)
            yield f"data: {json.dumps({'chunk': err_msg})}\n\n"
            full_response.append(err_msg)

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
    limit: int = 40,
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
    await db.execute(
        select(AiConversation).where(AiConversation.user_id == user.id)
    )
    # delete from DB
    from sqlalchemy import delete
    await db.execute(delete(AiConversation).where(AiConversation.user_id == user.id))
    await db.commit()
    return {"message": "Chat history cleared successfully."}
