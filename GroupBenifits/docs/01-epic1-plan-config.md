# EPIC 1 — Plan & Product Configuration

## Objective

Allow benefits administrators to create and configure Group Benefits products and plans using a flexible, configurable experience.

---

## Feature 1.1 — Employer Group Setup

### Requirements

**FR-1.1.1** — The system shall allow an administrator to create a new employer group.

**FR-1.1.2** — The system shall capture:

- Employer name
- Employer ID
- Industry
- Address
- Number of employees
- Effective date
- Renewal date
- State(s)
- Group status

**FR-1.1.3** — The system shall support multiple locations and divisions within an employer.

**FR-1.1.4** — The system shall support employee classes:

- Full-time
- Part-time
- Executive
- Union
- Hourly
- Salaried

---

## Feature 1.2 — Benefit Product Catalog

The system shall maintain a catalog of available benefit products.

### Product Types

- Medical
- Dental
- Vision
- Life
- AD&D
- Short-Term Disability
- Long-Term Disability
- FSA
- HSA
- Accident
- Critical Illness

### Requirements

**FR-1.2.1** — Administrator shall be able to create a benefit product.

**FR-1.2.2** — Administrator shall specify:

- Product name
- Product type
- Carrier
- Product description
- Effective date
- Termination date
- Product status

**FR-1.2.3** — The system shall allow multiple plans under one product.

**Example:**

```
Medical
  → PPO 500
  → PPO 1000
  → HDHP 3000
```

---

## Feature 1.3 — Plan Configuration

### Requirements

**FR-1.3.1** — Administrator shall create a plan.

**FR-1.3.2** — Administrator shall define:

- Plan name
- Plan code
- Carrier
- Effective date
- Coverage period
- Network
- Deductible
- Out-of-pocket maximum
- Copay
- Coinsurance
- Coverage tiers

### Coverage Tiers

- Employee Only
- Employee + Spouse
- Employee + Child
- Employee + Children
- Family

---

## Feature 1.4 — Premium & Contribution Configuration

Administrator shall configure:

- Employee premium
- Employer contribution
- Employee contribution
- Contribution percentage / amount
- Coverage tier rates

**Example rate table:**

| Coverage | Monthly Premium | Employer Pays | Employee Pays |
|----------|----------------|--------------|--------------|
| Employee Only | $600 | $450 | $150 |
| Employee + Spouse | $1,100 | $700 | $400 |
| Employee + Child | $950 | $650 | $300 |
| Family | $1,500 | $900 | $600 |

---

## Feature 1.5 — Plan Versioning

**FR-1.5.1** — The system shall maintain plan versions.

**Example:**

```
Medical PPO 500
  → 2026 Plan Version
  → 2027 Plan Version
```

**FR-1.5.2** — Changes to an existing plan shall create a new version rather than overwrite historical configuration.

---

## Demo Flow

```
Login
  → Select Acme Corporation
  → Create Medical Product
  → Create PPO 500 Plan
  → Configure coverage tiers
  → Configure premiums
  → Assign Carrier
  → Publish Plan
```
