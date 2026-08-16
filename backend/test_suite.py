"""
Async Integration Test Suite for Qaza Tracker.
Uses httpx.AsyncClient with native asyncio event loop.
"""
import sys
import uuid
import asyncio
import httpx
from app.main import app

async def run_async_tests():
    print("=" * 60)
    print("RUNNING ASYNC AUDIT TEST SUITE (NEON DB + FASTAPI)")
    print("=" * 60)

    passed = 0
    failed = 0

    def assert_test(name, condition, details=""):
        nonlocal passed, failed
        if condition:
            print(f"[PASS] {name}")
            passed += 1
        else:
            print(f"[FAIL] {name} - {details}")
            failed += 1

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health
        res = await client.get("/health")
        assert_test("Health Endpoint", res.status_code == 200 and res.json().get("status") == "ok")

        # 2. Signup
        test_email = f"audit_{uuid.uuid4().hex[:6]}@example.com"
        res = await client.post("/api/v1/auth/signup", json={
            "email": test_email,
            "password": "Password123!",
            "name": "Audit Tester"
        })
        assert_test("Auth Signup", res.status_code == 200 and "token" in res.json(), res.text)
        token = res.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Login
        res = await client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": "Password123!"
        })
        assert_test("Auth Login", res.status_code == 200 and "token" in res.json(), res.text)

        # 4. Profile GET
        res = await client.get("/api/v1/users/me", headers=headers)
        assert_test("Get Profile", res.status_code == 200 and res.json().get("name") == "Audit Tester", res.text)

        # 5. Profile PATCH
        res = await client.patch("/api/v1/users/me", headers=headers, json={
            "city": "London",
            "country": "United Kingdom",
            "track_witr": True,
            "quran_language": "en.sahih",
            "onboarding_complete": True
        })
        assert_test("Update Profile", res.status_code == 200 and res.json().get("city") == "London", res.text)

        # 6. Prayer Counts GET
        res = await client.get("/api/v1/prayers/counts", headers=headers)
        assert_test("Get Prayer Counts", res.status_code == 200 and "fajr" in res.json(), res.text)

        # 7. Prayer Counts PATCH
        res = await client.patch("/api/v1/prayers/counts", headers=headers, json={
            "fajr": 10,
            "dhuhr": 5,
            "asr": 3,
            "maghrib": 8,
            "isha": 12,
            "witr": 12
        })
        assert_test("Update Prayer Counts", res.status_code == 200 and res.json().get("fajr") == 10, res.text)

        # 8. Prayer History POST
        res = await client.post("/api/v1/prayers/history", headers=headers, json={
            "prayer_name": "fajr",
            "event_type": "completed",
            "amount": 1
        })
        assert_test("Add Prayer History", res.status_code == 201, res.text)

        # 9. Prayer History GET
        res = await client.get("/api/v1/prayers/history", headers=headers)
        assert_test("List Prayer History", res.status_code == 200 and len(res.json()) >= 1, res.text)

        # 10. Daily Log GET & PATCH
        today_str = "2026-08-15"
        res = await client.patch(f"/api/v1/prayers/daily/{today_str}", headers=headers, json={
            "entries": [
                {"prayer_name": "fajr", "status": "prayed"},
                {"prayer_name": "dhuhr", "status": "prayed"},
                {"prayer_name": "asr", "status": "pending"}
            ]
        })
        assert_test("Update Daily Log", res.status_code == 200 and res.json().get("prayers", {}).get("fajr") == "prayed", res.text)

        # 11. Quran API
        res = await client.get("/api/v1/quran/surah/1?edition=en.sahih")
        assert_test("Quran Surah Al-Fatiha", res.status_code == 200 and len(res.json()) == 2, res.text)

        # 12. Prayer Times
        res = await client.get("/api/v1/prayer-times?city=London&country=GB")
        assert_test("City Prayer Times", res.status_code == 200 and "timings" in res.json(), res.text)

        # 13. VAPID Endpoint
        res = await client.get("/api/v1/notifications/vapid-public-key")
        assert_test("VAPID Key Endpoint", res.status_code == 200, res.text)

    print("=" * 60)
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 60)
    return failed == 0

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    success = asyncio.run(run_async_tests())
    sys.exit(0 if success else 1)
