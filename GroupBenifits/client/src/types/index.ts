export interface Employer {
  employerId: string;
  name: string;
  industry: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  numberOfEmployees: number;
  activeEmployees: number;
  effectiveDate: string;
  renewalDate: string;
  enrollmentPeriodStart: string;
  enrollmentPeriodEnd: string;
  states: string[];
  payrollFrequency: string;
  status: string;
  createdAt: string;
}

export interface PlanYear {
  planYearId: string;
  employerId: string;
  year: number;
  startDate: string;
  endDate: string;
  openEnrollmentStart: string;
  openEnrollmentEnd: string;
  status: 'DRAFT' | 'CONFIGURATION' | 'OPEN_ENROLLMENT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
}

export interface Persona {
  personaId: string;
  name: string;
  role: string;
  email: string;
  description: string;
  defaultScreen: string;
  permissions: string[];
  employeeId?: string;
}

export interface Employee {
  employeeId: string;
  employerId: string;
  divisionId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  hireDate: string;
  employmentStatus: string;
  employmentType?: string;
  jobClass?: string;
  department?: string;
  location: string;
  hoursPerWeek?: number;
  annualSalary?: number;
  eligibilityStatus: string;
  enrollmentStatus: string;
  medicalEligible?: boolean;
  dentalEligible?: boolean;
  visionEligible?: boolean;
  lifeEligible?: boolean;
}

export interface Dependent {
  dependentId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  dob: string;
  ssn: string;
  relationship: string;
  status: string;
}

export interface Product {
  productId: string;
  employerId: string;
  carrierId: string;
  name: string;
  type: string;
  description: string;
  effectiveDate: string;
  terminationDate: string | null;
  status: string;
  plans?: Plan[];
}

export interface Plan {
  planId: string;
  productId: string;
  carrierId: string;
  name: string;
  planCode: string;
  network?: string;
  deductible?: number;
  outOfPocketMax?: number;
  copay?: number;
  coinsurance?: number;
  status?: string;
  rates?: RateTier[];
}

export interface RateTier {
  tierId: string;
  planId: string;
  planCode: string;
  versionId: string;
  tierType: string;
  monthlyPremium: number;
  employerContribution: number;
  employeeContribution: number;
}

export interface Carrier {
  carrierId: string;
  name: string;
  type: string;
  status?: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
}

export interface BenefitsDocument {
  documentId: string;
  employerId: string;
  workspaceId: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  documentType: string;
  planYear: number;
  lifecycleState: string;
  uploadedAt: string;
  validatedAt?: string | null;
  extractedAt?: string | null;
  analyzedAt?: string | null;
  requirementsGeneratedAt?: string | null;
  pageCount?: number | null;
  extractedRuleCount?: number | null;
  conflictCount?: number | null;
  ambiguityCount?: number | null;
  uploadedBy: string;
}

export interface Requirement {
  requirementId: string;
  epicId?: string;
  type: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  sourceDocumentId?: string | null;
  createdAt: string;
}

export interface UserStory {
  storyId: string;
  epicId?: string;
  title: string;
  userRole: string;
  narrative: string;
  acceptanceCriteria?: string[];
  priority?: string;
  status?: string;
}

export interface BusinessRule {
  ruleId: string;
  category?: string;
  title: string;
  rule: string;
  rationale?: string;
  enforcementLevel?: string;
  sourceDocumentId?: string | null;
}

export interface GenerateResult {
  documentId: string;
  generatedAt: string;
  requirementsCount: number;
  userStoriesCount: number;
  businessRulesCount: number;
  requirements: Requirement[];
  userStories: UserStory[];
  businessRules: BusinessRule[];
  conflicts: Array<{ conflictId: string; description: string; severity: string; resolution: string }>;
  model: string;
  processingTimeMs: number;
}

export interface EligibilityCondition {
  field: string;
  operator: string;
  value: unknown;
}

export interface EligibilityRule {
  ruleId: string;
  employerId: string;
  productId?: string | null;
  name: string;
  description: string;
  conditions: EligibilityCondition[];
  waitingPeriodType: string;
  waitingPeriodDays: number;
  status: string;
  sourceDocumentRef?: string;
  conflictsWith?: string;
  conflictDescription?: string;
  ambiguityFlag?: boolean;
  ambiguityNote?: string;
  createdAt: string;
}

export interface DependentRule {
  ruleId: string;
  ruleType: string;
  description: string;
  ageLimit?: number | null;
  ageLimitType?: string | null;
  documentationRequired: string[];
  status: string;
}

export interface PlanConfigSummary {
  employerId: string;
  planYear: number;
  configurationStatus: string;
  productsCount: number;
  plansCount: number;
  rateVersionsCurrent: boolean;
  eligibilityRulesCount: number;
  openEnrollmentStatus: string;
  lastPublishedAt?: string | null;
  publishedBy?: string | null;
  configChecklist: Array<{ item: string; status: 'complete' | 'incomplete' | 'warning' }>;
}

export interface OpenEnrollmentPeriod {
  openEnrollmentId: string;
  employerGroupId: string;
  planYear: number;
  enrollmentName: string;
  status: string;
  startDateTime: string;
  endDateTime: string;
  eligiblePopulation: Record<string, unknown>;
  eligiblePlans: string[];
  progress: {
    eligibleEmployees: number;
    notStarted: number;
    inProgress: number;
    submitted: number;
    completed: number;
    exceptions: number;
  };
}

export interface EnrollmentElection {
  productType: string;
  planCode: string;
  tierId: string;
  tierType: string;
  monthlyEmployeeContribution: number;
}

export interface Enrollment {
  enrollmentId: string;
  employeeId: string;
  planYear: number;
  status: string;
  enrollmentSource: string;
  elections: EnrollmentElection[];
  effectiveDate: string;
  createdAt: string;
}

export interface PlanRate {
  tierId: string;
  planCode: string;
  tierType: string;
  monthlyPremium: number;
  employerContribution: number;
  employeeContribution: number;
}

export interface Plan {
  planId: string;
  productId: string;
  name: string;
  planCode: string;
  deductible?: number;
  outOfPocketMax?: number;
  copay?: number;
  specialistCopay?: number;
  erCopay?: number;
  coinsurance?: number;
  hsaEligible?: boolean;
  preventiveCoverage?: number;
  basicServicesCoverage?: number;
  majorServicesCoverage?: number;
  orthodontiaCoverage?: number;
  status?: string;
}

export interface PremiumSummary {
  monthlyEmployeeTotal: number;
  monthlyEmployerTotal: number;
  perPaycheck: number;
  breakdown: Array<{
    productType: string;
    planCode: string;
    tierType: string;
    employeeContribution: number;
    employerContribution: number;
  }>;
}

export interface WizardElection {
  productType: string;
  planCode: string | null;
  tierType: string;
  waived: boolean;
}

export interface WizardSession {
  sessionId: string;
  employeeId: string;
  planYear: number;
  currentStep: number;
  elections: WizardElection[];
  submittedAt?: string;
}

export interface SearchResult {
  id: string;
  type: 'employer' | 'employee' | 'plan' | 'product' | 'carrier';
  name: string;
  subtitle: string;
  href: string;
  metadata: Record<string, unknown>;
}

export interface DashboardMetrics {
  dashboardDate: string;
  planYear: number;
  employerId: string;
  employees: {
    total: number;
    eligible: number;
    eligibilityRate: number;
  };
  enrollment: {
    fullyEnrolled: number;
    partiallyEnrolled: number;
    pending: number;
    notEnrolled: number;
    totalEnrolled: number;
    enrollmentRate: number;
  };
  eligibility: {
    exceptions: number;
    openedThisWeek: number;
  };
  carrier: {
    submitted: number;
    accepted: number;
    pending: number;
    rejected: number;
    successRate: number;
  };
  payroll: {
    activeDeductions: number;
    pendingUpdates: number;
    reconciliationExceptions: number;
    successRate: number;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    timestamp: string;
    retryable: boolean;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
