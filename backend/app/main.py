"""
Qaza Tracker — FastAPI Backend
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.api.v1 import auth, users, prayers, quran, ai, notifications

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Qaza Tracker API starting up...")
    yield
    logger.info("👋 Qaza Tracker API shutting down...")
    await engine.dispose()


app = FastAPI(
    title="Qaza Tracker API",
    description="Backend for the Qaza Prayer Tracker app with Neon DB, Quran API & AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url=None,
)

# ─── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow local frontend ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(prayers.router, prefix=API_PREFIX)
app.include_router(quran.router, prefix=API_PREFIX)
app.include_router(quran.prayer_router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)


# ─── Health ────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "app": "Qaza Tracker API"}


@app.get("/")
async def root():
    return {"message": "Qaza Tracker API", "docs": "/docs"}
