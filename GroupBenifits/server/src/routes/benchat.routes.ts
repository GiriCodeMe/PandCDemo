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
