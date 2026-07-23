# Functional & Technical Requirements Specification: Pet Hotel & Resort Integration

## 1. Executive Summary & Context
As part of JAB’s multi-vertical strategy, pet hospitality networks (e.g., *Pet Palace, Destination Pet, Gingr-powered facilities*) serve as high-margin distribution channels and customer retention tools. 

This document defines the requirements for integrating Pet Hotel Property Management Systems (PMS) and online booking portals with EIS **PolicyCore** and central microchip registries. Key capabilities include automated medical clearance validation, micro-duration "Stay Protection" insurance distribution, and incident emergency response routing.

---

## 2. Core Functional Requirements

### REQHTL-01: Automated Health Pass & Vaccination Clearance
* **Trigger:** A pet owner initiates an online booking or arrives for check-in at a pet resort.
* **Functional Logic:**
  1. The resort PMS calls the Central Data Mesh using `Microchip_ID` or `Customer_ID`.
  2. The system queries partner clinic records and digital health registries.
  3. Vaccination compliance (Rabies, Bordetella, DHPP) is verified automatically.
* **Outcome:** Replaces manual paper proof workflows. The booking engine automatically flags the reservation as `Vaccination_Verified_Green`.

---

### REQHTL-02: Embedded Single-Click "Stay Protection" Micro-Insurance
* **Trigger:** An uninsured pet owner reaches the payment checkout screen on a pet hotel booking engine.
* **Functional Logic:**
  1. The booking engine queries EIS *PolicyCore* for a micro-product rate (e.g., $3.50/day covering up to $2,500 in emergency medical coverage incurred *during* the stay).
  2. The user checks a single box: `[X] Add Stay Protection for 4 Days ($14.00)`.
  3. Upon payment confirmation, the system triggers a REST call to EIS *PolicyCore* to instantly bind a micro-term policy tied directly to the `Resort_Reservation_ID`.

---

### REQHTL-03: Incident Emergency Medical Care & Direct Claim Initiation
* **Trigger:** A pet exhibits symptoms of illness (e.g., Bloat, Kennel Cough) or sustains an injury while boarding.
* **Functional Logic:**
  1. Resort staff logs an `Incident_Report` in their PMS software.
  2. The system checks for an active full pet insurance policy (or active Stay Protection binder).
  3. The system automatically dispatches an alert to the nearest partner emergency veterinary hospital (e.g., SAGE/NVA network facility).
  4. Pre-approves emergency transport and initial diagnostic costs under the policy, notifying the pet owner via an automated SMS dispatch.

---

## 3. Interface & REST API Technical Contracts

### Request Payload: Issue Micro-Duration Stay Protection Policy
`POST /api/v1/ecosystem/hotel/stay-protection/bind`

```json
{
  "bookingContext": "Pet_Palace_Resort_Online",
  "reservationId": "RES-2026-883912",
  "facilityId": "HOTEL-PALACE-OHIO-02",
  "stayDetails": {
    "startDate": "2026-08-01",
    "endDate": "2026-08-07",
    "totalDays": 6
  },
  "customerData": {
    "firstName": "Emily",
    "lastName": "Watson",
    "email": "emily.watson@example.com",
    "phone": "+16145550199"
  },
  "petData": {
    "petName": "Barnaby",
    "species": "Canine",
    "breed": "Golden Retriever",
    "ageYears": 4,
    "microchipId": "981020007712399"
  },
  "financials": {
    "dailyPremium": 3.50,
    "totalPremiumCharged": 21.00,
    "currency": "USD",
    "paymentToken": "tok_stripe_hotel_88291"
  }
}

Response Payload: Policy Binder Confirmation
{
  "binderStatus": "BOUND_AND_ACTIVE",
  "policyNumber": "MICRO-STAY-2026-44102",
  "coverageTerm": {
    "effectiveStart": "2026-08-01T00:00:00Z",
    "effectiveEnd": "2026-08-07T23:59:59Z"
  },
  "coverageLimits": {
    "medicalEmergencyCap": 2500.00,
    "deductible": 0.00,
    "reimbursementPercentage": 100
  },
  "documentUrls": {
    "policyBinderPdf": "[https://assets.iph.com/binders/MICRO-STAY-2026-44102.pdf](https://assets.iph.com/binders/MICRO-STAY-2026-44102.pdf)"
  }
}

4. Cross-Vertical Ecosystem Loyalty Engine Matrix
Trigger Event	Ecosystem Condition	Cross-Vertical Reward / Action	System Execution
Resort Check-Out	Customer completes a 5+ day hotel stay AND maintains an active D2C pet insurance policy (e.g., Figo/Embrace).	Automatically applies a $15 Deductible Credit toward their annual policy.	Event stream calls PolicyCore.ApplyDeductibleCredit().
Annual Vet Visit	Partner clinic logs a completed Annual Preventive Exam.	Unlocks 10% discount on all daycare/boarding stays across partner resorts for the next 12 months.	Updates the Pet_Ecosystem_Profile flags in the central cloud data mesh.
Boarding Incident	Minor injury occurs on resort property; pet has active insurance.	Resort waives boarding fees for that day; insurance waives co-pay on vet treatment.	Joint write-off transaction posted across BillingCore and Resort PMS.
