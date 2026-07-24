import { getStore } from '../db/FileStore';

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

export const eligibilityService = {
  getRules(employerId?: string): EligibilityRule[] {
    const all = getStore().readArray<EligibilityRule>('eligibility/eligibilityRules');
    if (employerId) return all.filter((r) => r.employerId === employerId);
    return all;
  },

  getRuleById(ruleId: string): EligibilityRule | undefined {
    return getStore().findOne<EligibilityRule & Record<string, unknown>>(
      'eligibility/eligibilityRules',
      'ruleId',
      ruleId,
    ) as EligibilityRule | undefined;
  },

  getDependentRules(): DependentRule[] {
    return getStore().readArray<DependentRule>('eligibility/dependentRules');
  },

  evaluateEmployee(ruleId: string, employeeData: Record<string, unknown>): {
    eligible: boolean;
    rule: EligibilityRule | undefined;
    failedConditions: EligibilityCondition[];
    waitingPeriodEndDate?: string;
  } {
    const rule = this.getRuleById(ruleId);
    if (!rule) return { eligible: false, rule: undefined, failedConditions: [] };

    const failedConditions: EligibilityCondition[] = [];
    for (const cond of rule.conditions) {
      const empVal = employeeData[cond.field];
      let passes = false;
      switch (cond.operator) {
        case 'equals':
          passes = empVal === cond.value;
          break;
        case 'greater_than_or_equal':
          passes = Number(empVal) >= Number(cond.value);
          break;
        case 'less_than_or_equal':
          passes = Number(empVal) <= Number(cond.value);
          break;
        case 'in':
          passes = Array.isArray(cond.value) && (cond.value as unknown[]).includes(empVal);
          break;
        default:
          passes = true;
      }
      if (!passes) failedConditions.push(cond);
    }

    const eligible = failedConditions.length === 0;
    let waitingPeriodEndDate: string | undefined;
    if (eligible && employeeData.hireDate && rule.waitingPeriodDays > 0) {
      const hire = new Date(employeeData.hireDate as string);
      hire.setDate(hire.getDate() + rule.waitingPeriodDays);
      waitingPeriodEndDate = hire.toISOString().slice(0, 10);
    }
    return { eligible, rule, failedConditions, waitingPeriodEndDate };
  },
};
