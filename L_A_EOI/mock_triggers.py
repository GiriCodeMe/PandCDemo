import random
import time
from api_hub import MuleSoftApiHub

class HRSystemSimulator:
    def __init__(self, api_hub: MuleSoftApiHub):
        self.hub = api_hub

    def simulate_batch_stream(self, count=30):
        """
        Simulates background transaction streams with completely randomized 
        risk tiers to ensure an organic UI ledger mix.
        """
        first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Elizabeth", "William", "Linda"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
        platforms = ["WORKDAY_BENEFITS", "AFLAC_PORTAL", "ADP_SYNC"]

        # Flush any residue records out of cache prior to loop execution
        self.hub.clear_ledger()

        # Step 1: Pre-generate a balanced distribution map of risk tiers (10 of each for 30 total)
        # This keeps the telemetry metrics perfectly aligned while randomizing the layout display sequence.
        tier_pool = ["GREEN"] * 10 + ["ORANGE"] * 10 + ["RED"] * 10
        random.shuffle(tier_pool)

        # Step 2: Loop through and synthesize the unique payload variants
        for i in range(1, count + 1):
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            
            # Extract the pre-shuffled tier for this iteration item
            assigned_tier = tier_pool[i - 1]
            
            # Keep Employee IDs sequential (EMP_201 to EMP_230) to eliminate data duplication glitches, 
            # while allowing the tier and platform to be dynamically assigned.
            emp_id = f"EMP_{200 + i}"
            
            if assigned_tier == "ORANGE":
                origin = "WORKDAY_BENEFITS"  # Force Workday routing vectors for regional compliance rulesets
            else:
                origin = random.choice(platforms)

            # Generate realistic policy stakes
            current_amt = random.randint(2, 5) * 1000
            requested_amt = current_amt + random.randint(3, 7) * 1000

            # Build structural payload matching api_hub expectations
            raw_payload = {
                "emp_id": emp_id,
                "name": name,
                "current_amt": current_amt,
                "requested_amt": requested_amt,
                "origin": origin,
                "tier": assigned_tier  # Explicitly pass the randomized tier parameter down the pipeline
            }
            
            # Pipe straight down to integration module framework
            self.hub.intercept_and_compute_event(raw_payload)
            
            # Short yield simulation gap to allow system I/O bounds to process cleanly
            time.sleep(0.01)

if __name__ == "__main__":
    print("🚀 Initializing standalone integration testing pipeline...")
    
    # Instantiate the pipeline components manually for standalone CLI testing
    test_hub = MuleSoftApiHub()
    test_simulator = HRSystemSimulator(test_hub)
    
    print("🔄 Intercepting and computing 30 shuffled data streams through EOIAgent...")
    test_simulator.simulate_batch_stream(30)
    
    print("✅ Generation complete! 'ledger_state.json' has been created and populated successfully.")