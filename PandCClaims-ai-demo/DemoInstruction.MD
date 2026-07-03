# P&C Claims AI Demo — Instructions

_Generated: 2026-07-03_

---

## Overview

This demo showcases an end-to-end AI-powered P&C claims processing system built on **Google Gemini 2.0 Flash**. It covers three Lines of Business — **Auto**, **Homeowners**, and **Commercial Property** — each with a dedicated FNOL intake app and a professional adjuster workbench with a multi-step AI orchestration pipeline.

| Component | File | Purpose |
|---|---|---|
| Mobile FNOL App | `mobileApp.html` | Claimant submits first notice of loss |
| Adjuster Workbench | `ClaimsProfessionalWorkbench.html` | AI processing + E2E orchestration pipeline |
| Communication channel | `localStorage` | Real-time sync between the two browser tabs |

---

## Starting the Demo Server

Open a terminal and run:

```bash
cd C:\AIBrain\PandCClaims-ai-demo
python -m http.server 8080
```

Then open **two browser tabs** side by side:

| Tab | URL |
|---|---|
| Mobile App | `http://localhost:8080/mobileApp.html` |
| Adjuster Workbench | `http://localhost:8080/ClaimsProfessionalWorkbench.html` |

> **No API key required for Simulation mode.** For Live mode (real Gemini calls), enter your Google Gemini API key in the workbench settings panel.

---

## Modes

| Mode | Description |
|---|---|
| **Simulation** | Pre-built AI responses with realistic delays. No API key required. Best for demos without internet. |
| **Live** | Real Gemini 2.0 Flash API calls + external API function calling. Requires a valid Gemini API key. |

---

---

## Auto — Hydroplaning Accident (New Jersey)

### Scenario Summary

| Field | Detail |
|---|---|
| Claim ID | CLM-92841-NJ |
| Insured | Michael Carter |
| Vehicle | 2023 Honda Accord EX |
| VIN | 1HGCV1F38PA123456 |
| Policy | LMIC-7812456 (Personal Auto — NJ) |
| Incident | Hydroplaning on Route 1, Plainsboro NJ — front bumper + radiator damage |
| Police Report | NJSP-2026-874512 |
| Tow Company | Garden State Towing LLC |
| Severity | Moderate |

### Step-by-Step Demo Flow

**1. Submit FNOL from Mobile App**

1. Open `mobileApp.html`
2. Select the **Auto** scenario tab
3. Review the pre-filled narrative and damage photos (front bumper, radiator, police report, tow truck)
4. Click **Submit Claim**
5. Confirm the green success banner — payload is written to `localStorage`

**2. Receive Claim in Adjuster Workbench**

1. Switch to `ClaimsProfessionalWorkbench.html`
2. The **Auto** claim card (CLM-92841-NJ) updates from *Pending Sync* to the FNOL narrative
3. Click the claim card to expand the drawer

**3. Run AI Processing**

1. Ensure mode is set to **Simulation** (or enter API key for Live)
2. Click **Process with AI**
3. The workbench displays:
   - Confidence scores (Policy Match, Damage Assessment, Fraud Detection, Coverage Validation)
   - AI Summary narrative
   - Fraud check results (5 signals — all pass for this scenario)
   - Recommended Next Actions (8 items)
   - Timeline of processing events

**4. Run the 7-Step E2E Orchestration Pipeline**

Scroll to the **E2E Auto Claim Orchestration Pipeline** panel and click **▶ Run Live Pipeline**.

| Step | Title | What to Watch |
|---|---|---|
| 01 | Claim Intake | Multimodal understanding — incident type, damage zones, severity score |
| 02 | Policy Verification | Gemini function calling → Mock SOR API `GET /insurance/policy/LMIC-7812456` — collision coverage, rental reimbursement, prior claims |
| 03 | Coverage Verification | Peril match confirmation, deductible applied ($500), eligible coverage amount |
| 04 | Fraud Scoring | Risk score (Low), 4 signal checks — weather match, damage consistency, documents, prior claims |
| 05 | Damage Estimation | Computer vision — repair components, labor hours, estimate range, rental days |
| 06 | AI Claim Summary | Recommendation, settlement range, auto-settle eligibility, rental eligibility |
| 07 | Workflow Orchestration | Rule-based routing → adjuster queue assignment, estimated resolution days |

**Key demo talking points:**
- Step 02 demonstrates **Gemini function calling** — Gemini decides to call the Mock SOR API, receives policy data, and synthesises a verification response in one multi-turn exchange
- Step 07 is **rule-based** (no Gemini) — shows the hybrid AI + deterministic routing pattern
- Each step shows real timing in milliseconds

---

---

## Homeowners — Wind & Hail Storm (Florida)

### Scenario Summary

| Field | Detail |
|---|---|
| Claim ID | CLM-48271-FL |
| Insured | Sarah Johnson (Michael & Karen Rivera in pipeline) |
| Property | 412 Maple Drive, Gainesville, FL 32601 |
| Policy | HO-FL-293847 (Homeowners HO-3 Standard — FL) |
| Incident | Severe thunderstorm — 70 mph winds + large hail — roof shingle loss + ceiling water intrusion |
| NWS Event | NWS-FL-2026-041203 (1.25" hail, 58 mph gusts confirmed) |
| Roof Age | 6 years (Architectural Shingles) |
| Coverage Limit | $380,000 dwelling |
| Severity | Minor / Moderate |

### Step-by-Step Demo Flow

**1. Submit FNOL from Mobile App**

1. Open `mobileApp.html`
2. Select the **Home** scenario tab
3. Review photos: roof damage overview, ceiling water stain, hail evidence, property survey, weather report, contractor quote
4. Click **Submit Claim**

**2. Receive Claim in Adjuster Workbench**

1. Switch to `ClaimsProfessionalWorkbench.html`
2. Click the **Homeowners** claim card (CLM-48271-FL) to expand

**3. Run AI Processing**

1. Click **Process with AI**
2. The workbench displays:
   - Confidence scores (all above 92%)
   - AI Summary — NWS storm confirmation, roof uplift pattern, ALE flag, zero prior claims
   - Fraud checks — all 5 signals pass (NWS data, address validation, roof age, no prior claims, storm trajectory)
   - Recommended Next Actions (9 items including ALE eligibility and emergency mitigation)

**4. Run the 10-Step E2E Orchestration Pipeline**

Scroll to the **E2E Home Claim Orchestration Pipeline** panel and click **▶ Run Live Pipeline**.

| Step | Title | What to Watch |
|---|---|---|
| 01 | FNOL Intake & Channel Detection | Incident type, damage areas, severity score, channel detected |
| 02 | Policy Verification | SOR function call → `GET /insurance/policy/HO-FL-293847` — dwelling limit, ALE coverage, FL hurricane deductible rules |
| 03 | Document & Image Ingestion | Gemini Vision — roof damage zones, water intrusion detection, severity classification |
| 04 | Weather & Property Enrichment | **3 parallel external API calls** — NWS storm data, roof risk score, contractor network |
| 05 | Gemini Understanding Layer | Peril confirmed (Hail/Wind), weather match score, narrative consistency check |
| 06 | Fraud & Risk Scoring | 5 signal checks — fraud score LOW (0.09), weather corroboration pass |
| 07 | Coverage & ALE Decision | **FL hurricane deductible logic** — standard wind/hail deductible applied (not hurricane), ALE eligibility confirmed |
| 08 | Damage & Cost Estimation | Full roof replacement scope — 6-component cost breakdown totalling ~$16,800–$19,600 |
| 09 | Claim Decision Engine | Reserve estimate $18,500, routing decision, settlement range |
| 10 | System Execution & Routing | Guidewire claim file HOM-2026-073104, field adjuster dispatched, Sunshine Roofing & Restoration engaged |

**Key demo talking points:**
- Step 04 fires **3 external API function calls** in parallel (NWS Weather, Roof Risk Score, Contractor Network) — shows enterprise enrichment architecture
- Step 07 highlights **Florida-specific coverage logic** — hurricane deductible only applies to named storms per FL mandate; this storm is non-named so standard wind/hail deductible applies
- Step 10 shows the full **vendor + adjuster dispatch** triggered automatically by the pipeline

---

---

## Commercial — Electrical Fire (Texas)

### Scenario Summary

| Field | Detail |
|---|---|
| Claim ID | CLM-73019-TX |
| Insured | Metro Retail LLC |
| Property | 890 Commerce Blvd, Austin, TX 78701 (8,400 sq ft retail boutique) |
| Policies | CP-TX-884721 (Commercial Property) · BI-TX-884721 (Business Interruption) · GL-TX-884721 (General Liability) |
| Incident | Electrical fire — rear storage area — sprinkler system activated and contained fire |
| AFD Report | AFD-2026-041879 |
| Inventory Exposed | $62,000 (847 SKUs) |
| Monthly Revenue | $380,000 |
| Prior Claims | 1 (BI claim — Dec 2024, $28,000) |
| Severity | High |

### Step-by-Step Demo Flow

**1. Submit FNOL from Mobile App**

1. Open `mobileApp.html`
2. Select the **Commercial** scenario tab
3. Review photos: electrical fire damage, water damage (sprinkler), inventory/PO proof, AFD incident report, building exterior, fire investigator notes
4. Click **Submit Claim**

**2. Receive Claim in Adjuster Workbench**

1. Switch to `ClaimsProfessionalWorkbench.html`
2. Click the **Commercial Property** claim card (CLM-73019-TX) to expand

**3. Run AI Processing**

1. Click **Process with AI**
2. The workbench displays:
   - Confidence scores (91% overall, 93% coverage validation)
   - AI Summary — AFD report validated, BI coverage flagged, enhanced fraud review triggered
   - Fraud checks — 2 flagged items: claim amount exceeds $50K threshold + prior BI claim under review
   - AI Insights panel — Cause of Loss, Damage Severity, BI Risk, Estimated Property Damage ($425K), Estimated BI ($180K), Fraud Risk Score, Priority
   - Recommended Next Actions (8 items including Emergency Mitigation and BI Validation)

**4. Run the 12-Step E2E Orchestration Pipeline**

Scroll to the **E2E Commercial Claim Orchestration Pipeline** panel and click **▶ Run Live Pipeline**.

| Step | Title | What to Watch |
|---|---|---|
| 01 | FNOL Intake + API Gateway | Multi-channel enterprise entry — mobile channel, HIGH-PRIORITY gateway tag, payload normalisation |
| 02 | Document AI + Structured Data | 5 documents processed — AFD report extracted, PO/inventory data extracted, financial statement extracted |
| 03 | Multi-Policy Resolution | **Gemini function call** → `GET /insurance/enterprise/C-TX-00291/policies` — returns all 3 policies (CP + BI + GL) |
| 04 | Loss Classification + Entity Extraction | Gemini core reasoning — loss types (Property + BI + Inventory), affected area, operational downtime risk, regulatory exposure |
| 05 | Weather + Catastrophe Enrichment | CAT event check → Non-Cat Event, fire weather analysis, external ignition source ruled out |
| 06 | Asset + Finance / ERP Enrichment | **2 parallel API calls** — facility RCV ($420K building), ERP revenue data ($380K/month, $528/hr downtime cost), prior claim retrieved |
| 07 | Business Interruption Model | BI calculation — 21-day downtime, $12,667/day, 3-day waiting period, net BI exposure ~$210K vs $250K policy limit |
| 08 | Fraud & Risk Scoring | **MEDIUM fraud score** — prior BI claim flag + $50K threshold anomaly — SIU preliminary review triggered |
| 09 | Coverage + Liability Decision | Multi-policy table — CP APPROVED ($82.5K), BI APPROVED ($180K), GL MONITOR — subrogation LOW |
| 10 | Damage & Loss Estimation | 6-component breakdown — structural $25.5K + electrical $14K + inventory $62K + cleanup $18K + sprinkler $4.5K + board-up $3.5K = **$87,500 total** |
| 11 | Claim Decision Engine | Severity 87%, two-stage settlement strategy, reserve $267.5K (property + BI), routing to Complex Claims + BI Specialist |
| 12 | System Execution + Routing | Guidewire claim COM-2026-073201, reserves allocated per policy, SIU triggered, 2 vendors dispatched, Fire Marshal report requested |

**Key demo talking points:**
- Step 03 shows **enterprise multi-policy resolution** — one Gemini function call surfaces 3 separate policies across CP, BI, and GL lines
- Step 07 is the **Business Interruption Model** — shows daily revenue loss calculation, waiting period exclusion, policy limit cap, and recovery timeline — this is the unique commercial capability
- Step 08 shows **SIU escalation logic** — prior claim within 24-month lookback + claim threshold exceedance triggers SIU preliminary review automatically
- Step 09 renders a **per-policy coverage decision table** — CP approved, BI approved, GL on monitor — shows multi-line adjudication
- Step 12 shows **simultaneous multi-system execution** — Guidewire reserve allocation per LOB, two vendors dispatched, regulatory filing (Fire Marshal), customer notification all triggered in one step

---

---

## Architecture Reference

```
Mobile FNOL App
   ↓  (localStorage)
Adjuster Workbench
   ↓
AIFactory (Gemini 2.0 Flash)
   ↓
E2E Orchestration Pipeline
   ├── Mock SOR API            (Policy + Customer + Enterprise lookup)
   ├── External Enrichment     (Weather / Property / ERP / Asset APIs)
   └── Rule-Based Routing      (Guidewire / Adjuster Queue / SIU)
```

| Layer | Technology |
|---|---|
| AI Reasoning | Google Gemini 2.0 Flash (`gemini-flash-latest`) |
| Function Calling | Multi-turn Gemini tool use — request → functionCall → functionResponse → synthesis |
| Vision / Multimodal | Gemini Vision — damage photo analysis across all 3 LOBs |
| Mock SOR | `mock-sor.js` — simulated Policy Administration + Customer Information System |
| External APIs | `mock-home-apis.js` (NWS + Roof Risk + Contractor) · `mock-commercial-apis.js` (CAT + Asset + ERP) |
| IPC | `localStorage` — real-time channel between mobile app and workbench |
| Rendering | Vanilla JS — IIFE pattern, no framework dependencies |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Claim card shows *Pending Sync* | Submit from mobile app first, then refresh the workbench tab |
| Pipeline button not appearing | Scroll down inside the claim drawer — the panel appears below the Timeline section |
| Live mode returns empty response | Check Gemini API key in the workbench settings panel |
| `python` command not found | Try `python3 -m http.server 8080` or `npx serve . -p 8080` |
| Images not loading | Ensure server is running from `C:\AIBrain\PandCClaims-ai-demo` (not a subdirectory) |
| Pipeline hangs mid-step (Live mode) | Gemini rate limit — switch to Simulation mode or wait 30 seconds and click Re-run |
