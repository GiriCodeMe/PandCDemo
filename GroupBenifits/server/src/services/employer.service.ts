import { getStore } from '../db/FileStore';
import { Employer, PlanYear, DashboardSnapshot } from '../db/schema';

function derivePlanYears(employer: Employer): PlanYear[] {
  const currentYear = new Date(employer.effectiveDate).getFullYear();
  const nextYear = new Date(employer.renewalDate).getFullYear();
  const priorYear = currentYear - 1;
  return [
    {
      planYearId: 'PY-' + employer.employerId + '-' + nextYear,
      employerId: employer.employerId,
      year: nextYear,
      startDate: employer.renewalDate,
      endDate: nextYear + '-12-31',
      openEnrollmentStart: (nextYear - 1) + '-10-15',
      openEnrollmentEnd: (nextYear - 1) + '-11-15',
      status: 'DRAFT',
    },
    {
      planYearId: 'PY-' + employer.employerId + '-' + currentYear,
      employerId: employer.employerId,
      year: currentYear,
      startDate: employer.effectiveDate,
      endDate: currentYear + '-12-31',
      openEnrollmentStart: employer.enrollmentPeriodStart,
      openEnrollmentEnd: employer.enrollmentPeriodEnd,
      status: 'OPEN_ENROLLMENT',
    },
    {
      planYearId: 'PY-' + employer.employerId + '-' + priorYear,
      employerId: employer.employerId,
      year: priorYear,
      startDate: priorYear + '-01-01',
      endDate: priorYear + '-12-31',
      openEnrollmentStart: (priorYear - 1) + '-10-01',
      openEnrollmentEnd: (priorYear - 1) + '-11-15',
      status: 'ACTIVE',
    },
  ];
}

export const employerService = {
  getAll(): Employer[] {
    return getStore().readArray<Employer>('employers/employers');
  },
  getById(employerId: string): Employer | undefined {
    return getStore().findOne<Employer & Record<string,unknown>>('employers/employers', 'employerId', employerId) as Employer | undefined;
  },
  getPlanYears(employerId: string): PlanYear[] {
    const employer = this.getById(employerId);
    if (!employer) return [];
    return derivePlanYears(employer);
  },
  getDashboard(employerId: string): DashboardSnapshot | null {
    const employer = this.getById(employerId);
    if (!employer) return null;
    return getStore().readObject<DashboardSnapshot>('dashboard/dashboardSnapshot');
  },
};
