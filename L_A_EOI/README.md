# Aflac PLADS Bionic Underwriting Platform

An event-driven, decoupled prototype demonstrating automated, high-velocity enterprise case underwriting. The architecture cleanly separates ingestion, integration routing, rule computation, and the user interface to ensure zero state leakage and high-throughput processing.

## 🏗️ Decoupled Architecture Blueprint

The platform is engineered across four distinct structural modules:
1. **`app.py` (UI Workspace Layer):** A responsive Streamlit viewport that launches as a completely clean canvas, listening to the integration state layer and rendering a tri-color master-detail ledger pane upon data synchronization.
2. **`api_hub.py` (Enterprise Integration Layer):** Functions as the core MuleSoft API Gateway interceptor. It captures raw payloads, hands them to the calculation engine, and updates the atomic state cache.
3. **`eoi_agent.py` (Computational Rule Engine):** Processes policy arithmetic, coverage delta variances, and evaluates multi-jurisdictional compliance boundaries (e.g., Maine PFML rulesets) to output human-readable automated logic.
4. **`mock_triggers.py` (Simulation Stream Layer):** A background batch execution engine that synthesizes 30 unique, shuffled multi-tiered transaction records (`GREEN`, `ORANGE`, `RED`) without locking UI runtimes.

---

## 🚀 Installation & Local Environment Setup

### 1. Prerequisites
Ensure you have Python 3.10+ installed on your local Windows environment.

### 2. Clone and Navigate to Repository
```cmd
git clone [https://github.com/GiriCodeMe/LeaveAbsence.git](https://github.com/GiriCodeMe/LeaveAbsence.git)
cd LeaveAbsence

## Install the required execution runtimes

pip install streamlit

## 🎬 Live Demonstration Presentation Sequence

### Step #1: Initialize the Streamlit Server
python -m streamlit run app.py

### Step #1: Mock to generate sample data matching HRIS and AFLAC portal
python mock_triggers.py


🟢 Use Case 1: Evidence of Insurability (EOI) Gridlock

    The Core Problem: Traditional medical underwriting requires extensive health history verification, resulting in a slow, paper-heavy processing cycle.

    Operational Bottleneck: Inbound salary updates or dynamic coverage bumps cross an account’s Guaranteed Issue (GI) threshold, forcing the transaction out of the automated stream and into human-managed review queues.

    Financial Risk: Creates severe transaction friction for employees, risking lower conversion rates during open enrollment and increasing manual administrative costs for large enterprise accounts.

🟡 Use Case 2: Regional Absence & Evolving Statutory Overlaps

    The Core Problem: The state-level regulatory landscape is shifting rapidly (e.g., the rollout of Maine PFML rules and changing short-term disability frameworks in New York), making centralized compliance difficult.

    Operational Bottleneck: Legacy claims engines cannot natively parse overlapping timelines or changing state benefit stacking limits, resulting in configuration errors.

    Financial Risk: Leads to processing delays and compliance penalties for employers who run the risk of running afoul of variable state-mandated employee coverage obligations.

🔴 Use Case 3: Retroactive Premium Billing Asynchrony

    The Core Problem: High-value enterprise groups experience thousands of continuous mid-cycle payroll changes (terminations, changes in hours, retro-promotions), causing a disconnect between expected monthly invoices and actual cash received.

    Operational Bottleneck: Rigid backend architectures (legacy) try to enforce strict equality checks over asynchronous billing streams, causing regular transaction drops.

    Financial Risk: Unreconciled variances are shunted into static corporate suspense logs, driving up labor-intensive audit costs and causing premium leakage in large accounts.

🔵 Use Case 4: Siloed Multi-Carrier Coordination of Benefits (COB)

    The Core Problem: Insured group members often carry overlapping secondary coverage through working spouses or third-party indemnity riders, making it hard to determine the correct order of benefits.

    Operational Bottleneck: Inbound claim events are processed in isolation because legacy systems lack real-time connection layers to cross-reference external carrier registries or verify secondary liability protocols.

    Financial Risk: Results in structural data leaks, subrogation recovery backlogs, and multi-carrier overpayments that artificially inflate claims loss ratios.

🟣 Use Case 5: Census Volatility & Static Portfolio Rating

    The Core Problem: Mass staffing movements (seasonal headcount surges, sudden contractions, or mid-market reorganizations) warp the initial actuarial age and risk profile assumptions used to price a corporate policy.

    Operational Bottleneck: Monolithic billing backends rely on static, inflexible rate sheets that cannot automatically adjust composite rates or apply tiered volume group discounts in response to real-time workforce shifts.

    Financial Risk: Delinquent pricing reconciliation leads to direct underwriting margin erosion if a low-risk employee segment drops off while pricing metrics remain unchanged.



