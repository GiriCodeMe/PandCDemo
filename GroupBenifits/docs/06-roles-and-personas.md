# Roles, Personas & Demo Journey

## RACI Legend

| Code | Meaning |
|------|---------|
| A | Accountable / Admin control |
| E | Execute / Perform |
| V | View / Read-only |
| C | Configure / Approve |
| S | Submit / Initiate |
| — | No access |

---

## RACI Matrix

| Persona | Epic 1: Plan & Product Config | Epic 2: Eligibility & Rules | Epic 3: Enrollment & Life Events | Epic 4: Carrier & Payroll | Epic 5: AI Requirements |
|---------|-------------------------------|----------------------------|----------------------------------|--------------------------|------------------------|
| Benefits Administrator | A / C / E | A / C / E | A / V | C / V | C / E |
| HR Administrator | V | V / E | A / E | V | C / E |
| Employee | V | V | S / E | V | E |
| Benefits Analyst | V / C | C / E | V / E | V / E | E / C |
| Carrier Administrator | V | V | V / E | A / E | V |
| Payroll Administrator | V | V | V / E | A / E | V |
| Business Analyst | V | C / E | C / E | C / E | A / E |
| Product Manager | A / C | A / C | A / C | C | A / C |

---

## Persona Profiles

### 1. Benefits Administrator

- **Auth ID:** P-001 — Alex Chen (`alex.chen@acme.com`)
- **Demo persona:** "I need to launch a new benefits program for Acme Corporation."
- **Default screen:** `/plan-config`

**Key capabilities:**
- Create and manage employer groups
- Create benefit products and configure plans
- Configure premiums and employer contributions
- Define eligibility rules and waiting periods
- Configure dependent eligibility
- Manage enrollment windows
- Monitor life events
- Configure carrier and payroll integrations
- Review and approve AI-generated requirements

---

### 2. HR Administrator

- **Auth ID:** P-002 — Maria Torres (`maria.torres@acme.com`)
- **Demo persona:** "I need to ensure all eligible Acme employees are enrolled correctly."
- **Default screen:** `/employees`

**Key capabilities:**
- View available plans and employee eligibility
- Initiate employee enrollment
- Manage employee life events and dependents
- Review employee benefit elections
- View carrier transaction status
- Validate AI-generated business requirements

---

### 3. Employee

- **Auth ID:** P-004 — Rachel Kim (`rachel.kim@acme.com`, employeeId: `ACM-E004`)
- **Demo persona:** "I just got married. What benefits can I change?"
- **Default screen:** `/self-service`

**Key capabilities:**
- View eligible benefits and compare plans
- Add dependents and enroll in benefits
- Change elections during qualifying life events
- Submit marriage / birth / adoption events and upload documentation
- Ask AI benefits questions
- View enrollment confirmation

---

### 4. Benefits Analyst

- **Auth ID:** P-005 — David Park (`david.park@acme.com`)
- **Demo persona:** "Show me where the enrollment, carrier, and payroll data don't match."
- **Default screen:** `/analytics`

**Key capabilities:**
- Analyze plan configuration and validate eligibility rules
- Analyze enrollment trends and life event activity
- Reconcile carrier enrollment and payroll deductions
- Identify exceptions
- Review AI-generated requirements and validate business rules
- Perform requirements traceability analysis

---

### 5. Carrier Administrator

- **Auth ID:** P-006 — Susan Carter (`susan.carter@aetna.com`)
- **Demo persona:** "Why was this employee's enrollment rejected?"
- **Default screen:** `/carrier-portal`

**Key capabilities:**
- View assigned plans and receive eligibility/enrollment transactions
- Process additions and terminations
- Review rejected transactions and monitor API/SFTP/file integrations
- Resolve transaction errors
- View integration requirements

---

### 6. Payroll Administrator

- **Auth ID:** P-007 — Mark Johnson (`mark.johnson@acme.com`)
- **Demo persona:** "The employee elected PPO 500, but payroll is deducting the HDHP amount."
- **Default screen:** `/payroll`

**Key capabilities:**
- View benefit elections impacting payroll
- Receive and validate deduction updates
- Reconcile payroll with benefits
- Identify and resolve deduction mismatches
- View payroll integration requirements

---

### 7. Business Analyst

- **Auth ID:** P-008 — Lisa Anderson (`lisa.anderson@acme.com`)
- **Demo persona:** "I need to convert a 200-page benefits guide and stakeholder conversations into implementation-ready requirements."
- **Default screen:** `/requirements`

**Key capabilities:**
- Upload benefits documents and analyze existing requirements
- Conduct AI-assisted stakeholder interviews
- Generate business requirements, functional requirements, business rules, user stories, and acceptance criteria
- Identify missing and conflicting requirements
- Perform impact analysis and create requirements traceability

---

### 8. Product Manager

- **Auth ID:** P-003 — James Wilson (`james.wilson@acme.com`)
- **Demo persona:** "I need to understand which requirements are critical for the MVP and what downstream systems will be impacted."
- **Default screen:** `/dashboard`

**Key capabilities:**
- Define benefits product vision and approve product capabilities
- Prioritize requirements and backlog
- Review AI-generated requirements and approve changes
- Review requirement impact analysis

---

## Recommended Demo Role Journey

The demo uses **five primary personas** to tell a complete closed-loop story.

### Five-Persona Demo Sequence

```
1. Product Manager (James Wilson)
     "We need to launch a new Group Benefits offering."
     ↓
2. Business Analyst (Lisa Anderson)
     AI Requirements Engineering:
       Analyze documents → Interview stakeholders
       → Generate requirements → Identify gaps
     ↓
3. Benefits Administrator (Alex Chen)
     Use requirements to:
       Configure products → Plans → Rates → Eligibility rules
     ↓
4. Employee (Rachel Kim) + HR Administrator (Maria Torres)
     Determine eligibility → Enroll → Process life events
     ↓
5. Benefits Analyst (David Park)
     Reconcile carrier → Payroll → Benefits data → Identify exceptions
```

### Full Demo Narrative (Closed-Loop Story)

| Step | Actor | Action |
|------|-------|--------|
| 1 | Product Manager | "Launch new benefits program for Acme Corporation." |
| 2 | Business Analyst | Upload documents, interview stakeholders, generate requirements |
| 3 | Business Analyst | Validate requirements and business rules |
| 4 | Benefits Administrator | Configure products, plans, eligibility rules |
| 5 | Employee | Enroll in benefits |
| 6 | Employee | Life event: gets married and adds spouse |
| 7 | Carrier Administrator | Receive updated enrollment transaction |
| 8 | Payroll Administrator | Update employee deductions |
| 9 | Benefits Analyst | Reconcile and detect exceptions across carrier/payroll/benefits |
| 10 | AI Requirements Agent | Trace operational issues back to original business requirement |

### The Closed-Loop Value Proposition

```
Business Intent (Product Manager)
  → AI Requirements (Business Analyst)
    → Platform Configuration (Benefits Administrator)
      → Employee Enrollment & Life Events
        → Carrier + Payroll Integration
          → Operational Exception
            → AI Traceability back to source requirement
```

AI-generated requirements are not just documentation — they directly drive configuration, enrollment, and integration, and are traceable back when issues arise in production.
