const mockInvoices = [
  {
    id: 'INV-2026-001',
    claimId: '2026-108',
    vendorId: 'VND-001',
    vendorName: 'Restoration Pro',
    invoiceDate: '2026-03-17',
    dueDate: '2026-04-17',
    status: 'Pending Approval',
    lineItems: [
      { description: 'Water extraction — kitchen and adjacent areas', quantity: 1, unitCost: 1200, total: 1200 },
      { description: 'Structural drying — 5 day equipment rental', quantity: 5, unitCost: 350, total: 1750 },
      { description: 'Hardwood flooring removal and disposal', quantity: 420, unitCost: 4.50, total: 1890 },
      { description: 'Kitchen cabinet replacement (lower units)', quantity: 8, unitCost: 580, total: 4640 },
      { description: 'Subfloor repair', quantity: 1, unitCost: 2200, total: 2200 },
      { description: 'Mold preventative treatment', quantity: 1, unitCost: 850, total: 850 }
    ],
    subtotal: 12530,
    tax: 940,
    total: 13470,
    notes: 'Additional invoice for flooring replacement to follow upon completion of drying phase.'
  },
  {
    id: 'INV-2026-002',
    claimId: '2026-102',
    vendorId: 'VND-004',
    vendorName: 'FireShield Restoration',
    invoiceDate: '2026-03-12',
    dueDate: '2026-04-12',
    status: 'Pending Approval',
    lineItems: [
      { description: 'Emergency board-up and securing', quantity: 1, unitCost: 800, total: 800 },
      { description: 'Fire debris removal', quantity: 1, unitCost: 3200, total: 3200 },
      { description: 'Smoke and soot cleaning — kitchen/dining/living', quantity: 1, unitCost: 4500, total: 4500 },
      { description: 'HVAC duct cleaning', quantity: 1, unitCost: 1800, total: 1800 },
      { description: 'Odor neutralization treatment', quantity: 1, unitCost: 1200, total: 1200 }
    ],
    subtotal: 11500,
    tax: 862,
    total: 12362,
    notes: 'Structural repair estimate to follow after engineering assessment.'
  },
  {
    id: 'INV-2026-003',
    claimId: '2026-093',
    vendorId: 'VND-003',
    vendorName: 'Apex Roofing',
    invoiceDate: '2026-03-10',
    dueDate: '2026-04-10',
    status: 'Approved',
    lineItems: [
      { description: 'Emergency tarp installation', quantity: 1, unitCost: 450, total: 450 },
      { description: 'Shingle replacement — full roof (28 squares)', quantity: 28, unitCost: 380, total: 10640 },
      { description: 'Roof deck repair — damaged section (80 sq ft)', quantity: 80, unitCost: 8, total: 640 },
      { description: 'Ice and water shield installation', quantity: 1, unitCost: 620, total: 620 },
      { description: 'Ridge cap replacement', quantity: 1, unitCost: 380, total: 380 },
      { description: 'Debris removal and disposal', quantity: 1, unitCost: 320, total: 320 }
    ],
    subtotal: 13050,
    tax: 978,
    total: 14028,
    notes: 'Approved. Payment authorization issued.'
  }
];

module.exports = mockInvoices;
