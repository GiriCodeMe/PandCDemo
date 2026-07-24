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
