# Functional & Technical Requirements Specification: Pet Clinic Ecosystem Integration

## 1. Executive Summary & Context
Within the consolidated JAB Pet Services ecosystem (spanning Independence Pet Holdings in North America and Pinnacle Pet Group in Europe), veterinary clinics operate not as isolated third parties, but as primary digital touchpoints. 

This document defines the requirements for integrating Veterinary Practice Management Systems (PMS) — such as *e-VetPractice, Cornerstone, SAGE/NVA internal networks, and CaptainVet* — directly into the EIS core insurance framework (**ClaimCore**, **PolicyCore**) to enable real-time eligibility checks, automated pre-authorizations, and point-of-sale net claims settlement.

---

## 2. Core Functional Requirements

### REQVET-01: Automated Patient Eligibility & Benefit Verification
* **Trigger:** A receptionist or vet tech checks in a patient or searches a client record within the clinic PMS.
* **Functional Logic:**
  1. PMS dispatches an asynchronous `GET` query to the Ecosystem API Gateway containing `Microchip_ID`, `Policy_Number`, or `Owner_Phone_Number`.
  2. The gateway executes a real-time lookup against EIS *PolicyCore*.
  3. The API returns an inline status widget directly embedded inside the PMS user interface.
* **Required Output Attributes:**
  * Active Policy Status (`Active`, `In_Dunning`, `Lapsed`).
  * Remaining Annual Deductible (`$ / £ Amount`).
  * Co-Insurance Reimbursement Percentage (e.g., 80%).
  * Remaining Annual Policy Limit.
  * Active Specific Exclusion Riders (e.g., "Left Knee Cruciate Exclusion").

---

### REQVET-02: Real-Time Procedure Pre-Authorization Engine
* **Trigger:** A veterinarian creates a treatment plan for a high-cost procedure (> $500 / £400 or emergency surgical intervention).
* **Functional Logic:**
  1. The vet selects diagnostic and treatment procedure codes (mapped to ICD-Vet or SNOMED-CT standards).
  2. The PMS submits an electronic `PreAuth_Request` payload to the Custom Rules Engine (CRE).
  3. CRE evaluates line-item eligibility, waiting periods, and exclusion riders in < 2,000 ms.
* **System Action:**
  * **Approved:** Issues a cryptographically signed **Pre-Approval Token** with a guaranteed payout ceiling.
  * **Referred:** Prompts the vet tech to upload prior medical chart notes for immediate expedited review by an online medical adjuster.

---

### REQVET-03: Point-of-Sale Net Settlement (Direct-to-Clinic Billing)
* **Trigger:** Checkout and invoice finalization at the clinic front desk.
* **Functional Logic:**
  1. The PMS sends the final itemized invoice payload to EIS *ClaimCore*.
  2. *ClaimCore* adjudicates the bill automatically against active accumulators.
  3. The API responds with an explicit bill-split instruction:
$$\text{Customer Out-of-Pocket} = \text{Invoice Total} - \text{Approved Direct Payout}$$
  4. The customer pays *only* their deductible/co-pay portion at the credit card terminal.
  5. The insurance portion is automatically queued for direct clearing dispatch (ACH / Faster Payments) to the clinic's operating account.

---

## 3. Interface & REST API Technical Contracts

### Request Payload: PMS POS Net Settlement Ingestion
`POST /api/v1/ecosystem/clinic/settlement/submit`

```json
{
  "header": {
    "transactionId": "TXN-CLINIC-2026-991204",
    "timestamp": "2026-07-22T11:15:30Z",
    "sourcePms": "Cornerstone_v9.2",
    "clinicId": "CLINIC-NVA-0881"
  },
  "patientContext": {
    "microchipId": "981020003445121",
    "policyNumber": "PET-US-882103",
    "patientName": "Waffles",
    "species": "Canine"
  },
  "treatmentData": {
    "primaryDiagnosisCode": "ICD-VET-K92.2",
    "diagnosisDescription": "Acute Gastrointestinal Foreign Body",
    "lineItems": [
      {
        "itemCode": "RAD-001",
        "description": "Abdominal Radiograph 2 View",
        "chargedAmount": 350.00
      },
      {
        "itemCode": "SURG-102",
        "description": "Exploratory Laparotomy",
        "amount": 1450.00
      }
    ]
  },
  "financials": {
    "grossInvoiceTotal": 1800.00,
    "currency": "USD"
  }
}

Response payload
{
  "settlementStatus": "ADJUDICATED_SUCCESS",
  "claimReferenceNumber": "CLM-2026-00991823",
  "preAuthTokenUsed": "PA-8821-K9",
  "breakdown": {
    "grossInvoiceTotal": 1800.00,
    "nonCoveredItemsAmount": 0.00,
    "appliedDeductible": 100.00,
    "appliedCoInsuranceCustomerShare": 340.00,
    "netCarrierPayoutToClinic": 1360.00,
    "customerPayAtDesk": 440.00
  },
  "paymentInstruction": {
    "clearingMethod": "INSTANT_ACH",
    "recipientBankAccountId": "ACCT-NVA-CLINIC-0881-SETTLE",
    "payoutTimestampTarget": "2026-07-22T12:00:00Z"
  }
}

4. Exception & Fallback Matrix
Exception ID	Trigger Condition	System Behavior	Remediation Action
EX-VET-01	API Gateway Timeout (> 3,000 ms)	System triggers a soft degradation fallback.	PMS displays message: "Pre-Approval Timeout. Pivot to Standard Digital Customer Reimbursement Flow."
EX-VET-02	Fraud Alert (Pre-Existing Condition Nexus)	CRE detects medical notes matching an un-expired waiting period.	Auto-adjudication aborts. Status set to MANUAL_MEDICAL_REVIEW. Invoice falls back to full payment by customer with expedited post-claim filing.
EX-VET-03	Clinic Bank Account Unmapped	Payment routing fails to resolve IBAN/Routing number for clinic clearing.	Approved funds are held in EIS ClaimCore pending escrow ledger, and an urgent task is dispatched to the Clinic Onboarding Desk.
