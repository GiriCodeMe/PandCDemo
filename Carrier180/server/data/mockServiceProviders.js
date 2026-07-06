const mockServiceProviders = [
  // ─── Orlando FL 32801 area ───────────────────────────────────────────────────
  {
    id: 'SP-001', type: 'plumber',
    name: 'Orlando Plumbing Masters',
    address: '456 Service Blvd, Orlando, FL 32803',
    phone: '(407) 555-0101', email: 'dispatch@orlandomasters.com',
    rating: 4.9, reviewCount: 234, distance: 2.1, zip: '32801', state: 'FL',
    availability: 'Available Today', nextSlot: 'Today 2:00 PM',
    specialties: ['Water Damage', 'Pipe Repair', 'Emergency Service', 'Mold Remediation'],
    carrier180Certified: true, yearsWithCarrier180: 6, claimsHandled: 142,
    license: 'FL-CFC-1516204'
  },
  {
    id: 'SP-002', type: 'plumber',
    name: 'Sunshine State Plumbing Co.',
    address: '789 Commerce Ave, Orlando, FL 32809',
    phone: '(407) 555-0145', email: 'info@sunshineplumbing.com',
    rating: 4.7, reviewCount: 189, distance: 5.8, zip: '32801', state: 'FL',
    availability: 'Available Tomorrow', nextSlot: 'Tomorrow 10:00 AM',
    specialties: ['Insurance Claims', 'Leak Detection', 'Water Heater Replacement'],
    carrier180Certified: true, yearsWithCarrier180: 4, claimsHandled: 98,
    license: 'FL-CFC-1518901'
  },
  {
    id: 'SP-003', type: 'plumber',
    name: 'FloodPro Services',
    address: '2100 Industrial Dr, Orlando, FL 32811',
    phone: '(407) 555-0178', email: 'claims@floodpro.com',
    rating: 4.5, reviewCount: 312, distance: 8.3, zip: '32801', state: 'FL',
    availability: 'Available Today', nextSlot: 'Today 4:30 PM',
    specialties: ['Flood Restoration', 'Water Extraction', 'Structural Drying'],
    carrier180Certified: true, yearsWithCarrier180: 8, claimsHandled: 267,
    license: 'FL-CFC-1500741'
  },
  {
    id: 'SP-004', type: 'plumber',
    name: 'Central FL Emergency Plumbing',
    address: '330 Main St, Kissimmee, FL 34744',
    phone: '(407) 555-0233', email: 'emergency@cfeplumbing.com',
    rating: 4.6, reviewCount: 155, distance: 18.4, zip: '32801', state: 'FL',
    availability: 'Available Today', nextSlot: 'Today 6:00 PM',
    specialties: ['Emergency 24/7', 'Commercial & Residential', 'Burst Pipes'],
    carrier180Certified: true, yearsWithCarrier180: 3, claimsHandled: 74,
    license: 'FL-CFC-1521003'
  },
  // Field Inspectors — Orlando FL area
  {
    id: 'SP-101', type: 'inspector',
    name: 'James Mitchell',
    title: 'Senior Field Adjuster — Carrier180 Certified',
    address: '22 Magnolia Ave, Orlando, FL 32804',
    phone: '(407) 555-0290', email: 'j.mitchell@carrier180-net.com',
    rating: 4.8, reviewCount: 198, distance: 4.5, zip: '32801', state: 'FL',
    availability: 'Available Today', nextSlot: 'Today 3:00 PM',
    specialties: ['Water Damage', 'Structural Assessment', 'Contents Valuation'],
    carrier180Certified: true, yearsWithCarrier180: 7, claimsHandled: 321,
    credentials: 'CFIP, AIC'
  },
  {
    id: 'SP-102', type: 'inspector',
    name: 'Sarah Chen',
    title: 'Lead Field Inspector — Large Loss',
    address: '8801 E Colonial Dr, Orlando, FL 32817',
    phone: '(407) 555-0344', email: 's.chen@carrier180-net.com',
    rating: 4.9, reviewCount: 267, distance: 7.2, zip: '32801', state: 'FL',
    availability: 'Available Tomorrow', nextSlot: 'Tomorrow 9:00 AM',
    specialties: ['Large Loss', 'Fraud Detection', 'Roof Assessment', 'Structural'],
    carrier180Certified: true, yearsWithCarrier180: 9, claimsHandled: 445,
    credentials: 'CPCU, CFIP'
  },
  {
    id: 'SP-103', type: 'inspector',
    name: 'Robert Williams',
    title: 'Field Adjuster',
    address: '1150 Americana Blvd, Eatonville, FL 32751',
    phone: '(407) 555-0189', email: 'r.williams@carrier180-net.com',
    rating: 4.7, reviewCount: 142, distance: 12.8, zip: '32801', state: 'FL',
    availability: 'Available Today', nextSlot: 'Today 5:00 PM',
    specialties: ['Water Damage', 'Fire Assessment', 'Contents'],
    carrier180Certified: true, yearsWithCarrier180: 5, claimsHandled: 213,
    credentials: 'AIC'
  },
  // ─── Miami FL 33109 area (claim 2026-102) ────────────────────────────────────
  {
    id: 'SP-201', type: 'inspector',
    name: 'Carlos Rivera',
    title: 'Senior Field Adjuster — Fire & SIU',
    address: '1500 Brickell Ave, Miami, FL 33131',
    phone: '(305) 555-0112', email: 'c.rivera@carrier180-net.com',
    rating: 4.8, reviewCount: 186, distance: 3.1, zip: '33109', state: 'FL',
    availability: 'Available Today', nextSlot: 'Today 2:30 PM',
    specialties: ['Fire Damage', 'SIU Support', 'Coastal Properties', 'Structural'],
    carrier180Certified: true, yearsWithCarrier180: 6, claimsHandled: 287,
    credentials: 'CFIP, CPCU'
  },
  {
    id: 'SP-202', type: 'inspector',
    name: 'Diana Perez, P.E.',
    title: 'Structural Engineer Inspector',
    address: '777 NW 72nd Ave, Miami, FL 33126',
    phone: '(305) 555-0278', email: 'd.perez@structuralassess.com',
    rating: 4.9, reviewCount: 312, distance: 8.4, zip: '33109', state: 'FL',
    availability: 'Available Tomorrow', nextSlot: 'Tomorrow 11:00 AM',
    specialties: ['Structural Engineering', 'Fire Investigation', 'Load-Bearing Assessment'],
    carrier180Certified: true, yearsWithCarrier180: 11, claimsHandled: 534,
    credentials: 'P.E., CFIP'
  },
  {
    id: 'SP-203', type: 'inspector',
    name: 'Marcus Johnson',
    title: 'Field Adjuster — Large Loss',
    address: '3300 NE 2nd Ave, Miami, FL 33137',
    phone: '(305) 555-0445', email: 'm.johnson@carrier180-net.com',
    rating: 4.6, reviewCount: 128, distance: 12.7, zip: '33109', state: 'FL',
    availability: 'Available Today', nextSlot: 'Today 4:00 PM',
    specialties: ['Fire Damage', 'Smoke Assessment', 'ALE Verification'],
    carrier180Certified: true, yearsWithCarrier180: 4, claimsHandled: 178,
    credentials: 'AIC, AINS'
  },
  // ─── Houston TX 77001 area (claim 2026-093) ──────────────────────────────────
  {
    id: 'SP-301', type: 'plumber',
    name: 'Houston Pro Services LLC',
    address: '4400 Main St, Houston, TX 77002',
    phone: '(713) 555-0189', email: 'claims@houstonpro.com',
    rating: 4.8, reviewCount: 221, distance: 2.6, zip: '77001', state: 'TX',
    availability: 'Available Today', nextSlot: 'Today 1:00 PM',
    specialties: ['Roof Repair', 'Wind Damage', 'Insurance Claims'],
    carrier180Certified: true, yearsWithCarrier180: 5, claimsHandled: 189,
    license: 'TX-M-40192'
  },
  {
    id: 'SP-302', type: 'inspector',
    name: 'Tom Bradford',
    title: 'Field Adjuster — Wind & Hail',
    address: '6100 Westheimer Rd, Houston, TX 77057',
    phone: '(713) 555-0334', email: 't.bradford@carrier180-net.com',
    rating: 4.7, reviewCount: 176, distance: 6.9, zip: '77001', state: 'TX',
    availability: 'Available Tomorrow', nextSlot: 'Tomorrow 8:00 AM',
    specialties: ['Wind & Hail', 'Roof Assessment', 'Xactimate', 'NWS Verification'],
    carrier180Certified: true, yearsWithCarrier180: 4, claimsHandled: 156,
    credentials: 'AIC, AINS'
  },
  {
    id: 'SP-303', type: 'inspector',
    name: 'Angela Torres',
    title: 'Senior Field Adjuster',
    address: '9800 Hillcroft Ave, Houston, TX 77096',
    phone: '(713) 555-0511', email: 'a.torres@carrier180-net.com',
    rating: 4.8, reviewCount: 204, distance: 11.3, zip: '77001', state: 'TX',
    availability: 'Available Today', nextSlot: 'Today 2:00 PM',
    specialties: ['Roof Damage', 'Storm Assessment', 'Contents Valuation'],
    carrier180Certified: true, yearsWithCarrier180: 6, claimsHandled: 245,
    credentials: 'CPCU, AIC'
  }
];

module.exports = mockServiceProviders;
