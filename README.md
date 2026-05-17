# 🏏 OMEGA — Live IPL Tactical Intelligence OS

### *The Cinematic Multi-Agent IPL Prediction & Strategy Engine — Powered by Google Gemini*

[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-000000?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-000000?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-000000?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Aesthetic](https://img.shields.io/badge/Design-Black%20%26%20White%20Editorial-000000?style=for-the-badge)](#)

> *"OMEGA is not a simple score predictor. It is a live F1-style pit-wall strategy terminal designed for the high-stakes intensity of the IPL dugout, wrapped in an ultra-premium editorial Black & White visual aesthetic."*

---

## 🏛️ System Architecture

```mermaid
graph TD
    %% User Authentication Gate
    User[Commander Login / SSO] -->|1. Firebase Auth Gate| Auth[Firebase Identity Gateway]
    Auth -->|Clearance Granted| GUI[High-Contrast B&W Dashboard]
    
    %% Input Sources
    GUI -->|Manual Parameters / Preset Selection| Engine[Adversarial Core Engine]
    GUI -->|Live Cricbuzz URL| Scraper[CORS-Bypass Scraper Proxy]
    Scraper -->|Extract Match State & Cache 30s| Engine
    
    %% Preset Injection
    GUI -->|Instant Legendary Presets| Engine
    
    %% Multi-Agent Pipeline
    Engine -->|Assemble Prompt & Context| Gemini[Google Gemini 2.5 Flash]
    Gemini -->|Native Structured JSON| Debate[Adversarial Trace Parser]
    
    %% Specialists Disagreement
    Debate -->|Quant Model| Q[THE QUANT]
    Debate -->|Pragmatic Captain| S[THE STRATEGIST]
    Debate -->|Paranoid Weather Scrutiny| SK[THE SKEPTIC]
    Debate -->|Poetic Broadcaster| B[THE BROADCASTER]
    
    %% Dashboard Sync
    Q & S & SK & B -->|Reconstruct Strategy| UIUpdate[UI Render Orchestrator]
    
    %% Visual & Audio Pipelines
    UIUpdate -->|Draw Vector Placements| Canvas[Dynamic Theme-Aware Canvas Visualizer]
    UIUpdate -->|Expressive Vocalization| Speech[Web Speech Synthesis Engine]
```

---

## 🌟 Core System Features

### 1. ⚔️ The Multi-Agent Adversarial Debate
OMEGA orchestrates a structured, real-time tactical debate utilizing a single optimized, high-fidelity prompt. Four distinct AI personas analyze the game parameters from conflicting perspectives, exposing blind spots and identifying risks:
*   🧮 **THE QUANT (Probability Shift Engine):** Strictly clinical, objective, and data-driven. Computes matchup exploits, boundary pressure indexes, and historical run-rate shifts.
*   👑 **THE STRATEGIST (IPL Captaincy Brain):** The practical decision maker. Formulates bowling plans, target coordinates, and pressure-containment goals.
*   😈 **THE SKEPTIC (Adversarial Critic):** High-tension critique. Highlights spinner limitations, boundary-dimension hazards, and micro-climate failures.
*   🎙️ **THE BROADCASTER (Match Commentator):** Synthesizes the debate into poetic, cinematic commentary, explaining "why this strategy works" for the fans.

### 2. 🏆 Legendary Scenario Presets (One-Click Testing)
To eliminate manual form filling during analysis, OMEGA includes a high-contrast **Presets** tab loaded with high-tension IPL and World Cup scenarios:
1.  **CSK vs GT (IPL 2023 Final Replica):** Nail-biter chase: 10 runs needed off 2 balls. Jadeja on strike vs Mohit Sharma.
2.  **T20 WC 2024 Final (SA Chase replica):** High pressure: 30 needed off 30 balls. Klaasen set vs Jasprit Bumrah's lethal spell.
3.  **Chepauk Spin Trap:** Classical spin-trap: 85 runs needed off 48 balls. Turning track, spinner Rashid Khan bowling.
*Clicking any card instantly hydrates the form values, maps the physical stadiums, and runs the prediction simulation.*

### 🎙️ 3. Expressive Voice Commentary (Harsha Bhogle Synthesis)
Built-in **Web Speech Synthesis Engine** allows users to listen to the final tactical decision read aloud in professional cricket commentator accentuation:
*   **Expressive Pitch & Rate:** Expressively calibrated with a measured rate (`0.92`) and pitch (`1.05`) to mirror Harsha Bhogle's broadcasting rhythm.
*   **Voice Registry Prioritization:** Dynamically queries system voice libraries to bind English Indian or UK dialects automatically.
*   **Markdown Sanitizer:** Ingests the Gemini output, strips raw technical tags, and reads out a beautiful, expressive commentary.

### 🎨 4. Theme-Aware Canvas Radar Visualizer
A highly responsive HTML5 Canvas visualizes exact 2D coordinates for field setups:
*   **Monochrome Style Mapping:** Dynamically senses body theme rules. In default mode, it renders a lush green field; in **B&W mode**, it shifts to a striking editorial layout featuring an absolute black outfield, crisp white boundary lines, and pulsing white markers.
*   **Leak-Free Resize Lifecycle:** Binds bound listeners cleanly and disposes of window resize events in the background to guarantee zero memory overhead.
*   **Energy Saver Loop:** Terminates frame render loops after 8 seconds of active pulsing to preserve system battery and CPU cycles.

### 🛡️ 5. Systems Self-Diagnostic Suite
An integrated diagnostics panel in the configuration hub runs modular health checks:
*   **Scraper Validation:** Pings proxy endpoints to confirm CORS-bypass integrity.
*   **Gemini API Key Validation:** Performs lightweight health-check / ping request to Gemini API.
*   **Firebase SDK Integrity:** Verifies successful initialization of authentication endpoints.

---

## 🛠️ Technical Stack

*   **Core Architecture:** HTML5, Vanilla JavaScript (ESModules)
*   **Design Language:** Grayscale Brutalism, Cormorant Garamond / Inter / JetBrains Mono typography
*   **Build Pipeline & Proxy Routing:** Vite 8
*   **AI Engine:** Google Gemini API (`gemini-2.5-flash`)
*   **Identity Management:** Google Firebase Client SDK
*   **Graphics Engine:** Native 2D Canvas API (Theme-Aware Radar)
*   **Audio Pipeline:** Web Speech API (`window.speechSynthesis`)

---

## 🚀 Installation & Setup

### 1. Prerequisites
*   **Node.js 18+** installed.
*   A [Google Gemini API Key](https://aistudio.google.com/apikey).
*   A Google Firebase Project (for Clearance Gate Authentication).

### 2. Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Hackmaass/CricketAgent-.git
    cd CricketAgent-
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root folder and configure the following:
    ```env
    # Google Gemini API
    VITE_GEMINI_KEY=your_gemini_api_key

    # Firebase Authentication Configurations
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Launch Local Host:**
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:5173`.

---

## 🎮 Command Room Protocol

1.  **Clearance Access:** Click "Clearance Login" or "Launch Command Room" on the minimal home screen. Complete SSO auth using Google.
2.  **Scenario Loading:** Navigate to the **Presets** tab in the sidebar and select any scenario, or paste a live Cricbuzz score URL.
3.  **Execute Prediction:** Review calculated parameters and launch `Run Prediction`.
4.  **Vocalization:** Head to the **Broadcast Feed** tab and click **Listen to Harsha** to synthesize audio review commentary.

---

*Engineered for extreme tactical superiority. Powered by Google Gemini.* 🏏🏆
