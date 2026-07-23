const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { EIS_POLICIES, MOCK_CLINICS, generateClaimRef, runTriageRules } = require('../services/eisData');
const { policies: SOR_POLICIES } = require('../services/mockData');

const ISSUED_TOKENS = {};

function findPolicyByQuery(q) {
  return EIS_POLICIES.find(p =>
    p.policyNumber === q ||
    p.petId === q ||
    p.microchipId === q ||
    p.ownerPhone === q
  );
}

function computeBillSplit(policy, grossTotal) {
  const deductibleRemaining = Math.max(0, policy.deductible - policy.Accumulated_Deductible_Balance);
  const afterDeductible = Math.max(0, grossTotal - deductibleRemaining);
  const coinsurancePct = policy.coinsurancePct || 20;
  const carrierPayout = afterDeductible * (1 - coinsurancePct / 100);
  const customerPay = grossTotal - carrierPayout;
  return {
    grossInvoiceTotal: grossTotal,
    nonCoveredItemsAmount: 0,
    appliedDeductible: Math.min(deductibleRemaining, grossTotal),
    appliedCoInsuranceCustomerShare: parseFloat((afterDeductible * (coinsurancePct / 100)).toFixed(2)),
    netCarrierPayoutToClinic: parseFloat(carrierPayout.toFixed(2)),
    customerPayAtDesk: parseFloat(customerPay.toFixed(2)),
  };
}

// GET /api/clinic/eligibility
router.get('/eligibility', (req, res) => {
  try {
    const { q, clinicId } = req.query;

    if (!clinicId) {
      return res.status(400).json({ error: 'clinicId is required' });
    }
    if (!q || q.length < 6) {
      return res.status(400).json({ error: 'Search term must be at least 6 characters' });
    }

    const policy = findPolicyByQuery(q);
    const queriedAt = new Date().toISOString();

    if (!policy) {
      return res.status(404).json({
        found: false,
        notFoundMessage: 'No active policy found for this patient. Verify details with the owner.',
        queriedAt,
      });
    }

    const today = new Date();
    const termStart = new Date(policy.termStart);
    const illnessWaitMs = (policy.waitingPeriodDays?.illness || 14) * 24 * 60 * 60 * 1000;
    const waitingPeriodEndDate = new Date(termStart.getTime() + illnessWaitMs);
    const inWaitingPeriod = today < waitingPeriodEndDate;
    const annualLimitRemaining = policy.annualBenefitMax - (policy.accumulatedBenefitUsed || 0);
    const deductibleRemaining = Math.max(0, policy.deductible - policy.Accumulated_Deductible_Balance);
    const insurerReimbursementPct = 100 - policy.coinsurancePct;

    const emailParts = policy.holderEmail.split('@');
    const holderEmailMasked = emailParts[0].charAt(0) + '****@' + emailParts[1];

    res.json({
      found: true,
      queriedAt,
      clinicId,
      policy: {
        policyNumber: policy.policyNumber,
        coverageType: policy.coverageType,
        status: policy.status,
        termStart: policy.termStart,
        termEnd: policy.termEnd,
        annualBenefitMax: policy.annualBenefitMax,
        annualLimitRemaining,
        deductible: policy.deductible,
        deductibleRemaining,
        coinsurancePct: policy.coinsurancePct,
        insurerReimbursementPct,
        exclusionRiders: policy.exclusionRiders || [],
        inWaitingPeriod,
        waitingPeriodEndDate: waitingPeriodEndDate.toISOString().split('T')[0],
      },
      patient: {
        petId: policy.petId,
        petName: policy.petName,
        species: policy.species,
        breed: policy.breed,
        dob: policy.dob,
        microchipId: policy.microchipId,
      },
      holder: {
        holderName: policy.holderName,
        holderEmailMasked,
        ownerPhone: policy.ownerPhone,
        postcode: policy.postcode,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// POST /api/clinic/preauth
router.post('/preauth', (req, res) => {
  try {
    const { clinicId, policyNumber, diagnosisCode, diagnosisDescription, procedureLineItems, emergencyOverride } = req.body;

    if (!clinicId || typeof clinicId !== 'string') {
      return res.status(400).json({ error: 'clinicId is required' });
    }
    if (!policyNumber || typeof policyNumber !== 'string') {
      return res.status(400).json({ error: 'policyNumber is required' });
    }
    if (!diagnosisCode || typeof diagnosisCode !== 'string') {
      return res.status(400).json({ error: 'diagnosisCode is required' });
    }
    if (!diagnosisDescription || typeof diagnosisDescription !== 'string') {
      return res.status(400).json({ error: 'diagnosisDescription is required' });
    }
    if (!Array.isArray(procedureLineItems) || procedureLineItems.length === 0) {
      return res.status(400).json({ error: 'procedureLineItems must be a non-empty array' });
    }
    for (const line of procedureLineItems) {
      if (!line.description || typeof line.unitCharge !== 'number' || line.unitCharge <= 0) {
        return res.status(400).json({ error: 'Each line item must have description and a positive unitCharge' });
      }
    }

    const policy = EIS_POLICIES.find(p => p.policyNumber === policyNumber);
    if (!policy) {
      return res.status(404).json({ error: `Policy ${policyNumber} not found` });
    }

    const issuedAt = new Date().toISOString();
    const today = new Date();
    const procedureTotal = procedureLineItems.reduce((sum, l) => sum + l.unitCharge, 0);

    const sorPolicy = SOR_POLICIES.find(p => p.policy_id === policy.policy_id);
    const excluded_conditions = sorPolicy?.excluded_conditions || [];

    if (policy.status !== 'ACTIVE') {
      return res.json({
        outcome: 'DECLINED',
        declineReason: 'POLICY_INACTIVE',
        declineMessage: `Policy ${policyNumber} is not active (current status: ${policy.status}). Coverage cannot be extended.`,
        issuedAt,
      });
    }

    const termStart = new Date(policy.termStart);
    const illnessWaitMs = (policy.waitingPeriodDays?.illness || 14) * 24 * 60 * 60 * 1000;
    const waitingPeriodEndDate = new Date(termStart.getTime() + illnessWaitMs);
    if (today < waitingPeriodEndDate) {
      return res.json({
        outcome: 'REFERRED',
        referralReason: 'WAITING_PERIOD',
        referralMessage: `Treatment date falls within the ${policy.waitingPeriodDays?.illness || 14}-day illness waiting period (ends ${waitingPeriodEndDate.toISOString().split('T')[0]}). Claim requires manual review.`,
        adjusterEmail: 'expedited-review@petlife-demo.com',
        issuedAt,
      });
    }

    const policyIssueDate = new Date(policy.issueDate);
    const daysSinceIssue = Math.floor((today - policyIssueDate) / (1000 * 60 * 60 * 24));
    if (procedureTotal > 3500 && daysSinceIssue <= 30) {
      return res.json({
        outcome: 'REFERRED',
        referralReason: 'FRAUD_REVIEW',
        referralMessage: 'Pre-Approval Timeout / Review Required. High-value claim on a recently issued policy has been flagged for SIU review.',
        adjusterEmail: 'expedited-review@petlife-demo.com',
        issuedAt,
      });
    }

    const limitRemaining = policy.annualBenefitMax - (policy.accumulatedBenefitUsed || 0);
    const partial = procedureTotal > limitRemaining;
    const capAmount = partial ? limitRemaining : procedureTotal;

    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const diagPart = diagnosisCode.replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase();
    const preAuthToken = `PA-${policyNumber.slice(-4)}-${diagPart}-${dateStr}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const payoutCeiling = computeBillSplit(policy, capAmount);

    const lineDecisions = procedureLineItems.map(line => {
      const isExcluded = excluded_conditions.some(exc =>
        line.description.toLowerCase().includes(exc.toLowerCase())
      );
      const approvedAmount = isExcluded ? 0 : parseFloat(((line.unitCharge / procedureTotal) * payoutCeiling.netCarrierPayoutToClinic).toFixed(2));
      return {
        description: line.description,
        unitCharge: line.unitCharge,
        approvedAmount,
        status: isExcluded ? 'EXCLUDED' : 'APPROVED',
      };
    });

    const tokenExpiry = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    ISSUED_TOKENS[preAuthToken] = {
      policyNumber,
      issuedAt,
      expiry: tokenExpiry,
      used: false,
      procedureTotal,
      payoutCeiling,
    };

    res.json({
      outcome: partial ? 'PARTIAL_APPROVAL' : 'APPROVED',
      preAuthToken,
      tokenExpiry,
      guaranteedPayoutCeiling: payoutCeiling,
      procedureTotal,
      lineDecisions,
      policySnapshot: {
        policyNumber: policy.policyNumber,
        petName: policy.petName,
        coverageType: policy.coverageType,
        annualBenefitMax: policy.annualBenefitMax,
        limitRemaining,
        exclusionRiders: policy.exclusionRiders || [],
      },
      issuedAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// POST /api/clinic/settlement
router.post('/settlement', (req, res) => {
  try {
    const { header, patientContext, treatmentData, financials, preAuthToken } = req.body;

    if (!header || !header.clinicId) {
      return res.status(400).json({ error: 'header.clinicId is required' });
    }
    if (!patientContext || !patientContext.policyNumber) {
      return res.status(400).json({ error: 'patientContext.policyNumber is required' });
    }
    if (!treatmentData || !Array.isArray(treatmentData.lineItems) || treatmentData.lineItems.length === 0) {
      return res.status(400).json({ error: 'treatmentData.lineItems must be a non-empty array' });
    }
    if (!financials || !financials.grossInvoiceTotal || financials.grossInvoiceTotal <= 0) {
      return res.status(400).json({ error: 'financials.grossInvoiceTotal must be a positive number' });
    }

    if (preAuthToken && !/^PA-[A-Z0-9]{4}-[A-Z0-9]+-\d{8}-[A-Z0-9]{6}$/.test(preAuthToken)) {
      return res.status(400).json({ error: 'Invalid preAuthToken format' });
    }

    const policy = EIS_POLICIES.find(p => p.policyNumber === patientContext.policyNumber);
    if (!policy) {
      return res.status(404).json({ error: `Policy ${patientContext.policyNumber} not found` });
    }

    const clinic = MOCK_CLINICS.find(c => c.clinicId === header.clinicId);

    const triagePayload = {
      invoiceMetadata: {
        dateOfService: new Date().toISOString().split('T')[0],
        financialSummary: { grossInvoiceAmount: financials.grossInvoiceTotal },
      },
      claimantContext: { petId: policy.petId },
      customerDeclaration: { primarySymptomCategory: 'Emergency' },
    };

    const { overallTriage } = runTriageRules(triagePayload, policy);
    const claimReferenceNumber = generateClaimRef();
    const issuedAt = new Date().toISOString();

    if (overallTriage === 'SIU_REVIEW' || overallTriage === 'WAITING_PERIOD_REVIEW') {
      return res.json({
        settlementStatus: 'MANUAL_MEDICAL_REVIEW',
        claimReferenceNumber,
        reason: 'EX-VET-02',
        message: 'This claim requires manual medical review before settlement can be processed.',
        fallbackInstruction: 'Direct the customer to submit a standard reimbursement claim via the PetLife owner portal.',
      });
    }

    if (!clinic || !clinic.bankAccountMapped) {
      return res.json({
        settlementStatus: 'ESCROW_HOLD',
        claimReferenceNumber,
        reason: 'EX-VET-03',
        message: 'Clinic bank account is not mapped. Settlement funds will be held in escrow.',
        escalationTask: 'Dispatched to Clinic Onboarding Desk',
      });
    }

    const breakdown = computeBillSplit(policy, financials.grossInvoiceTotal);

    let preAuthTokenUsed = null;
    if (preAuthToken && ISSUED_TOKENS[preAuthToken]) {
      const tokenRecord = ISSUED_TOKENS[preAuthToken];
      const today = new Date();
      const expiry = new Date(tokenRecord.expiry);
      if (!tokenRecord.used && today <= expiry) {
        ISSUED_TOKENS[preAuthToken].used = true;
        preAuthTokenUsed = preAuthToken;
      }
    }

    const payoutTimestampTarget = new Date(Date.now() + 45 * 60 * 1000).toISOString();

    res.json({
      settlementStatus: 'ADJUDICATED_SUCCESS',
      claimReferenceNumber,
      preAuthTokenUsed,
      breakdown,
      paymentInstruction: {
        clearingMethod: 'INSTANT_ACH',
        recipientBankAccountId: `ACCT-${header.clinicId}-SETTLE`,
        payoutTimestampTarget,
      },
      triageSummary: { overallTriage },
      issuedAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

module.exports = router;
