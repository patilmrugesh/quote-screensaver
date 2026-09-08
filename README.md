# Motivational Quote Screensaver & Focus Hub

A fullscreen, customizable motivational quote screensaver, Pomodoro focus system, habit tracker, and productivity hub designed for workspaces, study sessions, desks, and ambient displays.

Features 200+ curated quotes, 8 preset themes, procedural ambient audio soundscapes, live desk clock, Pomodoro focus timer with 3-second melodic chimes, Next-Gen habit tracker with bad habit breakers and curated routines, and a full-stack SQLite backend with user authentication and cloud synchronization.

---

## ✨ Features

- **Fullscreen Typography & Screensaver**: Centered, editorial, or glass card layout with Google Fonts, smooth GPU-accelerated keyframe transitions, and ambient particle effects.
- **Quote Navigation & History**: Go back (`←`) to revisit quotes you loved, or shuffle forward (`→` / `Space`).
- **8 Curated Themes**: Instant switching between *Midnight OLED*, *Warm Sunset*, *Neon Horizon*, *Forest Sanctuary*, *Nordic Slate*, *Tea House & Cedar*, *Editorial Paper*, and *Lavender Dusk*.
- **Topic & Category Filtering**: Filter quotes by *Motivation*, *Discipline & Focus*, *Wisdom & Philosophy*, *Success & Ambition*, *Mindfulness & Peace*, *Courage & Resilience*, or *Creativity & Art*.
- **Favorites Collection**: Star your favorite quotes (`L`) and browse them in the drawer or enable **"Shuffle Only Favorites"** mode.
- **Procedural Ambient Audio**: Zero-asset soundscapes synthesized dynamically via Web Audio API (*Gentle Rain*, *Deep Focus Brown Noise*, *Alpha Wave Binaural Drone*, *Campfire Embers*).
- **🍅 Pomodoro Focus Timer (`T`)**:
  - Full Pomofocus-style interface with 25m focus, 5m short break, and 15m long break modes.
  - 3-second melodic harmonic chime sequence (*C5 → E5 → G5 → C6*) played at session completion.
  - Gamified activity report with focus streaks, level progression (*Level 1: Mindful Novice* to *Level 5: Zen Grandmaster*), unlockable badges, and session logs.
- **⚡ Next-Gen Habits, To-Do & Routines Hub (`K`)**:
  - Daily habit check-ins with streak tracking and zero default artificial progress (clean canvas).
  - Bad Habit Breaker with real-time "Days Clean" counter and **"🛡️ Resisted Urge! (+40 XP)"** willpower shield button with procedural metallic chime.
  - 5 Curated Life-Changing Routine Packs (*The 20-Page Daily Reader*, *10,000 Steps & Peak Vitality*, *Iron Will Bad Habit Breaker*, *Monk Mode Deep Work*, *Stoic Rituals*).
  - 1-Click **"🍅 Focus"** to launch the Pomodoro timer directly on any to-do task.
- **Full-Stack SQLite Backend & Cloud Sync (`U`)**:
  - Built-in SQLite database (`data/screensaver.db`) with zero external cloud dependencies.
  - Secure authentication (Register, Login, Session Cookies).
  - Offline-first: works fully offline with localStorage and offers 1-click **"Sync Local Data to Cloud"** to backup habits, tasks, and streaks.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack, Standalone Output)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend & Persistence**: Node 22+ Native SQLite (`node:sqlite`) with WAL mode
- **Audio Engine**: Native procedural Web Audio API synthesis (zero external audio files)

---

## 🚀 Deployment Guide (Railway & Render)

The project includes pre-configured deployment blueprints and a multi-stage `Dockerfile` with Node 22 for both Railway and Render.

### Option A: Deploy on Railway (Recommended)

1. Push your repository to GitHub.
2. Log into [railway.app](https://railway.app) and click **"New Project"** → **"Deploy from GitHub repo"**.
3. Select your repository (`patilmrugesh/quote-screensaver`).
4. **Add Persistent Volume for SQLite**:
   - Go to your service settings in Railway → **Volumes** → **Add Volume**.
   - Mount Path: `/app/data` (or set Environment Variable `DATABASE_PATH=/app/data/screensaver.db`).
5. Click **Deploy**. Railway will build the Docker container and provide a live production URL!

---

### Option B: Deploy on Render

1. Push your repository to GitHub.
2. Log into [render.com](https://render.com) and click **"New"** → **"Blueprint"** (or **"Web Service"**).
3. Connect your GitHub repository (`patilmrugesh/quote-screensaver`).
   - Render will automatically detect the [render.yaml](render.yaml) file included in the root.
   - It will automatically attach a 1GB persistent disk at `/var/data` where `screensaver.db` persists.
4. Click **Apply**. Your app will build and deploy on Render's global CDN!

---

## 💻 Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Open http://localhost:3000
```

To test the production build locally:

```bash
npm run build
npm start
```