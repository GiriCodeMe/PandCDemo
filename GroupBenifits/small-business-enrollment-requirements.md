# Small Business Employee Benefits — Enrollment Portal Requirements

_Generated: 2026-07-24_

Source: UI mockups in `images mocks/` (14 screens, 1.png – 9.png)
Product: **Life Carrier — Benefits Enrollment Portal** · Small Business Employee Benefits

---

## Overview

An 8-step wizard that takes a small business owner through full group benefits enrollment — from business owner identity through employee census, benefit product selection, employee enrollment, billing setup, payment, and final submission.

### Wizard Steps

| Step | Label | Screen |
|---|---|---|
| 1 | Owner | Business Owner Details |
| 2 | Business | Business Details |
| 3 | Census | Employee Census |
| 4 | Benefits | Benefits Selection |
| 5 | Enrollment | Employee Enrollment |
| 6 | Billing | Billing & Deductions |
| 7 | Payment | Payment Method |
| 8 | Confirm | Review & Confirm |

- Step 8 (Confirm) remains **locked/greyed** until all prior steps are completed.
- Each completed step shows a **checkmark** in the progress bar.
- Active step is **highlighted in blue** (filled circle with number).
- Navigation: **Back** (left) and **Continue →** (right) on every step.

---

## Step 1 — Business Owner Details

**Purpose:** Capture the primary contact for contract signing and communication.

### Fields

| Field | Required | Type | Notes |
|---|---|---|---|
| First Name | Yes | Text | |
| Last Name | Yes | Text | |
| Title / Role | Yes | Text | e.g. "HR Mgr" |
| Email | Yes | Email | |
| Phone | Yes | Tel | |
| Date of Birth | Yes | Date picker | Format: MM/DD/YYYY |
| Address Line 1 | Yes | Text | |
| Address Line 2 | No | Text | |
| City | Yes | Text | |
| State | Yes | Dropdown | US states |
| ZIP | Yes | Text | 5-digit |

### UX Notes
- Smart Tip banner: _"This information is used for contract signing and primary communication. Make sure the contact details are accurate."_
- All required fields marked with `*`.

---

## Step 2 — Business Details

**Purpose:** Capture the company's legal, regulatory, and operational information.

### Fields

| Field | Required | Type | Notes |
|---|---|---|---|
| Legal Business Name | Yes | Text | |
| DBA (Doing Business As) | No | Text | |
| Entity Type | Yes | Dropdown | e.g. LLC, S-Corp, C-Corp, Sole Prop |
| TIN / EIN | Yes | Text | Format: XX-XXXXXXX |
| SIC Code | No | Text | |
| NAICS Code | Yes | Text | |
| Nature of Business | Yes | Text | |
| Year Established | Yes | Number | 4-digit year |
| Total Employees | Yes | Number | |

### "I need help finding my codes" Link
- Inline helper link below SIC/NAICS fields — opens a lookup tool or external reference.

### Office Locations
- Add multiple locations via **+ Add Location** button.
- Each location card has: location name, address fields (street, city, state, zip).
- One location must be marked as **Primary** (badge indicator).
- Headquarters is pre-filled from Owner address if available.

### Key Contacts
- Add multiple contacts via **+ Add Contact** button.
- Each contact row has: Full Name, Role/Title, Email, Phone.
- Delete icon per contact row.

### UX Notes
- Smart Tip: _"Your TIN/EIN and NAICS code help us find the best rates and ensure regulatory compliance."_

---

## Step 3 — Employee Census

**Purpose:** Import or manually enter the employee list for benefits eligibility.

Three sub-steps within this step:

```
1 Select Provider  →  2 Connect  →  3 Review Census
```

### Sub-step 1: Select Provider

**HRIS/Payroll Integration options (tile cards):**

| Provider | Description |
|---|---|
| Intuit QuickBooks | QuickBooks Online Payroll |
| ADP | ADP Workforce Now / RUN |
| UKG | UKG Pro / Ready |

**Manual options (if no integration):**

| Option | Description |
|---|---|
| Upload a File | Upload an Excel or CSV file with employee data |
| Enter Manually | Add employee information one by one |

- Smart Tip: _"Connecting your payroll system automatically syncs employee data, saving time and reducing errors."_

### Sub-step 2: Connect (example: ADP)

- Form fields: **Company ID*** and **API Key / Access Token***.
- CTA button: **Connect & Import**.
- Other providers show equivalent credential fields.

### Sub-step 3: Review Census

**Census table columns:**

| Column | Notes |
|---|---|
| Checkbox | Select/deselect individual employees |
| Name | Clickable — opens employee detail |
| Job Title | |
| Email | |
| Hire Date | Format: YYYY-MM-DD |
| Salary | Dollar amount |
| Status | Badge: Active (green) / Inactive (grey) |

- Shows **"X imported / X selected"** count at top.
- **Re-import** button to re-sync from provider.
- Confirmation message at bottom: _"Census confirmed with X employees."_
- Smart Tip: _"Review and select which employees to include in the benefits plan. Part-time or contract workers may not be eligible."_

---

## Step 4 — Benefits Selection

**Purpose:** Choose which benefit products to offer employees.

### Layout
- Selected product chips displayed at top (e.g. "Basic Life ×", "Short Term Disability ×") — click × to remove.
- Smart Tip: _"Offering competitive benefits helps attract and retain top talent. Most companies offer Life and STD as core benefits, with Dental and Vision as popular add-ons."_

### Statutory Benefits (Required badge)
Employer-paid, billed to the company.

| Product | Description | Plan Options |
|---|---|---|
| **Basic Life** | Employer-paid group term life insurance; death benefit to employees' beneficiaries | $10,000 flat ($1.50/ee/mo), $25,000 flat ($3.25/ee/mo), $50,000 flat ($5.75/ee/mo), 1× Salary ($8.00/ee/mo) |
| **Short Term Disability** | Employer-paid income replacement for non-work-related illness or injury | 60% Income / 13 Weeks ($12.00/ee/mo), 70% Income / 26 Weeks ($18.50/ee/mo) |

- Each product card: **expandable/collapsible** via chevron.
- When expanded: shows **SELECT A PLAN OPTION** tile grid with pricing per employee per month.
- **Remove Product** link at bottom of expanded card.

### Voluntary Benefits (Optional badge)
Employee-paid via payroll deduction.

| Product | Description |
|---|---|
| Supplemental Life | Additional employee-paid life insurance above the basic group benefit |
| Spousal Life | Life insurance coverage for an employee's spouse or domestic partner |
| Child Life | Life insurance coverage for eligible dependent children of the employee |
| Accident | Lump-sum cash benefit for covered accidental injuries and treatments |
| Critical Illness | Lump-sum benefit upon diagnosis of a covered critical illness (cancer, heart attack, stroke) |
| Hospital Indemnity | Fixed cash benefits for hospital admissions, confinement, and outpatient procedures |
| Short Term Disability (Voluntary) | Employee-paid income replacement for short-term inability to work |
| Long Term Disability | Income protection for extended periods of disability, typically after STD ends |
| Dental | Coverage including preventive, basic, and major restorative services |
| Vision | Coverage for annual exams, lenses, frames, and contact lens allowances |

- Voluntary products are **collapsed by default** — expand to see plan options and pricing.

---

## Step 5 — Employee Enrollment

**Purpose:** Configure benefit elections for each employee.

### Bulk Actions Bar
- **Voluntary Benefit** dropdown — select a voluntary product.
- **Plan Tier** dropdown — select a plan tier.
- **Enroll All** button — bulk-enroll all 12 employees in the selected benefit/tier.

### View Toggle
- **Grid View** (default) — matrix of employees × benefits.
- **Individual View** — one employee at a time, full detail.

### Grid View

- Rows: Employees (avatar initial + name + job title).
- Columns: One per selected benefit product.
  - Column header shows product name + badge (e.g. "Statutory") + enrolled count (e.g. "12/12").
  - "Quick Actions" row under header shows "Auto-enrolled" for statutory products.
- Each cell: **Enrolled** (green badge) or unenrolled state.

### Enrollment Summary
- Progress bars at bottom, one per product: shows enrolled count vs total (e.g. "12 of 12").
- Success banner when all enrolled: _"All employee enrollments have been confirmed. Make changes."_

---

## Step 6 — Billing & Deductions

**Purpose:** Review employer costs and configure payroll deduction settings.

### Employer-Billed (Statutory) Section
- Line items per statutory product: product name, enrolled count, monthly cost.
- **Employer Monthly Total** — sum of all statutory premiums.

### Payroll Deductions (Voluntary) Section
- **Enable Payroll Deduction** toggle (on by default) — auto-deducts voluntary premiums from employee paychecks.
- **Payroll Frequency** dropdown: options include Bi-Weekly, Weekly, Semi-Monthly, Monthly.
- **Total Voluntary Premiums** — sum of all voluntary employee contributions.

### Billing Preferences Section
- **Employer Billing Frequency** dropdown: Monthly, Quarterly, Annually.
- **Billing Contact Name*** — free text.
- **Billing Email*** — email.
- **Invoice preview card** — shows total employer invoice amount based on frequency selected.

---

## Step 7 — Payment Method

**Purpose:** Set up payment for employer-billed statutory premiums.

### Payment Options (toggle tabs)

**ACH / Bank Transfer** (default selected)

| Field | Required |
|---|---|
| Bank Name | Yes |
| Routing Number | Yes |
| Account Number | Yes |
| Account Type | Yes (Checking / Savings dropdown) |

**Credit / Debit Card**

| Field | Required |
|---|---|
| Name on Card | Yes |
| Card Number | Yes |
| Expiry (MM/YY) | Yes |
| CVV | Yes |

### UX Notes
- Security disclaimer: _"Your payment information is encrypted and securely transmitted. We never store raw card or bank account numbers."_
- Continue button shows inline validation message **"Complete all required fields to continue"** when fields are missing.

---

## Step 8 — Review & Confirm

**Purpose:** Final review of all data before submission.

### Summary Cards (2-column grid)

| Card | Contents |
|---|---|
| Business Owner | Name, title, email, phone, address |
| Business | Legal name, DBA, entity type, TIN, NAICS, SIC, nature, year established |
| Employee Census | Count enrolled, import source (e.g. "Imported from ADP"), avatar thumbnails + overflow count |
| Benefits Selected | Count of products + product names list |
| Billing | Monthly cost/employer, voluntary amount, billing frequency |
| Payment | Method (ACH or Card) + masked account info |

### Terms & Agreement
- Section heading: **"Group Benefits Enrollment Agreement"**
- Scrollable legal agreement text.
- Checkbox: _"I have read, understand, and agree to the Group Benefits Enrollment Agreement and authorize the enrollment of selected plans for the employees listed above."_
- **Digital Signature*** — text field, user types full legal name as electronic signature.

### CTA
- **Submit Application** button (primary, blue) — only active when checkbox checked and signature entered.
- **Back** link.

---

## Confirmation Screen (Post-Submit)

- Full-page success state with animated checkmark circle (green).
- Heading: **"Application Submitted"**
- Message: _"The benefits enrollment application for [Company Name] has been submitted successfully. We will review your application and contact [Owner Name] at [email] with next steps."_
- Summary line: _"X employees enrolled across Y benefit products."_
- CTA: **Start New Application** button.

---

## Global UX Patterns

### Header
- Life Carrier logo + "Benefits Enrollment Portal" + "Small Business Employee Benefits" subtitle.
- User icon (top right) — profile/account menu.
- Hamburger menu (top left) — navigation drawer.

### Smart Tips
- Appear as callout banners with a lightbulb icon.
- Blue-highlighted key phrases within the tip text.
- Collapsible (not shown in mocks but implied by icon).

### Form Validation
- Required fields marked with red `*`.
- Inline validation on Continue — error message appears adjacent to Continue button.
- Fields with errors highlighted with red border.

### Progress Stepper
- Horizontal step indicator across the top.
- Completed steps: checkmark icon (outlined circle).
- Active step: filled blue circle with step number.
- Future steps: grey circle with step number, label below.
- Step 8 (Confirm) shown as locked until all steps complete.

---

## Data / Integration Requirements

| Integration | Purpose | Credential Fields |
|---|---|---|
| ADP Workforce Now / RUN | Employee census import | Company ID, API Key / Access Token |
| Intuit QuickBooks Online Payroll | Employee census import | (credentials TBD) |
| UKG Pro / Ready | Employee census import | (credentials TBD) |
| File Upload | Census fallback | Excel or CSV |
| Manual Entry | Census fallback | Form-based per employee |

### Employee Census Fields (from import or manual entry)
- Name, Job Title, Email, Hire Date, Salary, Status (Active / Inactive)

---

## Open Questions / To Clarify

1. **Individual View** (enrollment step) — exact layout not shown; needs design spec.
2. **Voluntary product plan tiers** — pricing not shown for Dental, Vision, Accident, etc.
3. **QuickBooks and UKG connect flows** — only ADP connect form was mocked; others TBD.
4. **Manual employee entry form** — fields and validation rules not shown.
5. **File upload format spec** — required columns for Excel/CSV template.
6. **Billing invoice details** — what exactly appears on the quarterly employer invoice?
7. **Terms & Agreement full text** — legal copy needed from compliance/legal team.
8. **Error and edge case states** — e.g. census import failure, payment decline, duplicate EIN.
9. **Account profile / login** — sign-in flow not shown; assumed separate from enrollment wizard.
10. **Mid-wizard save / resume** — can users save progress and return later?
