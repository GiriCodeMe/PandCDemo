# Group Benefits AI Demo — Gap Analysis

_Generated: 2026-07-23 — Last updated: 2026-07-23_

---

## Summary

The requirements document covers 5 EPICs, ~35 features, and a clear demo story. The analysis below identifies every gap that must be resolved before or during construction of a React + Node.js + Gemini AI demo app.

---

## 1. Critical — Must decide before a single line of code

| # | Gap | Decision Needed |
|---|-----|----------------|
| 1 | **AI model selection** | ✅ **RESOLVED** — Gemini 1.5 Pro for ingestion/extraction/Q&A; Gemini 2.0 Flash for interview/generation/validation/assistant |
| 2 | **Data persistence** | ✅ **RESOLVED** — LowDB / JSON file-store. One JSON array per entity under `seed/`. `db.js` service layer for CRUD. Plan versions, traceability graph, and enrollment records all persisted. See [ADR-2](docs/08-architecture.md). |
| 3 | **Auth / persona switching** | ✅ **RESOLVED** — 8 personas defined with RACI matrix; demo uses 5 primary personas with a switcher control |
| 4 | **AI streaming strategy** | ✅ **RESOLVED** — SSE for all long-running AI operations (ingestion, interview, generation, impact analysis, benefits assistant); request/response for deterministic calls (eligibility simulation, conflict detection) |
| 5 | **Acme Corp mock dataset** | ✅ **RESOLVED** — Full Acme Corp dataset under `seed/`: 30 employees, 21 dependents, 7 carriers, 13 plans, 34 coverage tiers, 5 life events, eligibility rules, enrollments, carrier transactions (incl. CT-10045 rejection), payroll deductions (incl. ACM-E001 mismatch), business rules, requirements, traceability links |
| 6 | **Sample "Benefits Guide" PDF** | ✅ **RESOLVED** — 5 PDFs generated under `samples/`: Benefits_Guide, Eligibility_Policy, Carrier_Requirements, Payroll_Spec, Enrollment_Process. All contain intentional conflicts and ambiguities for AI demo. |

---

## 2. Technical Architecture Gaps

- **AI model** ✅ **RESOLVED** — Gemini 1.5 Pro for ingestion/extraction/document Q&A; Gemini 2.0 Flash for interview/generation/validation/assistant/benefits chat.
- **Streaming / SSE design** ✅ **RESOLVED** — SSE for all long-running AI operations; request/response for deterministic fast calls (eligibility simulation, conflict detection).
- **Data persistence** ✅ **RESOLVED** — LowDB / JSON file-store. Full `seed/` directory created with all entities. See [ADR-2](docs/08-architecture.md).
- **Auth / role-switching** ✅ **RESOLVED** — RACI matrix added; 8 personas defined; 5-persona demo sequence established. `AUTH_MODE=mock` with persona-ID-as-Bearer-token. See ADR-3.
- **React state management** ✅ **RESOLVED** — Zustand selected. 5 store slices defined (employer, persona, enrollment, requirements, ui). Session-persistence strategy per slice. See [ADR-1](docs/08-architecture.md).
- **File storage for Epic 5** ✅ **RESOLVED** — `DocumentStorageService` interface defined. Local disk (demo) / GCS (production). 25 MB max, MIME + magic byte validation, 10 docs/workspace limit, lifecycle state machine, SHA-256 integrity. See [ADR-2](docs/08-architecture.md).
- **Environment / config management** ✅ **RESOLVED** — `.env.example` template defined. Zod validation at startup. Feature flags via `FEATURE_*` env vars. GCP Secret Manager for production secrets. See [ADR-3](docs/08-architecture.md).

---

## 3. Missing Mock Data / Demo Seed Content

- **Acme Corp employee dataset** ✅ **RESOLVED** — 30 employees (ACM-E001–ACM-E030) in `seed/employees/employees.json`, spanning full-time, part-time, executive, and hourly classes with varied hire dates and enrollment states. 21 dependents in `seed/employees/dependents.json`.
- **Dental, Vision, Life, STD, LTD plans** ✅ **RESOLVED** — 9 products and 13 plans in `seed/products/products.json` and `seed/products/plans.json` covering Medical, Dental, Vision, Basic Life, Voluntary Life, STD, LTD, HSA, and FSA.
- **Premium rate tables** ✅ **RESOLVED** — 34 coverage tier rate records in `seed/products/rates.json` spanning all 13 plans with EE Only, EE+Spouse, EE+Child, and Family tiers where applicable.
- **Carrier seed configs** ✅ **RESOLVED** — 7 carriers defined in `seed/integrations/carriers.json`: Aetna (Medical), Delta Dental (Dental), VSP (Vision), MetLife (Life/AD&D), Unum (STD/LTD), Fidelity (HSA), WEX (FSA). Each includes connection type, file format, and mock API endpoint.
- **Sample PDFs for Epic 5** ✅ **RESOLVED** — 5 PDFs generated in `samples/`: Benefits Guide (21,552 bytes), Eligibility Policy, Carrier Requirements, Payroll Spec, and Enrollment Process. All contain intentional conflicts and ambiguities for AI demo.
- **Executive Dashboard seed numbers absent.** Active Groups, Plans, Enrollments, Eligibility Exceptions, Carrier Status, and AI Requirements Progress all need seed values.
- **Integration monitoring aggregate data absent.** The Feature 4.6 table (Medical 4,892 records / 12 errors; Vision failed / 42 errors) is shown as a mockup but not defined as mock data. Individual carrier transactions exist (9 records) but no aggregate monitoring feed record.

---

## 4. Business Logic Gaps

- **Premium calculation formula not specified.** Monthly-to-biweekly conversion is shown by example ($150 / 2 = $75) but no formula covers weekly, semi-monthly, or rounding on odd-cent amounts.
- **Employer contribution math undefined.** Both flat-dollar and percentage contributions are listed. No algorithm covers behavior when they coexist or when employer contribution exceeds total premium.
- **Eligibility date edge cases absent.** "First of month following 30 days" — if day 30 falls on the 1st of the month, does coverage begin that day or the next month? Hire date on the 1st of a month is unhandled.
- **Dependent age-out cutoff not specified.** "Children eligible until age 26" — no cutoff date defined (26th birthday, end of birth month, end of plan year, or end of calendar year).
- **Life event enrollment window not uniformly defined.** Only marriage is given a 30-day window. Birth, adoption, divorce, loss of coverage, and death of dependent each have legally distinct windows that are unspecified.
- **Plan versioning transition logic absent.** FR-1.5 says changes create a new version, but no spec covers: version numbering scheme, how in-flight enrollments behave when a version goes effective mid-year, or what "publish" does to prior versions.
- **Reconciliation matching key unspecified.** The three-way comparison (benefits vs. carrier vs. payroll) needs a join key. If carrier uses member ID and payroll uses employee ID, no mapping is defined.

---

## 5. UI/UX Gaps

- **Rule builder component unspecified.** "IF → AND → THEN" is described but no interaction pattern is given: dropdown selects, drag-and-drop, code-style tokens? No library selected (e.g., react-querybuilder).
- **Enrollment wizard back-navigation and draft state not specified.** The 8-step workflow (Feature 3.3) has no spec for saving partial enrollment or navigating backward without losing selections.
- **Requirements Studio → Plan Config auto-population transition.** Demo Step 6 says AI-generated requirements "automatically populate" the plan config and rule builder. No navigation or data-binding mechanism is described.
- **AI loading/latency UX not designed.** No spec for skeleton loaders, progress bars, streaming text reveal, or timeout messaging for operations taking 30–60 seconds.
- **Plan comparison interaction undefined.** Feature 3.2 shows a two-plan table. No spec for comparing more than two plans, or whether comparison is a modal, inline, or separate screen.
- **Document preview / extraction review step absent.** After PDF upload in Epic 5, there is no step to show extracted content before the user commits it to the requirements workspace.
- **Integration monitoring refresh behavior unspecified.** Feature 4.6 dashboard — no auto-refresh interval, no polling strategy, no "in-progress" visual state.

---

## 6. Incomplete Epics / Missing Features

| Missing Feature | Why It Matters |
|----------------|----------------|
| Open enrollment period management | System cannot know when enrollment is open vs. closed for employees |
| COBRA and employment termination | Legally required for any benefits demo; termination workflow drives carrier transactions |
| ACA compliance tracking | 5,000-employee group triggers ACA employer mandate; 1095-C reporting unaddressed |
| Audit trail | Plan config changes create versions (FR-1.5) but no log captures who changed what and when |
| Employee notifications | Life event processing updates coverage but no email, in-app notice, or document generation is specified |
| Dependent SSN validation | Demo climax (Step 10) depends on SSN validation but no rule is defined in Epic 2 or Epic 3 |
| Role-based access control matrix | ✅ **RESOLVED** — Full RACI matrix provided for all 8 personas across all 5 EPICs |

---

## 7. Epic 5 — AI Requirements Studio Specifics

- **Requirements data model** ✅ **RESOLVED** — Full schema defined in `seed/requirements/requirements.json`. ID prefix convention (BR- / FR- / BRL- / DR- / US- / AC- / TC-), type enum, status lifecycle (`Draft → Review → Approved → Implemented → Deprecated`), source_document FK, version counter, createdBy, tags. See [data model](docs/07-data-model.md).
- **Traceability graph data structure** ✅ **RESOLVED** — Edge schema defined in `seed/requirements/traceability.json` (16 links, TL-001–TL-016). `RequirementLink` entity has `sourceId`, `targetId`, `linkType` enum (`Derives From`, `Implements`, `Tests`, `Validates`, `Conflicts With`, `Duplicates`). See [data model](docs/07-data-model.md).
- **Conflict detection algorithm undefined.** No spec on whether detection is purely prompt-driven or uses deterministic rule comparison. No definition of conflict vs. overlap.
- **Document extraction output schema** ✅ **RESOLVED** — `SourceDocument.extractionSummary` schema defined as `{ plans: N, rules: N, rates: N, exceptions: N }` with full lifecycle state machine (`UPLOADED → VALIDATING → VALIDATED → PROCESSING → EXTRACTED → ANALYZED → REQUIREMENTS_GENERATED → COMPLETED`). See [ADR-2](docs/08-architecture.md).
- **Conversation state management absent.** Feature 5.3 (AI Interview) is multi-turn but no conversation ID, session store, or context window management strategy is specified.
- **Backlog export format not specified.** Feature 5.8 generates epics/features/stories/AC but no export target is defined: JSON, CSV, Jira-compatible XML, Azure DevOps format.
- **Impact analysis context strategy missing.** Feature 5.7 requires AI to know all existing requirements to assess impact. No prompt context strategy (full dataset injection vs. RAG vs. summary) is defined.

---

## 8. Integration Specifics

- **"Simulate" is undefined.** Feature 4.3 says simulate carrier API responses as Accepted or Rejected. No logic defines when to reject: random %, specific hardcoded test cases, or field-validation failures.
- **EDI 834 scope unresolved.** EDI is listed as a supported format but whether this means true ANSI X12 834 segments or a CSV labeled "EDI" is unspecified. A true 834 requires a sample file and segment map.
- **Transmission schedule simulation not designed.** "Weekly" is listed as a frequency. No spec for how this is triggered in the demo: scheduled Node job, manual button, or always-on mock.
- **Carrier rejection mock scenario** ✅ **RESOLVED** — `CT-10045` in `seed/integrations/carrierTransactions.json` hardcodes the Demo Step 10 rejection: Linda White (ACM-E012) medical enrollment rejected by Aetna, `errorCode: "DEP-INVALID-ID"`, `errorMessage: "Dependent ID DEP-INVALID not found in carrier member records"`. Linked to enrollment `ENR-10012` and life event `LE-003`.

---

## 9. Non-Functional / Cross-Cutting Gaps

- **No field-level validation rules.** FR-1.1.2 captures employer fields but no validation is specified (required vs. optional, numeric ranges, date constraints, format rules for EIN, SSN, etc.).
- **No API error response schema.** No standard HTTP error envelope (code, message, field-level errors) defined for the API layer or client-side display.
- **No test strategy.** No unit, integration, or E2E testing requirements. A demo with financial calculations needs at minimum eligibility date and premium calculation unit tests.
- **Gemini API rate-limit handling absent.** No retry, backoff, or graceful degradation for 429 errors during a live demo with rapid document uploads.
- **No deployment or hosting spec.** Localhost only? Docker? Cloud-deployed for remote demo? No containerization or environment parity guidance.

---

## Gaps vs. PetLife AI Factory Pattern

The PetLife pattern works because all routes are stateless (no persistence, no multi-turn AI, no file upload). Group Benefits breaks that in three ways:

| Dimension | PetLife | Group Benefits |
|-----------|---------|----------------|
| Persistence | In-memory seed data | Plan versions + enrollment records + traceability graph require cross-request storage |
| AI interaction | Single-shot Gemini calls | Multi-turn Requirements Interview needs session-aware conversation history |
| File handling | None | Epic 5 needs multer + PDF-to-text extraction before Gemini sees the content |

---

## Recommended Build Order

```
Epic 1 (Plan Config)
  → seed data: employer, products, plans, rates

Epic 2 (Eligibility)
  → depends on: plan data, employee classes

Epic 3 (Enrollment)
  → depends on: plans, eligibility rules, dependent data

Epic 5 (AI Requirements Studio)   ← "wow" moment
  → depends on: Epics 1–3 data model to populate from AI output
  → requires: SSE streaming, multi-turn conversation, PDF ingestion

Epic 4 (Carrier + Payroll Integration)   ← last, all mock
  → depends on: enrollment records from Epic 3
```

---

## Prioritized Next Steps

1. **Resolve the 6 critical decisions** (AI model, persistence, auth, streaming, seed data, sample PDF)
2. **Define the Acme Corp seed dataset** — 25–30 employees, full plan catalog, 3 carriers, pre-seeded enrollment states
3. **Design the Epic 5 data model** — Requirement entity schema and traceability edge model before any UI work
4. **Specify life event enrollment windows** for all 8 event types
5. **Choose rule builder approach** for Epic 2 (library vs. custom)
6. **Define the carrier rejection mock rule** for the demo climax (Step 10)
