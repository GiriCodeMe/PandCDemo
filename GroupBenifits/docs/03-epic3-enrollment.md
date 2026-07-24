# EPIC 3 — Enrollment & Life Events

## Objective

Allow employees and HR administrators to enroll employees and manage changes caused by qualifying life events.

---

## Feature 3.1 — Employee Enrollment

Employees see a personalized welcome screen listing their eligible benefits.

**Example view:**

```
Welcome John!
You are eligible for 2026 Benefits.

  Medical
  Dental
  Vision
  Life
  Disability
```

Employee selects plan and coverage tier, e.g.:

- Medical PPO 500
- Coverage: Employee + Spouse

---

## Feature 3.2 — Benefits Comparison

The employee can compare plans side-by-side.

**Example comparison table:**

| Feature | PPO 500 | HDHP 3000 |
|---------|---------|-----------|
| Deductible | $500 | $3,000 |
| OOP Max | $3,000 | $6,000 |
| Monthly Cost | $600 | $400 |
| Employer Contribution | $450 | $350 |

**AI assistant comment:**

> "Based on your selections, PPO 500 has a higher monthly premium but a lower deductible."

---

## Feature 3.3 — Enrollment Workflow

8-step guided enrollment wizard:

```
Eligible Employee
  ↓ Review Benefits
  ↓ Select Plans
  ↓ Add Dependents
  ↓ Select Coverage Tier
  ↓ Review Cost
  ↓ Confirm Elections
  ↓ Submit Enrollment
  ↓ Generate Confirmation
```

---

## Feature 3.4 — Life Events

Supported qualifying life events:

- Marriage
- Divorce
- Birth
- Adoption
- Death of dependent
- Loss of other coverage
- Change in employment status
- Change in work location

---

## Feature 3.5 — Life Event Processing

When a life event is submitted, the system:

1. Requests event date and documentation
2. Validates the qualifying event
3. Opens the enrollment change window (typically 30 days)
4. Allows eligible changes (e.g., add spouse, change tier)
5. Recalculates premium
6. Updates coverage
7. Sends carrier transaction
8. Updates payroll deduction

**Example — Marriage event:**

> John submits a Marriage Life Event. System requests marriage date, opens enrollment window, allows spouse to be added, recalculates premium, updates coverage, sends carrier transaction, and updates payroll deduction.

**Demo seed data:** `LE-001` (Carol Lopez, marriage) in `seed/enrollment/lifeEvents.json`.

---

## Feature 3.6 — AI Life Event Assistant

AI guides the employee through the life event process conversationally.

**Example conversation:**

```
Employee: "I recently got married."

AI: "Congratulations! I can help update your benefits.
     Please provide your marriage date."

[Employee provides date]

AI: "You have 30 days from your marriage date to add your
     spouse to Medical, Dental, and Vision."
```

AI determines:

- Whether the event qualifies
- The enrollment deadline
- Which benefits are eligible for change
- What documentation is required
