const API = '/api/reports';

export interface ExecutiveSummary {
  generatedAt: string;
  period: { label: string; start: string; end: string };
  enrollment: {
    totalEligible: number;
    totalEnrolled: number;
    enrollmentRate: number;
    newEnrollments: number;
    terminations: number;
    lifeEventChanges: number;
    waived: number;
    byPlan: Array<{ planCode: string; planName: string; enrolled: number; pct: number }>;
  };
  financials: {
    totalMonthlyCost: number;
    employerContribution: number;
    employeeContribution: number;
    avgCostPerEmployee: number;
    projectedAnnualCost: number;
    vsLastYear: number;
  };
  carriers: {
    totalTransactions: number;
    successRate: number;
    failed: number;
    pending: number;
    avgProcessingHours: number;
  };
  compliance: {
    aCA1095cFiled: number;
    aCA1095cPending: number;
    cobraActive: number;
    cobraElected: number;
    auditEventsThisQuarter: number;
    openExceptions: number;
  };
  topIssues: Array<{ id: string; category: string; description: string; severity: string; status: string }>;
}

export interface EnrollmentReport {
  reportId: string;
  title: string;
  period: string;
  generatedAt: string;
  summary: {
    totalEligible: number;
    totalEnrolled: number;
    totalWaived: number;
    enrollmentRate: number;
    completionByDeadline: number;
  };
  byEmployer: Array<{ employerId: string; employerName: string; eligible: number; enrolled: number; rate: number }>;
  byProduct: Array<{ productCode: string; productName: string; enrolled: number; eligible: number; rate: number; waived: number }>;
  byStatus: Record<string, number>;
  timeline: Array<{ date: string; label: string; enrolled: number }>;
}

export interface CarrierAuditReport {
  reportId: string;
  title: string;
  period: string;
  generatedAt: string;
  summary: {
    totalTransactions: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
    avgProcessingHours: number;
  };
  byCarrier: Array<{
    carrierId: string;
    carrierName: string;
    transactions: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
    topFailureReason: string;
  }>;
  failureReasons: Array<{ reason: string; count: number; pct: number }>;
  resolutionRate: { resolved: number; inProgress: number; open: number; avgResolutionHours: number };
}

export interface ComplianceReport {
  reportId: string;
  title: string;
  period: string;
  generatedAt: string;
  aca: {
    year: number;
    totalFullTimeEmployees: number;
    forms1095cGenerated: number;
    forms1095cFiled: number;
    forms1095cPending: number;
    form1094cStatus: string;
    irsSubmissionDate: string;
    employeeDistributionDeadline: string;
    employeeDistributed: number;
    employeePending: number;
  };
  cobra: {
    totalQBEs: number;
    active: number;
    elected: number;
    declined: number;
    lapsed: number;
    noticesGeneratedOnTime: number;
    noticesGeneratedLate: number;
    averageElectionDays: number;
    monthlyCobraCost: number;
  };
  hipaa: {
    pHIAccessAuditsConducted: number;
    violations: number;
    pendingRemediation: number;
    lastAuditDate: string;
  };
  auditTrail: { totalEvents: number; byType: Record<string, number> };
  openExceptions: Array<{ id: string; type: string; description: string; severity: string; dueDate: string }>;
}

async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

export const reportsApi = {
  getExecutiveSummary: () => fetchData<ExecutiveSummary>(`${API}/executive-summary`),
  getEnrollmentReport: () => fetchData<EnrollmentReport>(`${API}/enrollment`),
  getCarrierAuditReport: () => fetchData<CarrierAuditReport>(`${API}/carrier-audit`),
  getComplianceReport: () => fetchData<ComplianceReport>(`${API}/compliance`),
};
