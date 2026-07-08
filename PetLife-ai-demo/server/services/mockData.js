const policies = [
  {
    policy_id: 'POL-FRBL-2025-0042',
    member_id: 'MBR-00123',
    status: 'ACTIVE',
    holder: { name: 'Sarah Mitchell', email: 'sarah.mitchell@email.com', phone: '07700900001', postcode: 'SW1A 2AA', address: '14 Chester Square, London' },
    pet: { name: 'Biscuit', species: 'canine', breed: 'French Bulldog', dob: '2021-04-12', microchip: '826097400123456', colour: 'Fawn/White', sex: 'Male Neutered' },
    coverage: { type: 'ACCIDENT_ILLNESS', annual_benefit_max: 5000, deductible: 200, deductible_met: false, coinsurance_pct: 20, per_incident_max: 1500, category_limits: { DENTAL: 500, DIAGNOSTIC: 1000 } },
    dates: { start: '2025-01-01', renewal: '2026-01-01', inception: '2025-01-01' },
    premium: { monthly: 89.50, annual: 1074.00 },
    financials: { annual_benefit_used: 73.20, annual_benefit_remaining: 4926.80 },
    excluded_conditions: ['Atopic Dermatitis', 'BOAS'],
    excluded_codes: ['L20.89'],
    waiting_periods: { accident: '0 days', illness: '30 days', orthopaedic: '6 months' }
  },
  {
    policy_id: 'POL-GRET-2025-0089',
    member_id: 'MBR-00456',
    status: 'ACTIVE',
    holder: { name: 'James Thornton', email: 'james.t@email.com', phone: '07700900002', postcode: 'EC1A 1BB', address: '22 Barbican Estate, London' },
    pet: { name: 'Rosie', species: 'canine', breed: 'Golden Retriever', dob: '2019-08-15', microchip: '826097400234567', colour: 'Golden', sex: 'Female Spayed' },
    coverage: { type: 'COMPREHENSIVE', annual_benefit_max: 10000, deductible: 100, deductible_met: true, coinsurance_pct: 10, per_incident_max: 3000, category_limits: { DENTAL: 1000, DIAGNOSTIC: 2000 } },
    dates: { start: '2024-09-01', renewal: '2025-09-01', inception: '2024-09-01' },
    premium: { monthly: 124.00, annual: 1488.00 },
    financials: { annual_benefit_used: 1250.00, annual_benefit_remaining: 8750.00 },
    excluded_conditions: [],
    excluded_codes: [],
    waiting_periods: { accident: '0 days', illness: '30 days', orthopaedic: '6 months' }
  },
  {
    policy_id: 'POL-BCAT-2025-0156',
    member_id: 'MBR-00789',
    status: 'ACTIVE',
    holder: { name: 'Emma Clarke', email: 'emma.c@email.com', phone: '07700900003', postcode: 'M1 1AE', address: '8 Northern Quarter, Manchester' },
    pet: { name: 'Luna', species: 'feline', breed: 'British Shorthair', dob: '2020-03-22', microchip: '826097400345678', colour: 'Blue', sex: 'Female Spayed' },
    coverage: { type: 'STANDARD', annual_benefit_max: 4000, deductible: 150, deductible_met: false, coinsurance_pct: 20, per_incident_max: 1000, category_limits: { DENTAL: 300 } },
    dates: { start: '2025-03-01', renewal: '2026-03-01', inception: '2025-03-01' },
    premium: { monthly: 45.00, annual: 540.00 },
    financials: { annual_benefit_used: 0, annual_benefit_remaining: 4000 },
    excluded_conditions: [],
    excluded_codes: [],
    waiting_periods: { accident: '0 days', illness: '30 days', orthopaedic: '6 months' }
  },
  {
    policy_id: 'POL-LBRD-2025-0201',
    member_id: 'MBR-01012',
    status: 'ACTIVE',
    holder: { name: 'Oliver Patel', email: 'o.patel@email.com', phone: '07700900004', postcode: 'B1 1BB', address: '45 Brindleyplace, Birmingham' },
    pet: { name: 'Max', species: 'canine', breed: 'Labrador Retriever', dob: '2017-11-30', microchip: '826097400456789', colour: 'Black', sex: 'Male Neutered' },
    coverage: { type: 'PREMIUM', annual_benefit_max: 7500, deductible: 250, deductible_met: true, coinsurance_pct: 15, per_incident_max: 2000, category_limits: { DENTAL: 750, DIAGNOSTIC: 1500, ORTHOPAEDIC: 2000 } },
    dates: { start: '2023-01-15', renewal: '2026-01-15', inception: '2023-01-15' },
    premium: { monthly: 98.75, annual: 1185.00 },
    financials: { annual_benefit_used: 3200.00, annual_benefit_remaining: 4300.00 },
    excluded_conditions: ['Hip Dysplasia'],
    excluded_codes: ['M16.9'],
    waiting_periods: { accident: '0 days', illness: '30 days', orthopaedic: '6 months' }
  },
  {
    policy_id: 'POL-PMIX-2024-0334',
    member_id: 'MBR-01345',
    status: 'LAPSED',
    holder: { name: 'Sophia Williams', email: 's.williams@email.com', phone: '07700900005', postcode: 'EH1 1YZ', address: '3 Royal Mile, Edinburgh' },
    pet: { name: 'Pepper', species: 'canine', breed: 'Poodle Mix', dob: '2018-06-10', microchip: '826097400567890', colour: 'Cream', sex: 'Female Spayed' },
    coverage: { type: 'BASIC', annual_benefit_max: 2000, deductible: 300, deductible_met: false, coinsurance_pct: 25, per_incident_max: 500, category_limits: {} },
    dates: { start: '2024-06-01', renewal: '2025-06-01', inception: '2024-06-01' },
    premium: { monthly: 32.00, annual: 384.00 },
    financials: { annual_benefit_used: 0, annual_benefit_remaining: 2000 },
    excluded_conditions: [],
    excluded_codes: [],
    waiting_periods: { accident: '0 days', illness: '30 days', orthopaedic: '6 months' }
  },
  {
    policy_id: 'POL-MCAT-2025-0412',
    member_id: 'MBR-01678',
    status: 'ACTIVE',
    holder: { name: 'Aisha Rahman', email: 'a.rahman@email.com', phone: '07700900006', postcode: 'LS1 1BA', address: '12 Merrion Street, Leeds' },
    pet: { name: 'Mochi', species: 'feline', breed: 'Maine Coon', dob: '2022-09-05', microchip: '826097400678901', colour: 'Brown Tabby', sex: 'Male Neutered' },
    coverage: { type: 'ACCIDENT_ILLNESS', annual_benefit_max: 6000, deductible: 200, deductible_met: false, coinsurance_pct: 20, per_incident_max: 2000, category_limits: { DENTAL: 600, DIAGNOSTIC: 1200 } },
    dates: { start: '2025-02-15', renewal: '2026-02-15', inception: '2025-02-15' },
    premium: { monthly: 62.50, annual: 750.00 },
    financials: { annual_benefit_used: 280.00, annual_benefit_remaining: 5720.00 },
    excluded_conditions: [],
    excluded_codes: [],
    waiting_periods: { accident: '0 days', illness: '30 days', orthopaedic: '6 months' }
  }
];

const billingRecords = [
  { id: 'BIL-2025-001', policy_id: 'POL-FRBL-2025-0042', holder: 'Sarah Mitchell', pet: 'Biscuit', type: 'PREMIUM', amount: 89.50, due_date: '2025-07-01', paid_date: '2025-07-01', status: 'PAID', method: 'Direct Debit', period: 'July 2025' },
  { id: 'BIL-2025-002', policy_id: 'POL-FRBL-2025-0042', holder: 'Sarah Mitchell', pet: 'Biscuit', type: 'PREMIUM', amount: 89.50, due_date: '2025-08-01', paid_date: null, status: 'PENDING', method: 'Direct Debit', period: 'August 2025' },
  { id: 'BIL-2025-003', policy_id: 'POL-GRET-2025-0089', holder: 'James Thornton', pet: 'Rosie', type: 'PREMIUM', amount: 124.00, due_date: '2025-07-01', paid_date: '2025-07-01', status: 'PAID', method: 'Card', period: 'July 2025' },
  { id: 'BIL-2025-004', policy_id: 'POL-BCAT-2025-0156', holder: 'Emma Clarke', pet: 'Luna', type: 'PREMIUM', amount: 45.00, due_date: '2025-07-01', paid_date: '2025-07-02', status: 'PAID', method: 'Direct Debit', period: 'July 2025' },
  { id: 'BIL-2025-005', policy_id: 'POL-LBRD-2025-0201', holder: 'Oliver Patel', pet: 'Max', type: 'CLAIM_REIMBURSEMENT', amount: -450.00, due_date: '2025-06-15', paid_date: '2025-06-18', status: 'PAID', method: 'Bank Transfer', period: 'June 2025' },
  { id: 'BIL-2025-006', policy_id: 'POL-LBRD-2025-0201', holder: 'Oliver Patel', pet: 'Max', type: 'PREMIUM', amount: 98.75, due_date: '2025-07-15', paid_date: null, status: 'OVERDUE', method: 'Direct Debit', period: 'July 2025' },
  { id: 'BIL-2025-007', policy_id: 'POL-PMIX-2024-0334', holder: 'Sophia Williams', pet: 'Pepper', type: 'PREMIUM', amount: 32.00, due_date: '2025-06-01', paid_date: null, status: 'OVERDUE', method: 'Direct Debit', period: 'June 2025' },
  { id: 'BIL-2025-008', policy_id: 'POL-MCAT-2025-0412', holder: 'Aisha Rahman', pet: 'Mochi', type: 'PREMIUM', amount: 62.50, due_date: '2025-07-15', paid_date: '2025-07-14', status: 'PAID', method: 'Card', period: 'July 2025' },
  { id: 'BIL-2025-009', policy_id: 'POL-GRET-2025-0089', holder: 'James Thornton', pet: 'Rosie', type: 'CLAIM_REIMBURSEMENT', amount: -890.00, due_date: '2025-07-10', paid_date: '2025-07-12', status: 'PAID', method: 'Bank Transfer', period: 'July 2025' },
  { id: 'BIL-2025-010', policy_id: 'POL-FRBL-2025-0042', holder: 'Sarah Mitchell', pet: 'Biscuit', type: 'CLAIM_REIMBURSEMENT', amount: -73.20, due_date: '2025-06-20', paid_date: '2025-06-22', status: 'PAID', method: 'Bank Transfer', period: 'June 2025' }
];

const claimsHistory = [
  { claim_id: 'CLM-2025-0847', policy_id: 'POL-FRBL-2025-0042', pet: 'Biscuit', holder: 'Sarah Mitchell', submitted: '2025-03-20', status: 'PARTIALLY_APPROVED', billed: 659.50, approved: 73.20, condition: 'Atopic Dermatitis' },
  { claim_id: 'CLM-2025-0721', policy_id: 'POL-GRET-2025-0089', pet: 'Rosie', holder: 'James Thornton', submitted: '2025-06-12', status: 'APPROVED', billed: 1250.00, approved: 890.00, condition: 'ACL Repair' },
  { claim_id: 'CLM-2025-0654', policy_id: 'POL-LBRD-2025-0201', pet: 'Max', holder: 'Oliver Patel', submitted: '2025-05-30', status: 'APPROVED', billed: 680.00, approved: 450.00, condition: 'Ear Infection' },
  { claim_id: 'CLM-2025-0589', policy_id: 'POL-MCAT-2025-0412', pet: 'Mochi', holder: 'Aisha Rahman', submitted: '2025-04-15', status: 'DENIED', billed: 320.00, approved: 0, condition: 'Dental (waiting period)' },
  { claim_id: 'CLM-2025-0512', policy_id: 'POL-BCAT-2025-0156', pet: 'Luna', holder: 'Emma Clarke', submitted: '2025-07-01', status: 'PENDING', billed: 475.00, approved: null, condition: 'Urinary Tract Infection' }
];

const dashboardStats = {
  active_policies: 5,
  lapsed_policies: 1,
  open_claims: 3,
  pending_underwriting: 2,
  monthly_premium_collected: 419.75,
  fraud_alerts: 1,
  claim_approval_rate: 72,
  avg_claim_value: 668.50
};

module.exports = { policies, billingRecords, claimsHistory, dashboardStats };
