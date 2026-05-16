import streamlit as st
import json
import os
from api_hub import MuleSoftApiHub
from mock_triggers import HRSystemSimulator

# 1. SETUP CLEAN VIEWPORT ENVIRONMENT
st.set_page_config(
    page_title="Aflac PLADS Bionic Underwriting Platform", 
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 2. BRAND PALETTE STYLE MANAGEMENT
st.markdown("""
    <style>
        .stApp { background-color: #f7f9fc !important; color: #2d3748 !important; }
        [data-testid="collapsedControl"] { display: none !important; }
        #MainMenu, header, footer { visibility: hidden; }
        .block-container { padding-top: 1.5rem !important; padding-bottom: 2rem !important; }
        h1, h2, h3, h4, p, span, label, button { font-family: 'Segoe UI', -apple-system, sans-serif !important; }
        
        .brand-container {
            display: flex; align-items: center; gap: 16px;
            padding: 0px 0px 16px 0px; border-bottom: 2px solid #00a5e6; margin-bottom: 24px;
        }
        .brand-logo-vector {
            width: 32px; height: 32px;
            background: linear-gradient(135deg, #00a5e6 0%, #054c86 100%);
            border-radius: 6px;
        }
        .brand-text { font-size: 24px; font-weight: 700; color: #054c86; }
        
        .stTabs [data-baseweb="tab-list"] { gap: 4px; background-color: transparent; border-bottom: 1px solid #cbd5e0; }
        .stTabs [data-baseweb="tab"] {
            background-color: #edf2f7; border: 1px solid #cbd5e0;
            padding: 8px 18px; border-radius: 4px 4px 0 0; color: #4a5568; font-size: 14px; font-weight: 600;
        }
        .stTabs [aria-selected="true"] {
            background-color: #ffffff !important; color: #054c86 !important;
            border-color: #cbd5e0 !important; border-bottom: 1px solid #ffffff !important;
        }

        .stButton > button {
            width: 100% !important; text-align: left !important; padding: 10px 14px !important;
            border-radius: 4px !important; border: 1px solid #e2e8f0 !important;
            background-color: #ffffff !important; margin-bottom: 2px !important;
        }
        
        .telemetry-card {
            background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px;
            border-radius: 4px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .telemetry-label { color: #718096; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .telemetry-value { color: #054c86; font-size: 26px; font-weight: 700; }
        
        .section-header { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #718096; margin-top: 16px; margin-bottom: 4px; }
        .data-text { font-size: 14px; color: #2d3748; background-color: #ffffff; padding: 12px 16px; border-radius: 4px; border: 1px solid #e2e8f0; line-height: 1.5; }
        .blank-canvas {
            background-color: #ffffff; border: 1px dashed #cbd5e0; padding: 80px;
            text-align: center; color: #718096; border-radius: 6px; margin-top: 20px;
        }
    </style>
""", unsafe_allow_html=True)

# Use Streamlit's resource caching to ensure the hub and simulator persist without refreshing state files unexpectedly
@st.cache_resource
def get_backend_infrastructure():
    _hub = MuleSoftApiHub()
    _simulator = HRSystemSimulator(_hub)
    return _hub, _simulator

hub, simulator = get_backend_infrastructure()

# 4. SITE CORPORATE BRANDING HEADER
st.markdown("""
<div class="brand-container">
    <div class="brand-logo-vector"></div>
    <div class="brand-text">Aflac PLADS Underwriting Platform</div>
</div>
""", unsafe_allow_html=True)

state_file = "ledger_state.json"
cases_data = []

# Try to read file data cleanly
if os.path.exists(state_file):
    try:
        with open(state_file, 'r') as f:
            cases_data = json.load(f)
    except:
        cases_data = []

# Layout administrative baseline triggers inside an isolated bottom container row
col_spacer, col_action = st.columns([3, 1])
with col_action:
    if st.button("🔄 Initialize System Batch Sync", type="primary"):
        with st.spinner("Processing background stream data pipeline..."):
            # Manually clear it right here on button click intention ONLY
            hub.clear_ledger()
            simulator.simulate_batch_stream(30)
        st.rerun()

# 5. TAB VIEW CONTROLS
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
        st.markdown("<br>", unsafe_allow_html=True)
        
        col_ledger, col_viewer = st.columns([1.2, 2])
        
        if 'active_case_id' not in st.session_state or not any(c['id'] == st.session_state.active_case_id for c in cases_data):
            st.session_state.active_case_id = cases_data[0]['id']
            
        with col_ledger:
            st.markdown("<p style='font-size:12px; font-weight:700; color:#718096; text-transform:uppercase;'>Active System Stream Ledger</p>", unsafe_allow_html=True)
            for item in cases_data:
                badge = "🟢" if item['tier'] == "GREEN" else "🟡" if item['tier'] == "ORANGE" else "🔴"
                if st.button(f"{badge} {item['id']} — {item['name']}", key=f"ui_{item['id']}"):
                    st.session_state.active_case_id = item['id']
                    
        with col_viewer:
            selected_case = next((c for c in cases_data if c['id'] == st.session_state.active_case_id), cases_data[0])
            
            st.markdown(f"### Underwriting Context: {selected_case['name']} (`{selected_case['id']}`)")
            st.markdown("---")
            
            st.markdown('<div class="section-header">Case Origination Footprint</div>', unsafe_allow_html=True)
            st.markdown(f"""
                <div class="data-text">
                    <strong>Ingestion Protocol Gateway:</strong> <code>{selected_case['origin']}</code><br>
                    <strong>Source Validation Anchor:</strong> MuleSoft Core Enterprise Integration Pipeline Layer
                </div>
            """, unsafe_allow_html=True)
            
            st.markdown('<div class="section-header">Compute Metric Summary</div>', unsafe_allow_html=True)
            st.markdown(f"""
                <div class="data-text">
                    <strong>Baseline Policy Coverage Stake:</strong> ${selected_case['current']:,}<br>
                    <strong>Target Modification Threshold Request:</strong> ${selected_case['requested']:,}<br>
                    <strong>Computed Delta Variance:</strong> +${selected_case['delta']:,}<br>
                    <strong>Algorithmic Validation Status:</strong> {selected_case['status_label']}
                </div>
            """, unsafe_allow_html=True)
            
            st.markdown('<div class="section-header">Core Automated Decision Reasoning</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="data-text">{selected_case["reasoning"]}</div>', unsafe_allow_html=True)
            
            st.markdown('<div class="section-header">Conclusion and System Next Steps</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="data-text" style="border-left: 4px solid #00a5e6; font-weight: 500;">{selected_case["next_steps"]}</div>', unsafe_allow_html=True)

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
        st.markdown("### Aggregated Stream Health Metrics")
        st.markdown("<br>", unsafe_allow_html=True)
        
        g_count = sum(1 for c in cases_data if c['tier'] == 'GREEN')
        o_count = sum(1 for c in cases_data if c['tier'] == 'ORANGE')
        r_count = sum(1 for c in cases_data if c['tier'] == 'RED')
        
        col_card_1, col_card_2, col_card_3 = st.columns(3)
        with col_card_1:
            st.markdown(f"""<div class="telemetry-card"><div class="telemetry-label">Touchless Process Velocity</div><div class="telemetry-value">{g_count}/{len(cases_data)} Cases</div><p style="color:#10b981; font-size:12px; margin:4px 0 0 0; font-weight:600;">▲ Automated core bypass active</p></div>""", unsafe_allow_html=True)
        with col_card_2:
            st.markdown(f"""<div class="telemetry-card"><div class="telemetry-label">Regional Provisional Trajectory</div><div class="telemetry-value">{o_count}/{len(cases_data)} Cases</div><p style="color:#fab25a; font-size:12px; margin:4px 0 0 0; font-weight:600;">● Staged within Maine PFML structures</p></div>""", unsafe_allow_html=True)
        with col_card_3:
            st.markdown(f"""<div class="telemetry-card"><div class="telemetry-label">Manual Attention Overhead</div><div class="telemetry-value">{r_count}/{len(cases_data)} Cases</div><p style="color:#054c86; font-size:12px; margin:4px 0 0 0; font-weight:600;">■ Assigned onto analyst worklists</p></div>""", unsafe_allow_html=True)