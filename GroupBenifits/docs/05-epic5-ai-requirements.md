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

## Feature 5.3 — AI Requirements Interview

AI acts as a Business Analyst Agent, conducting a structured clarification interview.

**Example session:**

```
AI:   "What is the waiting period for new employees?"

User: "30 days."

AI:   "Does coverage begin exactly 30 days after hire or on
       the first day of the following month?"

User: "First day of the following month."

AI generates:
  Business Rule: New employees become eligible after completing
  30 days of employment, with coverage effective on the first
  day of the following month.
```

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

## Feature 5.5 — AI Requirements Validation

AI scans requirements for quality issues:

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

AI assesses the downstream impact of a proposed change.

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

**AI summary:**

> "This change impacts 7 requirements, 3 business rules, 5 test cases, and 2 integration workflows."

---

## Feature 5.8 — AI Requirements-to-Backlog

AI generates a hierarchical product backlog.

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
