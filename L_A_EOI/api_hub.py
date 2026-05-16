import json
import os
from eoi_agent import EOIAgent

class MuleSoftApiHub:
    def __init__(self):
        self.state_file = "ledger_state.json"
        self.agent = EOIAgent()

    def clear_ledger(self):
        if os.path.exists(self.state_file):
            try: os.remove(self.state_file)
            except: pass

    def intercept_and_compute_event(self, raw_payload):
        emp_id = raw_payload.get("emp_id")
        name = raw_payload.get("name")
        current_amt = raw_payload.get("current_amt", 0)
        requested_amt = raw_payload.get("requested_amt", 0)
        origin = raw_payload.get("origin", "UNKNOWN_GATEWAY")
        tier = raw_payload.get("tier", "GREEN")
        
        # Capture the work profile from the simulator payload explicitly!
        work_profile = raw_payload.get("work_profile", "EOI")

        computed_record = self.agent.calculate_underwriting_decision(
            emp_id=emp_id,
            name=name,
            current_amt=current_amt,
            requested_amt=requested_amt,
            origin=origin,
            tier=tier,
            work_profile=work_profile
        )

        current_state = []
        if os.path.exists(self.state_file):
            try:
                with open(self.state_file, 'r') as f:
                    current_state = json.load(f)
            except:
                current_state = []

        current_state.append(computed_record)

        with open(self.state_file, 'w') as f:
            json.dump(current_state, f, indent=4)