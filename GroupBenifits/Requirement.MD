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

**Total seeded requirements (seed/requirements/):** 208+ across 16 requirement sets.
