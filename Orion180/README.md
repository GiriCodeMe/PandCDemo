# Carrier P&C Claims AI Demo

An interactive AI-powered Property & Casualty claims management platform built for adjuster workflow demonstration. The platform walks through a full 5-step claim review lifecycle, integrated with Google Gemini AI for real-time fraud analysis, damage photo review, address verification, and the "Ask Stella" conversational AI assistant.

---

## Quick Start

### Prerequisites
- Node.js 18+
- A Google Gemini API key (optional — the app falls back to simulated AI responses without one)

### 1. Start the backend
```bash
cd server
npm install
# Create server/.env and add your Gemini key (optional):
#   GEMINI_API_KEY=your_key_here
npm run dev
# API running on http://localhost:3001
```

### 2. Start the frontend
```bash
cd client
npm install
npm run dev
# App running on http://localhost:5173
```

### 3. Open the app
Navigate to `http://localhost:5173` — you will be redirected to the Dashboard.

---

## Demo Accounts

No login required. Three pre-loaded claims are available:

| Claim # | Insured | Peril | Location | Fraud Risk |
|---|---|---|---|---|
| 2026-108 | John Smith | Water Damage | Orlando, FL | Medium |
| 2026-102 | Mary Johnson | Fire / Smoke | Miami, FL | High |
| 2026-093 | Robert Davis | Roof Damage | Houston, TX | Low |

---

## Key Features

- **5-Step Claim Review** — Submission review, validation, insights, communications, next steps
- **AI Factory** — Gemini 2.0 Flash analyses: damage photo review, address comparison (CRM vs documents), fraud vector scoring
- **Ask Stella** — Context-aware conversational AI assistant that knows the current claim and step
- **IoT Sensor Dashboard** — Smart home sensor data at time of loss (water, smoke, heat, CO)
- **Service Provider Directory** — Filtered list of registered plumbers, field adjusters, structural engineers
- **Claims Analytics** — Portfolio-level KPIs, peril breakdown, fraud distribution, regional performance
- **FNOL Form** — New claim submission with drag-and-drop document upload

---

## Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `server/.env` | Google Gemini API key for AI features |
| `PORT` | `server/.env` | API port (default: 3001) |

> `server/.env` is in `.gitignore` — never commit it.

---

## Scripts

| Command | Directory | Action |
|---|---|---|
| `npm run dev` | `client/` | Start Vite dev server (HMR) |
| `npm run build` | `client/` | Production build to `client/dist/` |
| `npm run dev` | `server/` | Start Express with `--watch` (auto-restart) |
| `npm start` | `server/` | Start Express (production) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, CSS Modules |
| Backend | Node.js, Express 4 |
| AI | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Data | In-memory mock data (no database) |
| Linting | oxlint |
