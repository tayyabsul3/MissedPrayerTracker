# 🕌 Qaza Tracker — Full-Stack Missed Prayer Tracker & Spiritual Companion

A modern, full-stack Islamic Progressive Web Application (PWA) designed to help Muslims calculate, track, and consistently fulfill missed obligatory prayers (**Qaza Salah**) with steadfastness (*Istiqamah*), spiritual motivation, and peace of mind.

Built with **Vue 3**, **FastAPI**, **PostgreSQL (Neon)**, **Google Identity Services**, and powered by **Gemini 3.5 Flash** for holistic spiritual & lifestyle mentorship.

---

## ✨ Features Overview

### 1. 📊 Smart Qaza & Daily Salah Tracking
- **Historical Qaza Debt Tracker**: Track debt across all 5 obligatory Fard prayers (**Fajr**, **Dhuhr**, **Asr**, **Maghrib**, **Isha**). Increment, decrement, or bulk-edit values with instant animated visual feedback.
- **Daily 5-Prayer Salah Checklist**: Log daily prayer statuses (*Prayed*, *Missed*, *Pending*). Marking a prayer as **Missed** automatically rolls over `+1` into your historical Qaza balance.
- **Calculated Local Prayer Times**: 12-Hour (AM/PM) and 24-Hour prayer times dynamically calculated for any city worldwide via the Aladhan API.

### 2. 📖 16-Line Classical Quran Reader (Dual-Page Stack)
- **Minimalist 3-Button Hub**:
  - 📖 **Resume Reading**: 1-click jump to last read Page (1–604), Surah, and Juz.
  - 📑 **Surah Index**: Searchable directory of all 114 Surahs with exact starting pages.
  - 📚 **Juz Index**: 30-Para directory with Arabic titles and instant navigation.
- **Stacked Dual-Page Architecture**:
  - **Top Page**: Authentic **16-line classical Arabic Mushaf page** with Surah headers, Bismillah, and Ayah end markers (۝).
  - **Bottom Page**: Matching **continuous translation page** with inline numbered badges, mirroring the Arabic layout.
- **Fixed Pagination Dock**: Floating Previous / Next controls, direct page input, and auto-hidden mobile app dock for undistracted reading.

### 3. 🤖 AI Islamic Mentor & Life Guide (Gemini 3.5 Flash)
- **Holistic Cause-and-Effect Mentorship**: Confide safely about personal struggles, spiritual dips, guilt, or habit lapses. Mentorship breaks down causes and actionable solutions across:
  - 🌿 **Spiritual & Islamic**: Authentic Quranic Ayahs, Hadith citations, Rahmah (Allah's mercy), and Duas.
  - 🧠 **Mental & Emotional**: Overcoming religious guilt, cognitive burnout, anxiety, and perfectionism paralysis.
  - ⏰ **Physical & Lifestyle**: Sleep hygiene, alarm strategies, circadian biology, and micro-habits for waking up for Fajr.
- **ChatGPT-Style Interface**: Multiline auto-resizing input without scrollbars, struggle suggestion chips, voice recognition (Web Speech API), and streaming markdown.

### 4. 📈 History, Visual Analytics & AI Spiritual Reflection
- **Salah Distribution Bars**: Visual breakdown of fulfilled Qaza prayers across each Salah.
- **On-Demand AI Progress Reflection**: Generates a personalized spiritual motivation report with Hadiths praising your steadfastness.
- **Activity Timeline**: Full filterable audit log of every prayer completed or missed.

### 5. ⚙️ Rich App Customization & Settings
- **App Font Size Scale**: Scale the entire application UI dynamically (**Small**, **Default**, **Large**, **XL**).
- **Prayer Calculation Methods**: University of Islamic Sciences Karachi, MWL, ISNA, Umm Al-Qura Makkah, Egyptian Authority, Tehran.
- **Asr Juristic Methods**: Hanafi (Double Shadow) vs Standard (Shafi'i, Maliki, Hanbali).
- **12-Hour / 24-Hour Toggle**: Switch prayer times format anytime.
- **Push Notification Testing**: Browser WebPush VAPID subscription and test triggers.

---

## 🛠️ Architecture & Tech Stack

```text
MissedPrayerTracker/
├── backend/                  # FastAPI async REST & SSE API
│   ├── app/
│   │   ├── api/v1/           # Auth, Users, Prayers, Quran, AI, Notifications
│   │   ├── core/             # Security (JWT), Config (Pydantic), Database (SQLAlchemy 2.0)
│   │   ├── models/           # PostgreSQL ORM Models
│   │   └── schemas/          # Pydantic V2 Request/Response Schemas
│   └── requirements.txt
│
├── frontend/                 # Vue 3 Single Page PWA
│   ├── src/
│   │   ├── assets/           # Global styles and branding
│   │   ├── router/           # Vue Router navigation guards
│   │   ├── services/         # Axios API client, Google OAuth GIS, SSE client
│   │   ├── stores/           # Pinia Auth & Prayer stores
│   │   ├── utils/            # Country & City database, location helpers
│   │   └── views/            # Dashboard, DailyLog, Quran, AI, History, Settings, Auth
│   ├── index.html            # Google GIS SDK & PWA meta
│   └── package.json
```

| Layer | Technologies |
|---|---|
| **Frontend** | Vue 3 (Composition API), Vite, TypeScript, Pinia, Tailwind CSS, Lucide Vue, Google Identity Services SDK |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy 2.0 (Async), Asyncpg, Pydantic V2, PyWebPush, Google Generative AI (Gemini) |
| **Database** | PostgreSQL Serverless (Neon) with SSL pooling |
| **Authentication**| Native Google OAuth 2.0 (GIS) + JWT Bearer tokens |
| **Notifications** | WebPush VAPID Protocol + Service Worker Background Sync |

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.10+ and **pip**
- A **PostgreSQL / Neon database** URL

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/MissedPrayerTracker.git
cd MissedPrayerTracker
```

---

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```ini
DATABASE_URL=postgresql+asyncpg://username:password@your-host.neon.tech/neondb?ssl=require
NEON_AUTH_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

Run database migrations & start the API server:
```bash
# Start backend on http://localhost:8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 3. Frontend Setup
```bash
cd ../frontend

# Install node dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `frontend/.env`:
```ini
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Start the Vite development server:
```bash
npm run dev -- --host
```

Open your browser at `http://localhost:5173` (or on your local network IP on mobile).

---

## 📱 Mobile PWA Installation
- **iOS (Safari)**: Tap **Share** $\rightarrow$ **Add to Home Screen**.
- **Android (Chrome)**: Tap **Install App** or the three dots $\rightarrow$ **Add to Home screen**.
- Launches in fullscreen standalone mode with native performance.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
May Allah accept our prayers and make the fulfillment of all missed obligations easy and blessed.