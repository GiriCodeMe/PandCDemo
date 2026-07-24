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
  eligibility/   eligibilityRules.json, dependentRules.json
  enrollment/    enrollments.json, lifeEvents.json
  integrations/  carrierTransactions.json, payrollTransactions.json
  products/      planVersions.json
  requirements/  businessRules.json, requirements.json,
                 userStories.json, acceptanceCriteria.json,
                 traceability.json
  documents/     documents.json
samples/
  Acme_2027_Benefits_Guide.pdf
  Acme_2027_Eligibility_Policy.pdf
  Acme_2027_Carrier_Requirements.pdf
  Acme_2027_Payroll_Spec.pdf
  Acme_2027_Enrollment_Process.pdf
```
