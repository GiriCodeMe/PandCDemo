# Group Benefits AI Demo — Requirements

AI-Powered Group Benefits Plan & Requirements Engineering Platform for Acme Corporation (5,000 employees).

---

## Documents

| # | File | Contents |
|---|------|----------|
| 00 | [docs/00-overview.md](docs/00-overview.md) | Application overview, personas, core scenario, AI model assignments, streaming strategy |
| 01 | [docs/01-epic1-plan-config.md](docs/01-epic1-plan-config.md) | EPIC 1 — Employer setup, benefit product catalog, plan configuration, premiums, plan versioning |
| 02 | [docs/02-epic2-eligibility.md](docs/02-epic2-eligibility.md) | EPIC 2 — Employee eligibility rules, rule builder, dependent eligibility, waiting periods, simulation, conflict detection |
| 03 | [docs/03-epic3-enrollment.md](docs/03-epic3-enrollment.md) | EPIC 3 — Employee enrollment, plan comparison, enrollment workflow, life events, AI life event assistant |
| 04 | [docs/04-epic4-integration.md](docs/04-epic4-integration.md) | EPIC 4 — Carrier management, eligibility data exchange, carrier integration, payroll integration, reconciliation, monitoring |
| 05 | [docs/05-epic5-ai-requirements.md](docs/05-epic5-ai-requirements.md) | EPIC 5 — Document ingestion, requirements discovery, AI interview, requirements generation, validation, traceability, impact analysis, backlog, demo UI, demo story, "wow" moment |
| 06 | [docs/06-roles-and-personas.md](docs/06-roles-and-personas.md) | RACI matrix, 8 persona profiles, five-persona demo sequence, closed-loop demo narrative |
| 07 | [docs/07-data-model.md](docs/07-data-model.md) | Data persistence strategy, JSON file store layout, entity relationship overview, all 20 entity definitions, ID conventions |
| 08 | [docs/08-architecture.md](docs/08-architecture.md) | ADR-1 (Zustand), ADR-2 (File Storage / DocumentStorageService), ADR-3 (Env Config / Zod / Feature Flags) |

---

## Quick Reference

### Demo Scenario

Acme Corporation launches Group Benefits for 5,000 employees. The AI Requirements Studio extracts business rules from uploaded documents, interviews stakeholders, generates structured requirements, and traces them end-to-end through configuration → enrollment → carrier integration → payroll.

### Five-Persona Demo Sequence

```
Product Manager → Business Analyst → Benefits Administrator → Employee / HR → Benefits Analyst
```

### AI Models

| Task | Model |
|------|-------|
| Document ingestion, extraction, Q&A | Gemini 1.5 Pro |
| Interview, generation, validation, assistant | Gemini 2.0 Flash |

### Key Demo Scenarios

| Scenario | Seed Data |
|----------|-----------|
| Eligibility rule conflict (30 days vs. first of month) | `BR-001` / `BR-002`, `ER-006-CONFLICT` / `ER-007-CONFLICT` |
| Carrier rejection — missing dependent ID | `CT-10045`, `ENR-10012`, `LE-003` |
| Payroll mismatch — old EE+Spouse rate after divorce | `DED-10001`, `ENR-10001` |
| Life event in progress — marriage pending docs | `LE-001`, `ACM-E030` |
| Ambiguous language — "promptly" undefined | `BR-007-AMBIGUOUS` |

### Seed Data

```
seed/
  auth/          personas.json (8 demo personas)
  dashboard/     dashboardSnapshot.json, eligibilityExceptions.json,
                 carrierMetrics.json, requirementCategories.json
  eligibility/   eligibilityRules.json (incl. ER-DEP-AGE-001), dependentRules.json,
                 edgeCaseScenarios.json (10 date edge cases)
  employees/     employees.json (30), dependents.json (22, incl. DEP-022 Sarah Smith age-out)
  employers/     payrollConfig.json
  enrollment/    enrollments.json, lifeEvents.json, openEnrollmentPeriods.json
  integrations/  carriers.json, carrierTransactions.json, payrollTransactions.json,
                 integrationMonitoringAggregates.json (6 windows), integrationMonitoringErrors.json,
                 personIdentityMappings.json (3 demo: MATCHED / MISSING / MISMATCH)
  lifeEvents/    lifeEventRuleCatalog.json (9 event types, configurable windows)
  products/      products.json, plans.json, rates.json, planVersions.json
  requirements/  businessRules.json, requirements.json, userStories.json,
                 acceptanceCriteria.json, traceability.json,
                 premiumCalculationRequirements.json         (REQ-PREM-001–008)
                 eligibilityCalculationRequirements.json     (REQ-ELIG-001–009)
                 dependentAgeOutRequirements.json            (REQ-DEP-001–010)
                 dependentSSNValidationRequirements.json     (REQ-DEP-SSN-001–015)
                 lifeEventEnrollmentWindowRequirements.json  (REQ-LE-001–012)
                 planVersioningRequirements.json             (REQ-VER-001–015)
                 reconciliationMatchingRequirements.json     (REQ-REC-001–012)
                 openEnrollmentRequirements.json             (REQ-OE-001–018)
                 employmentTerminationRequirements.json      (REQ-TERM-001–015)
                 acaComplianceRequirements.json              (REQ-ACA-001–016)
                 auditTrailRequirements.json                 (REQ-AUD-001–015)
                 employeeNotificationRequirements.json       (REQ-NOTIFY-001–017)
                 aiConflictDetectionRequirements.json        (REQ-CONFLICT-001–016)
                 aiInterviewConversationStateRequirements.json (REQ-CONV-001–015)
                 requirementsBacklogExportRequirements.json  (REQ-EXPORT-001–016)
                 aiImpactAnalysisRequirements.json           (REQ-IMPACT-001–015)
                 carrierSimulationRequirements.json          (REQ-CARRIER-SIM-001–015)
                 edi834Requirements.json                     (REQ-EDI-834-001–015)
                 transmissionScheduleRequirements.json       (REQ-TRANSMISSION-001–015)
                 fieldValidationRequirements.json            (REQ-VALIDATION-001–015)
                 qualityEngineeringRequirements.json         (REQ-TEST-001–015)
                 aiReliabilityRequirements.json              (REQ-AI-RELIABILITY-001–016)
                 deploymentRequirements.json                 (REQ-DEPLOY-001–016)
                 ruleBuilderRequirements.json                (REQ-RULE-UI-001–014)
                 enrollmentWizardRequirements.json           (REQ-ENROLL-UX-001–015)
                 requirementsPlanTransitionRequirements.json (REQ-REQPLAN-001–012)
                 aiProcessingUXRequirements.json             (REQ-AI-UX-001–015)
                 planComparisonRequirements.json             (REQ-PLAN-COMP-001–014)
                 documentPreviewRequirements.json            (REQ-DOC-REV-001–014)
                 integrationMonitoringRequirements.json      (REQ-INT-MON-001–014)
                 securityPrivacyRequirements.json           (REQ-SEC-001–015)
                 rbacRequirements.json                      (REQ-RBAC-001–015)
                 aiGovernanceRequirements.json              (REQ-AIGOV-001–015)
                 workflowStateRequirements.json             (REQ-WF-001–015)
                 configurationArchitectureRequirements.json (REQ-CFG-001–012)
                 demoControlCenterRequirements.json         (REQ-DEMO-001–012)
                 crossEntityVersioningRequirements.json     (REQ-VER-X-001–012)
                 aiDocumentIntelligenceRequirements.json    (REQ-AI-KNOW-001–015)
                 aiCopilotRequirements.json                 (REQ-AI-COP-001–015)
                 aiSimulationRequirements.json              (REQ-AI-SIM-001–012)
                 dataLifecycleRequirements.json             (REQ-DL-001–012)
                 operationalResilienceRequirements.json     (REQ-OPS-001–012)
                 accessibilityRequirements.json             (REQ-A11Y-001–012)
                 performanceRequirements.json               (REQ-PERF-001–012)
  validation/    fieldValidationMetadata.json
  documents/     documents.json
samples/
  Acme_2027_Benefits_Guide.pdf
  Acme_2027_Eligibility_Policy.pdf
  Acme_2027_Carrier_Requirements.pdf
  Acme_2027_Payroll_Spec.pdf
  Acme_2027_Enrollment_Process.pdf
```

---

## P0 Business Rule Requirements Index

Requirements seeded in `seed/requirements/` — each file is a self-contained JSON array of requirement objects with `requirementId`, `type`, `title`, `description`, `status`, and `tags`.

| Requirement Set | File | IDs | Count | Key Business Rules |
|----------------|------|-----|-------|--------------------|
| Premium Calculation | `premiumCalculationRequirements.json` | REQ-PREM-001–008 | 8 | `ROUND((Monthly × 12) ÷ Pay Periods, 2)`; biweekly ≠ monthly ÷ 2; half-up rounding; final-period true-up |
| Eligibility Effective Dates | `eligibilityCalculationRequirements.json` | REQ-ELIG-001–009 | 9 | Calendar-day wait; coverage = first of month following completion; no same-day activation on the 1st; rehire credit |
| Dependent Age-Out | `dependentAgeOutRequirements.json` | REQ-DEP-001–010 | 10 | End of birth month at 26; termination = first of following month; DEPENDENT_AGE_OUT event triggers carrier/payroll cascade |
| Dependent SSN Validation | `dependentSSNValidationRequirements.json` | REQ-DEP-SSN-001–015 | 15 | Format + length validation; FORMAT_VALID vs IDENTITY_VERIFIED distinction; duplicate SSN detection; carrier transaction BLOCKED on failure; SSN masked in all UI/notifications/logs; field encryption |
| Life Event Windows | `lifeEventEnrollmentWindowRequirements.json` | REQ-LE-001–012 | 12 | Configurable per event type; Marriage APPROVED; others REQUIRES_CONFIRMATION; no universal default |
| Plan Versioning | `planVersioningRequirements.json` | REQ-VER-001–015 | 15 | Published = immutable; changes create new draft; in-flight sessions flagged; future-dated elections revalidated |
| Reconciliation Matching | `reconciliationMatchingRequirements.json` | REQ-REC-001–012 | 12 | Canonical benefitsPersonId; composite key; effective-dated cross-reference mappings |
| Open Enrollment | `openEnrollmentRequirements.json` | REQ-OE-001–018 | 18 | Configurable window + time zone; OE ≠ Life Event window; auto-reenrollment per plan; saved ≠ submitted |
| Employment Termination | `employmentTerminationRequirements.json` | REQ-TERM-001–015 | 15 | Coverage end date independent of HR termination; COBRA qualifying event; carrier TERMINATE transactions |
| ACA Compliance | `acaComplianceRequirements.json` | REQ-ACA-001–016 | 16 | ALE profile; monthly offer tracking; offered ≠ elected ≠ active; 1095-C dataset; exception: FULL_TIME_NO_OFFER |
| Audit Trail | `auditTrailRequirements.json` | REQ-AUD-001–015 | 15 | Immutable append-only; correlation ID chains; AI-generated requirement versioning; full forward/backward trace |
| Employee Notifications | `employeeNotificationRequirements.json` | REQ-NOTIFY-001–017 | 17 | Event-driven; Email + In-App + PDF (MVP); configurable templates with merge fields; MANDATORY vs OPTIONAL; delivery status lifecycle; Employee Document Center |
| AI Conflict Detection | `aiConflictDetectionRequirements.json` | REQ-CONFLICT-001–016 | 16 | Hybrid: deterministic detection + LLM interpretation; 13 conflict types; confidence score; configurable source authority; resolution creates canonical requirement |
| AI Interview Conversation State | `aiInterviewConversationStateRequirements.json` | REQ-CONV-001–015 | 15 | Unique Conversation ID; structured memory (facts + open questions); three-layer context; token budget; auto-summarization; pause/resume; contradiction detection; message-to-requirement traceability |
| Requirements Backlog Export | `requirementsBacklogExportRequirements.json` | REQ-EXPORT-001–016 | 16 | Canonical backlog (Epic → Feature → Story → AC); P0: JSON + CSV; P1: Jira adapter; P2: Azure DevOps; incremental export; external ID persistence; no duplicate creation |
| AI Impact Analysis | `aiImpactAnalysisRequirements.json` | REQ-IMPACT-001–015 | 15 | Hybrid RAG: metadata filter + vector RAG + graph traversal + deterministic rules; bounded context package; DIRECT/INDIRECT/DEPENDENCY/POTENTIAL/NO_IMPACT; severity + confidence; no full dataset injection |
| Carrier API Simulation | `carrierSimulationRequirements.json` | REQ-CARRIER-SIM-001–015 | 15 | Deterministic default; ACCEPTED/REJECTED/SYSTEM_ERROR; 17 rejection reason codes; 7 seeded scenarios; optional CHAOS mode; business vs. technical failure distinction |
| EDI 834 Generation | `edi834Requirements.json` | REQ-EDI-834-001–015 | 15 | True ANSI X12 834 (not CSV-as-EDI); canonical model → EDI mapper; Add/Change/Terminate/Dependent; structural + business validation; sample artifacts: guide, segment map, 4 .edi files |
| Transmission Scheduling | `transmissionScheduleRequirements.json` | REQ-TRANSMISSION-001–015 | 15 | Manual trigger (primary) + optional cron job; same processing service; WEEKLY demo frequency; simulated time advance; batch lifecycle; PARTIALLY_ACCEPTED outcome |

| Field Validation | `fieldValidationRequirements.json` | REQ-VALIDATION-001–015 | 15 | Metadata-driven engine; regex patterns for EIN/SSN/ZIP/email; 8-layer validation pipeline; 14 error codes; conditional rules; SSN never in logs |
| Quality Engineering & Testing | `qualityEngineeringRequirements.json` | REQ-TEST-001–015 | 15 | Unit: eligibility dates (7 edge cases), premium calc (4 frequencies), age-out, life events; 5 E2E journeys; AI golden dataset; test seed composition; CI/CD gate |
| AI Reliability & Rate Limiting | `aiReliabilityRequirements.json` | REQ-AI-RELIABILITY-001–016 | 16 | Exponential backoff + jitter; circuit breaker (threshold 5 / cooldown 30s); queue (max 2 concurrent / 10 size); SHA-256 fingerprint cache; idempotency; graceful degradation; demo pre-warm mode |
| Deployment & Environment | `deploymentRequirements.json` | REQ-DEPLOY-001–016 | 16 | Node.js + React primary path (Docker optional); concurrently dev:all; .env.example committed; .env in .gitignore; startup validation; demo reset endpoint; version footer |
| Rule Builder UX | `ruleBuilderRequirements.json` | REQ-RULE-UI-001–014 | 14 | Visual IF → AND/OR → THEN dropdown builder; React Query Builder; canonical JSON rule AST; DRAFT → PUBLISHED lifecycle; only PUBLISHED rules evaluated |
| Enrollment Wizard UX | `enrollmentWizardRequirements.json` | REQ-ENROLL-UX-001–015 | 15 | 8-step wizard; stepper states ✓/●/○/⚠/🔒; backward navigation; auto-save; server-side draft persistence; submission blocked until all validations pass |
| Requirements → Plan Transition | `requirementsPlanTransitionRequirements.json` | REQ-REQPLAN-001–012 | 12 | Canonical requirement bridge; [Create Rule] / [Apply to Plan] actions; preview diff before apply; changes to draft only; traceability graph; 6 API endpoints |
| AI Processing UX | `aiProcessingUXRequirements.json` | REQ-AI-UX-001–015 | 15 | Immediate feedback < 200ms; skeleton loaders; 7-stage progress (no fake %); SSE streaming for chat; background jobs with AI Job Center; status model QUEUED → COMPLETED/FAILED/PARTIAL/TIMED_OUT/RETRYING |
| Plan Comparison | `planComparisonRequirements.json` | REQ-PLAN-COMP-001–014 | 14 | Dedicated comparison view (not modal); 2–4 plans; "Differences Only" mode; collapsible categories; sticky plan headers; enrollment workflow integration; AI comparison summary |
| Document Preview & Extraction Review | `documentPreviewRequirements.json` | REQ-DOC-REV-001–014 | 14 | Three-panel workspace: PDF Preview / Extracted Content / AI Findings; confidence-based review (≥90%/70–89%/<70%); explicit commit workflow; never auto-commit; document lifecycle UPLOADED → COMMITTED |
| Integration Monitoring | `integrationMonitoringRequirements.json` | REQ-INT-MON-001–014 | 14 | setInterval polling 10s; manual refresh; last-updated timestamp; records counter progress bar; pause on tab hidden; prevent overlapping polls; deterministic carrier simulations |
| API Error Schema | `apiErrorSchemaRequirements.json` | API-ERR-001–010 | 10 | Standard error envelope { success, error: { code, message, details, requestId, timestamp } }; HTTP status mapping; field-level validation details; retryable flag; no stack-trace exposure; 17-code error taxonomy |
| Security & Privacy | `securityPrivacyRequirements.json` | REQ-SEC-001–015 | 15 | PII classification; SSN encrypted at rest + masked XXX-XX-1234 in all UI/API/logs; TLS 1.2+; demo mock JWT; file upload magic-bytes validation; CORS whitelist; security headers via helmet; PII access events audited |
| Role-Based Access Control | `rbacRequirements.json` | REQ-RBAC-001–015 | 15 | 10 personas; permission matrix (VIEW/CREATE/EDIT/DELETE/APPROVE/PUBLISH/TRANSMIT/EXPORT) per feature; UI hides + API enforces independently; persona quick-switch in global nav |
| AI Governance | `aiGovernanceRequirements.json` | REQ-AIGOV-001–015 | 15 | Provenance schema (sourceDocumentId, sourcePage, sourceTextSnippet, modelVersion, promptTemplateVersion); confidence bands ≥90%/70–89%/<70%; no auto-commit without human approval; status badges [AI]/[HR]/[✓]/[✗]/[?]; 5-type conflict classification; governance dashboard |
| Workflow State Machines | `workflowStateRequirements.json` | REQ-WF-001–015 | 15 | Plan: DRAFT→UNDER_REVIEW→APPROVED→PUBLISHED→ACTIVE→RETIRED; AI Requirement: EXTRACTED→AI_REVIEWED→HUMAN_REVIEW→APPROVED→REJECTED→IMPLEMENTED; Enrollment: DRAFT→SUBMITTED→VALIDATED→CONFIRMED→TRANSMITTED→ACCEPTED/REJECTED→ACTIVE; state transitions create immutable audit events; HTTP 422 on invalid transitions |
| Configuration Architecture | `configurationArchitectureRequirements.json` | REQ-CFG-001–012 | 12 | Core principle: eligibility rules as JSON config not if/else code; AI targets named typed config fields; premiums from rate tables at runtime; FEATURE_* env var flags; CARRIER_SIMULATION_MODE; age-out policy configurable; AI-driven config change requires diff preview |
| Demo Control Center | `demoControlCenterRequirements.json` | REQ-DEMO-001–012 | 12 | SYSTEM_ADMIN only; reset ≤3s scope (seed+drafts+queue+docs+conversations); 3 scenario presets (HAPPY_PATH/EXCEPTIONS/FAILURES); carrier simulation one-click (Accept All/Partial/Reject All); AI mode toggle (Live Gemini/Demo Fallback); date override; snapshot save/restore (max 3) |
| Cross-Entity Versioning | `crossEntityVersioningRequirements.json` | REQ-VER-X-001–012 | 12 | Versioning on: plans, eligibilityRules, aiRequirements, rateTable, employerContribution, carrierMapping, payrollMapping; future effective dates; historical enrollment resolved at enrollment-date config version; diff view with AI source requirement reference |
| AI Document Intelligence | `aiDocumentIntelligenceRequirements.json` | REQ-AI-KNOW-001–015 | 15 | Multi-document knowledge base across all 5 Acme PDFs; Benefits Knowledge Assistant with source citation (document/page/section/snippet); cross-document requirement aggregation; EXPLICIT/INFERRED/CALCULATED extraction types; missing requirement detection (MISSING_INFORMATION); end-to-end traceability PDF→KB→REQ→CONFIG both directions |
| AI Copilot | `aiCopilotRequirements.json` | REQ-AI-COP-001–015 | 15 | Eligibility Copilot (why ineligible? + path-to-eligibility + predict eligibility within 30 days); Enrollment Assistant (conversational plan selection; advisory only); Life Event Assistant (natural language → event type + window + docs); Exception Copilot (root cause + fix recommendation; human approves before retry); Reconciliation Assistant; Benefits Decision Support |
| AI Simulation & Strategy | `aiSimulationRequirements.json` | REQ-AI-SIM-001–012 | 12 | What-If Simulation (change X → see impact → decide; read-only); 3 pre-configured scenarios (waiting period / contribution / eligibility threshold); impact dependency chain PDF→REQ→RULE→PLAN→ENROLLMENT→CARRIER→TEST; AI Test Case Generation (Given/When/Then + happy/boundary/negative/edge); AI Backlog Prioritization; Agentic Orchestration (Requirements→Impact→Testing→Compliance agents) |
| Data Lifecycle & Retention | `dataLifecycleRequirements.json` | REQ-DL-001–012 | 12 | Soft delete on all user-managed entities; terminated employees retained (ARCHIVED); audit log immutable + non-deletable; plan versions retained (RETIRED ≠ deleted); hard deletes only on POST /api/demo/reset; archived data queryable via include_archived=true |
| Operational Resilience | `operationalResilienceRequirements.json` | REQ-OPS-001–012 | 12 | Idempotency keys on all mutating APIs (24h window; duplicate → HTTP 200 + Idempotent-Replayed: true); partial batch processing (one failure ≠ batch failure); dead-letter queue for FAILED_PERMANENT transactions; correlation ID end-to-end; graceful degradation (non-critical failures don't block enrollment); health check endpoints |
| Accessibility | `accessibilityRequirements.json` | REQ-A11Y-001–012 | 12 | WCAG 2.1 AA target; keyboard nav (all interactive elements reachable; no traps; Escape dismisses modals); visible focus indicators 3:1+; 4.5:1 color contrast; status badges never color-only (always include text label); aria-live regions for AI streaming; skip navigation link; descriptive page titles updated on SPA navigation |
| Performance | `performanceRequirements.json` | REQ-PERF-001–012 | 12 | Non-AI API p95 ≤ 500ms; page load ≤ 3s (50 Mbps); AI first token ≤ 3s; AI full response ≤ 30s; enrollment submission ≤ 5s; eligibility rule engine ≤ 200ms; dashboard ≤ 1s (from seed snapshot); 5,000-employee dataset at all targets; carrier simulation 100 records ≤ 10s; demo reset ≤ 3s |

**Total seeded requirements (seed/requirements/):** 609+ across 45 requirement sets.
