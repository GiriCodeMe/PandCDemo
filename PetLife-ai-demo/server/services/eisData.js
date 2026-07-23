const EIS_POLICIES = [
  {
    policyNumber: 'PET-2026-991823',
    policy_id: 'POL-FRBL-2025-0042',
    ownerCustomerId: 'CUST-44129',
    petId: 'PET-7721',
    petName: 'Waffles',
    species: 'Canine',
    breed: 'Beagle',
    dob: '2022-05-10',
    holderName: 'Jordan Rivera',
    holderEmail: 'j.rivera@example.com',
    postcode: '08540',
    coverageType: 'ACCIDENT_ILLNESS',
    annualBenefitMax: 10000,
    deductible: 250,
    Accumulated_Deductible_Balance: 0,
    coinsurancePct: 20,
    termStart: '2026-06-01',
    termEnd: '2027-06-01',
    issueDate: '2026-06-01',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
    microchipId: '981020003445121',
    ownerPhone: '+1-609-555-0142',
    accumulatedBenefitUsed: 0,
    exclusionRiders: [],
  },
  {
    policyNumber: 'PET-2026-774512',
    policy_id: 'POL-GRET-2025-0089',
    ownerCustomerId: 'CUST-88204',
    petId: 'PET-3341',
    petName: 'Rocky',
    species: 'Canine',
    breed: 'German Shepherd',
    dob: '2019-02-28',
    holderName: 'Mia Thompson',
    holderEmail: 'mia.t@example.com',
    postcode: '90210',
    coverageType: 'COMPREHENSIVE',
    annualBenefitMax: 15000,
    deductible: 200,
    Accumulated_Deductible_Balance: 200,
    coinsurancePct: 10,
    termStart: '2025-11-01',
    termEnd: '2026-11-01',
    issueDate: '2025-11-01',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
    microchipId: '981020003887654',
    ownerPhone: '+1-310-555-0987',
    accumulatedBenefitUsed: 420,
    exclusionRiders: ['Left Knee Cruciate Exclusion'],
  },
  {
    policyNumber: 'PET-2026-330091',
    policy_id: 'POL-LBRD-2025-0201',
    ownerCustomerId: 'CUST-11730',
    petId: 'PET-9902',
    petName: 'Cleo',
    species: 'Feline',
    breed: 'Siamese',
    dob: '2020-08-14',
    holderName: 'Tyler Nguyen',
    holderEmail: 'tyler.n@example.com',
    postcode: '10001',
    coverageType: 'PREMIUM',
    annualBenefitMax: 25000,
    deductible: 100,
    Accumulated_Deductible_Balance: 100,
    coinsurancePct: 10,
    termStart: '2025-09-15',
    termEnd: '2026-09-15',
    issueDate: '2025-09-15',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
    microchipId: '981020004112233',
    ownerPhone: '+1-212-555-0356',
    accumulatedBenefitUsed: 100,
    exclusionRiders: [],
  },
  {
    policyNumber: 'PET-2026-558834',
    policy_id: 'POL-MCAT-2025-0412',
    ownerCustomerId: 'CUST-29017',
    petId: 'PET-5512',
    petName: 'Daisy',
    species: 'Canine',
    breed: 'Labrador Retriever',
    dob: '2021-11-03',
    holderName: 'Priya Sharma',
    holderEmail: 'p.sharma@example.com',
    postcode: '77001',
    coverageType: 'ACCIDENT_ILLNESS',
    annualBenefitMax: 8000,
    deductible: 300,
    Accumulated_Deductible_Balance: 150,
    coinsurancePct: 20,
    termStart: '2026-01-10',
    termEnd: '2027-01-10',
    issueDate: '2026-01-10',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
    microchipId: '981020004556677',
    ownerPhone: '+1-713-555-0211',
    accumulatedBenefitUsed: 150,
    exclusionRiders: [],
  },
  {
    policyNumber: 'PET-2026-119023',
    policy_id: 'POL-BCAT-2025-0156',
    ownerCustomerId: 'CUST-63901',
    petId: 'PET-1188',
    petName: 'Biscuit',
    species: 'Canine',
    breed: 'French Bulldog',
    dob: '2020-07-22',
    holderName: 'Michael Chen',
    holderEmail: 'mchen@example.com',
    postcode: '90210',
    coverageType: 'COMPREHENSIVE',
    annualBenefitMax: 15000,
    deductible: 250,
    Accumulated_Deductible_Balance: 0,
    coinsurancePct: 20,
    termStart: '2026-06-20',
    termEnd: '2027-06-20',
    issueDate: '2026-06-20',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
    microchipId: '981020004998877',
    ownerPhone: '+1-310-555-0654',
    accumulatedBenefitUsed: 0,
    exclusionRiders: ['BOAS Respiratory Exclusion'],
  },
];

const OPEN_CLAIMS = [
  {
    claimId: 'CLM-2026-00000001',
    petId: 'PET-3341',
    policyNumber: 'PET-2026-774512',
    primarySymptomCategory: 'Orthopedic',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    grossAmount: 420.00,
  },
];

function runTriageRules(payload, policy) {
  const triageResults = [];
  const today = new Date();
  const dos = new Date(payload.invoiceMetadata.dateOfService);
  const grossAmount = payload.invoiceMetadata.financialSummary.grossInvoiceAmount;
  const policyIssueDate = new Date(policy.issueDate);
  const termStart = new Date(policy.termStart);
  const petId = payload.claimantContext.petId;
  const symCategory = payload.customerDeclaration.primarySymptomCategory;

  const deductibleRemaining = policy.deductible - policy.Accumulated_Deductible_Balance;
  triageResults.push({
    ruleId: 'FNOL-T01',
    name: 'Account Deductible Sync',
    triggered: true,
    metadata: {
      annualDeductible: policy.deductible,
      accumulatedBalance: policy.Accumulated_Deductible_Balance,
      remainingDeductible: Math.max(0, deductibleRemaining),
      deductibleMet: deductibleRemaining <= 0,
    },
    note: deductibleRemaining <= 0
      ? `Deductible fully met ($${policy.deductible}). Claim processes at coinsurance rate only.`
      : `$${Math.max(0, deductibleRemaining).toFixed(2)} deductible balance remaining before reimbursement applies.`,
  });

  const windowMs = 14 * 24 * 60 * 60 * 1000;
  const relatedClaim = OPEN_CLAIMS.find(c =>
    c.petId === petId &&
    c.primarySymptomCategory === symCategory &&
    c.status === 'OPEN' &&
    (today - new Date(c.createdAt)) <= windowMs
  );
  triageResults.push({
    ruleId: 'FNOL-T02',
    name: 'Multi-Claim Triage Grouping',
    triggered: !!relatedClaim,
    metadata: relatedClaim ? { parentClaimId: relatedClaim.claimId, linkedAs: 'Supplemental Invoice Addendum' } : null,
    note: relatedClaim
      ? `Linked as Supplemental Invoice Addendum to ${relatedClaim.claimId}. Multi-deductible application prevented.`
      : 'No open claim within 14-day window for same symptom category. New claim file created.',
  });

  const daysSinceIssue = Math.floor((today - policyIssueDate) / (1000 * 60 * 60 * 24));
  const fraudTrigger = grossAmount > 3500 && daysSinceIssue <= 30;
  triageResults.push({
    ruleId: 'FNOL-T03',
    name: 'Immediate Fraud Scoring',
    triggered: fraudTrigger,
    metadata: fraudTrigger ? { flag: 'FRD-SUSPECT-NEW-POLICY', routedTo: 'SIU Workspace', grossAmount, daysSinceIssue } : null,
    note: fraudTrigger
      ? `FRD-SUSPECT-NEW-POLICY flag appended. Invoice $${grossAmount} + policy issued ${daysSinceIssue} days ago. Routed to SIU.`
      : `No fraud indicators. Invoice $${grossAmount.toFixed(2)} and policy age ${daysSinceIssue} days within normal parameters.`,
  });

  const illnessWaitMs = (policy.waitingPeriodDays?.illness || 14) * 24 * 60 * 60 * 1000;
  const waitEnd = new Date(termStart.getTime() + illnessWaitMs);
  const inWaitingPeriod = dos < waitEnd && dos >= termStart;
  triageResults.push({
    ruleId: 'FNOL-T04',
    name: 'Waiting Period Validation',
    triggered: inWaitingPeriod,
    metadata: inWaitingPeriod
      ? { priorityCode: 'WAITING_PERIOD_REVIEW', waitPeriodEnd: waitEnd.toISOString().split('T')[0], dateOfService: payload.invoiceMetadata.dateOfService }
      : null,
    note: inWaitingPeriod
      ? `Date of service ${payload.invoiceMetadata.dateOfService} falls within ${policy.waitingPeriodDays?.illness || 14}-day illness waiting period (ends ${waitEnd.toISOString().split('T')[0]}). Priority: WAITING_PERIOD_REVIEW.`
      : `Date of service ${payload.invoiceMetadata.dateOfService} is outside waiting period. Standard processing applies.`,
  });

  const routedToSIU = fraudTrigger;
  const linkedToParent = !!relatedClaim;
  const waitingPeriodReview = inWaitingPeriod;
  const overallTriage = routedToSIU ? 'SIU_REVIEW' : waitingPeriodReview ? 'WAITING_PERIOD_REVIEW' : 'STANDARD_PROCESSING';

  return { triageResults, overallTriage, linkedToParent, parentClaimId: relatedClaim?.claimId || null };
}

function generateClaimRef() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 90000000 + 10000000));
  return `CLM-${year}-${seq}`;
}

const MOCK_CLINICS = [
  { clinicId: 'CLINIC-NVA-0881', clinicName: 'Metropolitan Veterinary Hospital', pmsSystem: 'Cornerstone v9.2', city: 'Princeton, NJ', bankAccountMapped: true },
  { clinicId: 'CLINIC-NVA-0412', clinicName: 'Sunrise Animal Care Center', pmsSystem: 'e-VetPractice', city: 'Los Angeles, CA', bankAccountMapped: true },
  { clinicId: 'CLINIC-NVA-1204', clinicName: 'Eastside Emergency Vet', pmsSystem: 'SAGE/NVA', city: 'New York, NY', bankAccountMapped: true },
  { clinicId: 'CLINIC-PPG-0033', clinicName: 'Pinnacle Pet Clinic London', pmsSystem: 'CaptainVet', city: 'London, UK', bankAccountMapped: false },
];

module.exports = { EIS_POLICIES, OPEN_CLAIMS, runTriageRules, generateClaimRef, MOCK_CLINICS };
