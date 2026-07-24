# EPIC 5 — AI Requirements Engineering

> **This is the "wow" component of the demo.**

## Objective

Demonstrate how AI can transform unstructured business information into structured, validated, traceable requirements.

---

## Feature 5.1 — Document Ingestion

User uploads benefit documents. AI extracts structured content.

### Supported Document Types

- Benefits plan documents and summaries
- Policy documents and enrollment guides
- Carrier contracts
- Excel rate sheets
- Process documents
- Regulatory documents

### AI Extracts

- Products and plans
- Business rules and eligibility rules
- Rates and coverage rules
- Dependencies, exceptions, and edge cases

### Upload Constraints

| Constraint | Value |
|------------|-------|
| Allowed MIME types | `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| Max file size | 25 MB |
| Max documents per workspace | 10 |

---

## Feature 5.2 — AI Requirements Discovery

AI analyzes uploaded documents and generates structured requirements.

### Output Categories

**Business Requirement:**
> `BR-001: The system must support employer-sponsored medical plans.`

**Functional Requirement:**
> `FR-001: The system shall allow administrators to configure medical plan coverage tiers.`

**Business Rule:**
> `BRL-001: Full-time employees working 30 or more hours per week are eligible for medical benefits.`

**Data Requirement:**
> `DR-001: Employee eligibility records must include employee ID, employment status, hire date, and hours worked.`

---

## Feature 5.3 — AI Requirements Interview & Conversation State

AI acts as a Business Analyst Agent, conducting a structured clarification interview. The application owns conversation state — the LLM consumes a dynamically assembled context, not the full raw history.

**Example session:**

```
AI:   "What is the waiting period for new employees?"

User: "30 days."

AI:   "Does coverage begin exactly 30 days after hire or on
       the first day of the following month?"

User: "First day of the following month."

AI generates:
  REQ-ELIG-001: New employees become eligible after completing
  30 days of employment, with coverage effective on the first
  day of the following month.
  (sourceType: AI_INTERVIEW, conversationId: CONV-2027-000125,
   messageReferences: [MSG-00045, MSG-00046])
```

### Conversation State Architecture

| Concern | Approach |
|---------|----------|
| Conversation ID | Unique, persistent per interview session (e.g. `CONV-2027-000125`) |
| Message persistence | Every user + AI turn persisted with sequence number and timestamp |
| Structured memory | Facts, open questions, decisions, generated requirements — separate from raw messages |
| Context strategy | Recent 10–20 messages + rolling summary + structured facts + open questions + source excerpts |
| Token budget | Configurable per model (demo default ~16K: 2K instructions + 1K summary + 2K facts + 1K questions + 4K sources + 6K messages) |
| Auto-summarization | Triggers when message count exceeds threshold; preserves decisions and unresolved questions |
| Pause/resume | AI contextual recap on resume; conversation status: NEW → IN_PROGRESS → PAUSED → RESUMED → COMPLETED → ARCHIVED |
| Contradiction handling | No silent overwrite — contradiction surfaced to user for resolution |
| Traceability | Every generated requirement references conversation ID + originating message IDs |
| Demo persistence | lowdb / JSON file store; production path: PostgreSQL + Redis |

**Requirements:** REQ-CONV-001 to REQ-CONV-015 in `seed/requirements/aiInterviewConversationStateRequirements.json`

---

## Feature 5.4 — Requirements Generation

AI generates a complete requirements hierarchy:

- Epics
- Features
- User stories
- Acceptance criteria
- Business rules
- Data requirements
- Integration requirements
- Non-functional requirements

**Example output:**

```
User Story:
  As a Benefits Administrator, I want to configure employee
  eligibility rules so that the system can automatically
  determine which employees qualify for each benefit plan.

Acceptance Criteria:
  - Administrator can define eligibility criteria
  - Administrator can configure minimum hours
  - Administrator can configure waiting periods
  - Administrator can configure employee classes
  - System automatically evaluates eligibility
  - System provides explanation for eligibility decisions
```

---

## Feature 5.5 — AI Requirements Validation & Conflict Detection

AI scans requirements for quality issues and detects conflicts between source documents using a hybrid deterministic + LLM approach.

### Validation Checks

- Missing information
- Conflicts between requirements
- Duplicates
- Ambiguous language
- Incomplete acceptance criteria
- Missing edge cases

**Example — ambiguity flag:**

> **Requirement:** Employees can enroll within 30 days.
>
> **AI flags:** Does the 30-day window begin on the hire date, eligibility date, or benefits effective date?

**Demo ambiguity:** The word "promptly" in the notification policy is flagged as `BR-007-AMBIGUOUS` — AI recommends defining it as a specific number of calendar days.

### Conflict & Overlap Detection Architecture

Detection is **hybrid** — not purely prompt-driven:

| Layer | Role |
|-------|------|
| Deterministic rule comparison | Detection — structured attribute values compared directly (30 days ≠ 60 days) |
| LLM semantic analysis | Interpretation, classification, explanation, and resolution recommendation |

### Conflict Types

`CONFLICT` · `OVERLAP` · `DUPLICATE` · `AMBIGUITY` · `NO_CONFLICT`

### Conflict Taxonomy

`TIMING_CONFLICT` · `ELIGIBILITY_CONFLICT` · `COVERAGE_CONFLICT` · `PREMIUM_CONFLICT` · `DEPENDENT_CONFLICT` · `LIFE_EVENT_CONFLICT` · `ENROLLMENT_CONFLICT` · `PLAN_CONFIGURATION_CONFLICT` · `CARRIER_CONFLICT` · `PAYROLL_CONFLICT` · `COMPLIANCE_CONFLICT` · `DATA_CONFLICT` · `PROCESS_CONFLICT`

### Detection Algorithm

1. Extract requirements into normalized attribute/value structures (domain, subject, attribute, operator, value, unit)
2. Normalize equivalent business language → canonical attributes
3. Identify candidate pairs by matching domain + subject + attribute
4. Deterministic comparison for structured values → POTENTIAL_CONFLICT flag
5. LLM semantic analysis → classify, explain, recommend resolution

### Source Authority (configurable precedence)

Legal/Regulatory → Signed Plan Document → Employer Policy → Carrier Contract → Benefits Guide → Process Documentation → System Configuration → AI-Generated Requirement

### Resolution Workflow

`DETECTED → AI_CLASSIFIED → UNDER_REVIEW → RESOLVED / FALSE_POSITIVE`

On resolution: canonical requirement created; audit event written.

**Requirements:** REQ-CONFLICT-001 to REQ-CONFLICT-016 in `seed/requirements/aiConflictDetectionRequirements.json`

---

## Feature 5.6 — Requirements Traceability

AI builds a full traceability chain from source document to test case.

```
Source Document
  ↓ Business Requirement
    ↓ Business Rule
      ↓ User Story
        ↓ Acceptance Criteria
          ↓ Test Case
            ↓ Implementation
```

**Example chain:**

```
Benefits Guide (DOC-001)
  → BR-023
    → BRL-023  (Derives From)
      → FR-045  (Derives From)
        → US-105  (Implements)
          → AC-105.1  (Implements)
            → TC-105.1  (Tests)
```

---

## Feature 5.7 — AI Requirements Impact Analysis

AI assesses the downstream impact of a proposed change using a hybrid RAG + traceability graph + summary strategy. The complete requirements dataset is **never injected wholesale** into a single LLM prompt.

**Example:**

> **Change:** Medical eligibility waiting period changes from 30 days to 60 days.

**AI identifies impact on:**

- Eligibility rules
- Enrollment workflow
- Employee communications
- Carrier transactions
- Payroll deductions
- Test cases
- Existing employee records

### Context Strategy

```
New/Changed Requirement
        ↓
Entity + Domain + Attribute Extraction
        ↓
Impact Candidate Retrieval:
  Metadata Filtering  ← exact domain/entity matching
  Vector RAG          ← semantic similarity
  Graph Traversal     ← explicit traceability dependencies
  Deterministic Rules ← known business-rule relationships
        ↓
Bounded Context Package → Gemini
        ↓
Impact Assessment → Human Review
```

### Impact Classifications

`DIRECT` · `INDIRECT` · `DEPENDENCY` · `POTENTIAL` · `NO_IMPACT`

### Impact Severity

`CRITICAL` · `HIGH` · `MEDIUM` · `LOW` · `INFORMATIONAL`

Each impact carries a confidence score and evidence reference. Semantic similarity alone is **not** sufficient to classify an impact as DIRECT or INDIRECT.

**Key principle:** AI recommends impacts; human authorization is required before any requirement change takes effect.

**Requirements:** REQ-IMPACT-001 to REQ-IMPACT-015 in `seed/requirements/aiImpactAnalysisRequirements.json`

---

## Feature 5.8 — Requirements Backlog Export & Integration

AI generates a hierarchical product backlog and exports it to external work-management platforms. The AI Requirements platform owns the canonical requirement model — Jira and Azure DevOps are downstream execution systems.

```
Epic → Feature → User Story → Acceptance Criteria
```

**Example:**

```
Epic:    Eligibility & Business Rules
Feature: Employee Eligibility
Story:   Configure Waiting Period

Acceptance Criteria:
  - Admin can configure waiting period
  - System supports days and months
  - System calculates eligibility date
  - System calculates coverage effective date
  - System handles retroactive changes
  - System displays eligibility explanation
```

### Export Strategy

| Format | Priority | Purpose |
|--------|----------|---------|
| JSON | P0/MVP | System-to-system / API; preserves full traceability |
| CSV | P0/MVP | Business review / spreadsheet; flattened hierarchy |
| Jira adapter | P1 | Primary enterprise integration |
| Azure DevOps adapter | P2 | Secondary enterprise integration |

### Incremental Export

Full export, or incremental scope: **New** / **Changed** / **Approved** / **All**. External IDs stored per item to prevent duplicate Jira/ADO issue creation.

### Backlog Item Lifecycle

`DRAFT → AI_GENERATED → HUMAN_REVIEW → APPROVED → EXPORTED → IMPORTED` (e.g., `JIRA KEY: ACMEGB-123`)

### Traceability Preserved Through Export

Source PDF → Requirement → Epic → Feature → Story → Jira Issue — full forward trace maintained in canonical backlog.

**Requirements:** REQ-EXPORT-001 to REQ-EXPORT-016 in `seed/requirements/requirementsBacklogExportRequirements.json`

---

## Recommended Demo UI

Six primary screens:

| Screen | Description |
|--------|-------------|
| Executive Dashboard | Active groups, plans, enrollments, eligibility exceptions, carrier status, AI requirements progress |
| Plan Configuration | Interactive plan builder |
| Eligibility Rule Builder | Visual IF → AND → THEN rule editor |
| Employee Enrollment | Employee-facing benefits enrollment experience |
| Integration Command Center | Carrier and payroll transactions with reconciliation |
| AI Requirements Studio | Centerpiece — see below |

### AI Requirements Studio Layout

```
┌─────────────────────────────────────────────────────────┐
│  Left: Source Documents / Conversation                   │
│  Center: AI Analysis                                     │
│  Right: Generated Requirements                          │
│                                                          │
│  Tabs: Requirements | User Stories | Business Rules     │
│        Acceptance Criteria | Traceability               │
│        Conflicts | Impact Analysis                      │
└─────────────────────────────────────────────────────────┘
```

---

## End-to-End Demo Story

| Step | Action |
|------|--------|
| 1 — Upload | "Here is Acme's 2026 Benefits Guide." |
| 2 — AI Reads | AI extracts: 12 Plans, 8 Eligibility Rules, 5 Coverage Tiers, 14 Business Rules |
| 3 — AI Asks | "The document does not specify whether part-time employees working 25–29 hours are eligible for Dental. Should they be?" |
| 4 — User Answers | "Yes, but only after 60 days." |
| 5 — AI Generates | New Business Rule, Functional Requirement, User Story, Acceptance Criteria |
| 6 — Configure | Validated requirements automatically populate Plan Configuration and Eligibility Rule Builder |
| 7 — Enroll | Employee completes benefits enrollment |
| 8 — Life Event | Employee gets married and adds spouse |
| 9 — Integrate | System sends updated enrollment to Carrier → Payroll |
| 10 — AI Detects Issue | "Carrier rejected spouse enrollment due to missing dependent SSN." |
| 11 — AI Resolves | AI identifies the requirement and business rule governing dependent validation and recommends next action |

---

## The "Wow" Moment

The AI-generated requirements are not just documentation — they **directly drive the application**.

```
Natural Language Business Requirement
  ↓ AI-generated Business Rule
    ↓ Configured Eligibility Rule
      ↓ Employee Eligibility Decision
        ↓ Enrollment Workflow
          ↓ Carrier Transaction
            ↓ Payroll Deduction
              ↓ Traceability back to original requirement
```

This is the **Requirements-to-Run** narrative: AI converts business intent into executable Group Benefits capabilities while maintaining full traceability throughout the lifecycle.
