# Data Model & Persistence Strategy

## Persistence Decision

Use a **lightweight JSON file store** for the demo, with a domain model designed as if backed by a relational database.

- Each entity is a JSON file containing an array of records (equivalent to a database table)
- All foreign key relationships preserved using ID references
- A shared `db.js` service layer provides `findById`, `findWhere`, `insert`, `update`, `delete`
- The server reads and writes entire files on each operation (acceptable at demo scale)
- Referential integrity enforced in the service layer, not the file store

---

## File Store Layout

```
server/
  db/
    employers.json
    divisions.json
    employees.json
    dependents.json
    carriers.json
    benefit_products.json
    benefit_plans.json
    plan_versions.json
    coverage_tiers.json
    eligibility_rules.json
    enrollments.json
    dependent_enrollments.json
    life_events.json
    carrier_transactions.json
    payroll_deductions.json
    requirements.json
    source_documents.json
    requirement_links.json
    conversation_sessions.json
    conversation_messages.json
```

---

## Entity Relationship Overview

```
Employer
  ├── Division (1:N)
  ├── Employee (1:N)
  │     ├── Dependent (1:N)
  │     ├── Enrollment (1:N)
  │     │     └── DependentEnrollment (1:N)
  │     ├── LifeEvent (1:N)
  │     ├── CarrierTransaction (1:N)
  │     └── PayrollDeduction (1:N)
  └── BenefitProduct (1:N)
        └── BenefitPlan (1:N)
              ├── PlanVersion (1:N)
              ├── CoverageTier (1:N)
              └── EligibilityRule (N:N via product)

Carrier
  ├── BenefitProduct (N:N via carrierId)
  └── CarrierTransaction (1:N)

Epic 5 — Requirements Domain
  SourceDocument (1:N) ──> Requirement (N:N via RequirementLink)
  ConversationSession (1:N) ──> ConversationMessage
  ConversationMessage ──> Requirement (generated)
```

---

## Entity Definitions

### EMPLOYER — `employers.json`

| Field | Type | Notes |
|-------|------|-------|
| employerId | string PK | e.g. `EMP-001` |
| name | string | e.g. `Acme Corporation` |
| industry | string | e.g. `Technology` |
| address | object | street, city, state, zip |
| numberOfEmployees | integer | |
| effectiveDate | date | Benefits program start |
| renewalDate | date | Annual renewal date |
| states | string[] | Operating states |
| status | enum | `Active` \| `Pending` \| `Terminated` |
| createdAt | datetime | |

---

### DIVISION — `divisions.json`

| Field | Type | Notes |
|-------|------|-------|
| divisionId | string PK | e.g. `DIV-001` |
| employerId | string FK → employers | |
| name | string | e.g. `Engineering`, `Sales` |
| location | string | City, State |

---

### EMPLOYEE — `employees.json`

| Field | Type | Notes |
|-------|------|-------|
| employeeId | string PK | e.g. `EE-001` |
| employerId | string FK → employers | |
| divisionId | string FK → divisions | |
| firstName | string | |
| lastName | string | |
| dob | date | |
| ssn | string | Masked: `XXX-XX-1234` |
| hireDate | date | |
| employmentStatus | enum | `Active` \| `Terminated` \| `Leave` \| `COBRA` |
| employmentType | enum | `Full-time` \| `Part-time` \| `Executive` \| `Union` \| `Hourly` \| `Salaried` |
| hoursPerWeek | number | |
| jobClass | string | e.g. `Exempt`, `Non-Exempt` |
| annualSalary | number | |
| email | string | |
| phone | string | |
| address | object | street, city, state, zip |

---

### DEPENDENT — `dependents.json`

| Field | Type | Notes |
|-------|------|-------|
| dependentId | string PK | e.g. `DEP-001` |
| employeeId | string FK → employees | |
| firstName | string | |
| lastName | string | |
| dob | date | |
| ssn | string | Masked |
| relationship | enum | `Spouse` \| `Domestic Partner` \| `Child` \| `Stepchild` \| `Disabled Dependent` |
| status | enum | `Active` \| `Removed` \| `AgedOut` |

---

### CARRIER — `carriers.json`

| Field | Type | Notes |
|-------|------|-------|
| carrierId | string PK | e.g. `CAR-001` |
| name | string | e.g. `Aetna`, `Delta Dental` |
| supportedProductTypes | string[] | e.g. `["Medical"]` |
| connectionType | enum | `REST` \| `SFTP` \| `Batch` |
| fileFormat | enum | `JSON` \| `CSV` \| `EDI` |
| transmissionSchedule | enum | `Daily` \| `Weekly` \| `Monthly` |
| mockApiEndpoint | string | Internal mock route |
| status | enum | `Active` \| `Inactive` |

---

### BENEFIT PRODUCT — `benefit_products.json`

| Field | Type | Notes |
|-------|------|-------|
| productId | string PK | e.g. `PROD-001` |
| employerId | string FK → employers | |
| carrierId | string FK → carriers | |
| name | string | e.g. `Acme Medical 2026` |
| type | enum | `Medical` \| `Dental` \| `Vision` \| `Life` \| `AD&D` \| `STD` \| `LTD` \| `FSA` \| `HSA` \| `Accident` \| `Critical Illness` |
| description | string | |
| effectiveDate | date | |
| terminationDate | date \| null | |
| status | enum | `Active` \| `Draft` \| `Terminated` |

---

### BENEFIT PLAN — `benefit_plans.json`

| Field | Type | Notes |
|-------|------|-------|
| planId | string PK | e.g. `PLAN-001` |
| productId | string FK → benefit_products | |
| carrierId | string FK → carriers | |
| name | string | e.g. `PPO 500` |
| planCode | string | e.g. `MED-PPO-500` |
| network | string | e.g. `Aetna Choice POS II` |
| deductible | number | Individual deductible |
| outOfPocketMax | number | |
| copay | number | |
| coinsurance | number | Percentage employee pays |
| effectiveDate | date | |
| coveragePeriodStart | date | |
| coveragePeriodEnd | date | |
| status | enum | `Active` \| `Draft` \| `Terminated` |

---

### PLAN VERSION — `plan_versions.json`

| Field | Type | Notes |
|-------|------|-------|
| versionId | string PK | e.g. `VER-001` |
| planId | string FK → benefit_plans | |
| versionNumber | string | e.g. `2026-v1`, `2027-v1` |
| effectiveDate | date | When this version goes live |
| planSnapshot | object | Full copy of plan fields at time of version |
| createdBy | string | Persona / user |
| createdAt | datetime | |
| status | enum | `Draft` \| `Active` \| `Superseded` |

---

### COVERAGE TIER — `coverage_tiers.json`

| Field | Type | Notes |
|-------|------|-------|
| tierId | string PK | e.g. `TIER-001` |
| planId | string FK → benefit_plans | |
| versionId | string FK → plan_versions | |
| tierType | enum | `EE Only` \| `EE + Spouse` \| `EE + Child` \| `EE + Children` \| `Family` |
| monthlyPremium | number | Total monthly cost |
| employerContribution | number | Employer monthly dollar amount |
| employeeContribution | number | Employee monthly dollar amount |

---

### ELIGIBILITY RULE — `eligibility_rules.json`

| Field | Type | Notes |
|-------|------|-------|
| ruleId | string PK | e.g. `ER-001` |
| employerId | string FK → employers | |
| productId | string FK \| null | null = applies to all products |
| name | string | e.g. `Full-Time Medical Eligibility` |
| description | string | Plain-language explanation |
| conditions | object[] | Array of condition objects |
| waitingPeriodType | enum | `Immediate` \| `Days30` \| `Days60` \| `Days90` \| `FirstOfMonthFollowing30` \| `FirstOfMonthFollowingHire` |
| waitingPeriodDays | integer \| null | Used when type is Days30/60/90 |
| status | enum | `Active` \| `Draft` \| `Inactive` |
| createdAt | datetime | |

**Condition object schema:**

```json
{
  "field": "employmentType",
  "operator": "equals",
  "value": "Full-time"
}
```

Supported operators: `equals`, `not_equals`, `greater_than`, `less_than`, `greater_than_or_equal`, `in`, `not_in`

---

### ENROLLMENT — `enrollments.json`

| Field | Type | Notes |
|-------|------|-------|
| enrollmentId | string PK | e.g. `ENR-001` |
| employeeId | string FK → employees | |
| planId | string FK → benefit_plans | |
| tierId | string FK → coverage_tiers | |
| status | enum | `Active` \| `Terminated` \| `Pending` \| `Waived` |
| effectiveDate | date | |
| terminationDate | date \| null | |
| enrollmentSource | enum | `Open Enrollment` \| `New Hire` \| `Life Event` \| `Admin` |
| lifeEventId | string FK \| null | → life_events |
| createdAt | datetime | |

---

### DEPENDENT ENROLLMENT — `dependent_enrollments.json`

| Field | Type | Notes |
|-------|------|-------|
| depEnrollmentId | string PK | e.g. `DENR-001` |
| enrollmentId | string FK → enrollments | |
| dependentId | string FK → dependents | |
| status | enum | `Active` \| `Terminated` |
| effectiveDate | date | |
| terminationDate | date \| null | |

---

### LIFE EVENT — `life_events.json`

| Field | Type | Notes |
|-------|------|-------|
| lifeEventId | string PK | e.g. `LE-001` |
| employeeId | string FK → employees | |
| eventType | enum | `Marriage` \| `Divorce` \| `Birth` \| `Adoption` \| `Death of Dependent` \| `Loss of Coverage` \| `Employment Status Change` \| `Location Change` |
| eventDate | date | Date the qualifying event occurred |
| enrollmentWindowStart | date | Day enrollment window opens |
| enrollmentWindowEnd | date | Day enrollment window closes (30 days from event) |
| status | enum | `Pending` \| `Approved` \| `Processed` \| `Expired` \| `Rejected` |
| documentsRequired | string[] | e.g. `["Marriage Certificate"]` |
| documentsSubmitted | string[] | |
| submittedAt | datetime | |
| processedAt | datetime \| null | |

---

### CARRIER TRANSACTION — `carrier_transactions.json`

| Field | Type | Notes |
|-------|------|-------|
| transactionId | string PK | e.g. `TXN-001` |
| carrierId | string FK → carriers | |
| employeeId | string FK → employees | |
| enrollmentId | string FK → enrollments | |
| transactionType | enum | `Add` \| `Change` \| `Terminate` |
| status | enum | `Pending` \| `Accepted` \| `Rejected` |
| requestPayload | object | Data sent to carrier |
| responsePayload | object \| null | Carrier response |
| errorCode | string \| null | |
| errorMessage | string \| null | |
| sentAt | datetime | |
| respondedAt | datetime \| null | |

---

### PAYROLL DEDUCTION — `payroll_deductions.json`

| Field | Type | Notes |
|-------|------|-------|
| deductionId | string PK | e.g. `DED-001` |
| employeeId | string FK → employees | |
| enrollmentId | string FK → enrollments | |
| planId | string FK → benefit_plans | |
| monthlyAmount | number | Employee contribution per month |
| payFrequency | enum | `Weekly` \| `Biweekly` \| `Semi-Monthly` \| `Monthly` |
| perPaycheckAmount | number | Calculated: monthly ÷ pay periods |
| effectiveDate | date | |
| terminationDate | date \| null | |
| status | enum | `Active` \| `Suspended` \| `Terminated` |

**Pay period divisors:**

| Frequency | Divisor | Example ($150/month) |
|-----------|---------|----------------------|
| Weekly | 4.333 | $34.62 |
| Biweekly | 2.167 | $69.23 |
| Semi-Monthly | 2 | $75.00 |
| Monthly | 1 | $150.00 |

---

## Epic 5 — Requirements Domain

### SOURCE DOCUMENT — `source_documents.json`

| Field | Type | Notes |
|-------|------|-------|
| documentId | string PK | e.g. `DOC-001` |
| name | string | Original filename |
| uploadedAt | datetime | |
| uploadedBy | string | Persona |
| mimeType | string | `application/pdf`, `text/csv`, etc. |
| sizeBytes | integer | |
| extractionStatus | enum | `Pending` \| `Processing` \| `Completed` \| `Failed` |
| extractedText | string | Full text extracted from document |
| extractionSummary | object | `{ plans: N, rules: N, rates: N, exceptions: N }` |

---

### REQUIREMENT — `requirements.json`

| Field | Type | Notes |
|-------|------|-------|
| requirementId | string PK | e.g. `BR-001`, `FR-001`, `US-001` |
| type | enum | `Business Requirement` \| `Functional Requirement` \| `Business Rule` \| `Data Requirement` \| `User Story` \| `Acceptance Criteria` \| `Test Case` |
| title | string | |
| description | string | Full requirement text |
| status | enum | `Draft` \| `Review` \| `Approved` \| `Implemented` \| `Deprecated` |
| sourceDocumentId | string FK \| null | → source_documents |
| conversationMessageId | string FK \| null | → conversation_messages |
| version | integer | Increments on edit |
| createdBy | string | Persona |
| createdAt | datetime | |
| updatedAt | datetime | |
| tags | string[] | e.g. `["eligibility", "medical", "waiting-period"]` |

**requirementId prefix convention:**

| Prefix | Type |
|--------|------|
| BR- | Business Requirement |
| FR- | Functional Requirement |
| BRL- | Business Rule |
| DR- | Data Requirement |
| US- | User Story |
| AC- | Acceptance Criteria |
| TC- | Test Case |

---

### REQUIREMENT LINK — `requirement_links.json`

Represents traceability edges between requirements.

| Field | Type | Notes |
|-------|------|-------|
| linkId | string PK | e.g. `LNK-001` |
| sourceId | string FK → requirements | Parent requirement |
| targetId | string FK → requirements | Child / derived requirement |
| linkType | enum | `Derives From` \| `Implements` \| `Tests` \| `Validates` \| `Conflicts With` \| `Duplicates` |

**Example traceability chain:**

```
DOC-001 (Benefits Guide)
  → BR-023  (via sourceDocumentId)
    → BRL-023  (linkType: Derives From)
      → FR-045   (linkType: Derives From)
        → US-105   (linkType: Implements)
          → AC-105.1  (linkType: Implements)
            → TC-105.1  (linkType: Tests)
```

---

### CONVERSATION SESSION — `conversation_sessions.json`

| Field | Type | Notes |
|-------|------|-------|
| sessionId | string PK | e.g. `SESS-001` |
| topic | string | e.g. `Waiting Period Clarification` |
| createdBy | string | Persona |
| createdAt | datetime | |
| status | enum | `Active` \| `Completed` |
| linkedDocumentId | string FK \| null | → source_documents |

---

### CONVERSATION MESSAGE — `conversation_messages.json`

| Field | Type | Notes |
|-------|------|-------|
| messageId | string PK | e.g. `MSG-001` |
| sessionId | string FK → conversation_sessions | |
| role | enum | `user` \| `assistant` |
| content | string | Message text |
| timestamp | datetime | |
| generatedRequirementIds | string[] | IDs of requirements created from this message |

---

## ID Generation Convention

All IDs use a `PREFIX-NNN` format, auto-incremented by the `db.js` service layer by scanning the current max value in each file.

| Entity | Prefix | Example |
|--------|--------|---------|
| Employer | EMP- | EMP-001 |
| Division | DIV- | DIV-001 |
| Employee | EE- | EE-001 |
| Dependent | DEP- | DEP-001 |
| Carrier | CAR- | CAR-001 |
| Benefit Product | PROD- | PROD-001 |
| Benefit Plan | PLAN- | PLAN-001 |
| Plan Version | VER- | VER-001 |
| Coverage Tier | TIER- | TIER-001 |
| Eligibility Rule | ER- | ER-001 |
| Enrollment | ENR- | ENR-001 |
| Dependent Enrollment | DENR- | DENR-001 |
| Life Event | LE- | LE-001 |
| Carrier Transaction | TXN- | TXN-001 |
| Payroll Deduction | DED- | DED-001 |
| Source Document | DOC- | DOC-001 |
| Requirement | BR- / FR- / BRL- / DR- / US- / AC- / TC- | BR-001 |
| Requirement Link | LNK- | LNK-001 |
| Conversation Session | SESS- | SESS-001 |
| Conversation Message | MSG- | MSG-001 |
