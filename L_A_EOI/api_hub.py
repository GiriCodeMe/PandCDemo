import json
import os
from eoi_agent import EOIAgent

class MuleSoftApiHub:
    def __init__(self, state_file="ledger_state.json"):
        self.state_file = state_file
        self.agent = EOIAgent()

    def clear_ledger(self):
        if os.path.exists(self.state_file):
            try:
                os.remove(self.state_file)
            except OSError:
                pass

    def intercept_and_compute_event(self, raw_payload):
        """
        Intercepts incoming HRIS streaming event records, routes through Compute Agent, 
        and updates the central transaction pool file.
        """
        # Pass the tier down to the agent
        computed_case = self.agent.calculate_underwriting_decision(
            emp_id=raw_payload["emp_id"],
            name=raw_payload["name"],
            current_amt=raw_payload["current_amt"],
            requested_amt=raw_payload["requested_amt"],
            origin=raw_payload["origin"],
            tier=raw_payload.get("tier") # Catch the shuffled tier parameter cleanly
        )

        current_state = []
        if os.path.exists(self.state_file):
            try:
                with open(self.state_file, 'r') as f:
                    current_state = json.load(f)
            except json.JSONDecodeError:
                current_state = []

        current_state.append(computed_case)

        with open(self.state_file, 'w') as f:
            json.dump(current_state, f, indent=4)
            
        return computed_case