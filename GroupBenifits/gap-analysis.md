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
- **Executive Dashboard seed numbers** ✅ **RESOLVED** — `seed/dashboard/dashboardSnapshot.json` contains the full KPI snapshot (date: 2026-12-15, plan year: 2027). All 12 dashboard KPIs seeded: active groups, employee/dependent counts, plan/product counts, enrollment breakdown (4,125 enrolled / 88.7%), eligibility exceptions (42), carrier metrics (98.2% success), payroll deductions (4,050 active / 12 exceptions), and AI requirements progress (78%, 96 generated, 74 validated, 8 conflicts, 183 traceability links).
- **Integration monitoring aggregate data** ✅ **RESOLVED** — Two-layer architecture implemented. `seed/integrations/integrationMonitoringAggregates.json`: 6 daily processing window records (MON-2027-1215-001 to -006) covering Medical (4,892 records / 12 errors), Dental (1,842 / 6), Vision (1,125 / 42 — intentional FAILED scenario), Life (756 / 6), Disability (612 / 8 pending), Payroll (5,124 / 12). `seed/integrations/integrationMonitoringErrors.json`: error category breakdowns per integration (VIS-001 plan code mismatch = 15, VIS-002 invalid tier = 10, etc.). The 9 detailed carrier transaction records remain as representative drill-down samples; UI must display "Showing 9 sample records of N processed." Status model: `COMPLETED` / `IN_PROGRESS` / `FAILED` / `COMPLETED_WITH_ERRORS` / `WARNING`. Carrier connection-level status in `seed/dashboard/carrierMetrics.json`.

---

## 4. Business Logic Gaps

- **Premium calculation formula** ✅ **RESOLVED** — Authoritative formula: `Pay-Period Deduction = ROUND((Monthly Premium × 12) ÷ Pay Periods Per Year, 2)`. Pay periods: Weekly=52, Biweekly=26, Semi-Monthly=24, Monthly=12. The previous `$150 ÷ 2 = $75` example was the semi-monthly (24-period) amount; the correct biweekly (26-period) amount is $69.23. Rounding: half-up to 2 decimal places. Final-pay-period true-up ensures total annual deductions equal annual premium exactly. Mid-year proration based on remaining coverage months ÷ remaining pay periods. 8 requirements in `seed/requirements/premiumCalculationRequirements.json` (REQ-PREM-001 to REQ-PREM-008). Payroll config (frequency, rounding, true-up, tax treatment) in `seed/employers/payrollConfig.json`.
- **Employer contribution math** ✅ **RESOLVED** — Employee premium = Total premium − Employer contribution. Payroll deduction uses employee contribution only. Carrier funding uses employer contribution × coverage period. Both calculated independently and stored separately on the coverage tier (`employerContribution`, `employeeContribution`). See REQ-PREM-007 in `seed/requirements/premiumCalculationRequirements.json`.
- **Eligibility date edge cases** ✅ **RESOLVED** — Authoritative rule: waiting period completion = Hire Date + 30 calendar days; coverage effective = first day of month following completion date (even if completion = 1st). 9 requirements (REQ-ELIG-001 to REQ-ELIG-009) in `seed/requirements/eligibilityCalculationRequirements.json`. 10 edge-case scenarios (ELIG-EDGE-001 to -010) including ELIG-EDGE-002 (hire Jan 2 → completion Feb 1 → coverage March 1, ambiguityFlag: true) in `seed/eligibility/edgeCaseScenarios.json`. Rehire rules (≤30 days credit preserved / >30 days restart) in REQ-ELIG-007. AI ambiguity detection in REQ-ELIG-009.
- **Dependent age-out cutoff** ✅ **RESOLVED** — Authoritative rule: coverage through last day of calendar month in which dependent turns 26; termination effective first day of following month. Formula: `Coverage Termination Date = FIRST_DAY_OF_MONTH_AFTER(LAST_DAY_OF_BIRTH_MONTH_AT_AGE_26)`. 10 requirements (REQ-DEP-001 to REQ-DEP-010) in `seed/requirements/dependentAgeOutRequirements.json`. Eligibility rule ER-DEP-AGE-001 added to `seed/eligibility/eligibilityRules.json`. Demo scenario: DEP-022 Sarah Smith (DOB 2001-03-15), coverage terminates 2027-04-01, seeded in `seed/employees/dependents.json`.
- **Life event enrollment window** ✅ **RESOLVED** — Configurable rule catalog per event type. Marriage: 30-day window (APPROVED). Birth, Adoption, Divorce, Loss of Coverage, Death of Dependent, Employment Status Change: 30-day provisional default (REQUIRES_CONFIRMATION, labeled "Provisional — Requires Benefits/Legal Confirmation"). Dependent Age-Out: automatic (no window). 9-event rule catalog in `seed/lifeEvents/lifeEventRuleCatalog.json`. 12 requirements (REQ-LE-001 to REQ-LE-012) in `seed/requirements/lifeEventEnrollmentWindowRequirements.json`. AI detection of missing event rules in REQ-LE-011.
- **Plan versioning transition logic** ✅ **RESOLVED** — Published versions are immutable; any change creates a new draft. Major vs. minor version types. DRAFT → IN_REVIEW → SCHEDULED → PUBLISHED → SUPERSEDED → RETIRED lifecycle. In-flight enrollments flagged on version change (REQ-VER-009). Future-dated enrollments set to REQUIRES_REVALIDATION (REQ-VER-010). Completed elections locked to submission-time version (REQ-VER-008). Mid-year PPO-500 demo: v1.0 ($150 / $500 deductible) → v2.0 ($175 / $750 deductible, effective July 1). 15 requirements (REQ-VER-001 to REQ-VER-015) in `seed/requirements/planVersioningRequirements.json`.
- **Reconciliation matching key** ✅ **RESOLVED** — Canonical Benefits Person ID (BP-xxxxxx) as internal identity. Persistent cross-reference table: benefitsPersonId → HR employeeId, Carrier memberId (per product), Payroll employeeId. Composite reconciliation key: `benefitsPersonId + planId + planVersionId + coverageTier + coverageEffectiveDate`. Three demo scenarios seeded in `seed/integrations/personIdentityMappings.json`: BP-000001 (MATCHED), BP-000002 (IDENTITY_MAPPING_MISSING — no Dental member ID), BP-000003 (PLAN_MISMATCH — carrier has PPO-1000, benefits has PPO-500). 12 requirements (REQ-REC-001 to REQ-REC-012) in `seed/requirements/reconciliationMatchingRequirements.json`.

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

| Missing Feature | Status | Where Addressed |
|----------------|--------|----------------|
| Open enrollment period management | ✅ **RESOLVED** | 18 requirements REQ-OE-001 to REQ-OE-018 in `seed/requirements/openEnrollmentRequirements.json`. Demo seed in `seed/enrollment/openEnrollmentPeriods.json` (OE-ACME-2027: Oct 1–15 2026, 84% submitted). Time-zone-aware deadline, auto-reenrollment per plan, admin extension, life event independence. |
| COBRA and employment termination | ✅ **RESOLVED** | 15 requirements REQ-TERM-001 to REQ-TERM-015 in `seed/requirements/employmentTerminationRequirements.json`. Coverage termination date independent of HR termination date (Acme rule: end of termination month). Full termination lifecycle: eligibility end → qualified beneficiary ID → continuation coverage event → carrier TERMINATE transactions → payroll stop. Rehire rules link to REQ-ELIG-007. Demo scenario: ACM-E001 termination June 15 2027, coverage ends June 30, carrier transactions effective July 1. |
| ACA compliance tracking | ✅ **RESOLVED** | 16 requirements REQ-ACA-001 to REQ-ACA-016 in `seed/requirements/acaComplianceRequirements.json`. ALE profile, Look-Back measurement, monthly offer-of-coverage tracking, distinction of offered/elected/active, compliance exception detection (FULL_TIME_NO_OFFER), 1095-C dataset generation, reporting workflow lifecycle. Demo scenario: ACM-E025 ACA full-time with no March 2027 offer. AI cross-references measurement data against enrollment records to surface exception. |
| Audit trail | ✅ **RESOLVED** | 15 requirements REQ-AUD-001 to REQ-AUD-015 in `seed/requirements/auditTrailRequirements.json`. Immutable append-only events; actor, role, entity, version, field-level before/after, reason; 19 auditable entity types; correlation ID chains change request → plan version → enrollment impact → payroll → carrier → reconciliation. AI-generated requirement audit preserves original AI text when human edits. Demo: "Who changed PPO-500 deductible from $500 to $750?" → full trace. |
| Employee notifications | ✅ **RESOLVED** | 17 requirements REQ-NOTIFY-001 to REQ-NOTIFY-017 in `seed/requirements/employeeNotificationRequirements.json`. Event-driven notifications; channels: Email (primary), In-App, PDF document (MVP). Configurable templates with merge fields. Delivery status lifecycle (CREATED → QUEUED → SENT → DELIVERED → OPENED → ACKNOWLEDGED / FAILED → RETRY). MANDATORY vs OPTIONAL distinction — mandatory notices not suppressible. Employee Document Center. Demo: Marriage Life Event closed loop (submit → document request → approval → coverage update → carrier → confirmation PDF → audit). |
| Dependent SSN validation | ✅ **RESOLVED** | 15 requirements REQ-DEP-SSN-001 to REQ-DEP-SSN-015 in `seed/requirements/dependentSSNValidationRequirements.json`. SSN format + length validation; rejection of known invalid patterns; FORMAT_VALID vs IDENTITY_VERIFIED distinction; duplicate SSN detection within employer group; dependent validation exception (CT-10045 canonical negative-path); carrier transaction BLOCKED (TXN-DEP-10045); admin override with audit; SSN masked in all UI/notifications; field-level encryption at rest. AI requirements engineering demo: AI reads carrier doc → detects no validation rule → generates REQ-DEP-SSN-001 → traces to CT-10045 → blocked carrier transaction → audit. |
| Role-based access control matrix | ✅ **RESOLVED** | Full RACI matrix for all 8 personas across all 5 EPICs in `docs/06-roles-and-personas.md`. |

---

## 7. Epic 5 — AI Requirements Studio Specifics

- **Requirements data model** ✅ **RESOLVED** — Full schema defined in `seed/requirements/requirements.json`. ID prefix convention (BR- / FR- / BRL- / DR- / US- / AC- / TC-), type enum, status lifecycle (`Draft → Review → Approved → Implemented → Deprecated`), source_document FK, version counter, createdBy, tags. See [data model](docs/07-data-model.md).
- **Traceability graph data structure** ✅ **RESOLVED** — Edge schema defined in `seed/requirements/traceability.json` (16 links, TL-001–TL-016). `RequirementLink` entity has `sourceId`, `targetId`, `linkType` enum (`Derives From`, `Implements`, `Tests`, `Validates`, `Conflicts With`, `Duplicates`). See [data model](docs/07-data-model.md).
- **Conflict detection algorithm** ✅ **RESOLVED** — 16 requirements REQ-CONFLICT-001 to REQ-CONFLICT-016 in `seed/requirements/aiConflictDetectionRequirements.json`. Hybrid architecture: deterministic rule comparison for structured attribute conflicts (detection); LLM semantic analysis for interpretation, classification, explanation, and recommendation. Conflict taxonomy: 13 types (ELIGIBILITY_CONFLICT, TIMING_CONFLICT, etc.). Confidence score. Configurable source authority / precedence hierarchy. Resolution workflow: DETECTED → AI_CLASSIFIED → UNDER_REVIEW → RESOLVED. Canonical requirement created on resolution. Full audit trail.
- **Document extraction output schema** ✅ **RESOLVED** — `SourceDocument.extractionSummary` schema defined as `{ plans: N, rules: N, rates: N, exceptions: N }` with full lifecycle state machine (`UPLOADED → VALIDATING → VALIDATED → PROCESSING → EXTRACTED → ANALYZED → REQUIREMENTS_GENERATED → COMPLETED`). See [ADR-2](docs/08-architecture.md).
- **Conversation state management** ✅ **RESOLVED** — 15 requirements REQ-CONV-001 to REQ-CONV-015 in `seed/requirements/aiInterviewConversationStateRequirements.json`. Application-managed persistent conversation state (not context-window-only). Unique Conversation ID per interview. Persisted messages with sequence numbers. Structured memory: extracted facts + open questions + decisions + generated requirements. Three-layer context: recent messages (~16K token budget), rolling summary, structured facts. Automatic summarization at threshold. Pause/resume with AI contextual recap. Conversation-to-requirement traceability (message IDs). Contradiction detection — no silent fact overwrite. Persistence: lowdb/JSON for demo, PostgreSQL/Redis for production.
- **Backlog export format** ✅ **RESOLVED** — 16 requirements REQ-EXPORT-001 to REQ-EXPORT-016 in `seed/requirements/requirementsBacklogExportRequirements.json`. Canonical backlog model independent of external platforms. Hierarchy: Epic → Feature → User Story → Acceptance Criteria. P0/MVP: JSON (system-to-system) + CSV (business review). P1: Jira adapter. P2: Azure DevOps adapter. Incremental export (new / changed / approved / all). External ID persistence prevents duplicate Jira issues. Export completeness validation and audit trail.
- **Impact analysis context strategy** ✅ **RESOLVED** — 15 requirements REQ-IMPACT-001 to REQ-IMPACT-015 in `seed/requirements/aiImpactAnalysisRequirements.json`. Hybrid RAG architecture: full requirements corpus indexed but NOT injected wholesale into prompts. Four retrieval methods: metadata filtering, vector RAG (semantic similarity), dependency graph traversal, deterministic rules. Context builder assembles bounded context package per analysis request. Impact classification: DIRECT / INDIRECT / DEPENDENCY / POTENTIAL / NO_IMPACT. Severity + confidence score per impact. Human review required before any requirement change. Immutable audit trail.

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
