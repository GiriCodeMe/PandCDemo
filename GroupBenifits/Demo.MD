# Group Benefits AI Demo — Demo Guide

_Last updated: 2026-07-23_

> Living document. Update this file with demo notes, sample data values, scenario walkthroughs, and presenter talking points as the build progresses.

---

## Demo Narrative

> "AI generates and understands requirements, while humans remain in control."

The core story: Acme Corporation's benefits team uploads their existing documents into the AI Requirements Studio. The AI extracts requirements, identifies conflicts, and proposes eligibility rules and plan configurations — but every change is reviewed and approved by a human before it takes effect. The end-to-end journey from a PDF to a processed carrier transaction is fully traceable.

---

## Core Demo Journey

```
Benefits Guide PDF
       ↓
Document Preview & Extraction Review
       ↓
AI Requirements Extraction
       ↓
Requirements Studio (human review + approve)
       ↓
         ├── [Create Rule] → Rule Builder (pre-populated)
         └── [Apply to Plan] → Plan Config Draft (preview diff → publish)
                                  ↓
                          Enrollment Wizard
                                  ↓
                       Carrier / Payroll Integration
                                  ↓
                    Monitoring & Reconciliation
```

---

## Design System Reference

CSS theme and design system: **https://staging.d20ckg150yx53q.amplifyapp.com/**

Match the visual design of this reference for all UI components — color tokens, typography, spacing, button variants, card styles, table styles, badge styles, and form field design.

---

## Application Shell

```
┌──────────────────────────────────────────────────────────────────────┐
│ ACME GROUP BENEFITS                          🔔  🔍  👤 Giri Admin   │
│ Acme Corp ▾    Plan Year: 2027 ▾                         Demo ●      │
├───────────────┬──────────────────────────────────────────────────────┤
│ 🏠 Dashboard  │                                                      │
│               │                                                      │
│ 📦 Plans      │                 WORKSPACE                            │
│               │                                                      │
│ ⚙ Eligibility │                                                      │
│               │                                                      │
│ 👥 Enrollment  │                                                      │
│               │                                                      │
│ 🔄 Integrations│                                                      │
│               │                                                      │
│ 🤖 AI Require- │                                                      │
│    ments       │                                                      │
│               │                                                      │
│ 🔍 Audit       │                                                      │
│               │                                                      │
│ ⚙ Admin       │                                                      │
└───────────────┴──────────────────────────────────────────────────────┘
```

**Global Elements:** Employer/Group selector — Plan Year selector — Global search — Notifications — AI Assistant — User profile / role — Breadcrumbs — Environment indicator (Demo)

---

## Primary Navigation Structure

```
ACME GROUP BENEFITS
│
├── 🏠 DASHBOARD
│
├── 📦 PLAN & PRODUCT
│   ├── Employer Groups
│   ├── Plans (Catalog)
│   ├── Plan Comparison
│   ├── Plan Details (Overview / Eligibility / Coverage / Premiums / Contributions / Network / Versions)
│   └── Plan Lifecycle (Draft → Review → Published → Retired)
│
├── ⚙ ELIGIBILITY
│   ├── Eligibility Rules
│   ├── Rule Builder
│   ├── Eligibility Simulator
│   ├── Exceptions
│   ├── Dependent Rules
│   └── Rule Version History
│
├── 👥 ENROLLMENT
│   ├── Open Enrollment
│   ├── Employee Enrollment (8-step wizard)
│   ├── Life Events (Marriage / Birth / Adoption / Divorce / Loss of Coverage / Death of Dependent)
│   ├── Dependents
│   ├── Enrollment Exceptions
│   └── Notifications
│
├── 🔄 INTEGRATIONS
│   ├── Integration Dashboard
│   ├── Carrier Transactions
│   ├── Payroll Transactions
│   ├── Transmission Queue
│   ├── Integration Monitoring (10-sec polling)
│   ├── Errors & Exceptions
│   └── Reconciliation (Benefits vs Carrier vs Payroll)
│
├── 🤖 AI REQUIREMENTS
│   ├── Document Library
│   ├── Upload & Ingest
│   ├── Document Review (PDF Preview / Extracted Content / AI Findings)
│   ├── AI Extraction
│   ├── Requirements Studio
│   ├── AI Interview
│   ├── Conflict Detection
│   ├── Impact Analysis
│   ├── Traceability
│   └── Backlog Export
│
├── 🔍 AUDIT & TRACEABILITY
│   ├── Requirement History
│   ├── Plan Version History
│   ├── Rule Version History
│   ├── Integration Audit
│   └── End-to-End Traceability (PDF Page → REQ → RULE → PLAN → ENROLLMENT → CARRIER → PAYROLL)
│
└── ⚙ ADMIN
    ├── Demo Reset
    └── Demo Scenario Selector
```

---

## Key Workspace Layouts

### Dashboard

```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Employer   │ │ Plans      │ │ Enrollment │ │ Exceptions │
│ 1          │ │ 9          │ │ 4,892      │ │ 12         │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

┌──────────────────────┐ ┌──────────────────────┐
│ Carrier Integration  │ │ AI Requirements      │
│                      │ │                      │
│ Medical ✓            │ │ 48 Extracted         │
│ Vision ⚠             │ │ 39 Approved          │
│ Dental ✓             │ │ 6 Conflicts          │
│ Life ●               │ │ 3 Need Review        │
└──────────────────────┘ └──────────────────────┘
```

All dashboard cards are clickable drill-downs.

### Rule Builder

```
IF
    Employee Type = Full-Time
AND
    Hours Per Week >= 30
AND
    Hire Date + 30 Days
THEN
    Eligible = TRUE

[Validate]  [Simulate]  [Save Draft]  [Publish]
```

### Eligibility Simulator

```
Employee: Linda White
Hire Date: 05/15/2027
Employee Type: Full-Time
Hours: 40

Result:
✓ Eligible

Effective Date:
07/01/2027

[View Rule Evaluation]
```

### Document Review Workspace (3-panel)

```
┌───────────────┬───────────────────┬──────────────────────┐
│ PDF Preview   │ Extracted Content │ AI Findings          │
│               │                   │                      │
│ Page 4        │ Eligibility       │ REQ-001 ✓ 96%        │
│               │                   │ REQ-002 ⚠ 74%        │
│ [highlighted] │ Full-time...      │ REQ-003 ✗ 58%        │
│ source text   │                   │                      │
│               │                   │ [Approve Selected]   │
└───────────────┴───────────────────┴──────────────────────┘
```

### Requirements Studio

```
┌──────────────────────────────────────────────────────────────┐
│ 48 Requirements | 39 Approved | 6 Conflicts | 3 Review      │
├──────────────────────────────────────────────────────────────┤
│ Filter: [All] [Eligibility] [Plan] [Enrollment] [Integration]│
├──────────────────────────────────────────────────────────────┤
│ REQ-001 │ Full-Time Eligibility │ ✓ Approved │ Page 4       │
│ REQ-002 │ Waiting Period         │ ⚠ Review   │ Page 5       │
│ REQ-003 │ Dependent Age-Out      │ ✓ Approved │ Page 7       │
└──────────────────────────────────────────────────────────────┘
```

Selecting a requirement opens: Requirement → Source → Business Rule → Plan Configuration → Enrollment Impact → Integration Impact

### Conflict View

```
Conflict #003

Benefits Guide
"Coverage begins first of month following 30 days."

vs.

Eligibility Policy
"Coverage begins after 30 days."

Severity: HIGH

[View Source A]  [View Source B]

AI Recommendation: Clarify effective-date rule.

[Resolve Conflict]
```

### Audit Trail (End-to-End Traceability)

```
PDF Page 4
    ↓
REQ-001 (Full-Time Eligibility)
    ↓
RULE-ELIG-001 v1.0
    ↓
PLAN-PPO-500 (Eligibility Config)
    ↓
ENROLLMENT-10045 (Linda White)
    ↓
CARRIER-TX-10045 (Aetna — REJECTED: DEP-INVALID-ID)
    ↓
PAYROLL-TX-10045 (blocked)
```

---

## Role-Based Navigation

| Persona | Primary Workspaces |
|---------|-------------------|
| Benefits Administrator | Plans, Eligibility, Enrollment, Integrations, AI Requirements |
| Benefits Analyst | Requirements, Rules, Plans, Audit |
| HR Administrator | Employees, Enrollment, Life Events |
| Integration Administrator | Integrations, Monitoring, Errors, Reconciliation, Audit |
| Compliance / Auditor | Audit & Traceability, Plan Versions, Requirement History |
| Product Owner | AI Requirements, Backlog |
| Executive | Dashboard |

---

## Key Demo Scenarios

| Scenario | Key Data | Location |
|----------|----------|----------|
| Carrier rejection — missing dependent ID | `CT-10045`, Linda White (ACM-E012), ENR-10012 | `seed/integrations/carrierTransactions.json` |
| Eligibility rule conflict | `BR-001` / `BR-002`, `ER-006-CONFLICT` / `ER-007-CONFLICT` | `seed/eligibility/eligibilityRules.json` |
| Payroll mismatch — old EE+Spouse rate after divorce | `DED-10001`, `ENR-10001` | `seed/integrations/payrollTransactions.json` |
| Life event — marriage with pending docs | `LE-001`, ACM-E030 | `seed/enrollment/lifeEvents.json` |
| Dependent age-out — Sarah Smith | DEP-022, DOB 2001-03-15, coverage terminates 2027-04-01 | `seed/employees/dependents.json` |
| Vision carrier — FAILED batch | MON-2027-1215-003, 1,125 records / 42 errors | `seed/integrations/integrationMonitoringAggregates.json` |
| ACA exception — full-time with no offer | ACM-E025, March 2027 | `seed/requirements/acaComplianceRequirements.json` |
| Ambiguous language — "promptly" undefined | `BR-007-AMBIGUOUS` | `seed/requirements/businessRules.json` |

---

## UI/UX Gap Backlog

38-item gap catalog organized by priority tier.

### P0 — Must Resolve Before Demo Build

| # | Area | Gap | Decision |
|---|------|-----|---------|
| 1 | Plan Configuration | Plan creation/edit experience not fully defined | Use structured plan configuration screens with Draft → Review → Publish |
| 2 | Eligibility Rules | Rule builder interaction | ✅ RESOLVED — REQ-RULE-UI-001–014 |
| 3 | Enrollment Wizard | Back navigation and partial enrollment | ✅ RESOLVED — REQ-ENROLL-UX-001–015 |
| 4 | Requirements → Plan Config | Transition undefined | ✅ RESOLVED — REQ-REQPLAN-001–012 |
| 5 | AI Loading | 30–60 sec operations lack loading UX | ✅ RESOLVED — REQ-AI-UX-001–015 |
| 6 | Plan Comparison | >2 plans undefined | ✅ RESOLVED — REQ-PLAN-COMP-001–014 |
| 7 | Document Review | No extraction review step | ✅ RESOLVED — REQ-DOC-REV-001–014 |
| 8 | Integration Monitoring | Refresh behavior undefined | ✅ RESOLVED — REQ-INT-MON-001–014 |
| 9 | Open Enrollment | Enrollment period open/closed UX | ✅ RESOLVED — REQ-OE-001–018 |
| 10 | Premium Calculation | Calculation transparency not defined | Show monthly → pay-period calculation and rounding details |
| 11 | Role-based Permissions | Role-based UI visibility | Hide/disable unauthorized actions based on persona |
| 12 | Error & Empty States | Standard application error UX | Standard error banner, retry, support/request ID; contextual empty state + next action |
| 13 | Audit Trail | Audit UI not defined | Who / What / When / Before / After |

### P1 — Needed for Complete Demo

| # | Area | Gap | Decision |
|---|------|-----|---------|
| 14 | Life Events | Life-event workflow UX | Event selection → validation → effective date → enrollment changes |
| 15 | Dependent Management | Add/edit/remove dependent UX | Dependent cards + validation + coverage selection |
| 16 | Eligibility Exceptions | Exception review workflow | Exception queue → reason → evidence → Approve/Reject/Override |
| 17 | Carrier Integration | Transmission initiation UX | Review → Validate → Transmit → Monitor |
| 18 | Carrier Errors | Error resolution UX | Error details → Correct → Retry failed transactions |
| 19 | Payroll Integration | Payroll output review | Preview deductions → Validate → Export/Transmit |
| 20 | Reconciliation | Three-way reconciliation UI | Benefits vs Carrier vs Payroll comparison with mismatch drill-down |
| 21 | AI Conflict Detection | Conflict vs overlap UX | Conflict cards with source A, source B, severity, resolution |
| 22 | AI Interview | Multi-turn conversation UX | ✅ RESOLVED — REQ-CONV-001–015 |
| 23 | Impact Analysis | Impact visualization | Requirement → Rules → Plans → Integrations dependency graph |
| 24 | Requirements Traceability | Navigation between source and downstream | ✅ RESOLVED — REQ-REQPLAN-009–010 |
| 25 | Requirement Approval | Human approval workflow | Approve / Edit / Reject / Request Review |
| 26 | Requirement Versioning | Changes to requirements and downstream | Version history + diff + impacted artifacts |
| 27 | Backlog Export | Export destination | ✅ RESOLVED — REQ-EXPORT-001–016 |

### P2 — Demo Polish / Future

| # | Area | Gap | Decision |
|---|------|-----|---------|
| 28 | Dashboard | Executive dashboard interactions | KPI cards → drill-down → operational workspace |
| 29 | Notifications | Employee/admin notification UX | ✅ RESOLVED — REQ-NOTIFY-001–017 |
| 30 | Search | Cross-application search | Search Employees, Plans, Requirements, Rules, Integrations |
| 31 | Global Navigation | Navigation structure finalization | Persistent left nav + contextual breadcrumbs |
| 32 | Loading States | Standard non-AI loading | Skeleton for data, spinner for short actions |
| 33 | Unsaved Changes | Navigation with unsaved edits | Auto-save or "Save / Discard / Cancel" confirmation |
| 34 | Responsive UX | Desktop/tablet behavior | Optimize for desktop; responsive fallback for tablet |
| 35 | Demo Reset | No mechanism to reset demo data | ✅ RESOLVED — REQ-DEPLOY-010 (POST /api/demo/reset) |
| 36 | Demo Mode | No controlled scenario switching | Scenario selector for happy path / exceptions / failures |
| 37 | Jira/Azure DevOps export | Export adapter | ✅ RESOLVED — REQ-EXPORT-009–010 (P1/P2 adapters) |
| 38 | Accessibility | Accessibility requirements | ✅ RESOLVED — REQ-AI-UX-015, REQ-PLAN-COMP-007 |

---

## Recommended Next Step

Before development begins, create a **UI/UX Requirements Matrix** with these columns:

```
Epic → Feature → Screen → Persona → User Action → UI Component →
State → Validation → Error State → API/Data Dependency →
Navigation → Acceptance Criteria
```

This consolidates all 38 gaps into a build-ready specification and prevents issues from resurfacing during construction.

---

## Demo Notes

> Add presenter talking points, sample data values, and scenario-specific notes here as the build progresses.

### Presenter Flow (Draft)

1. Open Dashboard as **Benefits Administrator**
2. Show KPI cards — enrollment rate 88.7%, AI Requirements 78% progress
3. Switch to **AI Requirements Studio** — upload Acme_2027_Benefits_Guide.pdf
4. Walk through Document Review workspace (3 panels)
5. Show extraction summary: 48 requirements / 6 conflicts
6. Open Conflict #003 (waiting period conflict between two documents)
7. Resolve conflict → approve requirement
8. [Create Rule] → open Rule Builder pre-populated
9. Publish rule → navigate to Eligibility Simulator → verify Linda White (ACM-E012)
10. [Apply to Plan] → PPO 500 Draft → Preview diff → Publish
11. Switch to **Enrollment** → find Linda White → Start Enrollment Wizard
12. Complete 8 steps → submit enrollment
13. Navigate to **Integrations** → Transmission Queue → Run Now
14. Show carrier rejection CT-10045 (Dependent SSN validation failed)
15. Navigate to **Audit & Traceability** → show full chain: PDF → REQ → RULE → PLAN → ENROLLMENT → CARRIER-TX

### Seed Data Quick Reference

| Entity | ID | Notes |
|--------|-----|-------|
| Primary employee | ACM-E012 Linda White | Carrier rejection scenario |
| Draft enrollment | ENR-10012 | Linked to LE-003 |
| Carrier transaction | CT-10045 | REJECTED — DEP-INVALID-ID |
| Age-out dependent | DEP-022 Sarah Smith | DOB 2001-03-15, terminates 2027-04-01 |
| Dashboard snapshot date | 2026-12-15 | Plan year 2027 |
| Open enrollment period | OE-ACME-2027 | Oct 1–15 2026, 84% submitted |

---

## Demo Data Pack

The complete demo data pack provides rich, consistent seed data across the full demo journey. Priority tiers below indicate what is needed for a functional demo (Must Have) vs. what elevates the story (High Value / Demo Differentiator).

### Recommended Folder Structure

```
acme-demo-data/
  documents/          5 AI source PDFs
  plans/              Acme_Plan_Catalog.json
  employees/          Acme_Employees.csv, Acme_Dependents.csv
  enrollment/         Acme_Enrollment_Records.csv, Acme_Life_Events.csv
  integrations/       Carrier transaction files, payroll deductions, reconciliation
  ai/                 Requirements JSON, conflicts JSON, change scenarios JSON, test cases JSON, backlog JSON, 834 sample
  audit/              Acme_Audit_Log.json
```

### File Inventory

#### Tier 1 — Must Have

| # | File | Format | Contents | Notes |
|---|------|--------|----------|-------|
| 1 | `Acme_2027_Benefits_Guide.pdf` | PDF | Plan summary, eligibility overview, enrollment process | Already in `samples/` |
| 2 | `Acme_Eligibility_Policy.pdf` | PDF | Full eligibility rules, waiting periods, special populations | Already in `samples/` — intentionally contradicts Benefits Guide on waiting period wording |
| 3 | `Acme_Enrollment_Process.pdf` | PDF | Step-by-step enrollment, life event windows, COBRA overview | Already in `samples/` |
| 4 | `Acme_Carrier_Requirements.pdf` | PDF | Carrier data submission specs, required fields, EDI 834 notes | Already in `samples/` |
| 5 | `Acme_Payroll_Interface_Spec.pdf` | PDF | Payroll deduction codes, frequency rules, deduction priorities | Already in `samples/` |
| 6 | `Acme_Plan_Catalog.json` | JSON | 7 benefit types, all coverage tiers, employer/employee contributions | Seed in `seed/products/` |
| 7 | `Acme_Employees.csv` | CSV | 30 detailed employees (EMP-10001–EMP-10030) + 5,000 aggregate | 30 detailed records for the interactive demo; 5,000 aggregate IDs for dashboard KPI realism |
| 8 | `Acme_Dependents.csv` | CSV | Spouses, children, age-out scenarios, invalid SSN scenario (DEP-022) | All 6 dependent relationship types represented |
| 9 | `Acme_Enrollment_Records.csv` | CSV | Active, pending, draft, expired, and rejected enrollment states | Covers all enrollment lifecycle states |
| 10 | `Acme_Carrier_Transactions.csv` | CSV | 9–15 transactions TX-10001 to TX-10015 | Must include TX-10045 REJECTED (DEP-INVALID-ID) as the demo climax |

#### Tier 2 — High Value

| # | File | Format | Contents |
|---|------|--------|----------|
| 11 | `Acme_Life_Events.csv` | CSV | All 6 life event types: marriage, birth, adoption, divorce, loss of coverage, dependent death |
| 12 | `Acme_Carrier_Accepted.json` | JSON | Mock accepted carrier API response |
| 13 | `Acme_Carrier_Rejected.json` | JSON | Mock rejected response with DEP-INVALID-ID reason code |
| 14 | `Acme_Carrier_Timeout.json` | JSON | Mock carrier timeout / SYSTEM_ERROR response |
| 15 | `Acme_Payroll_Deductions.csv` | CSV | All 4 pay frequencies: weekly, biweekly, semi-monthly, monthly |
| 16 | `Acme_Reconciliation_Results.csv` | CSV | Mismatch records matching dashboard KPIs (42 exceptions, $18,400 variance) |
| 17 | `Acme_AI_Requirements.json` | JSON | Pre-seeded AI-extracted requirements with confidence scores, source citations, and reviewer assignments |
| 18 | `Acme_Audit_Log.json` | JSON | Who/what/when/before/after audit entries with AI source tracking |

#### Tier 3 — Demo Differentiators

| # | File | Format | Contents |
|---|------|--------|----------|
| 19 | `Acme_AI_Conflicts.json` | JSON | 5-type conflict set: CONFLICT-001 (CONTRADICTION), AMBIGUITY-001, MISSING-001, DUPLICATE-001, OVERLAP-001 |
| 20 | `Acme_Change_Scenarios.json` | JSON | 3 What-If scenarios: waiting period 30→60 days, employer contribution 80→90%, eligibility threshold 30→20 hours |
| 21 | `Acme_AI_Test_Cases.json` | JSON | AI-generated test cases from requirements (Given/When/Then format with HAPPY_PATH/BOUNDARY/NEGATIVE/EDGE_CASE types) |
| 22 | `Acme_Requirements_Backlog.json` | JSON | Epic → Feature → Story → Acceptance Criteria hierarchy for backlog export demo |
| 23 | `Acme_Enrollment_834_Sample.txt` | EDI | Simulated ANSI X12 834 transaction for the Add/Change/Terminate demo |

### Key Employee Profiles for Demo

| Employee ID | Name | Profile | Demo Scenario |
|-------------|------|---------|---------------|
| EMP-10001 | (Full-Time, enrolled) | Standard enrolled employee | Happy path baseline |
| EMP-10002 | (Part-Time, ~20 hrs) | Just under eligibility threshold | Eligibility Copilot: "not eligible — 20 hrs < 30 hrs required" |
| EMP-10003 | (30-hr boundary case) | Exactly at threshold | Boundary test; tests eligibility edge case |
| EMP-10012 | Linda White | Marriage life event pending | Links to LE-003, ENR-10012, CT-10045 (carrier rejection) |
| EMP-10025 | (Full-time, no ACA offer) | ACA compliance exception | ACM-E025 equivalent; AI flags FULL_TIME_NO_OFFER |
| EMP-10030 | (Divorce life event) | Life event with dependent removal | Payroll mismatch after EE+Spouse rate continues post-divorce |
| EMP-10045 | (New hire within waiting period) | 15 days into 30-day wait | Eligibility Copilot: "eligible on [date]" |

### Document Design Principles

The five source PDFs are the most critical demo artifacts — they are the foundation for the entire AI Requirements Engineering story. Design them with:

1. **Intentional cross-document inconsistencies** — 2–3 deliberate contradictions (e.g., Benefits Guide says "30 days", Eligibility Policy says "first of month after 30 days") to demonstrate AI conflict detection
2. **Ambiguous language** — "promptly", "as soon as practicable", "reasonable" — to trigger AI AMBIGUITY classification
3. **Missing definitions** — a process referenced in one doc but not defined anywhere — to trigger MISSING_INFORMATION detection
4. **Cross-references** — documents that reference each other (e.g., "see Eligibility Policy Section 3") so AI can demonstrate cross-document linking
5. **All 5 plan types** — Medical, Dental, Vision, Life, STD/LTD — each plan type must appear in at least two documents so the AI can perform cross-document aggregation

---

_Update this file as the demo build progresses._
