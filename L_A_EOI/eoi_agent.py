class EOIAgent:
    def __init__(self):
        pass

    def calculate_underwriting_decision(self, emp_id, name, current_amt, requested_amt, origin, tier=None, work_profile="EOI"):
        delta = requested_amt - current_amt
        work_profile_upper = str(work_profile).strip().upper()
        
        # -------------------------------------------------------------
        # USE CASE 1: EVIDENCE OF INSURABILITY (EOI)
        # -------------------------------------------------------------
        if work_profile_upper == "EOI":
            if tier == "GREEN":
                status_label = "🟢 AUTO_PASS"
                reasoning = "Requested benefit variance sits precisely within standard risk bounds. Cross-system Databricks history evaluation yields zero anomalies."
                next_steps = "System execution finalized. Payroll attributes synchronized automatically with core ledger parameters."
            elif tier == "ORANGE":
                status_label = "🟡 CONDITIONAL_PFML"
                reasoning = "Transaction matches localized state eligibility parameters associated with statutory paid family and medical leave rollout rulesets."
                next_steps = "Staged pending regulatory verification signatures. Digital notifications triggered to employee dashboard for confirmation."
            else:
                status_label = "🔴 ESCALATED_REVIEW"
                reasoning = "Dynamic pipeline analysis caught multi-system data model mismatches. Historical claim volumes exceed automated threshold bounds."
                next_steps = "Case index prioritized and pushed into specialist manual queue. Profile elements pre-compiled for human validation."

        # -------------------------------------------------------------
        # USE CASE 2: REGIONAL ABSENCE & CLAIM ROUTER
        # -------------------------------------------------------------
        elif work_profile_upper == "ABSENCE":
            if tier == "GREEN":
                status_label = "🟢 CLAIMS_AUTO_APPROVE"
                reasoning = "Medical duration guidelines perfectly match reported clinical codes. Core policy definitions confirm active, zero-exclusion coverage."
                next_steps = "Touchless authorization executed. Automated disbursement pipeline scheduled for next active payment clearing cycle."
            elif tier == "ORANGE":
                status_label = "🟡 REGIONAL_STATUTORY_STAGING"
                reasoning = "Claim timeline intersects concurrent state short-term disability and evolving statutory medical leave frameworks."
                next_steps = "Staged within compliance queue. Automated request triggered out to employer portal for missing concurrent state attestation files."
            else:
                status_label = "🔴 TECHNICAL_CLAIM_AUDIT"
                reasoning = "Concurrent processing error flagged: claimant listed with active overlapping leaves under mismatching regional enterprise identifiers."
                next_steps = "Claim isolated from automated path. Assigned to Senior Technical Claims Examiner for manual coordination and cross-system cleanup."

        # -------------------------------------------------------------
        # USE CASE 3: RETROACTIVE PREMIUM BILLING RECONCILIATION
        # -------------------------------------------------------------
        elif work_profile_upper == "BILLING":
            if tier == "GREEN":
                status_label = "🟢 RECON_COMPLETE"
                reasoning = "Retroactive premium delta variation falls within acceptable nominal tolerances ($1.00 bound). Automated ledger balancing verified."
                next_steps = "Variances completely written off. Premium allocation metrics successfully balanced against group invoice numbers."
            elif tier == "ORANGE":
                status_label = "🟡 TIMING_VARIANCE_SUSPENSE"
                reasoning = "Premium mismatch identified due to mid-cycle enrollment changes on the employer HRIS side. Variance out of bounds for auto-writeoff."
                next_steps = "Staged within suspense account balance. Balance adjustment line-item generated and pushed to the employer group billing portal."
            else:
                status_label = "🔴 STRUCTURAL_BILLING_AUDIT"
                reasoning = "Critical data mesh synchronization error: received cash fails to match minimum premium stakes on a high-value corporate account ($5M+ TCV)."
                next_steps = "Invoice locked to prevent errant collection actions. Routed onto the Strategic Account Underwriting desk for immediate manual audit."

        # -------------------------------------------------------------
        # USE CASE 4: MULTI-CARRIER COORDINATION OF BENEFITS (COB)
        # -------------------------------------------------------------
        elif work_profile_upper == "COB":
            if tier == "GREEN":
                status_label = "🟢 COB_CLEAR"
                reasoning = "Cross-carrier query confirmed zero overlapping coordination parameters. Primary liability sequence bounds securely established."
                next_steps = "Claims validation confirmed. Payout instruction vector authorized to downstream settlement rails."
            elif tier == "ORANGE":
                status_label = "🟡 SPLIT_LIABILITY_STAGING"
                reasoning = "Active parallel short-term indemnity rider identified via secondary employer index. NAIC rules mandate pro-rata calculation splits."
                next_steps = "Liability calculation staged at 60% baseline. Automated coordination notification submitted to secondary carrier hub."
            else:
                status_label = "🔴 SUBROGATION_LOCK"
                reasoning = "Conflict Detected: Duplicate medical ingestion records matching exact date-range footprints flagged across external carrier indices."
                next_steps = "Hard processing block applied. Assigned to Special Investigative Coordination Desk to prevent duplicate benefit payouts."

        # -------------------------------------------------------------
        # USE CASE 5: PREMIUM PORTABILITY & AGGREGATION ENGINE
        # -------------------------------------------------------------
        elif work_profile_upper == "PORTABILITY":
            if tier == "GREEN":
                status_label = "🟢 VOLUME_STABLE"
                reasoning = "Enterprise customer headcount churn sits comfortably inside contract portfolio tolerance guidelines ($5M+ TCV segment monitoring)."
                next_steps = "Standard corporate account premium billing generation confirmed. No structural rating amendments required."
            elif tier == "ORANGE":
                status_label = "🟡 RATE_BREAK_TRIGGERED"
                reasoning = "Unified Lakehouse census track caught group enrollment adjustments crossing the 10,000 active lives discount threshold tier."
                next_steps = "Dynamic billing updated to revised lower Per-Employee-Per-Month (PEPM) metrics for upcoming billing cycles."
            else:
                status_label = "🔴 RISK_EXPOSURE_ALERT"
                reasoning = "Mass structural census fluctuations detected (exceeding 25% account volume variance). Base cohort age/risk assumptions corrupted."
                next_steps = "Automated billing files suspended. Routed instantly back to Lead Corporate Actuary for portfolio risk model re-underwriting."

        return {
            "id": emp_id,
            "name": name,
            "current": current_amt,
            "requested": requested_amt,
            "delta": delta,
            "origin": origin,
            "tier": tier,
            "work_profile": work_profile,
            "status_label": status_label,
            "reasoning": reasoning,
            "next_steps": next_steps
        }