# Requirements — Carrier P&C Claims AI Demo

---

## Scope

This is a demonstration platform for an AI-augmented Property & Casualty claims adjuster workflow. It is not a production system — there is no real insured data, no persistent storage, and no authentication. All data is seeded in-memory.

---

## Functional Requirements

### FR-01 — Dashboard

| ID | Requirement |
|---|---|
| FR-01.1 | Display 5 KPI cards: Total Active Claims, Avg Cycle Time, Total Exposure, SIU Referrals YTD, Settled This Month |
| FR-01.2 | Display a claims table with columns: Claim #, Insured, Peril, Location, Opened, Amount, Status, Risk |
| FR-01.3 | Claims table supports text search (by claim # or insured name) |
| FR-01.4 | Claims table supports filter by Status and by Risk level |
| FR-01.5 | Display an AI Risk Insight panel showing the highest-priority flagged claim |
| FR-01.6 | Display a regional bar chart (CSS bars — no charting library) |
| FR-01.7 | "+ New Claim" button navigates to the FNOL form |
| FR-01.8 | Clicking a claim row navigates to the 5-step claim review |

### FR-02 — FNOL Form (Report New Claim)

| ID | Requirement |
|---|---|
| FR-02.1 | Form is divided into 4 sections: Policyholder, Loss Location, Incident Details, Documents |
| FR-02.2 | Entering a policy number auto-populates policyholder name, phone, and email |
| FR-02.3 | Type of Loss and Cause of Loss are `<select>` dropdowns |
| FR-02.4 | Document upload area accepts drag-and-drop; stores filenames in local state (no real upload) |
| FR-02.5 | Submit creates a new claim and redirects to Step 1 of the review workflow |
| FR-02.6 | An AI TIP callout is shown above the submit button |

### FR-03 — Claim Review (5-step workflow)

**Persistent elements (all steps):**
| ID | Requirement |
|---|---|
| FR-03.1 | Claim header bar shows: Claim #, Insured Name, Peril, Location, Policy #, Date |
| FR-03.2 | Step progress bar shows 5 labeled steps; completed steps are visually distinct |
| FR-03.3 | Clicking a completed step navigates to it via `?step=N` query param |

**Step 1 — Review Submission:**
| ID | Requirement |
|---|---|
| FR-03.1.1 | Display full FNOL narrative |
| FR-03.1.2 | Display policy details: number, type, period, deductible, limits |
| FR-03.1.3 | Display uploaded documents list with document type badges |
| FR-03.1.4 | Clicking a document opens a preview modal or new tab |

**Step 2 — Claim Validation:**
| ID | Requirement |
|---|---|
| FR-03.2.1 | Show coverage eligibility check results (covered / excluded badges) |
| FR-03.2.2 | Call `POST /api/ai/address-compare` on mount and render results panel |
| FR-03.2.3 | Call `POST /api/ai/photo-review` on mount and render results panel |
| FR-03.2.4 | Address compare panel shows: CRM address, each document's address, overall verdict, risk level |
| FR-03.2.5 | Photo review panel shows: overall consistency, damage severity, zone breakdown |
| FR-03.2.6 | Fraud indicators are displayed with color-coded severity |

**Step 3 — Insights & Evidence:**
| ID | Requirement |
|---|---|
| FR-03.3.1 | Display fraud risk gauge / score from AI Factory |
| FR-03.3.2 | Call `POST /api/ai/fraud-vector` on mount and display fraud vectors |
| FR-03.3.3 | Display a prior claims history table |
| FR-03.3.4 | Show a "View IoT Data" button that opens the IoT Sensor Modal |
| FR-03.3.5 | IoT modal shows sensor readings (water, smoke, heat, CO) at time of loss |

**Step 4 — Communications Log:**
| ID | Requirement |
|---|---|
| FR-03.4.1 | Display full communications history for the claim |
| FR-03.4.2 | Show AI-generated email template cards (e.g. status update, document request) |
| FR-03.4.3 | Each template card has a Copy button |

**Step 5 — Next Steps:**
| ID | Requirement |
|---|---|
| FR-03.5.1 | Display current decision status (Approve / Deny / Pending) |
| FR-03.5.2 | Show a "Next Best Actions" panel with action buttons |
| FR-03.5.3 | Clicking a Next Best Action button shows a confirmation modal |
| FR-03.5.4 | A "Request Service Provider" button opens the Service Provider Modal |
| FR-03.5.5 | Service Provider Modal lists available providers filtered by peril/trade |

### FR-04 — Ask Stella (AI Assistant)

| ID | Requirement |
|---|---|
| FR-04.1 | "Ask Stella" button is always visible in the top navigation |
| FR-04.2 | Clicking the button opens a slide-in chat panel (right side) |
| FR-04.3 | Each page/step sets a context object `{ page, claimId, step }` before Stella requests |
| FR-04.4 | User messages are sent to `POST /api/stella/chat` with the current context and conversation history |
| FR-04.5 | Stella receives the full claim JSON in its system prompt when a claimId is active |
| FR-04.6 | Stella can answer questions about claim data, fraud risk, missing documents, and next actions |
| FR-04.7 | Conversation history persists within the current claim session; clears on claim change |
| FR-04.8 | If no API key is configured, Stella returns a simulated demo reply |

### FR-05 — Claims List Page

| ID | Requirement |
|---|---|
| FR-05.1 | Display all claims in a table matching dashboard style |
| FR-05.2 | Support search, status filter, and risk filter |
| FR-05.3 | Clicking a claim navigates to the 5-step review |

### FR-06 — Reports / Analytics Page

| ID | Requirement |
|---|---|
| FR-06.1 | Display 5 portfolio-level KPI cards |
| FR-06.2 | Display "Claims by Peril Type" horizontal bar chart |
| FR-06.3 | Display "Fraud Risk Distribution" bar chart |
| FR-06.4 | Display "Monthly Settlement Trend" vertical bar chart |
| FR-06.5 | Display regional breakdown table with cycle time and fraud rate |
| FR-06.6 | Display open action items list; clicking an item navigates to the claim |
| FR-06.7 | Export PDF and Export CSV buttons are present (demo — no real export) |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | All pages use a consistent light theme (white panels on light gray background) |
| NFR-02 | The application is fully functional without a Gemini API key (simulated fallback responses) |
| NFR-03 | GEMINI_API_KEY must never appear in client-side code or be committed to git |
| NFR-04 | All AI calls route through the Express backend — never directly from the browser |
| NFR-05 | No external CSS frameworks — all styles are custom CSS Modules |
| NFR-06 | No charting libraries — all charts are CSS bar chart implementations |
| NFR-07 | The app runs with two commands: `npm run dev` in `server/` and `npm run dev` in `client/` |
| NFR-08 | No database — all data lives in in-memory mock objects (server restart resets state) |
| NFR-09 | Color accessibility: text colors must be readable on their backgrounds (no white-on-white) |
| NFR-10 | No login or authentication — the demo opens directly to the dashboard |

---

## Mock Data Requirements

| ID | Requirement |
|---|---|
| MD-01 | Three pre-loaded claims: 2026-108 (Water/John Smith/Orlando), 2026-102 (Fire/Mary Johnson/Miami), 2026-093 (Roof/Robert Davis/Houston) |
| MD-02 | Each claim must have: narrative, policy ref, adjuster, status, documents list, communications log, AI scores |
| MD-03 | AI simulated results must differ per claim to demonstrate varied risk scenarios |
| MD-04 | Claim 2026-102 must yield HIGH fraud risk + SIU_REFERRAL recommendation |
| MD-05 | Claim 2026-108 must yield an address mismatch (invoice address ≠ CRM address) |
| MD-06 | Claim 2026-093 must yield LOW risk + APPROVE recommendation |
| MD-07 | CRM data includes customer segments (Gold/Silver/Bronze), NPS scores, sentiment scores |
| MD-08 | IoT sensor data is scoped to claim 2026-108 (water damage) |

---

## Out of Scope

- Real document upload or storage
- User authentication or role management
- Actual payment processing or reserve management
- PDF or CSV export functionality
- Email sending via Communications Log
- Multi-carrier or multi-tenant support
- Mobile-responsive design
