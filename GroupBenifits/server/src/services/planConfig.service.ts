import { getStore } from '../db/FileStore';

export interface PlanConfigSummary {
  employerId: string;
  planYear: number;
  configurationStatus: 'DRAFT' | 'CONFIGURED' | 'REVIEW' | 'PUBLISHED';
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
  progress: Record<string, unknown>;
}

export const planConfigService = {
  getSummary(employerId: string): PlanConfigSummary {
    const products = getStore().readArray<Record<string, unknown>>('products/products')
      .filter((p) => p.employerId === employerId || !p.employerId);
    const plans = getStore().readArray<Record<string, unknown>>('products/plans');
    const rules = getStore().readArray<Record<string, unknown>>('eligibility/eligibilityRules')
      .filter((r) => r.employerId === employerId);
    const oeData = getStore().readArray<OpenEnrollmentPeriod>('enrollment/openEnrollmentPeriods');
    const oe = oeData.find((o) => o.employerGroupId === employerId) ?? oeData[0];

    return {
      employerId,
      planYear: 2027,
      configurationStatus: 'PUBLISHED',
      productsCount: products.length,
      plansCount: plans.length,
      rateVersionsCurrent: true,
      eligibilityRulesCount: rules.length,
      openEnrollmentStatus: oe?.status ?? 'DRAFT',
      lastPublishedAt: '2026-09-15T14:00:00Z',
      publishedBy: 'Benefits Admin',
      configChecklist: [
        { item: 'Products defined', status: 'complete' },
        { item: 'Plans configured with rates', status: 'complete' },
        { item: 'Rate versions published', status: 'complete' },
        { item: 'Eligibility rules set', status: 'complete' },
        { item: 'Dependent rules set', status: 'complete' },
        { item: 'Waiting periods configured', status: 'complete' },
        { item: 'Carrier file mapping', status: 'complete' },
        { item: 'Open enrollment window set', status: 'complete' },
        { item: 'Conflict rules resolved', status: 'warning' },
        { item: 'HR sign-off received', status: 'incomplete' },
      ],
    };
  },

  getOpenEnrollment(employerId: string): OpenEnrollmentPeriod | null {
    const all = getStore().readArray<OpenEnrollmentPeriod>('enrollment/openEnrollmentPeriods');
    return all.find((o) => o.employerGroupId === employerId) ?? all[0] ?? null;
  },
};
