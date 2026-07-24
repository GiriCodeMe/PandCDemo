import { getStore } from '../db/FileStore';

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

export interface OpenEnrollmentPeriod {
  openEnrollmentId: string;
  employerGroupId: string;
  planYear: number;
  enrollmentName: string;
  status: string;
  startDateTime: string;
  endDateTime: string;
  eligiblePlans: string[];
  progress: {
    snapshotDate: string;
    eligibleEmployees: number;
    notStarted: number;
    inProgress: number;
    submitted: number;
    completed: number;
    exceptions: number;
  };
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
  hsaEligible?: boolean;
  status: string;
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

const wizardSessions = new Map<string, WizardSession>();

export const enrollmentService = {
  getOpenPeriod(employerId: string): OpenEnrollmentPeriod | null {
    const all = getStore().readArray<OpenEnrollmentPeriod>('enrollment/openEnrollmentPeriods');
    return all.find((o) => o.employerGroupId === employerId) ?? all[0] ?? null;
  },

  getByEmployeeId(employeeId: string): Enrollment | null {
    const all = getStore().readArray<Enrollment>('enrollment/enrollments');
    return all.find((e) => e.employeeId === employeeId) ?? null;
  },

  getAllEnrollments(employerId?: string): Enrollment[] {
    const all = getStore().readArray<Enrollment>('enrollment/enrollments');
    if (!employerId) return all;
    const employees = getStore().readArray<Record<string, unknown>>('employees/employees')
      .filter((e) => e.employerGroupId === employerId)
      .map((e) => e.employeeId as string);
    return all.filter((e) => employees.includes(e.employeeId));
  },

  getPlansForEnrollment(): Plan[] {
    return getStore().readArray<Plan>('products/plans').filter((p) => p.status === 'Active');
  },

  getRatesForPlan(planCode: string): PlanRate[] {
    return getStore().readArray<PlanRate>('products/rates').filter((r) => r.planCode === planCode);
  },

  getAllRates(): PlanRate[] {
    return getStore().readArray<PlanRate>('products/rates');
  },

  startWizard(employeeId: string): WizardSession {
    const sessionId = `WIZ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const existing = this.getByEmployeeId(employeeId);
    const elections: WizardElection[] = existing?.elections.map((e) => ({
      productType: e.productType,
      planCode: e.planCode,
      tierType: e.tierType,
      waived: false,
    })) ?? [];
    const session: WizardSession = { sessionId, employeeId, planYear: 2027, currentStep: 1, elections };
    wizardSessions.set(sessionId, session);
    return session;
  },

  getWizardSession(sessionId: string): WizardSession | null {
    return wizardSessions.get(sessionId) ?? null;
  },

  updateWizardStep(sessionId: string, step: number, elections: WizardElection[]): WizardSession | null {
    const session = wizardSessions.get(sessionId);
    if (!session) return null;
    session.currentStep = step;
    session.elections = elections;
    wizardSessions.set(sessionId, session);
    return session;
  },

  submitWizard(sessionId: string): { enrollmentId: string; status: string; effectiveDate: string } | null {
    const session = wizardSessions.get(sessionId);
    if (!session) return null;
    session.submittedAt = new Date().toISOString();
    wizardSessions.set(sessionId, session);
    return {
      enrollmentId: `ENR-${Date.now()}`,
      status: 'Pending',
      effectiveDate: '2027-01-01',
    };
  },

  calculatePremiumSummary(elections: WizardElection[]): {
    monthlyEmployeeTotal: number;
    monthlyEmployerTotal: number;
    perPaycheck: number;
    breakdown: Array<{ productType: string; planCode: string; tierType: string; employeeContribution: number; employerContribution: number }>;
  } {
    const rates = this.getAllRates();
    const breakdown: Array<{
      productType: string;
      planCode: string;
      tierType: string;
      employeeContribution: number;
      employerContribution: number;
    }> = [];

    let monthlyEmployeeTotal = 0;
    let monthlyEmployerTotal = 0;

    for (const election of elections) {
      if (election.waived || !election.planCode) continue;
      const rate = rates.find(
        (r) => r.planCode === election.planCode && r.tierType === election.tierType
      );
      if (!rate) continue;
      breakdown.push({
        productType: election.productType,
        planCode: election.planCode,
        tierType: election.tierType,
        employeeContribution: rate.employeeContribution,
        employerContribution: rate.employerContribution,
      });
      monthlyEmployeeTotal += rate.employeeContribution;
      monthlyEmployerTotal += rate.employerContribution;
    }

    return {
      monthlyEmployeeTotal,
      monthlyEmployerTotal,
      perPaycheck: Math.round((monthlyEmployeeTotal * 12) / 26 * 100) / 100,
      breakdown,
    };
  },
};
