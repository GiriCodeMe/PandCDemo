# EPIC 4 — Carrier & Payroll Integration

## Objective

Demonstrate end-to-end data exchange between the benefits platform, insurance carriers, and payroll.

---

## Feature 4.1 — Carrier Management

Configure carrier connection details:

- Carrier name and ID
- Supported products
- Connection type (REST / SFTP / Batch)
- File format (JSON / CSV / EDI)
- Transmission schedule (Daily / Weekly / Monthly)

**Example:**

| Field | Value |
|-------|-------|
| Carrier | Aetna |
| Product | Medical |
| File Type | Eligibility File |
| Schedule | Weekly |

---

## Feature 4.2 — Eligibility Data Exchange

The system generates an Employee Eligibility File containing:

- Employee ID
- Employee name
- Date of birth
- SSN / Member ID
- Employment status
- Plan code
- Coverage tier
- Effective date
- Dependent information

---

## Feature 4.3 — Carrier Integration

Supported demo integration patterns:

- REST API
- SFTP
- Batch file
- JSON, CSV, EDI formats

The demo simulates round-trip carrier communication:

```
Benefits Platform → Carrier API → Response: "Transaction Accepted" | "Transaction Rejected"
```

**Demo rejection scenario:** Carrier transaction `CT-10045` — Linda White (ACM-E012) medical enrollment rejected by Aetna with error `DEP-INVALID-ID: Dependent ID DEP-INVALID not found in carrier member records`. Seed data in `seed/integrations/carrierTransactions.json`.

---

## Feature 4.4 — Payroll Integration

Benefits platform sends deduction data to payroll:

- Employee ID
- Benefit plan
- Coverage tier
- Deduction amount
- Effective date

**Example:**

| Field | Value |
|-------|-------|
| Plan | Medical PPO 500 |
| Monthly deduction | $150 |
| Pay frequency | Biweekly |
| Per paycheck | $75 |

---

## Feature 4.5 — Reconciliation

System performs a three-way comparison:

```
Benefits Enrollment  vs.  Carrier Enrollment  vs.  Payroll Deduction
```

**Example exception:**

> Employee elected PPO 500. Carrier shows PPO 500. Payroll deduction reflects HDHP.

**AI recommendation:**

> "Potential payroll deduction mismatch detected. Review payroll transaction."

**Primary demo mismatch:** `DED-10001` — John Smith (ACM-E001) Medical PPO 500 EE Only. Expected: $69.23/paycheck. Actual: $200.00/paycheck. Root cause: payroll still using old EE+Spouse rate from before divorce. Seed data in `seed/integrations/payrollTransactions.json`.

---

## Feature 4.6 — Integration Monitoring Dashboard

Real-time status across all carrier and payroll integrations.

**Example dashboard:**

| Integration | Status | Records | Errors |
|-------------|--------|---------|--------|
| Medical Carrier | Success | 4,892 | 12 |
| Dental Carrier | Success | 4,901 | 3 |
| Vision Carrier | Failed | 4,900 | 42 |
| Payroll | Success | 4,900 | 0 |

**AI analysis:**

> "Vision carrier integration failed because 42 records contain an invalid plan code."
