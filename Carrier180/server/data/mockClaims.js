const mockClaims = [
  {
    id: '2026-108',
    policyNumber: '2024-001',
    customerId: 'CUST-001',
    insuredName: 'John Smith',
    causeOfLoss: 'Water Damage',
    claimAmount: 50000,
    dateOfLoss: '2026-03-15',
    dateSubmitted: '2026-03-15',
    status: 'New',
    adjuster: 'Jane Doe',
    fraudRisk: 'Medium',
    aiSentiment: 'Neutral',
    insuredSegmentation: 'Gold',
    isHomeLivable: true,
    typeOfLoss: 'Property',
    primaryPeril: 'Sudden and Accidental discharge or overflow of water or steam',
    initialReserves: 50000,
    fnolNarrative: 'On Mar 15, 2026 at approximately 08:30 EST, the policyholder discovered a significant water intrusion event in the kitchen. The initial assessment suggests a burst supply line behind the vanity cabinet. Water migrated through the floor into the kitchen cabinets. The policyholder immediately contacted emergency mitigation services (Restoration Pro) who are currently on-site performing water extraction and structural drying. No structural integrity issues reported yet, but high-end hardwood flooring in the kitchen shows signs of early cupping.',
    address: {
      line1: '123 Main St',
      line2: 'Plot no 1254',
      city: 'Orlando',
      state: 'FL',
      zip: '32801'
    },
    contact: {
      phone: '202-555-0143',
      email: 'john.smith@example.com'
    },
    documents: [
      { id: 'doc-1', name: 'repair_invoice.pdf', description: 'Invoice from Restoration Pro to replace the damaged kitchen floor and cabinets', size: '3.1MB', uploadedAt: '2026-03-15T14:22:00Z', url: '/sample-docs/repair-invoice.html' },
      { id: 'doc-2', name: 'damaged_flooring.jpg', description: 'Insured images of damaged flooring and cabinets', size: '4.2MB', uploadedAt: '2026-03-15T14:20:00Z', url: '/sample-docs/damaged-flooring.html' },
      { id: 'doc-iot-1', name: 'IoT Sensor Data', description: 'Smart home sensor readings at time of loss — water, humidity, temperature', size: 'Live Feed', uploadedAt: '2026-03-15T08:30:00Z', type: 'iot' }
    ],
    iotSensors: {
      deviceId: 'SMRT-2026-108',
      property: '123 Main St, Orlando FL 32801',
      lastSync: '2026-03-15T08:31:00Z',
      alertTriggeredAt: '2026-03-15T08:29:00Z',
      sensors: [
        { id: 's1', name: 'Kitchen Water Sensor', location: 'Under Sink', status: 'ALERT', value: 'Leak Detected', unit: '', timestamp: '2026-03-15T08:29:00Z', history: ['Normal', 'Normal', 'Normal', 'ALERT'] },
        { id: 's2', name: 'Humidity Sensor', location: 'Kitchen', status: 'HIGH', value: 87, unit: '%RH', threshold: 60, timestamp: '2026-03-15T08:30:00Z', history: [42, 44, 71, 87] },
        { id: 's3', name: 'Temperature Sensor', location: 'Kitchen', status: 'NORMAL', value: 72, unit: '°F', threshold: 95, timestamp: '2026-03-15T08:30:00Z', history: [71, 71, 72, 72] },
        { id: 's4', name: 'Water Shut-off Valve', location: 'Main Supply', status: 'ALERT', value: 'Auto-closed at 08:29', unit: '', timestamp: '2026-03-15T08:29:00Z', history: ['Open', 'Open', 'Open', 'CLOSED'] },
        { id: 's5', name: 'Smoke Detector', location: 'Kitchen', status: 'NORMAL', value: 'No Smoke', unit: '', timestamp: '2026-03-15T08:30:00Z', history: ['Clear', 'Clear', 'Clear', 'Clear'] },
        { id: 's6', name: 'Floor Moisture Sensor', location: 'Kitchen Floor', status: 'HIGH', value: 94, unit: '% sat', threshold: 30, timestamp: '2026-03-15T08:31:00Z', history: [12, 18, 67, 94] }
      ],
      timeline: [
        { time: '08:28', event: 'All sensors normal', severity: 'normal' },
        { time: '08:29', event: 'Water Sensor triggered — leak detected under kitchen sink', severity: 'alert' },
        { time: '08:29', event: 'Auto shut-off valve closed main water supply', severity: 'alert' },
        { time: '08:30', event: 'Humidity spike to 87%RH — floor moisture at 94% saturation', severity: 'high' },
        { time: '08:31', event: 'Carrier Smart Home alert sent to insured mobile app', severity: 'info' },
        { time: '08:45', event: 'Insured confirmed receipt — contacted restoration services', severity: 'info' }
      ]
    },
    visualEvidence: {
      before: { url: '/sample-docs/kitchen-before.svg', label: 'Kitchen — Pre-Loss (2026-03-01)', caption: 'High-end hardwood flooring and custom cabinets in good condition' },
      after: { url: '/sample-docs/kitchen-after.svg', label: 'Kitchen — Post-Loss (2026-03-15)', caption: 'Severe water damage — cupped hardwood, swollen cabinet bases, saturated subfloor' }
    },
    damageImages: ['/sample-docs/images/water-damage-assessment.jpg'],
    documentAddresses: [
      { source: 'repair_invoice.pdf', address: '98 Commerce Drive, Orlando FL 32803', note: 'Restoration Pro billing address — MISMATCH with loss property' },
      { source: 'damaged_flooring.jpg', address: '123 Main St, Orlando FL 32801', note: 'Matches loss property address' }
    ],
    missingDocuments: ['Plumber\'s report', 'List of Damaged Goods'],
    dataInconsistencies: ['Insured address and invoice address does not match.'],
    coverageVerification: {
      status: 'Verified',
      covered: true,
      coverages: ['Water Damage', 'Mold Remediation', 'Sewer Backup'],
      rationale: 'Based on the review of the policy documents and the claims information submitted the claim for water damage is covered. See page 3 of the policy declaration.'
    },
    fraudAnalysis: {
      score: 42,
      level: 'Medium',
      flags: ['Claim amount exceeds regional average by 15%', 'Address mismatch on invoice']
    },
    insuredHistory: [
      { claimId: '2024-055', date: '2024-06-10', cause: 'Roof Damage', amount: 8200, status: 'Closed' }
    ],
    communications: [
      { id: 'comm-1', type: 'call', actor: 'Jane Doe', agentId: 'ADJ-001', claimId: '2026-108', notes: 'Call on Hold Claim Details - No Emergency Assistance', timestamp: '2026-03-15T15:15:00Z' },
      { id: 'comm-2', type: 'portal', actor: 'John Smith', agentId: null, claimId: '2026-105', notes: 'Claim submitted via website', timestamp: '2026-03-15T13:45:00Z' }
    ],
    nextSteps: {
      decisionStatus: 'Additional Information Required from Claimant',
      decisionRationale: 'Validated water damage through historical trend modeling and repair invoice analysis. On-site mitigation logs confirm the cause of loss as a sudden plumbing failure. Estimated costs align with industry standard pricing for the 32801 region. Additional information is required to validate the veracity of the claim amount.',
      nextBestActions: [
        'Request plumber\'s report',
        'Confirm second visit on site',
        'Schedule field inspection — required for property loss over $50K'
      ]
    },
    currentStep: 1,
    region: 'Florida Coast'
  },
  {
    id: '2026-102',
    policyNumber: '2024-002',
    customerId: 'CUST-002',
    insuredName: 'Mary Johnson',
    causeOfLoss: 'Fire',
    claimAmount: 52800,
    dateOfLoss: '2026-03-10',
    dateSubmitted: '2026-03-10',
    status: 'Under Review',
    adjuster: 'Jane Doe',
    fraudRisk: 'High',
    aiSentiment: 'Concerned',
    insuredSegmentation: 'Silver',
    isHomeLivable: false,
    typeOfLoss: 'Property',
    primaryPeril: 'Fire — accidental ignition from kitchen appliance',
    initialReserves: 52800,
    fnolNarrative: 'On Mar 10, 2026, a fire broke out in the kitchen area originating from an electrical appliance malfunction. The fire caused significant damage to the kitchen, dining area, and partial damage to the living room. The insured evacuated safely and contacted emergency services. Fire department confirmed accidental cause. The property is currently uninhabitable and the insured has secured temporary housing.',
    address: {
      line1: '456 Oak Avenue',
      line2: '',
      city: 'Miami',
      state: 'FL',
      zip: '33109'
    },
    contact: {
      phone: '305-555-0198',
      email: 'mary.johnson@example.com'
    },
    documents: [
      { id: 'doc-3', name: 'fire_report.pdf', description: 'Official fire department incident report (ADF)', size: '2.8MB', uploadedAt: '2026-03-10T18:00:00Z', url: '/sample-docs/fire-report.html' },
      { id: 'doc-4', name: 'fire_damage_photos.jpg', description: 'Photos of fire and smoke damage throughout property', size: '6.1MB', uploadedAt: '2026-03-10T17:45:00Z', url: '/sample-docs/fire-damage-photos.html' },
      { id: 'doc-iot-2', name: 'IoT Sensor Data', description: 'Smart home sensor readings at time of fire — smoke, heat, CO, and suppression system', size: 'Live Feed', uploadedAt: '2026-03-10T14:22:00Z', type: 'iot' }
    ],
    iotSensors: {
      deviceId: 'SMRT-2026-102',
      property: '456 Oak Avenue, Miami FL 33109',
      lastSync: '2026-03-10T14:25:00Z',
      alertTriggeredAt: '2026-03-10T14:18:00Z',
      sensors: [
        { id: 'fs1', name: 'Smoke Detector', location: 'Kitchen', status: 'ALERT', value: 'Smoke Detected', unit: '', timestamp: '2026-03-10T14:18:00Z', history: ['Clear', 'Clear', 'ALERT', 'ALERT'] },
        { id: 'fs2', name: 'Heat Sensor', location: 'Kitchen Ceiling', status: 'ALERT', value: 312, unit: '°F', threshold: 135, timestamp: '2026-03-10T14:19:00Z', history: [72, 98, 185, 312] },
        { id: 'fs3', name: 'CO Detector', location: 'Living Room', status: 'HIGH', value: 142, unit: 'ppm', threshold: 70, timestamp: '2026-03-10T14:20:00Z', history: [2, 4, 68, 142] },
        { id: 'fs4', name: 'Smoke Detector', location: 'Dining Room', status: 'HIGH', value: 'Elevated Smoke', unit: '', timestamp: '2026-03-10T14:21:00Z', history: ['Clear', 'Clear', 'Elevated', 'Elevated'] },
        { id: 'fs5', name: 'Fire Suppression Sprinkler', location: 'Kitchen', status: 'ALERT', value: 'Activated at 14:19', unit: '', timestamp: '2026-03-10T14:19:00Z', history: ['Standby', 'Standby', 'Standby', 'ACTIVATED'] },
        { id: 'fs6', name: 'Temperature Sensor', location: 'Dining Room', status: 'HIGH', value: 118, unit: '°F', threshold: 95, timestamp: '2026-03-10T14:22:00Z', history: [71, 74, 95, 118] }
      ],
      timeline: [
        { time: '14:17', event: 'All sensors normal — appliance plugged in', severity: 'normal' },
        { time: '14:18', event: 'Kitchen smoke detector triggered — smoke detected', severity: 'alert' },
        { time: '14:19', event: 'Heat sensor exceeded 135°F threshold — fire suppression activated', severity: 'alert' },
        { time: '14:19', event: 'Fire suppression sprinkler deployed in kitchen', severity: 'alert' },
        { time: '14:20', event: 'CO levels elevated to 142 ppm — living room sensor', severity: 'high' },
        { time: '14:21', event: '911 dispatch called — Miami-Dade Fire Rescue notified', severity: 'info' },
        { time: '14:22', event: 'Carrier Smart Home alert sent to insured mobile app', severity: 'info' },
        { time: '14:38', event: 'Fire department arrived on scene', severity: 'info' }
      ]
    },
    visualEvidence: {
      before: { url: '/sample-docs/fire-before.svg', label: 'Kitchen — Pre-Fire (2026-03-08)', caption: 'Modern kitchen with stainless appliances in excellent condition' },
      after: { url: '/sample-docs/fire-after.svg', label: 'Kitchen — Post-Fire (2026-03-10)', caption: 'Severe fire and smoke damage — charred cabinets, melted fixtures, structural exposure' }
    },
    damageImages: ['/sample-docs/images/fire-damage-assessment.jpg'],
    documentAddresses: [
      { source: 'fire_report.pdf', address: '456 Oak Avenue, Miami FL 33109', note: 'Matches loss property address — verified by Miami-Dade Fire Rescue' },
      { source: 'fire_damage_photos.jpg', address: '456 Oak Avenue, Miami FL 33109', note: 'Matches loss property address' }
    ],
    missingDocuments: ['Structural engineer assessment', 'Contents inventory list'],
    dataInconsistencies: ['Missing structural documentation', 'Proximity to coastal surge zone flagged'],
    coverageVerification: {
      status: 'Verified',
      covered: true,
      coverages: ['Fire', 'Smoke Damage', 'ALE - Additional Living Expense'],
      rationale: 'Fire damage is covered under the policy. ALE benefits activated as property is deemed uninhabitable.'
    },
    fraudAnalysis: {
      score: 78,
      level: 'High',
      flags: ['Missing structural documentation', 'Proximity to coastal surge zone', 'Claim amount near policy limit', 'Prior claim within 24 months']
    },
    insuredHistory: [
      { claimId: '2025-003', date: '2025-01-20', cause: 'Water Damage', amount: 14500, status: 'Closed' }
    ],
    communications: [
      { id: 'comm-3', type: 'call', actor: 'Jane Doe', agentId: 'ADJ-001', claimId: '2026-102', notes: 'Initial contact made. Insured confirmed fire department report filed. ALE benefits explained.', timestamp: '2026-03-10T19:00:00Z' }
    ],
    nextSteps: {
      decisionStatus: 'Under Review — SIU Referral Pending',
      decisionRationale: 'High fraud risk score due to missing structural documentation and proximity to coastal surge zone. Immediate field inspection is recommended. SIU preliminary review triggered.',
      nextBestActions: [
        'Assign field adjuster for immediate site inspection',
        'Request structural engineer assessment',
        'Initiate SIU preliminary review',
        'Confirm ALE hotel authorization for insured'
      ]
    },
    currentStep: 2,
    region: 'Florida Coast'
  },
  {
    id: '2026-093',
    policyNumber: '2024-003',
    customerId: 'CUST-003',
    insuredName: 'Robert Davis',
    causeOfLoss: 'Roof Damage',
    claimAmount: 18450,
    dateOfLoss: '2026-03-08',
    dateSubmitted: '2026-03-08',
    status: 'Under Review',
    adjuster: 'Jane Doe',
    fraudRisk: 'Low',
    aiSentiment: 'Positive',
    insuredSegmentation: 'Bronze',
    isHomeLivable: true,
    typeOfLoss: 'Property',
    primaryPeril: 'Wind and Hail — severe thunderstorm',
    initialReserves: 18450,
    fnolNarrative: 'On Mar 8, 2026, a severe thunderstorm with winds exceeding 65 mph caused significant roof damage to the property. Multiple shingles were displaced and one section of the roof deck was exposed. No interior water intrusion at time of report. A local contractor performed an emergency tarp installation to prevent further damage. NWS confirmed storm event in the area with 0.9 inch hail.',
    address: {
      line1: '789 Pine Circle',
      line2: 'Unit 4',
      city: 'Houston',
      state: 'TX',
      zip: '77001'
    },
    contact: {
      phone: '713-555-0267',
      email: 'gopi.reddy@example.com'
    },
    documents: [
      { id: 'doc-5', name: 'roof_damage_photos.jpg', description: 'Photos of displaced shingles and exposed roof deck', size: '3.9MB', uploadedAt: '2026-03-08T16:30:00Z', url: '/sample-docs/roof-damage-photos.html' },
      { id: 'doc-6', name: 'contractor_estimate.pdf', description: 'Roofing contractor repair estimate', size: '1.2MB', uploadedAt: '2026-03-08T17:00:00Z', url: '/sample-docs/contractor-estimate.html' },
      { id: 'doc-7', name: 'nws_storm_report.pdf', description: 'NWS official storm verification report — 65 mph winds, 0.9" hail, Houston TX 77001', size: '1.8MB', uploadedAt: '2026-03-09T10:00:00Z', url: '/sample-docs/nws-storm-report.html' }
    ],
    visualEvidence: {
      before: { url: '/sample-docs/roof-before.svg', label: 'Roof — Pre-Storm (2026-03-05)', caption: 'Intact asphalt shingles and ridge cap in good condition' },
      after: { url: '/sample-docs/roof-after.svg', label: 'Roof — Post-Storm (2026-03-08)', caption: 'Multiple missing shingles, exposed decking, hail impact marks visible' }
    },
    damageImages: ['/sample-docs/images/roof-damage-assessment.jpg'],
    documentAddresses: [
      { source: 'roof_damage_photos.jpg', address: '789 Pine Circle, Houston TX 77001', note: 'Matches loss property address' },
      { source: 'contractor_estimate.pdf', address: '789 Pine Circle Unit 4, Houston TX 77001', note: 'Matches loss property address' },
      { source: 'nws_storm_report.pdf', address: 'ZIP 77001 coverage area', note: 'Storm event confirmed for ZIP code — consistent with loss location' }
    ],
    missingDocuments: [],
    dataInconsistencies: [],
    coverageVerification: {
      status: 'Verified',
      covered: true,
      coverages: ['Wind Damage', 'Hail Damage'],
      rationale: 'Wind and hail damage is covered under the policy. NWS storm data corroborates the reported event.'
    },
    fraudAnalysis: {
      score: 12,
      level: 'Low',
      flags: []
    },
    insuredHistory: [],
    communications: [
      { id: 'comm-4', type: 'sms', actor: 'Jane Doe', agentId: 'ADJ-001', claimId: '2026-093', notes: 'SMS sent confirming claim receipt and estimated timeline of 5-7 business days.', timestamp: '2026-03-08T17:30:00Z' }
    ],
    nextSteps: {
      decisionStatus: 'Approved — Pending Final Estimate',
      decisionRationale: 'Low fraud risk. Storm event confirmed by NWS. Contractor estimate within regional benchmarks for roof repair. Claim approved pending receipt of final invoice.',
      nextBestActions: [
        'Approve contractor estimate',
        'Issue payment authorization to insured',
        'Schedule 30-day follow-up inspection'
      ]
    },
    currentStep: 3,
    region: 'Texas Inland'
  }
];

module.exports = mockClaims;
