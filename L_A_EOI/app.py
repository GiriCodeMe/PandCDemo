import streamlit as st
import json
import os
from api_hub import MuleSoftApiHub
from mock_triggers import HRSystemSimulator

# 1. SETUP CLEAN SYSTEM VIEWPORT
st.set_page_config(
    page_title="Aflac PLADS Bionic Underwriting Platform", 
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 2. DESIGN SYSTEM CSS OVERRIDES
st.markdown("""
    <style>
        .stApp { background-color: #f7f9fc !important; color: #2d3748 !important; }
        [data-testid="collapsedControl"] { display: none !important; }
        #MainMenu, header { visibility: hidden; }
        footer { visibility: hidden !important; }
        .block-container { padding-top: 1.5rem !important; padding-bottom: 0rem !important; }
        h1, h2, h3, h4, p, span, label, button { font-family: 'Segoe UI', -apple-system, sans-serif !important; }
        
        .brand-container {
            display: flex; align-items: center; gap: 16px;
            padding: 0px 0px 16px 0px; border-bottom: 2px solid #00a5e6; margin-bottom: 16px;
        }
        .brand-logo-vector {
            width: 32px; height: 32px;
            background: linear-gradient(135deg, #00a5e6 0%, #054c86 100%);
            border-radius: 6px;
        }
        .brand-text { font-size: 24px; font-weight: 700; color: #054c86; }
        
        .filter-panel {
            background-color: #ffffff; border: 1px solid #e2e8f0; 
            padding: 12px 20px; border-radius: 6px; margin-bottom: 20px;
        }
        
        .viewer-box { 
            border-left: 2px solid #cbd5e0; 
            padding-left: 28px; 
            margin-top: 0px !important;
            padding-top: 0px !important;
        }
        
        .stButton > button {
            width: 100% !important; text-align: left !important; padding: 10px 14px !important;
            border-radius: 4px !important; border: 1px solid #e2e8f0 !important;
            background-color: #ffffff !important; margin-bottom: 3px !important;
        }
        
        .telemetry-card {
            background-color: #ffffff; border: 1px solid #e2e8f0; padding: 16px;
            border-radius: 4px; margin-bottom: 12px;
        }
        .telemetry-label { color: #718096; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .telemetry-value { color: #054c86; font-size: 20px; font-weight: 700; }
        
        .section-header { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #718096; margin-top: 14px; margin-bottom: 4px; }
        .data-text { font-size: 14px; color: #2d3748; background-color: #ffffff; padding: 12px 16px; border-radius: 4px; border: 1px solid #e2e8f0; line-height: 1.5; }
        
        .blank-canvas {
            background-color: #ffffff; border: 1px dashed #cbd5e0; padding: 60px;
            text-align: center; color: #718096; border-radius: 6px;
        }
        .aflac-footer {
            margin-top: 50px; padding: 24px 0px; border-top: 1px solid #cbd5e0;
            font-size: 11px; color: #718096; line-height: 1.6;
        }
        .footer-links { margin-bottom: 8px; font-weight: 600; color: #054c86; }
        .epam-badge { font-weight: 700; color: #73b51a; text-transform: uppercase; }
    </style>
""", unsafe_allow_html=True)

# 3. CONSTRUCT RECOVERY ARCHITECTURE INFRASTRUCTURE
@st.cache_resource
def get_backend_infrastructure():
    _hub = MuleSoftApiHub()
    _simulator = HRSystemSimulator(_hub)
    return _hub, _simulator

hub, simulator = get_backend_infrastructure()

# 4. BRAND VIEWPORT HEADER
st.markdown("""
<div class="brand-container">
    <div class="brand-logo-vector"></div>
    <div class="brand-text">Aflac PLADS Bionic Underwriting Platform</div>
</div>
""", unsafe_allow_html=True)

state_file = "ledger_state.json"
cases_data = []

if os.path.exists(state_file):
    try:
        with open(state_file, 'r') as f:
            cases_data = json.load(f)
    except:
        cases_data = []

# Action Controller Setup
col_spacer, col_action = st.columns([3, 1])
with col_action:
    if st.button("🔄 Initialize System Batch Sync", type="primary"):
        with st.spinner("Processing background stream data pipeline..."):
            hub.clear_ledger()
            simulator.simulate_batch_stream(50)
            if os.path.exists(state_file):
                with open(state_file, 'r') as f:
                    fresh_data = json.load(f)
                    if fresh_data:
                        st.session_state.active_case_id = fresh_data[0]['id']
        st.rerun()

tab_workbench, tab_telemetry = st.tabs(["Bionic Underwriter Workbench", "Operational Telemetry Platform"])

# ==========================================
# TAB 1: BIONIC UNDERWRITER WORKBENCH
# ==========================================
with tab_workbench:
    if len(cases_data) == 0:
        st.markdown("""
            <div class="blank-canvas">
                <h4 style="color:#054c86; margin-bottom:8px;">Awaiting Stream Connection Gateway Initialization</h4>
                <p style="margin:0; font-size:14px;">The active workbench space is currently unpopulated. Click 'Initialize System Batch Sync' below to trigger the MuleSoft intercept architecture protocols.</p>
            </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown("### Operational Case Management Workspace")
        
        # Horizontal Domain Selection Control
        st.markdown('<div class="filter-panel">', unsafe_allow_html=True)
        filter_type = st.radio(
            "Select Global Workspace Domain Filter:",
            ["ALL", "EOI", "ABSENCE", "BILLING", "COB", "PORTABILITY"],
            horizontal=True,
            key="workload_filter"
        )
        st.markdown('</div>', unsafe_allow_html=True)
        
        if not isinstance(cases_data, list):
            cases_data = []

        # Granular Case-Insensitive Matching Layout Block
        filtered_cases = []
        for c in cases_data:
            if isinstance(c, dict):
                w_profile = str(c.get('work_profile', c.get('profile', ''))).strip().upper()
                case_id = str(c.get('id', '')).upper()
                
                if not w_profile:
                    if "EOI" in case_id: w_profile = "EOI"
                    elif "ABSENCE" in case_id: w_profile = "ABSENCE"
                    elif "BILLING" in case_id: w_profile = "BILLING"
                    elif "COB" in case_id: w_profile = "COB"
                    elif "PORTABILITY" in case_id: w_profile = "PORTABILITY"

                if filter_type == "ALL" or w_profile == str(filter_type).upper():
                    filtered_cases.append(c)
        
        if len(filtered_cases) == 0 and len(cases_data) > 0 and filter_type != "ALL":
            st.warning(f"Filter mismatch diagnostics: The ledger file contains keys like: {list(cases_data[0].keys())} and values like profile='{cases_data[0].get('work_profile') or cases_data[0].get('profile')}'")
        
        if len(filtered_cases) > 0:
            allowed_ids = [c['id'] for c in filtered_cases]
            if st.session_state.get('active_case_id') not in allowed_ids:
                st.session_state.active_case_id = filtered_cases[0]['id']
        
        col_left_panel, col_right_panel = st.columns([1.3, 2])
        
        with col_left_panel:
            st.markdown("<p style='font-size:12px; font-weight:700; color:#718096; text-transform:uppercase; margin-bottom:10px;'>Active System Stream Ledger</p>", unsafe_allow_html=True)
            
            if len(filtered_cases) == 0:
                st.info(f"No streaming sequences captured for: {filter_type}")
            else:
                for item in filtered_cases:
                    badge = "🟢" if item['tier'] == "GREEN" else "🟡" if item['tier'] == "ORANGE" else "🔴"
                    is_selected = (item['id'] == st.session_state.get('active_case_id'))
                    btn_label = f"{badge} {'➡️ ' if is_selected else ''}{item['id']} — {item['name']}"
                    
                    if st.button(btn_label, key=f"ui_{item['id']}"):
                        st.session_state.active_case_id = item['id']
                        st.rerun()
                        
        with col_right_panel:
            st.markdown('<div class="viewer-box">', unsafe_allow_html=True)
            
            selected_case = next((c for c in cases_data if c['id'] == st.session_state.get('active_case_id')), None)
            if selected_case is None and len(filtered_cases) > 0:
                selected_case = filtered_cases[0]
                st.session_state.active_case_id = selected_case['id']
                
            if selected_case:
                st.markdown(f"<h3 style='margin-top:0px; padding-top:0px; color:#054c86;'>Underwriting Context: {selected_case['name']}</h3>", unsafe_allow_html=True)
                st.markdown(f"<p style='font-size:14px; color:#4a5568;'><strong>System Case Key:</strong> <code>{selected_case['id']}</code></p>", unsafe_allow_html=True)
                st.markdown("---")
                
                st.markdown('<div class="section-header">Case Origination Footprint</div>', unsafe_allow_html=True)
                
                raw_wp = str(selected_case.get('work_profile', '')).strip().upper()
                if not raw_wp:
                    if "EOI" in str(selected_case.get('id', '')).upper(): raw_wp = "EOI"
                    elif "ABSENCE" in str(selected_case.get('id', '')).upper(): raw_wp = "ABSENCE"
                    elif "BILLING" in str(selected_case.get('id', '')).upper(): raw_wp = "BILLING"
                    elif "COB" in str(selected_case.get('id', '')).upper(): raw_wp = "COB"
                    elif "PORTABILITY" in str(selected_case.get('id', '')).upper(): raw_wp = "PORTABILITY"
                
                st.markdown(f"""
                    <div class="data-text">
                        <strong>Ingestion Protocol Gateway:</strong> <code>{selected_case['origin']}</code><br>
                        <strong>Functional Workload Domain:</strong> {raw_wp} Lifecycle Engine
                    </div>
                """, unsafe_allow_html=True)
                
                st.markdown('<div class="section-header">Compute Metric Summary</div>', unsafe_allow_html=True)
                
                # Contextual Data-Swapping Metric Structure (UC 1 to UC 5)
                if raw_wp == "BILLING":
                    label_curr, label_req, label_delta = "Expected Ledger Invoice Premium:", "Actual Clearing Account Remittance:", "Calculated Invoice Variance Delta:"
                elif raw_wp == "COB":
                    label_curr, label_req, label_delta = "Primary Carrier Liability Limit:", "Secondary Coordinated Claim Intake:", "System Subrogation Calculation Exposure:"
                elif raw_wp == "PORTABILITY":
                    label_curr, label_req, label_delta = "Baseline Group Census Volume:", "Active Ported Account Changes:", "Recalculated Aggregate TCV Break Delta:"
                else:
                    label_curr, label_req, label_delta = "Baseline Policy Coverage Stake:", "Target Modification Threshold Request:", "Computed Delta Variance Threshold:"
                    
                st.markdown(f"""
                    <div class="data-text">
                        <strong>{label_curr}</strong> ${selected_case['current']:,}<br>
                        <strong>{label_req}</strong> ${selected_case['requested']:,}<br>
                        <strong>{label_delta}</strong> ${selected_case['delta']:,}<br>
                        <strong>Algorithmic Validation Status:</strong> {selected_case['status_label']}
                    </div>
                """, unsafe_allow_html=True)
                
                st.markdown('<div class="section-header">Core Automated Decision Reasoning</div>', unsafe_allow_html=True)
                st.markdown(f'<div class="data-text">{selected_case["reasoning"]}</div>', unsafe_allow_html=True)
                
                st.markdown('<div class="section-header">Conclusion and System Next Steps</div>', unsafe_allow_html=True)
                st.markdown(f'<div class="data-text" style="border-left: 4px solid #00a5e6; font-weight: 500;">{selected_case["next_steps"]}</div>', unsafe_allow_html=True)
            
            st.markdown('</div>', unsafe_allow_html=True)

# ==========================================
# TAB 2: OPERATIONAL TELEMETRY PLATFORM
# ==========================================
with tab_telemetry:
    if len(cases_data) == 0:
        st.markdown("""
            <div class="blank-canvas">
                <h4 style="color:#054c86; margin-bottom:8px;">No Aggregated Infrastructure Telemetry Available</h4>
                <p style="margin:0; font-size:14px;">Telemetry channels will illuminate once data routing records populate via the primary sync system container.</p>
            </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown("### Functional Workload Telemetry Streams")
        st.markdown("<br>", unsafe_allow_html=True)
        
        t_eoi, t_abs, t_bil, t_cob, t_port = 0, 0, 0, 0, 0
        for c in cases_data:
            c_id = str(c.get('id', '')).upper()
            wp = str(c.get('work_profile', c.get('profile', ''))).strip().upper()
            if "EOI" in c_id or wp == "EOI": t_eoi += 1
            elif "ABSENCE" in c_id or wp == "ABSENCE": t_abs += 1
            elif "BILLING" in c_id or wp == "BILLING": t_bil += 1
            elif "COB" in c_id or wp == "COB": t_cob += 1
            elif "PORTABILITY" in c_id or wp == "PORTABILITY": t_port += 1
        
        # Five-Column Telemetry Dashboard Component Layout
        col_1, col_2, col_3, col_4, col_5 = st.columns(5)
        with col_1:
            st.markdown(f"""<div class="telemetry-card"><div class="telemetry-label">Evidence of Insurability</div><div class="telemetry-value">{t_eoi} Intercepts</div><p style="color:#10b981; font-size:11px; margin:4px 0 0 0; font-weight:600;">▲ Touchless Active</p></div>""", unsafe_allow_html=True)
        with col_2:
            st.markdown(f"""<div class="telemetry-card"><div class="telemetry-label">Absence & Claims</div><div class="telemetry-value">{t_abs} Staged</div><p style="color:#fab25a; font-size:11px; margin:4px 0 0 0; font-weight:600;">● Mid-Market Scale</p></div>""", unsafe_allow_html=True)
        with col_3:
            st.markdown(f"""<div class="telemetry-card"><div class="telemetry-label">Retro Invoicing</div><div class="telemetry-value">{t_bil} Audited</div><p style="color:#054c86; font-size:11px; margin:4px 0 0 0; font-weight:600;">■ MDM Bound Checked</p></div>""", unsafe_allow_html=True)
        with col_4:
            st.markdown(f"""<div class="telemetry-card"><div class="telemetry-label">Coordination of Benefits</div><div class="telemetry-value">{t_cob} Cross-Audited</div><p style="color:#73b51a; font-size:11px; margin:4px 0 0 0; font-weight:600;">▲ NAIC Rules Aligned</p></div>""", unsafe_allow_html=True)
        with col_5:
            st.markdown(f"""<div class="telemetry-card"><div class="telemetry-label">Premium Portability</div><div class="telemetry-value">{t_port} Optimized</div><p style="color:#e06666; font-size:11px; margin:4px 0 0 0; font-weight:600;">▼ Aggregation Tier-Match</p></div>""", unsafe_allow_html=True)

# ==========================================
# COMPLIANCE FOOTER
# ==========================================
st.markdown("""
<div class="aflac-footer">
    <div class="footer-links">
        Aflac Home | Privacy Policy | Terms of Use | Security Practices | Enterprise MDM Gateway Audit Logs
    </div>
    <div>
        © 2026 American Family Life Assurance Company of Columbus (Aflac) | WWHQ | 1932 Wynnton Road, Columbus, Georgia 31999.<br>
        Confidentiality Notice: This interface access framework contains proprietary computational logic models and private group insurance account data streams. Unauthorized system access or data exploitation is strictly prohibited.<br>
        <span style="display:inline-block; margin-top:8px; font-size:10px; color:#a0aec0;">
            Architecture Solution Ingestion Layer Platform • <span class="epam-badge">Powered by EPAM</span>
        </span>
    </div>
</div>
""", unsafe_allow_html=True)