# PetLife AI Demo

Two-tier React + Node.js application for pet insurance workflows powered by Google Gemini API.

## Architecture

```
client/   React + Vite frontend  (port 5173)
server/   Node.js + Express API  (port 3001)
```

## Portals

### Hotel Portal (`/hotel`)
Workflow for boarding facilities managing pet stays.

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Health Pass | `GET /api/hotel/health-pass` | Vaccine status (GREEN / AMBER / RED) |
| Stay Protection Quote | `GET /api/hotel/stay-protection/quote` | $3.50/day premium quote |
| Stay Protection Bind | `POST /api/hotel/stay-protection/bind` | Issue micro-stay policy |
| Incident Report | `POST /api/hotel/incident/report` | File illness / injury / emergency |
| Loyalty Events | `POST /api/hotel/loyalty/apply-event` | Credit rewards to policy |

### Clinic Portal (`/clinic`)
Workflow for veterinary clinics managing claims.

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Eligibility Check | `POST /api/clinic/eligibility` | Verify active EIS policy |
| Pre-Authorization | `POST /api/clinic/pre-auth` | Adjudicate procedure line items |
| Settlement | `POST /api/clinic/settle` | Process final claim payout |

### AI Workbench (original tabs)

| Tab | Use Case | AI Task |
|-----|----------|---------|
| Dashboard | Overview | Mock SOR data |
| New Quote | Policy quoting | Gemini risk assessment |
| Policies | Policy management | Mock CRM/ERP |
| Claims | UC-01 + UC-02 | Invoice parsing + adjudication |
| Medical Coding | UC-03 | SNOMED-CT / ICD-10 coding |
| Breed & Fraud | UC-04 | Vision breed verification |
| Medical History | UC-05 | Longitudinal record review |
| Underwriting | UC-06 | Multi-agent risk decision |
| Billing | ERP mock | Premium & invoice management |

## Setup

### 1. Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm run dev
```

### 2. Client
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Test Data

### Hotel Portal
| Pet | ID | Health Pass |
|-----|----|-------------|
| Waffles | `PET-7721` | GREEN — all vaccines current |
| Rocky | `PET-3341` | AMBER — Bordetella expiring soon |

### Clinic Portal (EIS policies)
| Pet | Policy | Deductible |
|-----|--------|------------|
| Rocky | `PET-2026-774512` | $200 — fully met |
| Waffles | `PET-2026-991823` | $250 — unmet |
| Luna | `PET-2026-334801` | $150 — partially met |

Clinic ID for eligibility search: `CLINIC-NVA-0881`

## Testing

```bash
# Server — Jest (unit + route regression, 77 tests)
cd server && npm test

# Client — Vitest + React Testing Library (5 component tests)
cd client && npm test
```

CI runs both test suites plus a Vite production build on every push to `main` via `.github/workflows/petlife-demo-ci.yml`.

## Sample Documents

Sample PDFs for each use case are in `C:\AIBrain\PetLife\`:
- `RecieptInvoices/` — invoice PDFs for Claims tab
- `Automated_Medical_Coding/` — SOAP note PDFs
- `Breed_Fraud_Verification/` — breed verification PDFs
- `Longitudinal_Medical_History_Review/` — history PDFs
- `Multi_Agent_Risk_Underwriting/` — underwriting PDFs
- `Basic_Claims_Adjudication/` — claims PDFs

## Gemini Models Used

- `gemini-1.5-flash` — fast tasks (quote, adjudication, coding)
- `gemini-1.5-pro` — vision tasks (breed, invoice PDF, history PDF)
