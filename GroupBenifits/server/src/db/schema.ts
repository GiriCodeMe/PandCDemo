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
}

export interface SearchResult {
  id: string;
  type: 'employer' | 'employee' | 'plan' | 'product' | 'carrier';
  name: string;
  subtitle: string;
  href: string;
  metadata: Record<string, unknown>;
}

export interface AuditEvent {
  id: string;
  actor: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  employerId: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface DashboardSnapshot {
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
