const express = require('express');
const router = express.Router();
const { EIS_POLICIES } = require('../services/eisData');

const MOCK_VACCINATION_REGISTRY = {
  'PET-7721': { rabies: { expiry: '2027-03-15', clinic: 'Central Animal Hospital' }, bordetella: { expiry: '2026-11-20', clinic: 'Riverside Vet Clinic' }, dhpp: { expiry: '2027-01-10', clinic: 'Central Animal Hospital' } },
  'PET-3341': { rabies: { expiry: '2026-08-10', clinic: 'Westside Vet Group' }, bordetella: { expiry: '2026-07-30', clinic: 'Westside Vet Group' }, dhpp: { expiry: '2026-09-05', clinic: 'Westside Vet Group' } },
  'PET-9902': { rabies: { expiry: '2027-06-01', clinic: 'Feline Wellness Center' }, bordetella: { expiry: '2026-12-15', clinic: 'Feline Wellness Center' }, dhpp: { expiry: '2027-04-22', clinic: 'Feline Wellness Center' } },
  'PET-5512': { rabies: { expiry: '2026-10-20', clinic: 'Riverside Vet Clinic' }, bordetella: { expiry: '2026-09-01', clinic: 'Riverside Vet Clinic' }, dhpp: { expiry: '2027-02-14', clinic: 'Riverside Vet Clinic' } },
  'PET-1188': { rabies: { expiry: '2026-07-25', clinic: 'South Bay Animal Care' }, bordetella: { expiry: '2026-07-28', clinic: 'South Bay Animal Care' }, dhpp: { expiry: '2026-08-05', clinic: 'South Bay Animal Care' } },
};

const MOCK_HOTEL_FACILITIES = [
  { facilityId: 'HOTEL-PALACE-OHIO-02', name: 'Pet Palace Resort - Columbus', city: 'Columbus', state: 'OH', network: 'Pet Palace', vetFacilityId: 'VET-SAGE-OH-07' },
  { facilityId: 'HOTEL-DEST-CA-07', name: 'Destination Pet - Los Angeles', city: 'Los Angeles', state: 'CA', network: 'Destination Pet', vetFacilityId: 'VET-NVA-CA-12' },
  { facilityId: 'HOTEL-GINGR-TX-11', name: 'Gingr Partner Resort - Houston', city: 'Houston', state: 'TX', network: 'Gingr', vetFacilityId: 'VET-NVA-TX-03' },
];

const MOCK_VET_NETWORK = [
  { facilityId: 'VET-SAGE-OH-07', name: 'SAGE Emergency & Specialty - Columbus', address: '4145 Dublin Rd, Columbus, OH 43221', phone: '+16145550800', network: 'SAGE', estimatedTransportMinutes: 18 },
  { facilityId: 'VET-NVA-CA-12', name: 'NVA Emergency Center - Los Angeles', address: '1900 S Sepulveda Blvd, Los Angeles, CA 90025', phone: '+13105550920', network: 'NVA', estimatedTransportMinutes: 22 },
  { facilityId: 'VET-NVA-TX-03', name: 'NVA 24-Hour Animal Hospital - Houston', address: '8921 Westheimer Rd, Houston, TX 77063', phone: '+17135550441', network: 'NVA', estimatedTransportMinutes: 15 },
];

const MICRO_POLICY_BINDERS = [
  { policyNumber: 'MICRO-STAY-2026-00001', reservationId: 'RES-2026-DEMO01', facilityId: 'HOTEL-PALACE-OHIO-02', microchipId: '981020007712399', petName: 'Barnaby', ownerEmail: 'emily.watson@example.com', ownerPhone: '+16145550199', effectiveStart: '2026-08-01T00:00:00Z', effectiveEnd: '2026-08-07T23:59:59Z', coverageCap: 2500, status: 'ACTIVE', boundAt: '2026-07-22T10:45:00Z' },
];

const PET_LOYALTY_PROFILES = {
  'PET-7721': { totalDeductibleCreditsEarned: 0, activeBoardingDiscountPct: 0, boardingDiscountExpiresAt: null },
  'PET-3341': { totalDeductibleCreditsEarned: 15, activeBoardingDiscountPct: 0, boardingDiscountExpiresAt: null },
  'PET-9902': { totalDeductibleCreditsEarned: 0, activeBoardingDiscountPct: 10, boardingDiscountExpiresAt: '2027-05-30' },
  'PET-5512': { totalDeductibleCreditsEarned: 0, activeBoardingDiscountPct: 0, boardingDiscountExpiresAt: null },
  'PET-1188': { totalDeductibleCreditsEarned: 0, activeBoardingDiscountPct: 0, boardingDiscountExpiresAt: null },
};

const LOYALTY_EVENT_LOG = [
  { eventType: 'CHECKOUT_DEDUCTIBLE_CREDIT', petId: 'PET-3341', petName: 'Rocky', rewardValue: '$15.00', status: 'APPLIED', appliedAt: '2026-07-10T00:00:00Z' },
  { eventType: 'BOARDING_INCIDENT_WRITEOFF', petId: 'PET-3341', petName: 'Rocky', rewardValue: 'Fee Waived', status: 'APPLIED', appliedAt: '2026-06-22T00:00:00Z' },
  { eventType: 'VET_VISIT_DISCOUNT', petId: 'PET-9902', petName: 'Cleo', rewardValue: '10% Boarding', status: 'APPLIED', appliedAt: '2026-05-30T00:00:00Z' },
];

function evalVaccine(record, today) {
  if (!record) return { status: 'MISSING', expiryDate: null, daysUntilExpiry: null };
  const expiry = new Date(record.expiry);
  const days = Math.floor((expiry - today) / 86400000);
  if (days < 0) return { status: 'NON_COMPLIANT', expiryDate: record.expiry, daysUntilExpiry: days, administeredBy: record.clinic };
  if (days <= 30) return { status: 'EXPIRING_SOON', expiryDate: record.expiry, daysUntilExpiry: days, administeredBy: record.clinic };
  return { status: 'COMPLIANT', expiryDate: record.expiry, daysUntilExpiry: days, administeredBy: record.clinic };
}

// GET /api/hotel/health-pass
router.get('/health-pass', (req, res) => {
  try {
    const { petId } = req.query;
    if (!petId) {
      return res.status(400).json({ error: 'petId is required' });
    }

    const policy = EIS_POLICIES.find(p => p.petId === petId);
    if (!policy) {
      return res.status(404).json({ error: `No policy found for petId ${petId}` });
    }

    const today = new Date();
    const vaccineData = MOCK_VACCINATION_REGISTRY[petId];
    const rabies = evalVaccine(vaccineData?.rabies, today);
    const bordetella = evalVaccine(vaccineData?.bordetella, today);
    const dhpp = evalVaccine(vaccineData?.dhpp, today);

    const allStatuses = [rabies.status, bordetella.status, dhpp.status];
    let overallStatus;
    if (allStatuses.some(s => s === 'NON_COMPLIANT' || s === 'MISSING')) {
      overallStatus = 'RED';
    } else if (allStatuses.some(s => s === 'EXPIRING_SOON')) {
      overallStatus = 'AMBER';
    } else {
      overallStatus = 'GREEN';
    }

    const clearanceCode = overallStatus === 'GREEN' ? 'Vaccination_Verified_Green' : 'Vaccination_Blocked_Red';

    const todayStr = today.toISOString();
    const activeBinder = MICRO_POLICY_BINDERS.find(b =>
      b.microchipId === policy.microchipId &&
      todayStr >= b.effectiveStart &&
      todayStr <= b.effectiveEnd
    );

    res.json({
      petId,
      petName: policy.petName,
      species: policy.species,
      breed: policy.breed,
      microchipId: policy.microchipId,
      policyStatus: policy.status,
      policyNumber: policy.policyNumber,
      overallStatus,
      clearanceCode,
      generatedAt: today.toISOString(),
      vaccinations: { rabies, bordetella, dhpp },
      activeStayBinder: activeBinder || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// GET /api/hotel/stay-protection/quote
router.get('/stay-protection/quote', (req, res) => {
  try {
    const { startDate, endDate, petId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const todayDateStr = new Date().toISOString().split('T')[0];

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (end <= start) {
      return res.status(400).json({ error: 'endDate must be after startDate' });
    }
    if (startDate < todayDateStr) {
      return res.status(400).json({ error: 'startDate cannot be in the past' });
    }

    const totalDays = Math.ceil((end - start) / 86400000);
    const dailyPremium = 3.50;
    const totalPremium = parseFloat((dailyPremium * totalDays).toFixed(2));
    const quoteId = 'QT-HTL-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900000 + 100000);

    let existingPolicyWarning = null;
    if (petId) {
      const policy = EIS_POLICIES.find(p => p.petId === petId);
      if (policy && policy.status === 'ACTIVE' && (policy.coverageType === 'COMPREHENSIVE' || policy.coverageType === 'PREMIUM')) {
        existingPolicyWarning = `Pet ${policy.petName} already has an active ${policy.coverageType} policy (${policy.policyNumber}). Stay Protection may provide supplemental coverage only.`;
      }
    }

    res.json({
      quoteId,
      startDate,
      endDate,
      totalDays,
      dailyPremium,
      totalPremium,
      currency: 'USD',
      coverageSummary: {
        emergencyVetCap: 2500,
        coveredServices: ['Emergency Exam & Triage', 'Emergency Transport', 'Initial Diagnostics', 'Overnight Observation'],
        exclusions: ['Pre-existing conditions', 'Routine wellness', 'Elective procedures'],
      },
      existingPolicyWarning,
      quotedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// GET /api/hotel/stay-protection/policy-pdf
router.get('/stay-protection/policy-pdf', (req, res) => {
  const {
    policyNumber, petName, ownerEmail, ownerPhone, microchipId,
    facilityId, reservationId, effectiveStart, effectiveEnd,
    coverageCap, status, boundAt,
  } = req.query;

  if (!policyNumber) return res.status(400).send('<h1>policyNumber is required</h1>');

  // Build binder from query params (frontend passes all fields so no DB lookup needed)
  const binder = {
    policyNumber,
    petName:      petName      || '—',
    ownerEmail:   ownerEmail   || '—',
    ownerPhone:   ownerPhone   || '—',
    microchipId:  microchipId  || null,
    facilityId:   facilityId   || '—',
    reservationId: reservationId || '—',
    effectiveStart: effectiveStart || null,
    effectiveEnd:   effectiveEnd   || null,
    coverageCap:  coverageCap ? Number(coverageCap) : 2500,
    status:       status      || 'ACTIVE',
    boundAt:      boundAt     || new Date().toISOString(),
  };

  const fmt = s => s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const issuedDate = fmt(binder.boundAt);
  const startDate  = fmt(binder.effectiveStart);
  const endDate    = fmt(binder.effectiveEnd);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Stay Protection Policy — ${policyNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1a1d2e; padding: 40px 48px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 28px; }
  .brand { font-size: 22px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; }
  .brand span { color: #1a1d2e; }
  .policy-type { font-size: 13px; color: #6b7280; margin-top: 3px; }
  .badge { background: #6366f1; color: white; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; }
  h2 { font-size: 18px; font-weight: 700; margin-bottom: 18px; color: #1a1d2e; }
  .policy-num { font-family: 'Courier New', monospace; font-size: 20px; font-weight: 700; color: #6366f1; background: #ede9fe; display: inline-block; padding: 6px 18px; border-radius: 6px; margin-bottom: 24px; letter-spacing: 1px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
  .cell { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
  .cell:nth-last-child(-n+2) { border-bottom: none; }
  .cell label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 3px; letter-spacing: 0.5px; }
  .cell .val { font-size: 14px; font-weight: 600; color: #1a1d2e; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6366f1; letter-spacing: 0.8px; margin: 20px 0 10px; }
  .coverage-box { border: 1px solid #ddd6fe; background: #faf5ff; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
  .coverage-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ede9fe; font-size: 13px; }
  .coverage-row:last-child { border-bottom: none; }
  .coverage-row .k { color: #6b7280; }
  .coverage-row .v { font-weight: 700; color: #1a1d2e; }
  .services { list-style: none; padding: 0; margin: 0 0 20px; }
  .services li { font-size: 13px; padding: 4px 0 4px 18px; position: relative; color: #374151; }
  .services li::before { content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: 700; }
  .excl { color: #ef4444; }
  .excl::before { content: '✗'; color: #ef4444; }
  .footer { border-top: 2px solid #e5e7eb; padding-top: 18px; margin-top: 8px; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-note { font-size: 11px; color: #9ca3af; max-width: 420px; line-height: 1.5; }
  .issued { font-size: 12px; color: #6b7280; text-align: right; }
  .status-bar { background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #15803d; }
  @media print {
    body { padding: 20px; }
    @page { margin: 1cm; }
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand">Pet<span>Life</span> AI</div>
    <div class="policy-type">Hotel Stay Protection Certificate</div>
  </div>
  <span class="badge">ACTIVE POLICY</span>
</div>

<div class="status-bar">&#10003;&nbsp; Policy Active — Emergency coverage in force for the stay period</div>

<div class="policy-num">${policyNumber}</div>

<div class="section-title">Policy Details</div>
<div class="grid">
  <div class="cell"><label>Policy Number</label><div class="val" style="font-family:monospace">${policyNumber}</div></div>
  <div class="cell"><label>Status</label><div class="val" style="color:#15803d">&#x25CF; ${binder.status}</div></div>
  <div class="cell"><label>Pet Name</label><div class="val">${binder.petName || '—'}</div></div>
  <div class="cell"><label>Microchip ID</label><div class="val" style="font-family:monospace">${binder.microchipId || '—'}</div></div>
  <div class="cell"><label>Owner Email</label><div class="val">${binder.ownerEmail || '—'}</div></div>
  <div class="cell"><label>Owner Phone</label><div class="val">${binder.ownerPhone || '—'}</div></div>
  <div class="cell"><label>Coverage Start</label><div class="val">${startDate}</div></div>
  <div class="cell"><label>Coverage End</label><div class="val">${endDate}</div></div>
  <div class="cell"><label>Facility ID</label><div class="val" style="font-family:monospace">${binder.facilityId || '—'}</div></div>
  <div class="cell"><label>Reservation ID</label><div class="val" style="font-family:monospace">${binder.reservationId || '—'}</div></div>
</div>

<div class="section-title">Coverage Summary</div>
<div class="coverage-box">
  <div class="coverage-row"><span class="k">Emergency Vet Cap</span><span class="v">$${(binder.coverageCap || 2500).toLocaleString()}</span></div>
  <div class="coverage-row"><span class="k">Deductible</span><span class="v">$0</span></div>
  <div class="coverage-row"><span class="k">Reimbursement Rate</span><span class="v">100%</span></div>
  <div class="coverage-row"><span class="k">Daily Premium</span><span class="v">$3.50</span></div>
</div>

<div class="section-title">Covered Services</div>
<ul class="services">
  <li>Emergency Exam &amp; Triage</li>
  <li>Emergency Transport to In-Network Vet</li>
  <li>Initial Diagnostics (X-ray, bloodwork)</li>
  <li>Overnight Observation</li>
</ul>

<div class="section-title">Exclusions</div>
<ul class="services">
  <li class="excl">Pre-existing conditions</li>
  <li class="excl">Routine wellness &amp; preventive care</li>
  <li class="excl">Elective or cosmetic procedures</li>
</ul>

<div class="footer">
  <div class="footer-note">
    This certificate constitutes proof of active Stay Protection coverage. In an emergency, call the PetLife Hotel Hotline: <strong>1-800-PET-LIFE</strong>. Policy is underwritten by PetLife Insurance Co., regulated by NAIC.
  </div>
  <div class="issued">
    <div>Issued: ${issuedDate}</div>
    <div style="margin-top:4px;font-size:11px">PetLife AI Platform</div>
  </div>
</div>

<script>window.onload = () => window.print();</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// POST /api/hotel/stay-protection/bind
router.post('/stay-protection/bind', (req, res) => {
  try {
    // Accept both the nested schema and the flat payload the frontend sends
    const {
      facilityId,
      checkInDate, checkOutDate,        // flat (frontend)
      owner = {},                        // flat (frontend)
      pet = {},                          // flat (frontend)
      linkedPetId,                       // flat (frontend)
      stayDetails,                       // nested (legacy)
      customerData,                      // nested (legacy)
      petData,                           // nested (legacy)
    } = req.body;

    const startDate = stayDetails?.startDate || checkInDate;
    const endDate   = stayDetails?.endDate   || checkOutDate;
    const email     = customerData?.email    || owner.email;
    const petName   = petData?.petName       || pet.name;
    const microchipId = petData?.microchipId || pet.microchipId;
    const ownerPhone  = customerData?.phone  || owner.phone;
    const reservationId = req.body.reservationId || ('RES-' + Date.now());

    if (!facilityId) return res.status(400).json({ error: 'facilityId is required' });
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'checkInDate and checkOutDate are required' });
    }
    if (!email) return res.status(400).json({ error: 'owner email is required' });
    if (!petName) return res.status(400).json({ error: 'pet name is required' });

    const policyNumber = 'MICRO-STAY-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000 + 10000));
    const boundAt = new Date().toISOString();

    const binder = {
      policyNumber,
      reservationId,
      facilityId,
      microchipId: microchipId || null,
      petName,
      ownerEmail: email,
      ownerPhone: ownerPhone || null,
      effectiveStart: new Date(startDate).toISOString(),
      effectiveEnd: new Date(endDate + 'T23:59:59').toISOString(),
      coverageCap: 2500,
      status: 'ACTIVE',
      boundAt,
    };

    MICRO_POLICY_BINDERS.push(binder);

    res.status(201).json({
      success: true,
      policyNumber,
      binder,
      notification: {
        smsStatus: 'DISPATCHED',
        emailStatus: 'DISPATCHED',
        recipient: email,
      },
      boundAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// POST /api/hotel/incident/report
router.post('/incident/report', (req, res) => {
  try {
    const {
      petId, facilityId, incidentType, symptomsDescription,
      incidentTimestamp, incidentDatetime,          // accept both names
      reportedByStaffId, staffId,                   // accept both names
    } = req.body;
    const resolvedTimestamp = incidentTimestamp || incidentDatetime || new Date().toISOString();
    const resolvedStaffId   = reportedByStaffId  || staffId         || 'HOTEL-STAFF';

    if (!petId || !incidentType || !symptomsDescription) {
      return res.status(400).json({ error: 'petId, incidentType, and symptomsDescription are required' });
    }
    if (symptomsDescription.length < 10) {
      return res.status(400).json({ error: 'symptomsDescription must be at least 10 characters' });
    }
    if (!['ILLNESS', 'INJURY', 'EMERGENCY'].includes(incidentType)) {
      return res.status(400).json({ error: 'incidentType must be one of ILLNESS, INJURY, EMERGENCY' });
    }

    const policy = EIS_POLICIES.find(p => p.petId === petId);
    if (!policy) {
      return res.status(404).json({ error: `No policy found for petId ${petId}` });
    }

    const incidentRef = 'INC-HTL-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900000 + 100000));

    let coverageStatus = 'NONE';
    let coveringPolicy = null;

    if (policy.status === 'ACTIVE') {
      coverageStatus = 'FULL_POLICY';
      coveringPolicy = policy;
    } else {
      const matchingBinder = MICRO_POLICY_BINDERS.find(b =>
        (b.microchipId === policy.microchipId || b.petName === policy.petName) &&
        resolvedTimestamp >= b.effectiveStart &&
        resolvedTimestamp <= b.effectiveEnd
      );
      if (matchingBinder) {
        coverageStatus = 'STAY_PROTECTION';
      }
    }

    let preAuth = null;
    if (coverageStatus !== 'NONE') {
      const preAuthRef = 'AUTH-HTL-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900000 + 100000));
      const deductibleRemaining = coveringPolicy ? Math.max(0, coveringPolicy.deductible - coveringPolicy.Accumulated_Deductible_Balance) : 0;
      preAuth = {
        preAuthRef,
        preApprovedAmount: 500,
        coveredServices: ['Emergency Exam & Triage', 'Emergency Transport', 'Initial Diagnostics'],
        deductibleRemaining,
        loyaltyAction: 'BOARDING_FEE_WAIVED',
      };
    }

    const hotelFacility = MOCK_HOTEL_FACILITIES.find(f => f.facilityId === facilityId);
    let nearestVet = null;
    if (hotelFacility) {
      nearestVet = MOCK_VET_NETWORK.find(v => v.facilityId === hotelFacility.vetFacilityId) || null;
    }

    const notification = coverageStatus !== 'NONE'
      ? { smsStatus: 'DISPATCHED', emailStatus: 'DISPATCHED' }
      : { smsStatus: 'NOT_SENT', emailStatus: 'NOT_SENT' };

    res.status(201).json({
      incidentRef,
      petId,
      petName: policy.petName,
      facilityId,
      incidentType,
      symptomsDescription,
      incidentTimestamp: resolvedTimestamp,
      reportedByStaffId: resolvedStaffId,
      coverageStatus,
      preAuth,
      nearestVet,
      notification,
      reportedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// POST /api/hotel/loyalty/apply-event
router.post('/loyalty/apply-event', (req, res) => {
  try {
    const { petId, eventType, triggerContext } = req.body;

    if (!petId || !eventType) {
      return res.status(400).json({ error: 'petId and eventType are required' });
    }
    const validEventTypes = ['CHECKOUT_DEDUCTIBLE_CREDIT', 'VET_VISIT_DISCOUNT', 'BOARDING_INCIDENT_WRITEOFF'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ error: `eventType must be one of ${validEventTypes.join(', ')}` });
    }

    const policy = EIS_POLICIES.find(p => p.petId === petId);
    if (!policy) {
      return res.status(404).json({ error: `No policy found for petId ${petId}` });
    }

    if (eventType === 'CHECKOUT_DEDUCTIBLE_CREDIT') {
      if (!triggerContext || triggerContext.stayDays < 5) {
        return res.status(422).json({ error: 'CHECKOUT_DEDUCTIBLE_CREDIT requires triggerContext.stayDays >= 5' });
      }
      if (policy.status !== 'ACTIVE') {
        return res.status(422).json({ error: 'CHECKOUT_DEDUCTIBLE_CREDIT requires an active policy' });
      }
    }

    if (!PET_LOYALTY_PROFILES[petId]) {
      PET_LOYALTY_PROFILES[petId] = { totalDeductibleCreditsEarned: 0, activeBoardingDiscountPct: 0, boardingDiscountExpiresAt: null };
    }

    const profile = PET_LOYALTY_PROFILES[petId];
    let rewardValue;
    const appliedAt = new Date().toISOString();

    if (eventType === 'CHECKOUT_DEDUCTIBLE_CREDIT') {
      profile.totalDeductibleCreditsEarned += 15;
      policy.Accumulated_Deductible_Balance += 15;
      rewardValue = '$15.00';
    } else if (eventType === 'VET_VISIT_DISCOUNT') {
      profile.activeBoardingDiscountPct = 10;
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      profile.boardingDiscountExpiresAt = expiresAt.toISOString().split('T')[0];
      rewardValue = '10% Boarding';
    } else if (eventType === 'BOARDING_INCIDENT_WRITEOFF') {
      rewardValue = 'Fee Waived + Co-Pay Waived';
    }

    const logEntry = {
      eventType,
      petId,
      petName: policy.petName,
      rewardValue,
      status: 'APPLIED',
      appliedAt,
    };
    LOYALTY_EVENT_LOG.push(logEntry);

    res.json({
      success: true,
      eventType,
      petId,
      petName: policy.petName,
      rewardValue,
      status: 'APPLIED',
      appliedAt,
      loyaltyProfile: profile,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// GET /api/hotel/loyalty/profile/:petId
router.get('/loyalty/profile/:petId', (req, res) => {
  try {
    const { petId } = req.params;

    const policy = EIS_POLICIES.find(p => p.petId === petId);
    if (!policy) {
      return res.status(404).json({ error: `No policy found for petId ${petId}` });
    }

    const profile = PET_LOYALTY_PROFILES[petId] || { totalDeductibleCreditsEarned: 0, activeBoardingDiscountPct: 0, boardingDiscountExpiresAt: null };
    const petEvents = LOYALTY_EVENT_LOG.filter(e => e.petId === petId);

    res.json({
      petId,
      petName: policy.petName,
      loyaltyProfile: profile,
      events: petEvents,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// GET /api/hotel/loyalty/log
router.get('/loyalty/log', (req, res) => {
  try {
    res.json({ log: LOYALTY_EVENT_LOG, total: LOYALTY_EVENT_LOG.length });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

module.exports = router;
