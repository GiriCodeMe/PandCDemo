const mockPolicies = {
  '2024-001': {
    policyNumber: '2024-001',
    customerId: 'CUST-001',
    type: 'HO-3 Standard Homeowners',
    status: 'Active',
    effectiveDate: '2024-01-01',
    expirationDate: '2025-01-01',
    annualPremium: 2400,
    premiumStatus: 'Current — Paid',
    state: 'Florida (FL)',
    property: {
      address: '123 Main St, Orlando, FL 32801',
      constructionType: 'Frame',
      yearBuilt: 1998,
      squareFootage: 2100
    },
    coverages: {
      dwelling:         { limit: 350000, deductible: 1000, included: true },
      otherStructures:  { limit: 35000,  deductible: 1000, included: true },
      personalProperty: { limit: 175000, deductible: 1000, included: true },
      lossOfUse:        { limit: 70000,  durationMonths: 12, included: true },
      liability:        { limit: 300000, included: true },
      medicalPayments:  { limit: 5000,   included: true },
      waterDamage:      { included: true, deductible: 1000 },
      moldRemediation:  { included: true, sublimit: 25000 },
      sewerBackup:      { included: true, sublimit: 10000 }
    },
    exclusions: ['Flood', 'Earthquake', 'Intentional acts'],
    priorClaims: 1
  },
  '2024-002': {
    policyNumber: '2024-002',
    customerId: 'CUST-002',
    type: 'HO-3 Standard Homeowners',
    status: 'Active',
    effectiveDate: '2024-02-01',
    expirationDate: '2025-02-01',
    annualPremium: 3200,
    premiumStatus: 'Current — Paid',
    state: 'Florida (FL)',
    property: {
      address: '456 Oak Avenue, Miami, FL 33109',
      constructionType: 'Masonry',
      yearBuilt: 2005,
      squareFootage: 2800
    },
    coverages: {
      dwelling:         { limit: 480000, deductible: 2500, included: true },
      otherStructures:  { limit: 48000,  deductible: 2500, included: true },
      personalProperty: { limit: 240000, deductible: 2500, included: true },
      lossOfUse:        { limit: 96000,  durationMonths: 24, included: true },
      liability:        { limit: 500000, included: true },
      medicalPayments:  { limit: 5000,   included: true },
      fire:             { included: true, deductible: 2500 },
      smokeDamage:      { included: true, deductible: 2500 },
      ale:              { included: true, dailyLimit: 200 }
    },
    exclusions: ['Flood', 'Earthquake'],
    priorClaims: 2
  },
  '2024-003': {
    policyNumber: '2024-003',
    customerId: 'CUST-003',
    type: 'HO-3 Standard Homeowners',
    status: 'Active',
    effectiveDate: '2024-03-01',
    expirationDate: '2025-03-01',
    annualPremium: 1800,
    premiumStatus: 'Current — Paid',
    state: 'Texas (TX)',
    property: {
      address: '789 Pine Circle, Houston, TX 77001',
      constructionType: 'Frame',
      yearBuilt: 2012,
      squareFootage: 1750
    },
    coverages: {
      dwelling:         { limit: 280000, deductible: 1500, included: true },
      otherStructures:  { limit: 28000,  deductible: 1500, included: true },
      personalProperty: { limit: 140000, deductible: 1500, included: true },
      lossOfUse:        { limit: 56000,  durationMonths: 12, included: true },
      liability:        { limit: 300000, included: true },
      medicalPayments:  { limit: 5000,   included: true },
      windDamage:       { included: true, deductible: 1500 },
      hailDamage:       { included: true, deductible: 1500 }
    },
    exclusions: ['Flood', 'Earthquake'],
    priorClaims: 0
  }
};

module.exports = mockPolicies;
