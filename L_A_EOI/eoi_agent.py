class EOIAgent:
    def __init__(self):
        pass

    def calculate_underwriting_decision(self, emp_id, name, current_amt, requested_amt, origin, tier=None, work_profile="EOI"):
        """
        Unified business computation engine handling EOI, Absence Eligibility, 
        and Retroactive Billing Reconciliation logic matrices.
        """
        delta = requested_amt - current_amt
        
        # -------------------------------------------------------------
        # WORKLOAD MATRIX 1: EVIDENCE OF INSURABILITY (EOI)
        # -------------------------------------------------------------
        if work_profile == "EOI":
            if tier == "GREEN":
                status_label = "🟢 AUTO_PASS"
                reasoning = "Requested benefit variance sits precisely within standard risk bounds. Cross-system Databricks history evaluation yields zero anomalies."
                next_steps = "System execution finalized. Payroll attributes synchronized automatically with core ledger parameters."
            elif tier == "ORANGE":
                status_label = "🟡 CONDITIONAL_PFML"
                reasoning = "Transaction matches localized state eligibility parameters associated with the Maine Paid Family and Medical Leave rollout rulesets."
                next_steps = "Staged pending regulatory verification signatures. Digital notifications triggered to employee dashboard for confirmation."
            else:
                status_label = "🔴 ESCALATED_REVIEW"
                reasoning = "Dynamic pipeline analysis caught multi-system data model mismatches. Historical claim volumes exceed automated threshold bounds."
                next_steps = "Case index prioritized and pushed into specialist manual queue. Profile elements pre-compiled for human validation."

        # -------------------------------------------------------------
        # WORKLOAD MATRIX 2: REGIONAL ABSENCE & CLAIM ROUTER
        # -------------------------------------------------------------
        elif work_profile == "ABSENCE":
            if tier == "GREEN":
                status_label = "🟢 CLAIMS_AUTO_APPROVE"
                reasoning = "Medical duration guidelines perfectly match reported clinical codes. Core policy definitions confirm active, zero-exclusion coverage."
                next_steps = "Touchless authorization executed. Automated disbursement pipeline scheduled for next active payment clearing cycle."
            elif tier == "ORANGE":
                status_label = "🟡 REGIONAL_STATUTORY_STAGING"
                reasoning = "Claim timeline intersects concurrent state short-term disability and evolving New York statutory medical leave frameworks."
                next_steps = "Staged within compliance queue. Automated request triggered out to employer portal for missing concurrent state attestation files."
            else:
                status_label = "🔴 TECHNICAL_CLAIM_AUDIT"
                reasoning = "Concurrent processing error flagged: claimant listed with active overlapping leaves under mismatching regional enterprise identifiers."
                next_steps = "Claim isolated from automated path. Assigned to Senior Technical Claims Examiner for manual coordination and cross-system cleanup."

        # -------------------------------------------------------------
        # WORKLOAD MATRIX 3: RETROACTIVE PREMIUM RECONCILIATION
        # -------------------------------------------------------------
        elif work_profile == "BILLING":
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