import time
from mock_triggers import HRSystemSimulator
from api_hub import MuleSoftApiHub

class UnderwriterCockpit:
    def __init__(self, target_hub):
        self.hub = target_hub

    def review_and_adjudicate(self, agent_assessment):
        print(f"\n [Underwriter Cockpit] --- NEW ITEM ROUTED FOR ANALYST REVIEW ({agent_assessment['crmCaseId']}) ---")
        print(f" Applicant: {agent_assessment['name']} | Location: {agent_assessment['state']}")
        print(f" Agent Evaluation Output: [{agent_assessment['recommendation']}]")
        print(f" System Reasoning Statement: \"{agent_assessment['reasoning']}\"")
        
        if agent_assessment["recommendation"] == "AUTO_PASS":
            print(" [Decision Engine] Bypassing analyst interface. System auto-approval executed successfully.")
            ui_msg = f"Hi {agent_assessment['name']}, your coverage increase has been instantly approved based on account history!"
            self.hub.dispatch_final_notifications(agent_assessment["name"], "APPROVED", ui_msg)
            
        elif "MAINE" in agent_assessment["recommendation"]:
            print(" [Decision Engine] Shifting to localized fast-track validation pipeline.")
            ui_msg = f"Hi {agent_assessment['name']}, your request matches the new Maine PFML fast-track rules. Please confirm 3 simple checks in your app."
            self.hub.dispatch_final_notifications(agent_assessment["name"], "CONDITIONAL_APPROVAL", ui_msg)
            
        else:
            print(" [Human-in-the-Loop] Simulating Underwriter manual case analysis...")
            time.sleep(1.5) # Simulating human decision process
            print("️  [Underwriter Cockpit] Analyst manual override action applied: APPROVED WITH EMPATHY EXCLUSIONS.")
            ui_msg = f"Hi {agent_assessment['name']}, our care specialist has manually reviewed your case. Your supplemental protections are now active."
            self.hub.dispatch_final_notifications(agent_assessment["name"], "APPROVED_BY_SPECIALIST", ui_msg)

# ==========================================
# MASTER LIVE EXECUTION HOOK (RUN THIS FILE)
# ==========================================
if __name__ == "__main__":
    print("=========================================================================")
    print(" STARTING EPAM TRANSFORMATION DEMO: AFLAC PLADS BIONIC EOI ENGINE")
    print("=========================================================================\n")
    
    # Initialize Core Platforms
    mulesoft_platform = MuleSoftApiHub()
    workday_feed = HRSystemSimulator(mulesoft_platform)
    analyst_terminal = UnderwriterCockpit(mulesoft_platform)
    
    # SCENARIO 1: The Clean Automation Journey (Auto-Pass Validation)
    print("--- RUNNING SCENARIO 1: Alice Jenkins (Low Risk, Clean Profile) ---")
    case_1_assessment = workday_feed.trigger_coverage_change("EMP_101", "Alice Jenkins", 3000, 7000, "AFLAC_PORTAL")
    analyst_terminal.review_and_adjudicate(case_1_assessment)
    
    print("\n" + "="*50 + "\n")
    
    # SCENARIO 2: The Regional Fast-Track Play (Maine PFML Deployment Context)
    print("--- RUNNING SCENARIO 2: Bob Miller (Maine Regional Portal Onboarding) ---")
    case_2_assessment = workday_feed.trigger_coverage_change("EMP_303", "Bob Miller", 4000, 10500, "WORKDAY_BENEFITS")
    analyst_terminal.review_and_adjudicate(case_2_assessment)
    
    print("\n" + "="*50 + "\n")
    
    # SCENARIO 3: The Empathy Hand-off (Complex Case Triggering Human Review)
    print("--- RUNNING SCENARIO 3: Charles Vance (High Risk, Fragmented Profile) ---")
    case_3_assessment = workday_feed.trigger_coverage_change("EMP_202", "Charles Vance", 2000, 9000, "ADP_SYNC")
    analyst_terminal.review_and_adjudicate(case_3_assessment)

    print("\n=========================================================================")
    print(" END-TO-END DEMO EXECUTION CYCLE WRAPPED UP SUCCESSFULLY")
    print("=========================================================================")