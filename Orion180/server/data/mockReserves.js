const mockReserves = {
  '2026-108': {
    claimId: '2026-108',
    totalReserve: 50000,
    lastUpdated: '2026-03-15',
    breakdown: [
      { category: 'Dwelling Repair', allocated: 28000, paid: 0, status: 'Open' },
      { category: 'Personal Property', allocated: 12000, paid: 0, status: 'Open' },
      { category: 'Mold Remediation', allocated: 5000, paid: 0, status: 'Open' },
      { category: 'Additional Living Expense', allocated: 3000, paid: 0, status: 'Open' },
      { category: 'Adjusting Expense', allocated: 2000, paid: 0, status: 'Open' }
    ],
    payments: []
  },
  '2026-102': {
    claimId: '2026-102',
    totalReserve: 52800,
    lastUpdated: '2026-03-10',
    breakdown: [
      { category: 'Dwelling Repair', allocated: 35000, paid: 0, status: 'Open' },
      { category: 'Personal Property', allocated: 8000, paid: 0, status: 'Open' },
      { category: 'Additional Living Expense', allocated: 6000, paid: 800, status: 'Open' },
      { category: 'Smoke Remediation', allocated: 2800, paid: 0, status: 'Open' },
      { category: 'Adjusting Expense', allocated: 1000, paid: 0, status: 'Open' }
    ],
    payments: [
      { id: 'PAY-001', date: '2026-03-11', amount: 800, category: 'Additional Living Expense', payee: 'Mary Johnson', description: 'ALE advance — hotel accommodation', status: 'Issued' }
    ]
  },
  '2026-093': {
    claimId: '2026-093',
    totalReserve: 18450,
    lastUpdated: '2026-03-08',
    breakdown: [
      { category: 'Roof Repair', allocated: 14028, paid: 14028, status: 'Paid' },
      { category: 'Emergency Tarp', allocated: 450, paid: 450, status: 'Paid' },
      { category: 'Interior Inspection', allocated: 2000, paid: 0, status: 'Open' },
      { category: 'Adjusting Expense', allocated: 1972, paid: 0, status: 'Open' }
    ],
    payments: [
      { id: 'PAY-002', date: '2026-03-14', amount: 14478, category: 'Roof Repair + Emergency Tarp', payee: 'Apex Roofing', description: 'Payment for approved invoice INV-2026-003', status: 'Issued' }
    ]
  }
};

module.exports = mockReserves;
