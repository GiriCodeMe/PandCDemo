# Carrier P&C Claims AI Demo

An interactive AI-powered Property & Casualty claims management platform built for adjuster workflow demonstration. The platform walks through a full 5-step claim review lifecycle, integrated with Google Gemini AI for real-time fraud analysis, damage photo review, address verification, and the "Ask Stella" conversational AI assistant.

---

## Demo Launch

### Prerequisites

- Node.js 18+
- A Google Gemini API key — get one free at [aistudio.google.com](https://aistudio.google.com)

### Step 1 — One-time setup (first launch only)

```bash
# From the repo root
cd server && npm install && cd ..
cd client && npm install && cd ..
```

Create `server/.env` with your API key:

```
GEMINI_API_KEY=your_key_here
```

> Without the key the app still runs — all AI panels fall back to simulated responses. For a live demo, the key is strongly recommended.

### Step 2 — Start both servers

Open **two terminals** from the `Carrier180/` root:

**Terminal 1 — API server**
```bash
cd server
npm run dev
# Listening on http://localhost:3001
```

**Terminal 2 — Frontend**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

### Step 3 — Open the app

Navigate to **http://localhost:5173** — the Claims Dashboard loads automatically.

---

## Demo Script

Recommended walk-through for a 10–15 minute live demo:

| Step | What to show | Where |
|---|---|---|
| 1 | **Dashboard** — portfolio KPIs, active claims queue | `/` |
| 2 | **Open claim 2026-102** (Mary Johnson, Fire/High Fraud) — most dramatic AI output | Click claim row |
| 3 | **Step 1 – Submission** — policy summary, reported peril, initial documents | Claim detail, tab 1 |
| 4 | **Step 2 – Validation** — AI address comparison (CRM vs docs), anomaly flags | Tab 2 |
| 5 | **Step 3 – AI Insights** — damage photo analysis, fraud vector scoring, IoT data | Tab 3 |
| 6 | **Ask Stella** — type a question like "What are the top fraud indicators on this claim?" | Stella panel |
| 7 | **Step 4 – Communications** — draft adjuster letter with one click | Tab 4 |
| 8 | **Step 5 – Next Steps** — recommended actions, SLA tracker | Tab 5 |
| 9 | **Service Providers** — filtered contractor/adjuster directory | Side nav |
| 10 | **Analytics** — portfolio peril breakdown, regional heatmap | Side nav |

> **Pro tip:** Run the AI steps on claim 2026-102 (High fraud) first, then contrast with 2026-093 (Low fraud) to highlight the scoring difference.

---

## Quick Start

See [Demo Launch](#demo-launch) above for the full walkthrough. TL;DR:

```bash
# Terminal 1 — API server
cd server && npm install && npm run dev

# Terminal 2 — Frontend
cd client && npm install && npm run dev
```

Then open **http://localhost:5173**.

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
