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
      if (policy.status !== 'ACTIVE' || (policy.coverageType !== 'COMPREHENSIVE' && policy.coverageType !== 'PREMIUM')) {
        return res.status(422).json({ error: 'CHECKOUT_DEDUCTIBLE_CREDIT requires an active COMPREHENSIVE or PREMIUM policy' });
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
