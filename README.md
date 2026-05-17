# ⚡ OMEGA — IPL Tactical Intelligence OS

### *The Cinematic Multi-Agent IPL Prediction Engine — Powered by Google Gemini*

[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-8B5CF6?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![DOMParser](https://img.shields.io/badge/Scraper-DOMParser-10B981?style=for-the-badge)](#)

> *"OMEGA is not a score predictor. It is a live F1 pit-wall strategy room built for the intensity of the IPL dugout."*

---

## 🌟 What is OMEGA?

OMEGA is a state-of-the-art **multi-agent tactical operating system**. By feeding it a live match state, OMEGA doesn't just predict who wins—it orchestrates an adversarial debate among four distinct AI agents to generate mathematically grounded, physically aware cricket strategy in real-time.

1. 📡 **Real-Time Data Integration** — Scrapes live IPL matches directly via a custom proxy engine.
2. ⚔️ **4-Agent Debate Loop** — Specialized AI personas clash over tactics, exposing blind spots.
3. 🌦️ **Geospatial & Micro-Climate Context** — Dynamically models stadium dimensions, soil profiles, and heavy dew factors.
4. 🎙️ **Cinematic Synthesis** — Outputs tactical plans in the electrifying language of an IPL broadcaster.

---

## 🧠 The Four Specialists

OMEGA utilizes a single unified Google Gemini prompt structure to trigger a structured JSON debate between four named personas:

| Agent | Role | Focus |
| --- | --- | --- |
| 🧮 **THE QUANT** | Probability Engine | Clinical, numbers-driven run-rate modeling. Identifies statistical boundary pressure. |
| 👑 **THE STRATEGIST** | Captaincy Brain | Sharp, pragmatic leadership. Maps out the primary bowling/fielding decisions. |
| 😈 **THE SKEPTIC** | Adversarial Attacker | Exposes blind spots. Paranoid. Heavily scrutinizes the *Micro-Climate (Dew)* and pitches. |
| 🎙️ **THE BROADCASTER** | Cricket Storyteller | Synthesizes the final decision into electric, high-tension commentary. |

---

## 🌪️ Advanced System Features

### 1. 🛡️ Unrestricted Live Match Engine
Most cricket APIs are rate-limited or expensive. OMEGA utilizes a custom **Vite Proxy Tunnel** to intercept requests, bypass CORS, and use the browser's native `DOMParser` to extract live scores, overs, and match status directly from the web, unrestricted and free. Includes a **30-second TTL cache** to prevent throttling.

### 2. 🌍 Geospatial & Micro-Climate Injection
OMEGA is mathematically aware of the physical stadium. If a match is played at Wankhede, the engine automatically injects data regarding its **Red Soil, high bounce, and short 64m square boundaries**, and actively calculates **Dew Risk** based on humidity hashes. The AI adjusts its spin and pace strategies accordingly.

### 3. 🔐 Commander Authentication
Secured via a gorgeous glassmorphic **Firebase Authentication Gateway**. 
- **Google One-Tap Login**
- **Email & Password Authentication**
- Automatic session hydration via `onAuthStateChanged`. The War Room cannot be accessed without clearance.

---

## 🛠️ Tech Stack

- **Core Application:** HTML5, Vanilla JavaScript (ESModules)
- **Styling:** CSS3 with Glassmorphism, CSS Variables, and Inter/JetBrains Mono fonts
- **Build Tool / Backend Proxy:** Vite 8
- **AI Engine:** Google Gemini API (`gemini-2.5-flash`)
- **Identity:** Google Firebase Auth
- **Visualization:** Native HTML5 Canvas API (Tactical Field Renderer)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Google Gemini API Key](https://aistudio.google.com/apikey)
- A Firebase Project (for Authentication)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hackmaass/CricketAgent-.git
   cd CricketAgent-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # Google Gemini API Key
   VITE_GEMINI_KEY=your_gemini_api_key

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Launch the War Room:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🎮 Operating the System

1. **Authenticate:** Click "Login" on the cinematic landing page. Use Google or initialize an Email profile.
2. **Select Match:** Navigate to the "Live Matches" tab inside the War Room. OMEGA automatically pulls active matches from the web.
3. **Execute Prediction:** Click any live match. OMEGA parses the score, calculates the phase, loads the stadium telemetry, and fires the 4-agent debate loop.
4. **Analyze Output:** Review the Win Probability split, read the internal agent conflict log, and view the recommended tactical field placements on the canvas.

---

*Built for absolute dominance.* 🏆
