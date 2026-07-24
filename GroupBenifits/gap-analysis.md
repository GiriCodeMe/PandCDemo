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

- **Rule builder component unspecified.** ✅ **RESOLVED** — Visual IF → AND/OR → THEN rule builder with dropdowns; React Query Builder evaluated; canonical JSON rule AST; AND/OR nested groups up to 2 levels; DRAFT → IN_REVIEW → APPROVED → PUBLISHED → RETIRED lifecycle; only PUBLISHED rules used by rule engine. 14 requirements (REQ-RULE-UI-001–014) in `seed/requirements/ruleBuilderRequirements.json`.
- **Enrollment wizard back-navigation and draft state not specified.** ✅ **RESOLVED** — 8-step wizard with ✓/●/○/⚠/🔒 stepper states; click Back or any completed step; auto-save on step completion; Save & Exit with draft ID; server-side persistence; draft lifecycle DRAFT → IN_PROGRESS → READY_FOR_SUBMISSION → SUBMITTED → PROCESSING → ACTIVE. 15 requirements (REQ-ENROLL-UX-001–015) in `seed/requirements/enrollmentWizardRequirements.json`.
- **Requirements Studio → Plan Config auto-population transition.** ✅ **RESOLVED** — Canonical requirement bridge: AI Extraction → Requirements Studio → Human Review → Approve → Normalize → [Create Rule | Apply to Plan] → Draft → Human Review → Publish; preview diff before applying; changes never directly modify published plan; bidirectional traceability graph. 12 requirements (REQ-REQPLAN-001–012) in `seed/requirements/requirementsPlanTransitionRequirements.json`.
- **AI loading/latency UX not designed.** ✅ **RESOLVED** — Immediate feedback < 200ms; skeleton loaders for structured content; 7-stage progress indicator (not fake %); SSE streaming for chat/interview; extended-processing message at 30s; background job support with Global AI Job Center in header; status model QUEUED → PROCESSING → COMPLETED | FAILED | CANCELLED | PARTIAL | TIMED_OUT | RETRYING. 15 requirements (REQ-AI-UX-001–015) in `seed/requirements/aiProcessingUXRequirements.json`.
- **Plan comparison interaction undefined.** ✅ **RESOLVED** — Dedicated comparison view (not modal); 2–4 plans side-by-side launched from Plan Catalog; "Differences Only" mode hides identical values; collapsible categories (Plan Overview / Eligibility / Coverage / Cost & Premiums / Network / HSA-FSA / etc.); sticky plan headers on scroll; enrollment workflow integration; optional AI comparison summary. 14 requirements (REQ-PLAN-COMP-001–014) in `seed/requirements/planComparisonRequirements.json`.
- **Document preview / extraction review step absent.** ✅ **RESOLVED** — Three-panel workspace: PDF Preview | Extracted Content | AI Findings; two-stage review (Extraction Review: did AI understand? + Requirements Review: did AI interpret correctly?); confidence-based prioritization (≥90% pre-selected / 70–89% review required / <70% manual); explicit commit workflow; never auto-commit; document lifecycle UPLOADED → VALIDATING → EXTRACTING → ANALYZING → REVIEW_REQUIRED → PARTIALLY_COMMITTED → COMMITTED. 14 requirements (REQ-DOC-REV-001–014) in `seed/requirements/documentPreviewRequirements.json`.
- **Integration monitoring refresh behavior unspecified.** ✅ **RESOLVED** — setInterval polling every 10 seconds; manual [↻ Refresh Now] resets timer; last-updated timestamp always visible; in-progress state with records counter (N/total) and deterministic progress bar; pause polling when browser tab inactive; immediate refresh on tab activation; prevent overlapping polls; stale-data warning on refresh failure. 14 requirements (REQ-INT-MON-001–014) in `seed/requirements/integrationMonitoringRequirements.json`.

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

- **Carrier simulation contract** ✅ **RESOLVED** — 15 requirements REQ-CARRIER-SIM-001 to REQ-CARRIER-SIM-015 in `seed/requirements/carrierSimulationRequirements.json`. Hybrid model: Schema Validation → Business Rule Validation → Seeded Scenario Matching → Default ACCEPTED. Default mode DETERMINISTIC (same input always same output). Three response states: ACCEPTED / REJECTED / SYSTEM_ERROR. Standardized 17-value rejection reason code set. 7 seeded scenarios including SCN-004 (CT-10045 INVALID_DEPENDENT_SSN), SCN-007 (CARRIER_TIMEOUT SYSTEM_ERROR). Optional CHAOS mode for monitoring demos. Business failures distinguished from technical failures in monitoring aggregates.
- **EDI 834 scope** ✅ **RESOLVED** — 15 requirements REQ-EDI-834-001 to REQ-EDI-834-015 in `seed/requirements/edi834Requirements.json`. Constrained ANSI ASC X12 834 generator (not CSV-as-EDI). Canonical enrollment model → EDI mapper → X12 834. Supported segments: ISA/GS/ST/BGN/REF/DTP/INS/NM1/DMG/HD/SE/GE/IEA. Transactions: Add, Change, Terminate, Dependent. Basic X12 structural + business validation. Deterministic control numbers. Sample artifacts required: Acme_834_Implementation_Guide.pdf, Segment_Map.xlsx, 4 sample .edi files. MVP boundary explicitly stated — not production-grade X12 translator.
- **Transmission schedule simulation** ✅ **RESOLVED** — 15 requirements REQ-TRANSMISSION-001 to REQ-TRANSMISSION-015 in `seed/requirements/transmissionScheduleRequirements.json`. Hybrid trigger model: manual 'Run Now' button (primary for demos) + optional Node.js cron job. Both triggers invoke same transmission service. WEEKLY is the primary demo frequency. Simulated time advancement and 'Run Scheduled Job Now' for demo control. Batch lifecycle: SCHEDULED → TRIGGERED → BATCH_CREATED → FILE_GENERATED → VALIDATING → TRANSMITTING → ACCEPTED/PARTIALLY_ACCEPTED/REJECTED/SYSTEM_ERROR. Partial success scenario: 140 accepted / 5 rejected / 2 errors → PARTIALLY_ACCEPTED.
- **Carrier rejection mock scenario** ✅ **RESOLVED** — `CT-10045` in `seed/integrations/carrierTransactions.json` hardcodes the Demo Step 10 rejection: Linda White (ACM-E012) medical enrollment rejected by Aetna, `errorCode: "DEP-INVALID-ID"`, `errorMessage: "Dependent ID DEP-INVALID not found in carrier member records"`. Linked to enrollment `ENR-10012` and life event `LE-003`.

---

## 9. Non-Functional / Cross-Cutting Gaps

- **No field-level validation rules.** ✅ **RESOLVED** — Metadata-driven validation engine: configurable field metadata JSON with required/optional/conditional/system classification, regex patterns (EIN, SSN, ZIP, email, phone), cross-field rules, conditionalExamples, 8-layer validation pipeline, 14 error codes. 15 requirements (REQ-VALIDATION-001–015) in `seed/requirements/fieldValidationRequirements.json`. Companion seed: `seed/validation/fieldValidationMetadata.json`.
- **No API error response schema.** ✅ **RESOLVED** — Standard error envelope `{ success, error: { code, message, details, requestId, timestamp } }`. HTTP status mapping (400/401/403/404/409/422/429/500/502/503/504). Field-level validation details with field + code + message. Business-rule violation format. Carrier/AI/timeout error formats. Retryable flag. No stack-trace exposure. Centralized frontend error routing (validation → inline, unauthorized → login, rate-limit → auto-retry, internal → generic + requestId). 17-code error taxonomy. 10 requirements (API-ERR-001–010) in `seed/requirements/apiErrorSchemaRequirements.json`.
- **No test strategy.** ✅ **RESOLVED** — Cross-cutting quality engineering epic: unit tests for all financial/date/rule business logic (eligibility dates with 7 edge cases, premium calculation for all 4 frequencies + rounding, dependent age-out, life events, enrollment validation), API integration tests (INT-001–004), 5 E2E journeys (E2E-001–005 including CT-10045 carrier rejection path and AI requirements engineering flow), AI golden dataset evaluation, test seed composition (30 employees / 9 plans / 5 carriers), CI/CD gate, minimum regression suite. 15 requirements (REQ-TEST-001–015) in `seed/requirements/qualityEngineeringRequirements.json`.
- **Gemini API rate-limit handling absent.** ✅ **RESOLVED** — Exponential backoff + jitter (`delay = min(baseDelay × 2^attempt + randomJitter, maxDelay)`); max 3 retries; circuit breaker (threshold 5 failures, cooldown 30s); request queue (max 2 concurrent, max queue size 10); SHA-256 document fingerprinting cache prevents duplicate calls; idempotency key (AI-REQ-YYYYMMDD-NNN); graceful degradation (document saved, retry available); demo pre-warm / CACHED_DEMO fallback mode. 16 requirements (REQ-AI-RELIABILITY-001–016) in `seed/requirements/aiReliabilityRequirements.json`.
- **No deployment or hosting spec.** ✅ **RESOLVED** — Primary path: Node.js + React direct execution with `concurrently` (`npm run dev:all`). Docker optional. `.env.example` committed; `.env` and service-account*.json in `.gitignore`. 15-variable env catalog. Startup validation (6 checks, non-zero exit on failure). Demo reset endpoint (`POST /api/demo/reset`). Version footer and demo environment banner. 16 requirements (REQ-DEPLOY-001–016) in `seed/requirements/deploymentRequirements.json`.

---

## 10. Phase 2 — Platform Architecture Gaps

_Identified in Phase 2 gap review. All 14 new requirement sets created under `seed/requirements/`._

| # | Gap Category | Priority | Status | Requirement Set |
|---|-------------|----------|--------|----------------|
| 1 | **Security & Privacy** | P0 | ✅ **RESOLVED** | 15 requirements REQ-SEC-001–015 in `securityPrivacyRequirements.json`. PII classification; SSN encrypted at rest, masked XXX-XX-1234 in all UI/API/notifications/logs; TLS 1.2+; demo mock JWT (AUTH_MODE=mock); file upload magic-bytes validation; CORS whitelist = FRONTEND_URL only; security headers via helmet; PII access events audited without recording the PII value itself. |
| 2 | **Role-Based Access Control** | P0 | ✅ **RESOLVED** | 15 requirements REQ-RBAC-001–015 in `rbacRequirements.json`. 10 personas defined with full permission matrix covering VIEW/CREATE/EDIT/DELETE/APPROVE/PUBLISH/TRANSMIT/EXPORT per feature area. UI hides/disables unauthorized actions (UX layer); API enforces independently (security layer). Persona quick-switch in global navigation header. Bearer token with personaId + role. |
| 3 | **Audit & Traceability (extended)** | P0 | ✅ **RESOLVED** | Extended by REQ-AIGOV-015 (provenance chain navigable: Document → Extraction Run → Requirement → Review → Approval → Configuration) and REQ-AUD-001–015 (existing). Full forward and backward traceability through `aiDocumentIntelligenceRequirements.json` (REQ-AI-KNOW-011). |
| 4 | **AI Governance & Human-in-the-Loop** | P0 | ✅ **RESOLVED** | 15 requirements REQ-AIGOV-001–015 in `aiGovernanceRequirements.json`. Provenance schema; confidence bands ≥90%/70–89%/<70%; no auto-commit without human approval (architectural principle); status badges [AI]/[HR]/[✓]/[✗]/[?]; bulk action confirmation dialogs; no silent AI failures; AI output targets only named config fields; governance dashboard KPIs; reviewer assignment workflow. |
| 5 | **Data Lifecycle & Retention** | P1 | ✅ **RESOLVED** | 12 requirements REQ-DL-001–012 in `dataLifecycleRequirements.json`. Soft delete pattern (isActive flag / ARCHIVED/RETIRED status); terminated employees retained in ARCHIVED state; audit log immutable and non-deletable; plan versions never hard-deleted; archived data queryable via include_archived=true; hard deletes only during POST /api/demo/reset. |
| 6 | **Workflow & Approval State Machines** | P0 | ✅ **RESOLVED** | 15 requirements REQ-WF-001–015 in `workflowStateRequirements.json`. Explicit state machines defined for: Plan lifecycle (6 states), AI Requirement lifecycle (7 states), Enrollment lifecycle (9 states), Eligibility Rule lifecycle (5 states), Carrier Transmission lifecycle (9 states), Life Event lifecycle (8 states). All transitions create immutable audit events. HTTP 422 BUSINESS_RULE_VIOLATION on invalid transitions. |
| 7 | **Operational Resilience** | P1 | ✅ **RESOLVED** | 12 requirements REQ-OPS-001–012 in `operationalResilienceRequirements.json`. Idempotency keys on all mutating APIs (24h dedup window; duplicate → 200 + Idempotent-Replayed: true); partial batch processing; dead-letter queue (FAILED_PERMANENT after 3 retries); X-Correlation-Id propagated end-to-end; graceful degradation (non-critical failures don't block enrollment or carrier transmission); health check endpoints for all external dependencies. |
| 8 | **Demo Experience & Observability** | P0 | ✅ **RESOLVED** | 12 requirements REQ-DEMO-001–012 in `demoControlCenterRequirements.json`. SYSTEM_ADMIN-only Demo Control Center: reset ≤ 3s; 3 scenario presets (HAPPY_PATH/EXCEPTIONS/FAILURES); carrier simulation one-click controls; AI mode toggle (Live Gemini / Demo Fallback with banner); specific error simulation (CT-10045, DED-10001, rate limit, invalid SSN); date override; Pre-Warm AI (24h cache); snapshot save/restore (max 3 snapshots). |
| 9 | **Accessibility** | P1 | ✅ **RESOLVED** | 12 requirements REQ-A11Y-001–012 in `accessibilityRequirements.json`. WCAG 2.1 AA target; keyboard navigation (no traps; Escape dismisses all modals); visible focus indicators (3:1+ contrast); 4.5:1 text color contrast; status badges always include text label (never color-only); aria-live regions for AI streaming responses; skip navigation link; descriptive page titles updated on SPA navigation. |
| 10 | **Performance & Scalability** | P1 | ✅ **RESOLVED** | 12 requirements REQ-PERF-001–012 in `performanceRequirements.json`. Non-AI API p95 ≤ 500ms; initial page load ≤ 3s; AI first token ≤ 3s; enrollment submission ≤ 5s; eligibility rule engine ≤ 200ms; dashboard ≤ 1s from seed snapshot; 5,000-employee dataset at all targets; carrier simulation 100 records ≤ 10s; demo reset ≤ 3s. |
| 11 | **Versioning & Effective Dating (Cross-Entity)** | P0 | ✅ **RESOLVED** | 12 requirements REQ-VER-X-001–012 in `crossEntityVersioningRequirements.json`. Versioning extended beyond plans to: eligibilityRules, aiRequirements, rateTable, employerContribution, carrierMapping, payrollMapping. Future effective date support. Historical enrollments evaluated against config version at enrollment date. Carrier ID mappings versioned with effective dates. Version History panel on all versioned entities with diff view. |
| 12 | **Configuration vs. Hardcoding (Architecture Principle)** | P0 | ✅ **RESOLVED** | 12 requirements REQ-CFG-001–012 in `configurationArchitectureRequirements.json`. Core principle: eligibility rules stored as JSON AST not if/else code. AI targets named typed config fields (INTEGER/DATE/DECIMAL/BOOLEAN) — never source code. FEATURE_* env vars for feature flags. CARRIER_SIMULATION_MODE env var. Age-out policy and ACA measurement period in employer config. All config changes create audit trail entries. |
| 13 | **AI Copilot (Eligibility, Enrollment, Life Events, Operations)** | P0 | ✅ **RESOLVED** | 15 requirements REQ-AI-COP-001–015 in `aiCopilotRequirements.json`. Eligibility Copilot (why ineligible? + path-to-eligibility + 30-day predictive query); Enrollment Assistant (conversational, advisory only — never auto-elects); Life Event Assistant (natural language → event type + window + required docs); Exception Copilot (root cause + fix recommendation → human approves → retry); Reconciliation Assistant; Benefits Decision Support. All AI responses labeled and include disclaimer. |
| 14 | **AI Simulation, Test Generation, and Agentic Orchestration** | P0 | ✅ **RESOLVED** | 12 requirements REQ-AI-SIM-001–012 in `aiSimulationRequirements.json`. What-If Simulation (read-only; 3 pre-configured demo scenarios); impact dependency chain visualization (PDF→REQ→RULE→PLAN→ENROLLMENT→CARRIER→TEST); AI Test Case Generation (Given/When/Then + happy/boundary/negative/edge per requirement); AI Backlog Prioritization (5 scoring criteria); AI Compliance Assistant (ACA/COBRA/ERISA flags + disclaimer); Agentic Orchestration concept demo (Requirements Agent → Impact Agent → Test Generation Agent → Compliance Agent → human review package). |

### Platform Layer Architecture

The 14 new requirement sets implement the horizontal platform layer that cuts across all 5 Epics:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  EPIC 1           EPIC 2          EPIC 3        EPIC 4         EPIC 5       │
│  Plan Config      Eligibility     Enrollment    Integration    AI Req Studio│
├─────────────────────────────────────────────────────────────────────────────┤
│  Security & PII Protection (REQ-SEC-001–015)                                │
│  Role-Based Access Control (REQ-RBAC-001–015)                               │
│  Audit & Traceability (REQ-AUD-001–015 + REQ-AI-KNOW-011)                  │
│  Workflow State Machines (REQ-WF-001–015)                                   │
│  Notifications (REQ-NOTIFY-001–017)                                         │
│  AI Governance & Human-in-the-Loop (REQ-AIGOV-001–015)                     │
│  Configuration Architecture (REQ-CFG-001–012)                              │
│  Cross-Entity Versioning (REQ-VER-X-001–012)                               │
│  Data Lifecycle & Retention (REQ-DL-001–012)                               │
│  Operational Resilience (REQ-OPS-001–012)                                  │
│  Performance Targets (REQ-PERF-001–012)                                    │
│  Accessibility (REQ-A11Y-001–012)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Gaps vs. PetLife AI Factory Pattern

The PetLife pattern works because all routes are stateless (no persistence, no multi-turn AI, no file upload). 
Group Benefits breaks that in three ways:

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
