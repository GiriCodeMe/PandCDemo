# Architecture — Carrier P&C Claims AI Demo

---

## System Overview

```
Browser
  └── Vite Dev Server (:5173)
        ├── React SPA
        └── /api/* proxy → Express API (:3001)
                              ├── In-memory mock data
                              └── Google Gemini 2.0 Flash (external)
```

---

## Directory Structure

```
Carrier180/
├── client/                          # Vite + React 19 SPA
│   ├── public/
│   │   └── sample-docs/             # Static HTML document previews
│   └── src/
│       ├── App.jsx                  # Router setup
│       ├── main.jsx                 # React entry point
│       ├── index.css                # Global CSS variables + resets
│       ├── context/
│       │   └── StellaContext.jsx    # Stella open/close state, page context, message history
│       ├── services/
│       │   └── api.js               # Typed fetch wrappers for all API routes
│       ├── pages/
│       │   ├── DashboardPage.jsx    # KPI cards, claims table, AI risk insight
│       │   ├── ClaimsPage.jsx       # Filterable/searchable claims list
│       │   ├── ReportClaimPage.jsx  # FNOL 4-section claim submission form
│       │   ├── ReviewClaimPage.jsx  # 5-step claim review orchestrator
│       │   └── ReportsPage.jsx      # Portfolio analytics dashboard
│       └── components/
│           ├── layout/
│           │   ├── Layout.jsx       # Sidebar + TopNav shell
│           │   ├── Sidebar.jsx      # Left navigation
│           │   └── TopNav.jsx       # Top bar: logo, nav links, bell notifications, Stella button
│           ├── claim/
│           │   ├── ClaimStepper.jsx         # 5-step progress indicator
│           │   ├── ClaimSummaryBar.jsx       # Persistent claim header bar
│           │   ├── IoTSensorModal.jsx        # Smart home sensor dashboard modal
│           │   ├── ServiceProviderModal.jsx  # Provider directory modal
│           │   └── steps/
│           │       ├── Step1ReviewSubmission.jsx   # FNOL narrative, policy fields, documents
│           │       ├── Step2ClaimValidation.jsx     # Coverage check, AI Factory analyses
│           │       ├── Step3InsightsReview.jsx      # Visual evidence, fraud gauge, history
│           │       ├── Step4CommunicationsLog.jsx   # Comm log, AI email templates
│           │       └── Step5NextSteps.jsx            # Final decision, next best actions
│           ├── dashboard/
│           │   ├── KpiCard.jsx       # Single stat card
│           │   ├── ClaimsTable.jsx   # Sortable/filterable claims list
│           │   ├── AiRiskInsight.jsx # Top-priority flagged claim panel
│           │   └── RegionChart.jsx   # CSS bar chart by region
│           └── stella/
│               └── StellaPanel.jsx  # Slide-in chat drawer
│
└── server/                          # Express API
    ├── server.js                    # Entry point — mounts all routers
    ├── routes/
    │   ├── claims.js    # GET /api/claims, GET /api/claims/:id, POST, PATCH
    │   ├── stella.js    # POST /api/stella/chat
    │   ├── ai.js        # POST /api/ai/photo-review, address-compare, fraud-vector
    │   ├── crm.js       # GET /api/crm/customers/:id + /history
    │   ├── erp.js       # GET /api/erp/invoices/:claimId, /vendors, /reserves/:claimId
    │   └── sor.js       # GET /api/sor/policies/:policyNumber + /coverages + /claims/history
    ├── services/
    │   ├── gemini.js    # Stella chat: system prompt builder + Gemini chat session
    │   └── aiFactory.js # Three AI analysis functions (photo, address, fraud)
    └── data/
        ├── mockClaims.js          # 3 seed claims with full claim objects
        ├── mockCustomers.js       # CRM customer profiles
        ├── mockPolicies.js        # HO-3 policy records
        ├── mockInvoices.js        # Repair invoices per claim
        ├── mockVendors.js         # Approved contractor list
        ├── mockReserves.js        # Reserve allocations per claim
        └── mockServiceProviders.js # Field adjusters, plumbers, engineers
```

---

## Frontend Architecture

### Routing

| Route | Page | Notes |
|---|---|---|
| `/` | → redirect | Redirects to `/dashboard` |
| `/dashboard` | DashboardPage | KPI overview |
| `/claims` | ClaimsPage | All claims list |
| `/claims/new` | ReportClaimPage | FNOL submission form |
| `/claims/:id/review` | ReviewClaimPage | 5-step review; step controlled by `?step=N` |
| `/reports` | ReportsPage | Portfolio analytics |

### State Management

- **React local state** (`useState`) — per-component UI state
- **StellaContext** — global provider for:
  - `messages` — full chat history
  - `addMessage` / `clearMessages` — message management
  - `updateContext` — sets `{ page, claimId, step }` sent to each Stella request
  - `isOpen` / `toggle` — panel open/close
- No Redux or Zustand — scope is contained enough for Context

### CSS Architecture

- **CSS Modules** per component — zero global class collisions
- **CSS variables** in `:root` (index.css) — single source for colors, spacing, shadows, radii
- Light theme throughout: `--color-bg: #f4f6f9`, `--color-panel: #ffffff`, `--color-text: #1a1d2e`
- Dark elements intentional by design: Sidebar, TopNav, `nextActionsPanel` in Step 5

---

## Backend Architecture

### API Routes

```
GET    /api/health
GET    /api/claims
GET    /api/claims/:id
POST   /api/claims
PATCH  /api/claims/:id/status

POST   /api/stella/chat           { message, context, history }

POST   /api/ai/photo-review       { claimId }
POST   /api/ai/address-compare    { claimId }
POST   /api/ai/fraud-vector       { claimId }

GET    /api/crm/customers/:id
GET    /api/crm/customers/:id/history

GET    /api/erp/invoices/:claimId
GET    /api/erp/vendors
GET    /api/erp/reserves/:claimId

GET    /api/sor/policies/:policyNumber
GET    /api/sor/policies/:policyNumber/coverages
GET    /api/sor/claims/history/:policyNumber
```

### AI Factory (aiFactory.js)

Three independent analysis functions, each following the same pattern:

```
Request → lookup claim data → build Gemini prompt → call Gemini (or use simulated fallback) → return structured JSON
```

| Endpoint | Analysis | Key Output Fields |
|---|---|---|
| `POST /api/ai/photo-review` | Gemini Vision analyzes damage photos | `overallConsistency`, `damageSeverity`, `damageZones[]`, `fraudIndicators[]`, `nextActions[]` |
| `POST /api/ai/address-compare` | Gemini compares CRM address vs document addresses | `overallVerdict`, `riskLevel`, `comparisons[]`, `fraudConcerns[]`, `recommendedActions[]` |
| `POST /api/ai/fraud-vector` | Gemini scores fraud risk across multiple vectors | `overallFraudRisk`, `confidenceScore`, `recommendation`, `vectors[]`, `topRisks[]`, `settlementGuidance` |

Simulated fallbacks are claim-specific (no API key needed for demo):
- **2026-108** (Water): `SIGNIFICANT_MISMATCH` on address (invoice 98 Commerce Dr vs CRM 123 Main St)
- **2026-102** (Fire): `HIGH` fraud risk, `SIU_REFERRAL` recommendation
- **2026-093** (Roof): `LOW` risk, `APPROVE`

### Stella (gemini.js)

- Uses `model.startChat({ history })` for conversation continuity
- System prompt is built dynamically per request, injecting: full claim JSON, current page/step, adjuster context, IoT sensor summary, prior claims history, document addresses
- Conversation history is passed from the client on every message (stateless server pattern)
- Falls back to a static simulated reply if no API key is configured

---

## Data Flow — Claim Review

```
User navigates to /claims/:id/review?step=2
  → ReviewClaimPage fetches GET /api/claims/:id
  → clearMessages() resets Stella history
  → updateContext({ page: 'claim-validation', claimId, step: 2 })
  → Step2ClaimValidation mounts
      → Promise.allSettled([
          POST /api/ai/address-compare,
          POST /api/ai/photo-review
        ])
      → Renders AddressComparePanel + PhotoReviewPanel with results
  → User opens Stella panel and types a question
      → POST /api/stella/chat { message, context, history }
      → Gemini receives claim JSON + conversation history
      → Reply rendered in StellaPanel
```

---

## Security Notes

- `GEMINI_API_KEY` lives in `server/.env` only — never exposed to the client
- `server/.env` is in `.gitignore`
- All AI calls go through Express — the frontend never calls Gemini directly
- No authentication layer (demo app — not for production use)
- All data is in-memory — no persistent database, no PII risk
