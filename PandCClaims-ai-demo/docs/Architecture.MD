# P&C Claims AI — Architecture Documentation

_Generated: 2026-07-03_

---

## Auto FNOL — Real Gemini API Design

End-to-end technical flow using Google Gemini Flash (`gemini-flash-latest`) backed by Vertex AI Workflows orchestration.

---

### Architecture Diagram

![Auto FNOL Architecture](AUTO%20FNOL%20Arch.png)

#### Layer Breakdown

| # | Layer | Components |
|---|---|---|
| 1 | **FNOL Submission** | Mobile App · Web Portal · Agent Portal · Email/SMS · Connected Vehicle |
| 2 | **API Gateway** | Authentication · Policy Resolution · Payload Normalisation · Audit Logging |
| 3 | **Orchestration** | Vertex AI Workflows — Event triggers: FNOL submitted, Document uploaded, Severity detected |
| 4 | **Gemini Flash API** | Core reasoning engine — Loss classification, Coverage compliance, Fraud detection, Routing |
| 5 | **Document AI** | Structured data extraction — Incident reports, Repair invoices, Medical records, Repair pricing |
| 6 | **Vertex AI Vision** | Image analysis — Vehicle damage detection, Part identification, Damage quality scoring |
| 7 | **External Systems** | Policy System API · Vehicle Data API (VIN) · Fraud Check API · Repair Network API · Weather/Telematics API |
| 8 | **Fraud & Risk Scoring** | Document Consistency · VIN Verification · Weather Correlation · Prior Claims · Fraud Risk Score |
| 9 | **Claim Decision Engine** | Vehicle Damage Score · Coverage Validation · Settlement Calculation · Routing Decision → Adjuster Queue |
| 10 | **Execution & Output** | Systems Update (Guidewire/Duck Creek) · Notifications (Email/SMS/Push) · Repair Network Activation · Feedback Loop |

**Gemini Flash Endpoint**

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent
```

---

### Swimlane Diagram

![Auto FNOL Swimlane](AUTO%20FNOL%20SwimLane.png)

#### Phase-by-Phase Flow

| Phase | Lane | Key Actions |
|---|---|---|
| **1. FNOL Intake** | Customer Channels | Submit via mobile/web/agent; description, photos, documents ingested |
| | API & Orchestration | API Gateway receives payload; Vertex AI Workflows triggered; event routing begins |
| **2. Data Extraction & Understanding** | AI / ML | Document AI extracts structured data; Gemini Flash API — multimodal reasoning on narrative + images |
| | External Systems & Cloud | Policy System lookup; Vehicle Data API (VIN decode); Weather/Telematics correlation |
| | Data & Storage | Raw claim data persisted; structured loss dataset created |
| **3. Verification & Enrichment** | AI / ML | Gemini Flash — coverage compliance check; loss classification; entity extraction |
| | External Systems | Fraud Check API; Repair Network API; prior claims cross-reference |
| | Claims Operations | Policy verification result; coverage eligibility confirmed or flagged |
| **4. Risk & Decisioning** | AI / ML | Vertex AI Vision — vehicle damage detection and severity scoring; Gemini Flash — settlement calculation |
| | External Systems | Fraud Risk Score computed; damage estimate benchmarked against repair network pricing |
| | Claims Operations | Adjuster queue assignment; complex vs standard routing decision |
| **5. Execution & Output** | Claims Operations & Vendors | Claim file created in Guidewire/Duck Creek; adjuster assigned; repair shop activated |
| | Customer Channels | Customer notification (email/SMS/push); repair status updates; feedback loop initiated |

**Key Benefits (from diagram)**

- AI-accelerated FNOL processing
- Real-time fraud detection at intake
- Automated coverage compliance checks
- Computer vision damage assessment
- Multi-system orchestration via Vertex AI Workflows
- End-to-end audit trail

---

## Home FNOL — Architecture

> _Diagrams coming soon — see [DemoInstruction.MD](../DemoInstruction.MD#homeowners--wind--hail-storm-florida) for the 10-step pipeline walkthrough._

**Planned coverage:**
- Architecture diagram — Weather + Property enrichment layer, ALE eligibility decision, FL hurricane deductible logic
- Swimlane diagram — NWS API function calling, roof risk scoring, contractor dispatch

---

## Commercial FNOL — Architecture

> _Diagrams coming soon — see [DemoInstruction.MD](../DemoInstruction.MD#commercial--electrical-fire-texas) for the 12-step pipeline walkthrough._

**Planned coverage:**
- Architecture diagram — Multi-policy enterprise resolution, Business Interruption model, ERP/Finance enrichment layer
- Swimlane diagram — Enterprise SOR function calling (3-policy lookup), BI calculation, SIU escalation, multi-system execution (Guidewire + vendor + regulatory)

---

## Cross-LOB Technology Stack

| Component | Technology |
|---|---|
| AI Reasoning Engine | Google Gemini 2.0 Flash (`gemini-flash-latest`) |
| Orchestration | Vertex AI Workflows |
| Document Processing | Document AI |
| Image / Vision Analysis | Gemini Vision (multimodal) |
| Function Calling | Multi-turn Gemini tool use — request → `functionCall` → `functionResponse` → synthesis |
| External Enrichment | NWS Weather API · Roof Risk Score API · Contractor Network · Asset/Facility API · ERP/Finance API |
| Mock SOR | Policy Administration System + Customer Information System (`mock-sor.js`) |
| Claims System | Guidewire ClaimCenter / Duck Creek |
| IPC (Demo) | `localStorage` — real-time channel between mobile FNOL app and adjuster workbench |
