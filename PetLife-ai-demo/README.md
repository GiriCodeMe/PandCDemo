# PetLife AI Demo

Two-tier React + Node.js application for pet insurance workflows powered by Google Gemini API.

## Architecture

```
client/   React + Vite frontend  (port 5173)
server/   Node.js + Express API  (port 3001)
```

## Use Cases

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
