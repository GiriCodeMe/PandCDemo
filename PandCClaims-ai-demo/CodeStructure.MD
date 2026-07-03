# P&C Claims AI Demo — Code Structure

_Generated: 2026-07-03_

---

## Project Root

```
C:\AIBrain\PandCClaims-ai-demo\
├── mobileApp.html                          # Claimant FNOL submission app
├── ClaimsProfessionalWorkbench.html        # Adjuster AI workbench
├── DemoInstruction.MD                      # End-to-end demo walkthrough
├── CodeStructure.MD                        # This file
├── EPAM_VertexAI_Insurance_Offerings.pdf   # Reference material (not loaded by app)
├── docs/                                   # Architecture diagrams + documentation
├── js/                                     # All application JavaScript
└── Sample Data/                            # Pre-loaded evidence files (photos + PDFs)
```

---

## HTML Entry Points

### `mobileApp.html` — ~862 lines

Mobile-styled claimant FNOL app ("SmartClaim").

**What it does:**
- Presents a scenario selector for Auto, Home, and Commercial loss events
- Pre-fills narrative, photos, and metadata for each scenario
- Calls `window.FNOLApi.callFNOLAnalysis()` (from `js/fnol-api.js`)
- Writes the submitted claim payload to `localStorage` for real-time pickup by the workbench

**Key globals used:** `window.FNOLApi`

---

### `ClaimsProfessionalWorkbench.html` — ~2213 lines

Dark-themed adjuster workbench — the primary demo surface.

**What it does:**
- Listens for `localStorage` updates from `mobileApp.html`
- Renders three claim queue cards (Auto / Home / Commercial)
- Expands a full claim drawer on click — AI scores, fraud signals, entity panel, AI summary, timeline, next steps
- Drives AI processing via `window.AIFactory.analyze()`
- Hosts the E2E Orchestration Pipeline panel per LOB (7 / 10 / 12 steps)
- Supports **Simulation mode** (pre-built data + delays) and **Live mode** (real Gemini API calls)

**Key inline functions:**
| Function | Purpose |
|---|---|
| `renderDrawer(key, sc, ai, req, res)` | Builds the full HTML for an expanded claim drawer |
| `buildCommercialInsightsPanel(sc, ai)` | Renders the 7-card AI Insights panel for commercial only |
| `buildOrchestrationPanel(sc, ai)` | Renders the step list for Auto (7), Home (10), or Commercial (12) |
| `renderOrchOutput(stepNum, result, lob)` | Renders key-value output for a completed pipeline step |
| `runOrchestration(key, btn)` | Dispatches to the correct LOB orchestration engine and drives the UI |
| `animateConfidenceBars(key)` | Animates the 5 confidence score bars on drawer open |

**Script load order** (defined in `<head>`):

```
prompts/_schema.js
prompts/auto.js  →  prompts/home.js  →  prompts/commercial.js
shared/media-processor.js  →  shared/gemini-client.js
auto-api.js  →  home-api.js  →  commercial-api.js
index.js
mock-sor.js
auto-orchestration.js
mock-home-apis.js  →  home-orchestration.js
mock-commercial-apis.js  →  commercial-orchestration.js
```

---

## `js/` — JavaScript Modules

All files follow the **IIFE + window global** pattern — no bundler, no Node, no `import/export`. Everything attaches to `window.*` and is loaded in dependency order via `<script>` tags.

---

### `js/fnol-api.js` — ~218 lines

**Global:** `window.FNOLApi`

Legacy single-file FNOL API client used by `mobileApp.html`. Predates the AI Factory refactor. Contains its own standalone image-processing utilities and a direct Gemini call.

| Function | Description |
|---|---|
| `callFNOLAnalysis(sc, apiKey, endpoint)` | End-to-end: builds prompt + images → calls Gemini → returns parsed JSON |
| `buildFNOLPrompt(sc, imageCount)` | Constructs the FNOL analysis prompt string |
| `fetchImageAsInlinePart(src)` | Fetches image URL → base64 `inlineData` part |
| `dataUrlToInlinePart(dataUrl)` | Converts a data URL to a Gemini `inlineData` part |
| `buildImageParts(sc)` | Builds all image parts for a scenario |

---

### `js/ai-factory/` — AI Factory Modules

The primary AI engine for the workbench. Organised in four sub-groups: **shared utilities**, **LOB prompts**, **LOB APIs**, and **orchestration pipelines**.

---

#### Entry Point

##### `js/ai-factory/index.js` — ~83 lines

**Global:** `window.AIFactory`

Public router — the only entry point the workbench calls for AI processing.

| Export | Description |
|---|---|
| `AIFactory.analyze(sc, apiKey, endpoint)` | Routes to the correct LOB `analyze()` based on `sc.lob` |
| `AIFactory.buildPrompt(sc, imageCount)` | Routes to the correct LOB `buildPrompt()` for display |
| `AIFactory.apis.auto/home/commercial()` | Direct LOB API accessors |
| `AIFactory.MediaProcessor` | Re-export of `_AIShared.MediaProcessor` |
| `AIFactory.GeminiClient` | Re-export of `_AIShared.GeminiClient` |

**LOB routing map:** `auto` / `personal auto` → `_AIApis.auto` · `home` / `homeowners` → `_AIApis.home` · `commercial` / `commercial property` → `_AIApis.commercial`

---

#### Shared Utilities — `js/ai-factory/shared/`

##### `shared/gemini-client.js` — ~91 lines

**Global:** `window._AIShared.GeminiClient`

Core Gemini HTTP transport. Every LOB API and orchestration step uses this.

| Export | Description |
|---|---|
| `GeminiClient.call(parts, apiKey, endpoint)` | POST to `gemini-flash-latest` → parse JSON response |
| `GeminiClient.DEFAULT_ENDPOINT` | `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent` |

**Fixed config:** `responseMimeType: 'application/json'`, `temperature: 0.1`, `maxOutputTokens: 3000`

---

##### `shared/media-processor.js` — ~139 lines

**Global:** `window._AIShared.MediaProcessor`

Converts local images and PDFs into Gemini `inlineData` parts for multimodal requests.

| Method | Description |
|---|---|
| `buildLabeledImageParts(sc, maxPhotos)` | Main method — fetches up to 6 photos, returns interleaved `{ text: label }` + `{ inlineData }` arrays |
| `fetchImageAsInlinePart(src)` | Fetch image URL → base64 blob |
| `fetchPdfAsInlinePart(src)` | Fetch PDF URL → base64 blob (`application/pdf`) |
| `dataUrlToInlinePart(dataUrl)` | Convert already-loaded data URL |

---

#### LOB Prompt Builders — `js/ai-factory/prompts/`

##### `prompts/_schema.js` — ~70 lines

**Global:** `window._AIPrompts.SCHEMA`

Single source of truth for the JSON output contract shared by all 3 LOB prompts. Defines all expected response fields so Gemini returns structured data.

**Schema fields:** `overallConfidence` · `policyMatch` · `damageAssessment` · `fraudDetection` · `coverageValidation` · `metadata{}` · `entities{}` · `aiSummary` · `fraud[]` · `nextSteps[]` · `timeline[]` · `insights{}` _(commercial only)_

---

##### `prompts/auto.js` — ~81 lines

**Global:** `window._AIPrompts.auto` · **Export:** `build(sc)`

System prompt for personal auto collision claims. Expert context includes: NJ/FL/MI/NY PIP rules, collision reconstruction, police report format validation (`NJSP-YYYY-XXXXXX`), tow documentation cross-referencing, damage zone classification (A/B/C pillars).

---

##### `prompts/home.js` — ~90 lines

**Global:** `window._AIPrompts.home` · **Export:** `build(sc)`

System prompt for homeowners wind/hail/water claims. Expert context includes: NWS storm corroboration, FL hurricane vs. standard wind/hail deductible separation, TX hail disclosure rules, water intrusion triage, Xactimate repair benchmarking, ALE eligibility partitioning.

---

##### `prompts/commercial.js` — ~104 lines

**Global:** `window._AIPrompts.commercial` · **Export:** `build(sc)`

System prompt for commercial property/fire claims. Expert context includes: AFD report number format validation, mandatory SIU threshold ($50K+), BI activation and daily revenue calculation, sprinkler activation corroboration, inventory/PO cross-referencing. Appends `_schema.js` plus additional `insights` guidance for the 7-card Insights panel.

---

#### LOB API Modules

All three follow an identical structure — thin wrappers that combine `MediaProcessor` + LOB prompt + `GeminiClient`.

##### `auto-api.js` — ~41 lines · `home-api.js` — ~41 lines · `commercial-api.js` — ~41 lines

**Globals:** `window._AIApis.auto` · `window._AIApis.home` · `window._AIApis.commercial`

| Method | Description |
|---|---|
| `analyze(sc, apiKey, endpoint)` | Build image parts → build prompt → call Gemini → return parsed AI result |
| `buildPrompt(sc, imageCount)` | Return prompt string for display in the workbench API panel (no fetch) |

---

#### Mock Data — System of Record

##### `mock-sor.js` — ~382 lines

**Global:** `window._MockSOR`

In-memory simulation of a Policy Administration System + Customer Information System. Covers all three LOB demo scenarios.

**Data records:**

| Key | Record | Details |
|---|---|---|
| `C-NJ-00847` | Customer | Sarah Johnson — Princeton NJ — Auto |
| `C-FL-00392` | Customer | Michael Rivera — Gainesville FL — Home |
| `C-TX-00291` | Customer | Metro Retail LLC — Austin TX — Commercial (enterprise) |
| `VH-NJ-7812` | Vehicle | 2022 Honda Civic Silver — NJZ-4821 |
| `LMIC-7812456` | Policy | Personal Auto — NJ — collision/PIP/rental/towing |
| `HO-FL-293847` | Policy | Homeowners HO-3 — FL — dwelling/ALE/hurricane deductible |
| `CP-TX-884721` | Policy | Commercial Property — TX — all-risk fire |
| `BI-TX-884721` | Policy | Business Interruption — TX — 12-month indemnity |
| `GL-TX-884721` | Policy | General Liability — TX — $1M CGL |

**API methods (async, simulated latency):**

| Method | Endpoint simulated | Latency |
|---|---|---|
| `api.getPolicy(policyNumber)` | `GET /insurance/policy/{id}` | 280 ms |
| `api.getCustomer(customerId)` | `GET /insurance/customer/{id}` | 210 ms |
| `api.getEnterprisePolicies(customerId)` | `GET /insurance/enterprise/{id}/policies` | 350 ms |

---

#### Mock Data — External Enrichment APIs

##### `mock-home-apis.js` — ~200 lines

**Global:** `window._MockHomeAPIs`

Simulates three external enrichment services used by the Home pipeline's Step 04 (Weather & Property Enrichment). Data keyed to Gainesville FL / ZIP 32601.

| Data store | Contents |
|---|---|
| `_weatherDb['32601']` | NWS storm NWS-FL-2026-041203 — 1.25" hail, 58 mph gusts, confirmed track |
| `_propertyDb['2847-magnolia']` | Roof age 6 yr, 28 squares Architectural Shingles, RCV $318K, roofRiskScore 0.42 |
| `_contractorDb['32601']` | Sunshine Roofing & Restoration (CCC1333221) + Gulf Coast Restoration Group |

**Gemini tool declarations:** `get_weather_history` · `get_property_roof_risk` · `get_contractor_network`

**API methods:**

| Method | Endpoint simulated | Latency |
|---|---|---|
| `api.getWeatherHistory(zip)` | `GET /weather/history?zip={zip}` | 340 ms |
| `api.getPropertyRoofRisk(address)` | `GET /property/roof-risk-score?address={addr}` | 280 ms |
| `api.getContractorNetwork(zip, serviceType)` | `GET /contractor/network?zip={zip}&service={type}` | 210 ms |
| `api.dispatch(funcName, args)` | Routes Gemini `functionCall` to the correct API above | — |

---

##### `mock-commercial-apis.js` — ~232 lines

**Global:** `window._MockCommercialAPIs`

Simulates three enterprise enrichment services used by the Commercial pipeline's Steps 05–06. Data keyed to Austin TX / ZIP 78701 (Metro Retail LLC).

| Data store | Contents |
|---|---|
| `_weatherCatDb['78701']` | Non-Cat event, clear conditions, no red flag warning, internal electrical ignition |
| `_assetDb['890-commerce-austin']` | Building RCV $420K, equipment $100.5K, inventory $62K, last inspection pass |
| `_erpDb['C-TX-00291']` | Monthly revenue $380K, daily $12,667, downtime $528/hr, prior BI claim Dec 2024 |

**Gemini tool declarations:** `get_weather_catastrophe_data` · `get_asset_facility_inventory` · `get_erp_financial_data`

**API methods:**

| Method | Endpoint simulated | Latency |
|---|---|---|
| `api.getWeatherCatastrophe(zip)` | `GET /weather/catastrophe?zip={zip}` | 320 ms |
| `api.getAssetFacilityInventory(address)` | `GET /assets/facility/{encoded-address}` | 410 ms |
| `api.getERPFinancialData(customerId)` | `GET /erp/financials/{customerId}` | 380 ms |
| `api.dispatch(funcName, args)` | Routes Gemini `functionCall` to the correct API above | — |

---

#### E2E Orchestration Pipelines

All three engines share the same callback contract:

```js
engine.run(sc, mode, apiKey, endpoint, {
  onStepStart(stepIndex)              // step index is 0-based
  onStepComplete(stepIndex, result, elapsedMs)
  onStepError(stepIndex, error)
  onComplete(fullContext)
  onPipelineError(error)
})
```

`mode` is either `'sim'` (uses `SIM[stepN]` data + `setTimeout` delay) or `'live'` (real Gemini + external API calls). The final step in every pipeline is always **rule-based** (no Gemini call).

---

##### `auto-orchestration.js` — ~534 lines

**Global:** `window._AutoOrchestration` · `STEP_COUNT: 7`

Test scenario: Sarah Johnson — NJ hydroplaning event — policy LMIC-7812456.

| Step | Title | Live implementation |
|---|---|---|
| 01 | Claim Intake | `liveStep1` — Gemini multimodal on narrative + photos |
| 02 | Policy Verification | `liveStep2` — Gemini function calling (`get_policy_details`) → `_MockSOR` |
| 03 | Coverage Verification | `liveStep3` — Gemini reasoning on policy data |
| 04 | Fraud Scoring | `liveStep4` — Gemini classification + image analysis |
| 05 | Damage Estimation | `liveStep5` — Gemini Vision cost model |
| 06 | AI Claim Summary | `liveStep6` — Gemini narrative synthesis |
| 07 | Workflow Orchestration | `buildRoutingResult()` — rule-based, no Gemini |

**Sim delays:** 1100 / 900 / 650 / 800 / 700 / 550 / 320 ms

---

##### `home-orchestration.js` — ~612 lines

**Global:** `window._HomeOrchestration` · `STEP_COUNT: 10`

Test scenario: Michael & Karen Rivera — Gainesville FL hail/wind storm — policy HO-FL-293847.

| Step | Title | Live implementation |
|---|---|---|
| 01 | FNOL Intake & Channel Detection | `liveStep1` — Gemini multimodal |
| 02 | Policy Verification | `liveStep2` — Gemini function calling → `_MockSOR` |
| 03 | Document & Image Ingestion | `liveStep3` — Gemini Vision (roof + interior photos) |
| 04 | Weather & Property Enrichment | `liveStep4` — 3 parallel calls to `_MockHomeAPIs` + Gemini synthesis |
| 05 | Gemini Understanding Layer | `liveStep5` — peril ID, narrative consistency, weather match score |
| 06 | Fraud & Risk Scoring | `liveStep6` — Gemini + image analysis |
| 07 | Coverage & ALE Decision | `liveStep7` — FL hurricane deductible logic |
| 08 | Damage & Cost Estimation | `liveStep8` — Gemini Vision + roof cost model |
| 09 | Claim Decision Engine | `liveStep9` — final AI reasoning, reserve, routing |
| 10 | System Execution & Routing | `buildRoutingResult()` — rule-based, no Gemini |

**Sim delays:** 1100 / 900 / 850 / 780 / 700 / 820 / 680 / 760 / 620 / 350 ms

---

##### `commercial-orchestration.js` — ~731 lines

**Global:** `window._CommercialOrchestration` · `STEP_COUNT: 12`

Test scenario: Metro Retail LLC — Austin TX electrical fire — 3-policy enterprise (CP + BI + GL).

| Step | Title | Live implementation |
|---|---|---|
| 01 | FNOL Intake + API Gateway | `liveStep1` — Gemini multimodal, mobile channel |
| 02 | Document AI + Structured Data | `liveStep2` — Gemini Vision (AFD report, PO docs, damage photos) |
| 03 | Multi-Policy Resolution | `liveStep3` — Gemini function calling (`get_enterprise_policies`) → `_MockSOR` |
| 04 | Loss Classification + Entity Extraction | `liveStep4` — Gemini core reasoning engine |
| 05 | Weather + Catastrophe Enrichment | `liveStep5` — `_MockCommercialAPIs.getWeatherCatastrophe()` + Gemini |
| 06 | Asset + Finance / ERP Enrichment | `liveStep6` — 2 parallel calls (asset + ERP) + Gemini synthesis |
| 07 | Business Interruption Model | `liveStep7` — Gemini BI calculation (daily loss × eligible days) |
| 08 | Fraud & Risk Scoring | `liveStep8` — Gemini + SIU trigger logic |
| 09 | Coverage + Liability Decision | `liveStep9` — multi-policy Gemini reasoning (CP / BI / GL) |
| 10 | Damage & Loss Estimation | `liveStep10` — Gemini Vision + cost model |
| 11 | Claim Decision Engine | `liveStep11` — final AI reasoning, reserve breakdown, routing |
| 12 | System Execution + Routing | `buildSystemExecutionResult()` — rule-based, no Gemini |

**Sim delays:** 1200 / 980 / 850 / 780 / 720 / 810 / 690 / 760 / 640 / 730 / 580 / 320 ms

---

## `Sample Data/` — Evidence Files

Pre-loaded claim evidence used as `sc.photos` in each scenario. Files are fetched at runtime by `MediaProcessor.buildLabeledImageParts()` and sent as `inlineData` to Gemini.

```
Sample Data/
├── HydropanningEvent/          # Auto scenario
│   ├── NJ DL.png
│   ├── NJ_Accident_Report_Michael_Carter.pdf
│   ├── PoliceReport.png
│   ├── Towing Picture.png
│   └── VechileDamage_Front.png
│
├── Home_Hail/                  # Home scenario
│   ├── RoofDamage.png
│   ├── Ceiling_Water_Damage.png
│   ├── Hail_Damage.png
│   ├── Property Survey.png
│   ├── Weather Report.png
│   └── Quote.png
│
└── Commercial Fire Claim/      # Commercial scenario
    ├── Electrical Fire Damage.png
    ├── WaterDamage.png
    ├── PO_Proof.png
    ├── AFD Report1.png
    ├── AFD Report2.png
    ├── Business_External.png
    └── Fire investigator.png
```

---

## `docs/` — Architecture Documentation

```
docs/
├── Architecture.MD             # Architecture diagrams + layer breakdown (all LOBs)
├── AUTO FNOL Arch.png          # Auto architecture diagram (10-layer)
└── AUTO FNOL SwimLane.png      # Auto swimlane diagram (5-phase, 5-lane)
```

> Home and Commercial architecture diagrams: add PNG files to `docs/` and update `Architecture.MD`.

---

## Key Design Patterns

### 1. IIFE + Window Global (no bundler)

Every JS file is a self-invoking function that attaches one namespace to `window`. Load order is the only dependency mechanism — script tags in `ClaimsProfessionalWorkbench.html` must respect the hierarchy below.

```
_AIPrompts  →  _AIShared  →  _AIApis  →  AIFactory
_MockSOR    →  *Orchestration
_Mock*APIs  →  *Orchestration
```

### 2. Gemini Function Calling (multi-turn)

Steps that call external APIs use a two-turn Gemini exchange:

```
Turn 1: POST prompt + tools[]  →  Gemini returns { functionCall: { name, args } }
Turn 2: POST functionResponse  →  Gemini synthesises final JSON
```

This is implemented in each orchestration file as a local `geminiWithTool()` helper.

### 3. Simulation vs Live mode

Every orchestration `run()` checks `mode === 'live'`:

- **Sim:** `setTimeout(resolve(SIM[stepKey]), delay)` — deterministic, no network
- **Live:** calls `liveStep*()` → real `fetch()` to Gemini + real mock API latencies

The final step of every pipeline is always rule-based (`buildRoutingResult` / `buildSystemExecutionResult`) — no Gemini call in either mode.

### 4. localStorage IPC

`mobileApp.html` writes: `localStorage.setItem('fnol_claim_auto', JSON.stringify(payload))`

`ClaimsProfessionalWorkbench.html` listens: `window.addEventListener('storage', handler)`

No server required for cross-tab communication. Each LOB has its own key (`fnol_claim_auto`, `fnol_claim_home`, `fnol_claim_commercial`).

### 5. Orchestration Callback Contract

All three pipeline engines share an identical callback interface, allowing `runOrchestration()` in the workbench to be LOB-agnostic once the engine is selected:

```js
{
  onStepStart(i)                 // i = 0-based step index
  onStepComplete(i, result, ms)  // result = step data object, ms = elapsed
  onStepError(i, err)
  onComplete(context)            // context = { step1, step2, ..., stepN }
  onPipelineError(err)
}
```
