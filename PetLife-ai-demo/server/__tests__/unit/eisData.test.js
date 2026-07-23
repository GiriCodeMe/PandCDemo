const { EIS_POLICIES, runTriageRules, generateClaimRef } = require('../../services/eisData');

const ROCKY = EIS_POLICIES.find(p => p.policyNumber === 'PET-2026-774512'); // deductible fully met
const WAFFLES = EIS_POLICIES.find(p => p.policyNumber === 'PET-2026-991823'); // deductible not met

function makePayload(grossAmount = 500, petId = ROCKY.petId) {
  return {
    invoiceMetadata: {
      dateOfService: new Date().toISOString().split('T')[0],
      financialSummary: { grossInvoiceAmount: grossAmount },
    },
    claimantContext: { petId },
    customerDeclaration: { primarySymptomCategory: 'General Illness' },
  };
}

describe('EIS_POLICIES — data integrity', () => {
  test('contains exactly 5 policies', () => {
    expect(EIS_POLICIES).toHaveLength(5);
  });

  test('all policies have required fields', () => {
    EIS_POLICIES.forEach(p => {
      expect(p.policyNumber).toBeTruthy();
      expect(p.petId).toBeTruthy();
      expect(typeof p.deductible).toBe('number');
      expect(typeof p.Accumulated_Deductible_Balance).toBe('number');
      expect(typeof p.coinsurancePct).toBe('number');
      expect(typeof p.annualBenefitMax).toBe('number');
      expect(['ACTIVE', 'LAPSED', 'IN_DUNNING']).toContain(p.status);
    });
  });

  test('accumulated deductible never exceeds deductible', () => {
    EIS_POLICIES.forEach(p => {
      expect(p.Accumulated_Deductible_Balance).toBeLessThanOrEqual(p.deductible);
    });
  });

  test('policy numbers are unique', () => {
    const numbers = EIS_POLICIES.map(p => p.policyNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});

describe('generateClaimRef', () => {
  test('returns a string starting with CLM-', () => {
    expect(generateClaimRef()).toMatch(/^CLM-/);
  });

  test('generates unique refs across multiple calls', () => {
    const refs = new Set(Array.from({ length: 20 }, () => generateClaimRef()));
    expect(refs.size).toBe(20);
  });
});

describe('runTriageRules', () => {
  test('returns overallTriage string for valid payload', () => {
    const { overallTriage } = runTriageRules(makePayload(), ROCKY);
    expect(typeof overallTriage).toBe('string');
    expect(overallTriage.length).toBeGreaterThan(0);
  });

  test('returns triageResults array with at least one rule', () => {
    const { triageResults } = runTriageRules(makePayload(), ROCKY);
    expect(Array.isArray(triageResults)).toBe(true);
    expect(triageResults.length).toBeGreaterThan(0);
  });

  test('FNOL-T01 deductible sync rule fires', () => {
    const { triageResults } = runTriageRules(makePayload(), ROCKY);
    const rule = triageResults.find(r => r.ruleId === 'FNOL-T01');
    expect(rule).toBeDefined();
    expect(rule.triggered).toBe(true);
  });

  test('policy with fully-met deductible: metadata.remainingDeductible = 0 and deductibleMet = true', () => {
    // Rocky: deductible=200, accumulated=200
    const { triageResults } = runTriageRules(makePayload(), ROCKY);
    const rule = triageResults.find(r => r.ruleId === 'FNOL-T01');
    expect(rule.metadata.remainingDeductible).toBe(0);
    expect(rule.metadata.deductibleMet).toBe(true);
  });

  test('policy with unmet deductible: metadata.remainingDeductible = deductible amount', () => {
    // Waffles: deductible=250, accumulated=0
    const { triageResults } = runTriageRules(makePayload(500, WAFFLES.petId), WAFFLES);
    const rule = triageResults.find(r => r.ruleId === 'FNOL-T01');
    expect(rule.metadata.remainingDeductible).toBe(250);
    expect(rule.metadata.deductibleMet).toBe(false);
  });
});
