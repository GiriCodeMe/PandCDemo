# EPIC 2 — Eligibility & Business Rules

## Objective

Allow the system to define and execute complex eligibility rules for employees and dependents.

---

## Feature 2.1 — Employee Eligibility Rules

The system shall support eligibility based on:

- Employment status
- Employment type
- Hours worked
- Job class
- Location
- Tenure
- Union membership
- Employee classification

**Example rule:**

> Full-time employees working at least 30 hours per week are eligible for Medical benefits after 30 days of employment.

---

## Feature 2.2 — Eligibility Rule Builder

Provide a visual rule builder with IF / AND / THEN logic.

**Example:**

```
IF   Employment Status = Active
AND  Employment Type = Full Time
AND  Hours Worked >= 30
AND  Employment Tenure >= 30 Days
THEN Eligible for Medical
```

---

## Feature 2.3 — Dependent Eligibility

Support the following dependent relationships:

- Spouse
- Domestic Partner
- Child
- Stepchild
- Disabled dependent

**Example rule:**

> Children are eligible until age 26.

---

## Feature 2.4 — Waiting Period Rules

Support all standard waiting period types:

- Immediate eligibility
- 30 days
- 60 days
- 90 days
- First of month following 30 days
- First of month following date of hire

---

## Feature 2.5 — Eligibility Simulation

> **Important demo moment.** Administrator enters employee details and the system calculates eligibility dates with explanations.

**Example input:**

| Field | Value |
|-------|-------|
| Employee | John Smith |
| Hire Date | January 15 |
| Hours | 40 |
| Status | Full Time |

**System response:**

| Benefit | Status | Effective Date |
|---------|--------|---------------|
| Medical | Eligible | February 15 |
| Dental | Eligible | February 15 |
| Vision | Eligible | February 15 |
| Life | Eligible | February 15 |

**AI explanation:**

> "John is eligible because he is a full-time employee working 40 hours per week and has completed the 30-day waiting period."

---

## Feature 2.6 — Business Rule Conflict Detection

AI detects when two configured rules produce conflicting outcomes.

**Example conflict:**

- **Rule A:** Full-time employees eligible after 30 days.
- **Rule B:** Full-time employees eligible on the first day of the month following hire.

**AI identifies:** The two rules produce different eligibility dates for the same employee.

**AI asks:** "Which rule should take precedence?"

> This is the primary demo conflict scenario. Seed data: `BR-001` vs `BR-002` in `seed/requirements/businessRules.json`, eligibility rules `ER-006-CONFLICT` and `ER-007-CONFLICT` in `seed/eligibility/eligibilityRules.json`.
