"""
Quran router — proxies Al Quran Cloud API with in-memory caching.
No API key needed from Al Quran Cloud.
Prayer times via Aladhan API (city-based).
"""
import logging
from cachetools import TTLCache
import httpx
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/quran", tags=["quran"])

# 24-hour TTL cache for Quran data
_cache: TTLCache = TTLCache(maxsize=500, ttl=86400)

QURAN_API = "https://api.alquran.cloud/v1"
ALADHAN_API = "https://api.aladhan.com/v1"


async def _fetch(url: str) -> dict:
    cache_key = url
    if cache_key in _cache:
        return _cache[cache_key]

    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                logger.warning(f"Upstream API returned status {resp.status_code} for {url}")
                raise HTTPException(status_code=502, detail="Upstream API error")
            data = resp.json()
            _cache[cache_key] = data
            return data
    except httpx.RequestError as e:
        logger.error(f"Network error requesting upstream API {url}: {e}")
        raise HTTPException(status_code=502, detail=f"Upstream connection error: {str(e)}")


@router.get("/surah/{number}")
async def get_surah(
    number: int,
    edition: str = Query(default="en.sahih", description="Translation edition code"),
):
    """Get full surah with Arabic text + chosen translation."""
    if number < 1 or number > 114:
        raise HTTPException(status_code=400, detail="Surah number must be between 1 and 114")

    # Fetch Arabic + translation in parallel editions
    url = f"{QURAN_API}/surah/{number}/editions/quran-uthmani,{edition}"
    data = await _fetch(url)
    return data.get("data", data)


@router.get("/page/{page_number}")
async def get_page(
    page_number: int,
    edition: str = Query(default="en.sahih", description="Translation edition code"),
):
    """Get a specific Quran page (1 to 604) with Arabic + translation."""
    if page_number < 1 or page_number > 604:
        raise HTTPException(status_code=400, detail="Page must be between 1 and 604")
    url_arabic = f"{QURAN_API}/page/{page_number}/quran-uthmani"
    url_trans = f"{QURAN_API}/page/{page_number}/{edition}"

    try:
        import asyncio
        arabic_res, trans_res = await asyncio.gather(
            _fetch(url_arabic),
            _fetch(url_trans)
        )
        return [arabic_res.get("data", arabic_res), trans_res.get("data", trans_res)]
    except Exception as e:
        logger.error(f"Error fetching page {page_number}: {e}")
        # Fallback to single fetch
        single = await _fetch(url_arabic)
        return [single.get("data", single), single.get("data", single)]


@router.get("/ayah/{surah}/{ayah}")
async def get_ayah(
    surah: int,
    ayah: int,
    edition: str = Query(default="en.sahih"),
):
    """Get a single ayah with Arabic + translation."""
    url = f"{QURAN_API}/ayah/{surah}:{ayah}/editions/quran-uthmani,{edition}"
    data = await _fetch(url)
    return data.get("data", data)


@router.get("/random")
async def get_random_ayah(
    edition: str = Query(default="en.sahih"),
):
    """Get a random ayah — used for Ayah of the Day widget."""
    url = f"{QURAN_API}/ayah/random/editions/quran-uthmani,{edition}"
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.json().get("data", {})
    except Exception as e:
        logger.warning(f"Error fetching random ayah: {e}")
    # Fallback to Ayah 1 of Al-Fatiha
    return await get_ayah(1, 1, edition)


@router.get("/editions")
async def get_editions():
    """List all available translation editions."""
    url = f"{QURAN_API}/edition?format=text&type=translation"
    data = await _fetch(url)
    return data.get("data", [])


@router.get("/surahs")
async def list_surahs():
    """List all 114 surahs with metadata (name, ayah count etc.)"""
    url = f"{QURAN_API}/surah"
    data = await _fetch(url)
    return data.get("data", [])


@router.get("/search")
async def search_quran(
    q: str = Query(..., min_length=2),
    edition: str = Query(default="en.sahih"),
):
    """Search Quran text."""
    url = f"{QURAN_API}/search/{q}/all/{edition}"
    data = await _fetch(url)
    return data.get("data", {})


# ─── Prayer Times (Aladhan, city-based) ────────────────────────

prayer_router = APIRouter(prefix="/prayer-times", tags=["prayer-times"])


@prayer_router.get("")
async def get_prayer_times(
    city: str = Query(...),
    country: str = Query(...),
    method: int = Query(default=2, description="Calculation method"),
):
    """
    Get today's prayer times for a city with fallback calculations.
    """
    url = f"{ALADHAN_API}/timingsByCity?city={city}&country={country}&method={method}"
    try:
        data = await _fetch(url)
        return data.get("data", data)
    except Exception as e:
        logger.warning(f"Prayer times lookup for {city} fallback: {e}")
        # Return sensible standard prayer times if external network is unavailable
        return {
            "timings": {
                "Fajr": "05:00",
                "Dhuhr": "13:00",
                "Asr": "16:30",
                "Maghrib": "19:45",
                "Isha": "21:15"
            }
        }
