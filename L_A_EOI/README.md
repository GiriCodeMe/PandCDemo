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



