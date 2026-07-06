# Test Plan — Carrier P&C Claims AI Demo

---

## Scope

Manual functional testing for the Carrier P&C Claims AI Demo. Covers all pages, the 5-step claim review workflow, AI Factory analyses, Ask Stella chat, and modals. No automated test suite — this plan is for demo-readiness verification.

---

## Environment Setup

```bash
# Terminal 1 — Backend
cd server
npm install
# Optional: create server/.env with GEMINI_API_KEY=your_key
npm run dev
# Expected: "Server running on port 3001"

# Terminal 2 — Frontend
cd client
npm install
npm run dev
# Expected: Vite server at http://localhost:5173
```

**Verification:** `GET http://localhost:3001/api/health` returns `{ "status": "ok" }` before running any UI tests.

---

## TC-01 — Dashboard

| # | Test | Steps | Expected |
|---|---|---|---|
| 1.1 | Page loads | Navigate to `/dashboard` | 5 KPI cards visible, claims table loaded, no blank/white text |
| 1.2 | KPI values | Inspect KPI cards | Total Active: 121, Avg Cycle: 14.2 days, Exposure: $4.8M, SIU YTD: 7, Settled: 34 |
| 1.3 | Claims table | View table | 3 rows: 2026-108, 2026-102, 2026-093 with correct insureds and perils |
| 1.4 | Search | Type "mary" in search box | Table filters to show only Mary Johnson / 2026-102 |
| 1.5 | Status filter | Select "Under Review" | Table shows only 2026-102 and 2026-093 |
| 1.6 | Risk filter | Select "High" | Table shows only 2026-102 |
| 1.7 | Row click | Click claim 2026-108 row | Navigates to `/claims/2026-108/review?step=1` |
| 1.8 | New Claim button | Click "+ New Claim" | Navigates to `/claims/new` |
| 1.9 | AI Risk Insight | View bottom-left panel | Displays claim 2026-102 as highest-priority flag |
| 1.10 | Region chart | View bottom-right | CSS bars visible with labels and counts |

---

## TC-02 — Report New Claim (FNOL)

| # | Test | Steps | Expected |
|---|---|---|---|
| 2.1 | Form loads | Navigate to `/claims/new` | 4 sections visible, no blank text |
| 2.2 | Policy prefill | Enter a valid policy number + blur/tab | Policyholder name, phone, email auto-populated |
| 2.3 | Type of Loss dropdown | Click Type of Loss | Dropdown options visible |
| 2.4 | Document upload | Drag a file into the upload zone | File name appears in the upload list |
| 2.5 | Form submit | Fill all required fields, click Submit | New claim created; redirected to claim review Step 1 |
| 2.6 | AI TIP callout | View form before submit | AI TIP callout block is visible above the submit button |

---

## TC-03 — Claim Review — Step 1 (Review Submission)

Test on all 3 claims (2026-108, 2026-102, 2026-093).

| # | Test | Steps | Expected |
|---|---|---|---|
| 3.1 | Claim header bar | Open any claim | Header shows Claim #, Insured, Peril, Policy #, Location, Date |
| 3.2 | Step indicator | View stepper | Step 1 is active; steps 2–5 are incomplete |
| 3.3 | FNOL narrative | View Step 1 | Full incident narrative text is readable (not white on white) |
| 3.4 | Policy details | View policy panel | Policy number, type, period, limits, deductible visible |
| 3.5 | Documents list | View documents panel | Document names visible with type badges |
| 3.6 | Navigate to Step 2 | Click Next or Step 2 in stepper | Navigates to `?step=2` |

---

## TC-04 — Claim Review — Step 2 (Claim Validation)

| # | Test | Steps | Expected |
|---|---|---|---|
| 4.1 | Coverage check | Navigate to Step 2 | Coverage eligibility badges rendered (Covered/Excluded/Review) |
| 4.2 | Address Compare loads | Wait for AI panel | Address Compare panel shows CRM address vs invoice addresses |
| 4.3 | Address mismatch — 2026-108 | View 2026-108 Step 2 | Overall verdict: SIGNIFICANT_MISMATCH; risk level: HIGH |
| 4.4 | Photo review loads | Wait for AI panel | Photo Review panel shows overall consistency, damage severity, zones |
| 4.5 | Fraud indicators | View photo review | Fraud indicator list visible with severity colors |
| 4.6 | Fire claim — 2026-102 | View 2026-102 Step 2 | High fraud indicators flagged |
| 4.7 | Low risk — 2026-093 | View 2026-093 Step 2 | Low risk / clean address match |

---

## TC-05 — Claim Review — Step 3 (Insights & Evidence)

| # | Test | Steps | Expected |
|---|---|---|---|
| 5.1 | Fraud vector panel | Navigate to Step 3 | Fraud vectors displayed with individual scores |
| 5.2 | High fraud — 2026-102 | View 2026-102 Step 3 | Overall fraud risk: HIGH; recommendation: SIU_REFERRAL |
| 5.3 | Low risk — 2026-093 | View 2026-093 Step 3 | Overall fraud risk: LOW; recommendation: APPROVE |
| 5.4 | Prior claims history | View Step 3 | Table of prior claims on this policy |
| 5.5 | IoT button visible | View Step 3 | "View IoT Data" button present |
| 5.6 | IoT modal opens | Click "View IoT Data" | Sensor dashboard modal opens |
| 5.7 | Sensor cards | View IoT modal | Sensor cards show status badges (Alert/High/Normal) on light background |
| 5.8 | Sensor timeline | View IoT modal | Event timeline visible with severity-colored dots and labels |
| 5.9 | IoT modal closes | Click X or backdrop | Modal closes; Step 3 still visible |

---

## TC-06 — Claim Review — Step 4 (Communications Log)

| # | Test | Steps | Expected |
|---|---|---|---|
| 6.1 | Comm history | Navigate to Step 4 | List of calls, emails, SMS with dates and summaries |
| 6.2 | AI email templates | View template cards | At least 2 AI-generated email templates visible |
| 6.3 | Copy button | Click Copy on a template | Text copied to clipboard (or visible feedback) |
| 6.4 | Sentiment score | View customer info | NPS score and sentiment score visible |

---

## TC-07 — Claim Review — Step 5 (Next Steps)

| # | Test | Steps | Expected |
|---|---|---|---|
| 7.1 | Step header visible | Navigate to Step 5 | "Next Steps & Final Decision" heading is visible with dark text (not invisible) |
| 7.2 | Decision status | View Step 5 | Current decision status (Approve / Deny / Pending) displayed |
| 7.3 | Next Best Actions panel | View dark navy panel | Action buttons visible with light text on dark background |
| 7.4 | Action button click | Click an action button | Confirm modal opens |
| 7.5 | Confirm modal — light theme | View confirm modal | White background, dark heading and body text (not black on black) |
| 7.6 | Confirm action | Click Confirm in modal | Modal closes; action appears to complete |
| 7.7 | Cancel action | Click Cancel in modal | Modal closes with no change |
| 7.8 | Service Provider button | Click "Request Service Provider" | Service Provider Modal opens |
| 7.9 | Service provider cards | View modal | Provider cards on white/light background with readable text |
| 7.10 | Select provider | Click a provider card | Card highlights with selected style |
| 7.11 | Modal close | Click X or Cancel | Modal closes |

---

## TC-08 — Ask Stella

| # | Test | Steps | Expected |
|---|---|---|---|
| 8.1 | Stella button visible | View any page | "Ask Stella" button in top nav always visible |
| 8.2 | Panel opens | Click "Ask Stella" | Slide-in panel opens from the right |
| 8.3 | Context — dashboard | Open Stella from Dashboard, ask "what claims need attention?" | Stella responds with relevant dashboard context |
| 8.4 | Context — claim | Open Stella from 2026-102 Step 3, ask "what is the fraud risk?" | Stella responds: High risk, SIU referral recommended |
| 8.5 | Context — claim | Ask "what documents are missing?" | Stella answers based on claim data |
| 8.6 | Conversation history | Send 3 messages | Earlier messages remain visible; Stella builds on prior context |
| 8.7 | Context switch | Navigate to a different claim | Stella history resets for new claim |
| 8.8 | No API key | Run without GEMINI_API_KEY | Stella returns a simulated demo reply (no crash or blank response) |
| 8.9 | Panel closes | Click X in panel | Panel closes |

---

## TC-09 — Claims List Page

| # | Test | Steps | Expected |
|---|---|---|---|
| 9.1 | Page loads | Navigate to `/claims` | All 3 claims listed with correct data |
| 9.2 | Search | Search for "houston" | Filters to 2026-093 / Robert Davis |
| 9.3 | Click claim | Click any row | Navigates to claim review |

---

## TC-10 — Reports Page

| # | Test | Steps | Expected |
|---|---|---|---|
| 10.1 | Page loads | Navigate to `/reports` | All content visible; no white-on-white or invisible text |
| 10.2 | KPI cards | View top row | 5 cards: 121 claims, 14.2 days, $4.8M, 7 SIU, 34 settled |
| 10.3 | Peril chart | View chart | Horizontal bars with labels and exposure amounts |
| 10.4 | Fraud distribution | View chart | 3 bars (Low/Medium/High) with counts |
| 10.5 | Settlement trend | View chart | 6 monthly bars (Jan–Jun) with day labels |
| 10.6 | Regional table | View table | 6 regions; cycle time and fraud rate columns use color coding |
| 10.7 | Action items | View section | 3 action items; HIGH in red, MEDIUM in yellow, LOW in green |
| 10.8 | Action item click | Click HIGH action item | Navigates to 2026-102 review |

---

## TC-11 — Theme Consistency (Cross-Page)

| # | Test | Expected |
|---|---|---|
| 11.1 | Dashboard background | Light gray `#f4f6f9` |
| 11.2 | Claims page background | Light gray `#f4f6f9` |
| 11.3 | Reports page background | Light gray `#f4f6f9` |
| 11.4 | Claim review background | Light gray `#f4f6f9` |
| 11.5 | Modal backgrounds | White `#ffffff` with border |
| 11.6 | Sidebar | Dark navy (intentional exception) |
| 11.7 | Top navigation | Dark navy (intentional exception) |
| 11.8 | Next Actions panel in Step 5 | Dark navy (intentional accent, with light text) |
| 11.9 | No white text on white background | Inspect all pages | All text is visible |

---

## TC-12 — API Smoke Tests

Run these directly against `http://localhost:3001`:

| # | Request | Expected |
|---|---|---|
| 12.1 | `GET /api/health` | `{ "status": "ok" }` |
| 12.2 | `GET /api/claims` | Array of 3 claims |
| 12.3 | `GET /api/claims/2026-108` | Full claim object for John Smith |
| 12.4 | `GET /api/claims/2026-102` | Full claim object for Mary Johnson |
| 12.5 | `GET /api/claims/2026-093` | Full claim object for Robert Davis |
| 12.6 | `POST /api/ai/photo-review` body `{"claimId":"2026-108"}` | JSON with `damageSeverity`, `overallConsistency` |
| 12.7 | `POST /api/ai/address-compare` body `{"claimId":"2026-108"}` | JSON with `overallVerdict: "SIGNIFICANT_MISMATCH"` |
| 12.8 | `POST /api/ai/fraud-vector` body `{"claimId":"2026-102"}` | JSON with `overallFraudRisk: "HIGH"` |
| 12.9 | `POST /api/ai/fraud-vector` body `{"claimId":"2026-093"}` | JSON with `overallFraudRisk: "LOW"` |
| 12.10 | `GET /api/crm/customers/CUST-001` | John Smith customer profile |
| 12.11 | `GET /api/erp/invoices/2026-108` | Invoice records for claim 2026-108 |
| 12.12 | `GET /api/sor/policies/2024-001` | HO-3 policy for John Smith |

---

## Known Demo Limitations

| Limitation | Notes |
|---|---|
| Document upload | Files are stored as filenames only — no actual file is uploaded or stored |
| Export buttons | PDF / CSV export buttons are present but do not produce a file |
| Email send | Communications log templates can be copied but not sent |
| Payment log | ERP payment endpoint accepts POST but nothing actually processes |
| IoT sensor data | Only claim 2026-108 (water damage) has meaningful IoT data |
| Stella without API key | Returns a static canned response — not Gemini-generated |
