import { Router } from 'express';
import { sendSuccess } from '../utils/apiResponse';

const router = Router();

const KB: Array<{ patterns: string[]; answer: string }> = [
  {
    patterns: ['enrollment rate', 'what does enrollment', 'enrollment metric'],
    answer: '**Enrollment Rate** is the percentage of eligible employees who have enrolled in at least one benefit plan.\n\nFormula: (Total Enrolled ÷ Total Eligible) × 100\n\nA rate above 85% is considered healthy. Rates below 80% may indicate communication issues, affordability concerns, or gaps in the enrollment experience. The dashboard color-codes this metric: green ≥85%, amber <85%.',
  },
  {
    patterns: ['eligibility exception', 'what is an exception', 'exceptions'],
    answer: '**Eligibility Exceptions** are cases where employee eligibility data does not match what the carrier or payroll system expects.\n\nCommon causes:\n- Hire date or termination date discrepancies\n- Missing dependent relationship data\n- SSN format mismatches\n- Waiting period violations\n\nExceptions must be resolved before the affected employee can be enrolled or their deductions processed. Open exceptions are tracked by week so you can monitor backlog.',
  },
  {
    patterns: ['carrier success', 'carrier rate', 'edi 834', 'carrier submission'],
    answer: '**Carrier Success Rate** measures the percentage of EDI 834 transactions (benefit enrollment files) accepted by the carrier without errors.\n\nA rate above 95% is healthy. Common rejection reasons:\n- Invalid SSN format\n- Missing subscriber relationship code\n- Duplicate transaction IDs\n- Carrier system timeouts\n\nRejected transactions require manual resubmission or carrier coordination.',
  },
  {
    patterns: ['payroll', 'deduction', 'payroll success'],
    answer: '**Payroll Success Rate** tracks how many employee benefit deductions are being processed correctly by the payroll system.\n\n**Active Deductions** = employees currently having premiums withheld from their paycheck.\n\n**Pending Updates** = deductions that have been changed (new enrollment, life event, termination) but not yet confirmed by payroll.\n\n**Reconciliation Exceptions** = mismatches between what the benefits system expects and what payroll actually deducted.',
  },
  {
    patterns: ['plan year', 'what is a plan year', 'plan years'],
    answer: '**Plan Year** is the 12-month period during which an employer\'s benefit plans are active. Each plan year has a status:\n\n- **DRAFT** — Being configured; no employee elections yet\n- **CONFIGURATION** — Rates and plan designs being finalized\n- **OPEN_ENROLLMENT** — Active enrollment window; employees can make elections\n- **ACTIVE** — Enrollment closed; benefits are live and deductions are running\n- **CLOSED** — Plan year ended; historical data only\n\nEmployers typically have 3 plan years visible: prior year (ACTIVE/CLOSED), current year (ACTIVE), and next year (DRAFT/OPEN_ENROLLMENT).',
  },
  {
    patterns: ['open enrollment', 'enrollment period', 'enrollment window'],
    answer: '**Open Enrollment** is the annual window during which employees can:\n- Enroll in benefit plans for the first time\n- Change their existing coverage selections\n- Add or remove dependents\n- Waive coverage\n\nOutside of Open Enrollment, employees can only make changes due to a Qualifying Life Event (QLE) such as marriage, birth, divorce, or loss of other coverage.\n\nThe enrollment period dates are shown on the employer\'s Plan Years table.',
  },
  {
    patterns: ['employer status', 'what does active mean', 'status mean'],
    answer: '**Employer Status** indicates whether the employer account is currently active in the system:\n\n- **ACTIVE** — The employer has running benefit plans and active employees\n- **PENDING** — The account is being set up; configuration not complete\n- **INACTIVE** — The employer account is suspended or terminated\n\nOnly ACTIVE employers can process enrollments, submit EDI files, or run payroll deductions.',
  },
  {
    patterns: ['draft', 'what does draft', 'draft status'],
    answer: '**DRAFT plan year** means the plan year is in the initial configuration phase. No employees can enroll yet.\n\nDuring DRAFT:\n- HR administrators define which plans to offer\n- Carriers configure rates and plan designs\n- Employee eligibility rules are set up\n- The system validates configuration completeness\n\nOnce configuration is approved, the plan year transitions to CONFIGURATION, then OPEN_ENROLLMENT when the enrollment window opens.',
  },
  {
    patterns: ['renewal', 'renewal date', 'how is renewal'],
    answer: '**Renewal Date** is when the current plan year ends and the next plan year begins. It marks the start of the new 12-month benefit period.\n\nTypically, Open Enrollment for the *next* plan year opens 60–90 days before the renewal date, giving employees time to review and elect their new year coverage.\n\nAfter renewal:\n- New premium rates take effect\n- All employee elections reset (or roll over, depending on plan rules)\n- New deduction amounts are transmitted to payroll',
  },
  {
    patterns: ['industry', 'what industry', 'sic code'],
    answer: '**Industry** classification determines which benefit products and rate tables apply to an employer.\n\nIndustry affects:\n- Available plan designs (some carriers restrict certain industries)\n- Risk pricing for life and disability products\n- Regulatory requirements (certain industries have specific mandates)\n- Wellness program eligibility\n\nThe industry field uses standard SIC (Standard Industrial Classification) descriptions.',
  },
  {
    patterns: ['payroll frequency', 'biweekly', 'semi-monthly', 'how often'],
    answer: '**Payroll Frequency** determines how often benefit premiums are deducted from employee paychecks.\n\nCommon frequencies:\n- **Weekly** — 52 pay periods/year\n- **Bi-Weekly** — 26 pay periods/year (most common)\n- **Semi-Monthly** — 24 pay periods/year\n- **Monthly** — 12 pay periods/year\n\nThe payroll frequency affects the per-paycheck deduction amount: annual premium ÷ number of pay periods.',
  },
  {
    patterns: ['eligibility status', 'employee eligibility', 'eligible employee'],
    answer: '**Employee Eligibility Status** indicates whether an employee qualifies for benefits based on the employer\'s eligibility rules.\n\n- **Eligible** — All eligibility criteria met (full-time 30+ hours, active, past waiting period)\n- **Partial** — Meets some but not all criteria (e.g., part-time meets Dental/Vision threshold but not Medical 30hr rule)\n- **Ineligible** — Does not meet eligibility requirements\n- **Terminated** — No longer employed\n\nEligibility is checked against the plan year\'s rule set on every change to employment status, hours, or hire date.',
  },
  {
    patterns: ['enrollment status', 'enrolled status', 'what is enrollment status'],
    answer: '**Enrollment Status** shows whether an employee has completed their benefit elections for the current plan year.\n\n- **Enrolled** — Employee has active coverage for at least the core benefit plans\n- **Partial** — Employee has enrolled in some but not all available products\n- **Pending** — Elections submitted but not yet finalized by carrier\n- **Not Enrolled** — Employee has not made any elections (may have waived or missed the window)\n\nEnrollment status updates when elections are submitted and confirmed by the carrier.',
  },
  {
    patterns: ['dependent', 'what is a dependent', 'add dependent'],
    answer: '**Dependents** are family members covered under an employee\'s benefit plan.\n\nEligible dependent relationships:\n- **Spouse** — Legal spouse\n- **Domestic Partner** — Registered domestic partner (where plan allows)\n- **Child** — Biological, adopted, or step-child, typically up to age 26\n\nAdding a dependent requires:\n1. A Qualifying Life Event (marriage, birth, adoption)\n2. Documentation (marriage certificate, birth certificate)\n3. HR approval (within the life event window)\n\nOnce approved, the dependent is added to the carrier EDI 834 file.',
  },
  {
    patterns: ['hsa', 'fsa', 'health savings', 'flexible spending'],
    answer: '**HSA (Health Savings Account)** and **FSA (Flexible Spending Account)** are tax-advantaged accounts for medical expenses.\n\n**HSA:**\n- Requires enrollment in a High Deductible Health Plan (HDHP)\n- Funds roll over year-to-year\n- Triple tax advantage: contributions, earnings, and qualified withdrawals are tax-free\n- 2027 limit: $4,300 individual / $8,550 family\n\n**FSA:**\n- Available with any health plan\n- Use-it-or-lose-it (up to $610 rollover allowed)\n- Employee sets annual election at open enrollment\n- 2027 limit: $3,300\n\nNeither account can be used for insurance premiums.',
  },
  {
    patterns: ['std', 'ltd', 'disability', 'short term disability', 'long term disability'],
    answer: '**STD (Short-Term Disability)** and **LTD (Long-Term Disability)** replace a portion of an employee\'s income when they cannot work due to illness or injury.\n\n**STD:**\n- Replaces 60-70% of salary\n- Coverage begins after a 7-14 day elimination period\n- Pays for up to 12-26 weeks\n- Often employer-paid\n\n**LTD:**\n- Takes over when STD ends\n- Replaces 60% of salary\n- Coverage until age 65 (or return to work)\n- May be employer-paid (taxable) or employee-paid (tax-free benefit)\n\nBoth products integrate with FMLA (Family and Medical Leave Act) coordination.',
  },
  {
    patterns: ['employee 360', 'employee detail', 'employee profile'],
    answer: '**Employee 360** is the comprehensive view of a single employee showing all benefit-related information in one place:\n\n- **Employment Information** — hire date, status, hours, salary, department\n- **Coverage Eligibility** — which products (Medical, Dental, Vision, Life) the employee is eligible for\n- **Enrollment Status** — what they are currently enrolled in\n- **Dependents** — family members covered under their plan\n- **Life Events** — marriage, birth, divorce events and their status\n- **Deductions** — per-paycheck premium amounts\n\nThis view is the primary source of truth for HR administrators when handling employee benefit questions.',
  },
  {
    patterns: ['waiting period', 'what is a waiting period', 'when does coverage start'],
    answer: '**Waiting Period** is the time between an employee\'s hire date and when their benefit coverage becomes effective.\n\nAcme 2027 uses two waiting period types:\n\n- **FirstOfMonthFollowing30** — Coverage starts on the first day of the month after the employee completes 30 days of employment. Most common for Medical, Dental, Vision, Life.\n- **Immediate** — Coverage starts on the hire date (day 1). Used for HSA when enrolled in HDHP.\n- **Days30** — Coverage starts exactly 30 calendar days after hire. (Note: this conflicts with FirstOfMonthFollowing30 — see eligibility conflict rules ER-006 and ER-007.)\n\nWaiting period conflicts in source documents are flagged by AI during document analysis and must be resolved before publishing plan configuration.',
  },
  {
    patterns: ['ppo', 'hdhp', 'difference between ppo', 'what is ppo', 'what is hdhp'],
    answer: '**PPO vs HDHP** are two medical plan designs:\n\n**PPO (Preferred Provider Organization):**\n- Lower deductible ($500–$1000) with predictable copays\n- Access to a large provider network with out-of-network coverage\n- Better for employees who expect frequent medical visits\n- Not HSA-eligible\n\n**HDHP (High Deductible Health Plan):**\n- Higher deductible ($3000+) but lower premiums\n- No copays until deductible is met\n- **HSA-eligible** — employees can contribute pre-tax dollars to a Health Savings Account\n- Best for employees who are generally healthy and want to build HSA savings\n\nAcme 2027 offers PPO 500 ($500 deductible), PPO 1000 ($1000 deductible), and HDHP 3000 ($3000 deductible).',
  },
  {
    patterns: ['eligibility rules', 'what are eligibility rules', 'plan eligibility', 'who is eligible'],
    answer: '**Eligibility Rules** define which employees qualify for each benefit product.\n\nAcme 2027 eligibility rules:\n\n- **Medical** — Full-time, 30+ hours/week, Active employment status\n- **Dental / Vision** — 20+ hours/week, Active employment status\n- **Basic Life** — Full-time, 30+ hours/week, Active employment status\n- **HSA** — Must be enrolled in HDHP 3000 (cannot have any other medical coverage)\n\nAll coverage types include a **30-day waiting period** (first of month following hire + 30 days).\n\nThe AI Requirements Studio detected a conflict between two waiting period rules in the source documents — this must be resolved before HR can publish the plan configuration.',
  },
  {
    patterns: ['publish', 'configuration publish', 'what does published mean', 'how do i publish'],
    answer: '**Configuration Publish** is the final step in plan year setup. Before publishing, a checklist validates:\n\n- Products and plans are defined\n- Rate versions are published\n- Eligibility rules are configured\n- Waiting periods are set\n- Carrier file mapping is complete\n- Open enrollment window is set\n- Conflict rules are resolved\n- HR sign-off received\n\nOnce published, the plan configuration is locked. Employees can enroll, deductions are calculated, and carrier EDI files are generated based on the published configuration.\n\n**Warning:** Publishing with unresolved conflicts (like the waiting period ambiguity) may cause incorrect deduction amounts. The system shows a warning but allows override with HR sign-off.',
  },
  {
    patterns: ['lifecycle', 'document lifecycle', 'what does requirements_generated', 'extracted', 'validated state'],
    answer: '**Document Lifecycle States** track the progress of a benefits document through AI processing:\n\n- **UPLOADED** — File received and queued\n- **VALIDATED** — File type, size, and format confirmed (PDF, DOCX)\n- **EXTRACTED** — Text and rules extracted from the document\n- **ANALYZED** — Rules cross-referenced for conflicts and ambiguities\n- **REQUIREMENTS_GENERATED** — AI has produced structured requirements, user stories, and business rules\n- **COMPLETED** — All artifacts reviewed and approved by HR administrator\n\nDocuments that reach REQUIREMENTS_GENERATED are ready for the Requirements Workspace.',
  },
  {
    patterns: ['ai generation', 'what does ai generate', 'what does generate', 'requirements studio', 'how does ai work'],
    answer: '**AI Requirements Generation** extracts structured artifacts from your uploaded benefits documents:\n\n- **Requirements** — Functional specifications (P0-P3 priority) grouped by category: Enrollment, Eligibility, Carrier, Payroll\n- **User Stories** — Narrative format: "As [role], I want [goal] so that [benefit]" with acceptance criteria\n- **Business Rules** — Enforceable constraints (MANDATORY/RECOMMENDED) with rationale\n- **Conflict Detection** — Cross-document contradictions flagged for HR review (e.g., "30-day waiting period" vs "first of next month" in two documents)\n\nIn Phase 2, generation runs on seed data. Full Claude AI integration is planned for Phase 4.',
  },
  {
    patterns: ['conflict detection', 'how are conflicts', 'what is a conflict', 'document conflict'],
    answer: '**Conflict Detection** analyzes multiple benefits documents for contradictions:\n\n**Common conflict types:**\n- Deduction frequency: "monthly" in one doc vs "per paycheck" in another\n- Waiting period: "30 calendar days" vs "first of the month following hire"\n- Default plan: one doc defines a default, another does not\n\n**Severity levels:**\n- **HIGH** — Must be resolved before plan configuration; could cause incorrect deductions\n- **MEDIUM** — Should be reviewed; ambiguous without clarification\n- **LOW** — Minor wording inconsistency; documentation update recommended\n\nConflicts are shown in the Conflicts tab of the Requirements Workspace and must be acknowledged by HR before moving to plan configuration.',
  },
  {
    patterns: ['business rule', 'what is a business rule', 'rule vs story', 'user story vs'],
    answer: '**Business Rules vs User Stories** serve different purposes in requirements:\n\n**Business Rule** — A constraint or policy that the system MUST enforce:\n- Example: "Employees must complete enrollment within 30 days of hire date"\n- Has enforcement level: MANDATORY (system-enforced) or RECOMMENDED (warning only)\n- Sourced from HR policy documents, carrier contracts, or regulatory requirements\n\n**User Story** — A narrative describing what a user needs to accomplish:\n- Format: "As [HR Administrator], I want [to view enrollment rates] so that [I can identify at-risk groups]"\n- Has acceptance criteria that define when the story is "done"\n- Used by developers to understand the feature from the user\'s perspective\n\nBoth types are generated from the same documents — rules capture the *what must not happen*, stories capture the *what the user does*.',
  },
  {
    patterns: ['how do i choose', 'choose between', 'which plan', 'best plan', 'plan recommendation'],
    answer: '**How to Choose a Medical Plan:**\n\n**PPO 500** — Best if you visit doctors frequently and want predictable copays. Higher premium, lowest deductible ($500).\n\n**PPO 1000** — Middle ground. Lower premium than PPO 500, slightly higher deductible ($1000). Good for moderate health care users.\n\n**HDHP 3000** — Lowest premium. High deductible ($3000) but you can open an HSA to save pre-tax dollars. Best for healthy employees who want to build long-term savings.\n\n**Rule of thumb:**\n- Frequent doctor visits → PPO 500\n- Occasional visits, cost-conscious → PPO 1000\n- Generally healthy, want HSA savings → HDHP 3000',
  },
  {
    patterns: ['enrollment wizard', 'how do i enroll', 'how to enroll', 'make elections', 'submit enrollment'],
    answer: '**Enrollment Wizard** is an 8-step guided process for making your benefit elections:\n\n1. **Welcome** — Overview of what you\'re selecting\n2. **Medical** — Choose PPO or HDHP, or waive\n3. **Dental** — Basic or Premium, or waive\n4. **Vision** — Standard coverage, or waive\n5. **Life Insurance** — Basic life (employer-paid) + voluntary options\n6. **Savings Account** — HSA (with HDHP) or FSA\n7. **Dependents** — Review dependent coverage tier\n8. **Review & Submit** — Final cost summary before submitting\n\nYou can navigate back at any time until you hit Submit. Elections are final once submitted — changes after the window require a Qualifying Life Event.',
  },
  {
    patterns: ['coverage effective', 'when does coverage start', 'coverage date', 'january 1'],
    answer: '**Coverage Effective Date** for the Acme 2027 plan year is **January 1, 2027**.\n\nAll elections made during the Open Enrollment window (Oct 1–15, 2026) become effective on this date.\n\n**New hire coverage** follows a different timeline based on your waiting period:\n- Most products: First of the month following 30 days of employment\n- HSA (when enrolled in HDHP): Effective on hire date\n\nIf you miss the open enrollment window, you cannot make changes until the next open enrollment — unless you experience a Qualifying Life Event (marriage, birth, divorce, loss of other coverage).',
  },
  {
    patterns: ['what is fsa', 'flexible spending account', 'fsa vs hsa', 'savings account choice'],
    answer: '**FSA vs HSA — Which Savings Account is Right for You?**\n\n| Feature | FSA | HSA |\n|---|---|---|\n| Eligibility | Any health plan | HDHP only |\n| 2027 Limit | $3,300 | $4,300 individual / $8,550 family |\n| Rollover | Up to $610 | Unlimited |\n| Tax benefit | Pre-tax contributions | Triple tax advantage |\n| Ownership | Employer-held | Yours permanently |\n\n**Choose FSA if:** You\'re enrolled in PPO 500 or PPO 1000 and want to set aside pre-tax dollars for known medical costs.\n\n**Choose HSA if:** You\'re enrolled in HDHP 3000 and want to build long-term medical savings that grow tax-free.\n\nYou cannot have both an HSA and a standard FSA at the same time.',
  },
  {
    patterns: ['edi 834', 'what is edi', 'carrier file', 'benefit enrollment file'],
    answer: '**EDI 834** (Electronic Data Interchange — Benefit Enrollment and Maintenance) is the standard file format used by employers to send benefit enrollment data to insurance carriers.\n\nEach EDI 834 transaction represents a change event:\n- **Add** — New enrollment or dependent added\n- **Change** — Coverage tier, plan, or demographic update\n- **Terminate** — Coverage ended\n\nTransaction statuses:\n- **Accepted** — Carrier received and processed the transaction\n- **Rejected** — Carrier found an error (invalid ID, missing data, duplicate)\n- **Pending** — Transmitted but not yet acknowledged\n- **Failed** — Transmission error; never reached the carrier\n\nCarrier success rate = (Accepted ÷ Total) × 100. Target ≥ 95%.',
  },
  {
    patterns: ['carrier rejection', 'why was rejected', 'transaction rejected', 'dep-invalid'],
    answer: '**Carrier Transaction Rejection** means the carrier could not process the enrollment change.\n\nCommon rejection reasons:\n- **DEP-INVALID-ID** — Dependent ID not found in carrier member records. Fix: verify dependent SSN and re-assign the correct dependent ID before resubmitting.\n- **DUPLICATE-TXN** — Same transaction already processed. Fix: check if the change is already in effect before resubmitting.\n- **INVALID-PLAN** — Plan code not recognized. Fix: verify the plan code against the carrier\'s current plan year configuration.\n- **MISSING-SSN** — Employee or dependent SSN not provided. Fix: complete member demographics and resubmit.\n\nRejected transactions must be corrected and resubmitted manually. The enrollment change is NOT in effect until the carrier accepts the corrected submission.',
  },
  {
    patterns: ['payroll mismatch', 'deduction mismatch', 'wrong deduction', 'reconciliation exception'],
    answer: '**Payroll Deduction Mismatch** occurs when the benefit deduction amount that was actually processed by payroll differs from what the benefits system expected.\n\n**Common root causes:**\n1. **Stale rate on the payroll system** — A life event changed the coverage tier (e.g., EE+Spouse → EE Only after divorce), but payroll was not updated with the new rate\n2. **Manual override not reversed** — A one-time manual correction that was never removed\n3. **Timing gap** — Deduction change was sent to payroll after the payroll cutoff\n\n**The John Smith mismatch (DED-10001):** Expected $69.23/paycheck (PPO 500 EE Only) but payroll is deducting $200 — the old EE+Spouse rate. Root cause: payroll file was not updated after the June 2026 divorce life event processed.\n\n**Resolution:** Export a payroll correction file with the correct deduction amount and submit to the payroll provider.',
  },
  {
    patterns: ['qualifying life event', 'what qualifies', 'life event', 'qle'],
    answer: '**Qualifying Life Events (QLEs)** are specific events that allow employees to make mid-year benefit changes outside of Open Enrollment.\n\n**Common QLEs:**\n- **Marriage** — Add spouse; change from EE Only to EE+Spouse tier\n- **Divorce** — Remove spouse; change to EE Only tier\n- **Birth / Adoption** — Add new dependent; upgrade to EE+Child or Family tier\n- **Loss of Other Coverage** — Spouse or employee loses coverage from another plan\n- **Gain of Other Coverage** — Employee or dependent gains coverage elsewhere\n- **Death of Dependent** — Remove deceased dependent from coverage\n- **Domestic Partnership** — Add domestic partner (imputed income may apply)\n\nEmployees must report a life event within **30 days** of the event date. Failure to report in time forfeits the enrollment window.',
  },
  {
    patterns: ['enrollment window', 'how long', 'life event window', 'when do i have to'],
    answer: '**Life Event Enrollment Window** gives employees **30 days** from the qualifying life event date to make benefit changes.\n\nFor example: if you get married on June 15, you have until July 15 to submit your updated elections.\n\n**Important rules:**\n- Changes must be consistent with the life event (e.g., marriage → can add spouse, but cannot change medical plan design)\n- Missing the 30-day window means waiting until the next Open Enrollment period\n- Documentation must be submitted and verified before changes are finalized\n- HR can grant a 1-time extension in exceptional circumstances',
  },
  {
    patterns: ['documents life event', 'documents do i need', 'marriage certificate', 'birth certificate', 'what do i need to submit'],
    answer: '**Documents Required by Life Event Type:**\n\n| Life Event | Required Documentation |\n|---|---|\n| Marriage | Marriage Certificate |\n| Divorce | Divorce Decree |\n| Birth | Birth Certificate |\n| Adoption | Adoption Decree |\n| Loss of Other Coverage | Carrier Termination Letter |\n| Gain of Other Coverage | Proof of Other Coverage |\n| Death of Dependent | Death Certificate |\n| Domestic Partnership | Domestic Partnership Affidavit + Proof of joint residency |\n\nDocuments must be submitted to HR for verification. Coverage changes are not finalized until documentation is approved. Only the minimum required documents for the specific life event type are needed.',
  },
  {
    patterns: ['dependent rules', 'who can be covered', 'dependent eligibility', 'add dependent mid-year'],
    answer: '**Dependent Eligibility Rules** determine who can be added to an employee\'s coverage:\n\n- **Spouse** — Legal spouse; requires Marriage Certificate\n- **Domestic Partner** — Requires Domestic Partnership Affidavit and proof of joint residency; imputed income applies federally\n- **Child (natural/adopted/step)** — Eligible through the end of the month they turn 26; requires Birth Certificate\n- **Disabled Adult Child** — May continue beyond age 26 if continuously disabled before age 26; requires annual physician certification\n- **Stepchild** — Requires both Marriage Certificate (to custodial parent) and Birth Certificate\n\nDependents can only be **added mid-year** through a qualifying life event. They can be **removed** at any time.',
  },
  {
    patterns: ['cobra', 'what is cobra', 'cobra eligible', 'continuation coverage'],
    answer: '**COBRA (Consolidated Omnibus Budget Reconciliation Act)** allows employees and their dependents to continue their group health coverage after a qualifying event that would otherwise cause loss of coverage.\n\n**Who is eligible:**\n- Employees who voluntarily or involuntarily lose their job (excluding gross misconduct)\n- Employees whose hours are reduced below the eligibility threshold\n- Dependents who lose coverage due to divorce, death of the employee, or dependent aging out\n\n**How it works:**\n1. Employer has 30 days to notify the plan administrator of the qualifying event\n2. Plan administrator has 14 days to send the COBRA election notice\n3. Employee has 60 days from the later of coverage loss or notice to elect COBRA\n4. Coverage is retroactive to the date coverage was lost\n\nCOBRA coverage lasts up to 18 months (36 months for disability or dependent events).',
  },
  {
    patterns: ['cobra election window', 'how long cobra', 'cobra 60 days', 'elect cobra'],
    answer: '**COBRA Election Window** gives qualified beneficiaries **60 days** to decide whether to elect COBRA continuation coverage.\n\nThe 60-day window starts from the **later** of:\n- The date coverage is lost, OR\n- The date the COBRA election notice is sent\n\n**Important:** If you elect COBRA, your coverage is retroactive to the date you lost coverage — so there is no gap even if you wait the full 60 days.\n\n**After electing:** You have 45 days to pay the first premium (retroactive). Subsequent payments are due by the first of each coverage month with a 30-day grace period.\n\nFailing to elect within the 60-day window permanently forfeits COBRA rights for that qualifying event.',
  },
  {
    patterns: ['cobra payment', 'cobra missed payment', 'cobra lapsed', 'cobra cost'],
    answer: '**COBRA Premium Payments**\n\nCOBRA beneficiaries pay the **full premium** (both the employer and employee share) plus a **2% administrative fee**.\n\nFor example: If the employer was paying $400/month and the employee $150/month:\n- COBRA cost = ($400 + $150) × 1.02 = **$561/month**\n\n**Payment schedule:**\n- First payment due within 45 days of electing\n- Subsequent payments due by the 1st of each month\n- 30-day grace period applies after the due date\n\n**Missed payment:** If payment is not received within the 30-day grace period, COBRA coverage is **terminated retroactively** to the last paid month. You will receive a termination notice. Coverage cannot be reinstated after lapsing for non-payment.',
  },
  {
    patterns: ['aca', 'affordable care act', '1095', 'employer mandate', 'aca compliance'],
    answer: '**ACA (Affordable Care Act) Compliance** requires applicable large employers (ALEs — 50+ full-time equivalent employees) to:\n\n1. **Offer minimum essential coverage** to at least 95% of full-time employees (30+ hrs/week)\n2. **Coverage must be affordable** — employee premium for self-only coverage cannot exceed 9.86% of the employee\'s household income\n3. **Coverage must meet minimum value** — plan must pay at least 60% of covered costs\n4. **File annual reports:** \n   - **1094-C** — Employer transmittal form (sent to IRS)\n   - **1095-C** — Employee statement (copy to IRS and employee)\n\n**Failure to comply:** Employer Shared Responsibility Payments (ESRP) — up to $2,900/year per full-time employee if coverage is not offered.',
  },
  {
    patterns: ['compliance audit', 'audit trail', 'audit log', 'what is in the audit'],
    answer: '**Compliance Audit Trail** records all COBRA-related actions with timestamps, actors, and compliance notes:\n\n**Tracked events include:**\n- `COBRA_NOTICE_GENERATED` — When the qualifying event notice was created\n- `COBRA_NOTICE_SENT` — When the election notice was delivered (DOL requires within 44 days)\n- `COBRA_ELECTION` — When a beneficiary elects or declines coverage\n- `COBRA_PAYMENT_OVERDUE` — When a payment passes the 30-day grace period\n- `COBRA_LAPSED` — When coverage is terminated for non-payment\n- `TERMINATION_PROCESSED` — When an employment termination triggers a COBRA event\n- `ACA_1095C_GENERATED` — When annual ACA forms are produced\n\nThe audit trail is your compliance evidence. In a DOL audit, you must demonstrate that notices were sent within required timeframes.',
  },
  {
    patterns: ['executive summary', 'executive dashboard', 'what is the executive', 'kpi'],
    answer: '**Executive Summary Report** provides a high-level view of your Group Benefits platform health:\n\n- **Enrollment Rate** — % of eligible employees enrolled in at least one benefit\n- **Monthly Cost** — Total employer + employee premium spend\n- **Carrier Success Rate** — % of EDI 834 transactions accepted by carriers\n- **Open Exceptions** — Compliance or integration issues requiring HR action\n\nThe Executive Summary also shows a **Plan Mix** breakdown (which plans employees chose), a **Financial Summary** (projected annual cost vs. last year), and **Top Issues** flagged for priority resolution.\n\nThis report is generated quarterly and refreshed during Open Enrollment.',
  },
  {
    patterns: ['projected annual cost', 'how is the projected', 'annual cost calculated', 'vs last year'],
    answer: '**Projected Annual Cost** = Total Monthly Cost × 12.\n\nThis figure represents the combined employer + employee benefit premium spend if current enrollment and tier selections hold constant for the full year.\n\n**vs Last Year** is the year-over-year growth rate, factoring in:\n- Changes in enrollment headcount\n- Plan design changes and rate renewals\n- Tier mix shifts (employees moving from EE Only to Family coverage)\n\nA 4–6% annual increase is typical for group benefits. A spike above 10% usually signals a large enrollment increase, significant rate increase at renewal, or both.',
  },
  {
    patterns: ['compliance exception', 'what is an exception', 'open exception', 'how to resolve'],
    answer: '**Compliance Exceptions** are flagged issues that require HR action to maintain regulatory or contractual compliance.\n\n**ACA Exception example:** 12 employees with 1095-C forms not yet distributed — deadline Jan 31. Action: print and mail or distribute electronically before the deadline. Failure triggers IRS penalties.\n\n**COBRA Exception example:** COBRA election window expiring in 14 days. Action: confirm whether the beneficiary has responded; if not, attempt re-contact. After the window closes, COBRA rights are forfeited.\n\n**Documentation Exception example:** Life event enrollments awaiting supporting documents. Action: follow up with the employee to collect and verify the required documents before the event window closes.\n\nExceptions auto-clear when the underlying action is completed and recorded in the audit trail.',
  },
  {
    patterns: ['enrollment report', 'enrollment summary', 'enrollment by employer', 'enrollment by product'],
    answer: '**Enrollment Report** breaks down the Open Enrollment results across three dimensions:\n\n1. **By Employer** — Each employer\'s enrollment rate vs. their eligible headcount\n2. **By Product** — How many employees enrolled in Medical vs. Dental vs. Vision vs. Life vs. STD\n3. **Timeline** — A week-by-week chart showing enrollment completion rate through the enrollment window\n\nUse this report to identify low-adoption products (e.g., Vision at 48%) or underperforming employer groups that may benefit from additional communication campaigns before the next enrollment period.',
  },
  {
    patterns: ['carrier audit', 'carrier report', 'failure reason', 'carrier breakdown'],
    answer: '**Carrier Audit Report** analyzes the health of your EDI 834 carrier integrations:\n\n- **By Carrier** — Success rate and failure detail per carrier\n- **Failure Reasons** — The root cause breakdown of rejected transactions\n- **Resolution** — What % of failures have been corrected and resubmitted\n\nTypical targets: ≥97% success rate, avg resolution < 24 hours.\n\n**BlueCross BlueShield (95.2%)** is below target due to 23 SSN format mismatches in EDI 834. The fix is to standardize SSN formatting in the export pipeline to remove dashes before transmission.',
  },
  {
    patterns: ['what is this page', 'what can i do', 'help', 'explain this'],
    answer: 'I can help you understand anything on this page — plan year statuses, enrollment metrics, eligibility exceptions, carrier submissions, payroll deductions, employee eligibility, or product benefits.\n\nTry asking:\n- "What does the enrollment rate mean?"\n- "Explain eligibility exceptions"\n- "What is the difference between HSA and FSA?"\n- "What does DRAFT plan year mean?"',
  },
];

function findAnswer(message: string): string {
  const lower = message.toLowerCase();
  for (const entry of KB) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      return entry.answer;
    }
  }
  return 'I can explain enrollment rates, eligibility exceptions, carrier submissions, payroll deductions, plan year statuses, and employer configuration.\n\nTry rephrasing your question or choose one of the suggested prompts. Full AI assistance (Claude-powered Q&A) is coming in a later release.';
}

router.post('/chat', (req, res) => {
  const { message } = req.body as { message?: string };
  if (!message || typeof message !== 'string' || !message.trim()) {
    sendSuccess(res, { answer: 'Please enter a question.' });
    return;
  }
  const answer = findAnswer(message.trim());
  sendSuccess(res, { answer });
});

export default router;
