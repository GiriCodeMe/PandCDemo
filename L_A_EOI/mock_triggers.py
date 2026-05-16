import random
import time
from api_hub import MuleSoftApiHub

class HRSystemSimulator:
    def __init__(self, api_hub: MuleSoftApiHub):
        self.hub = api_hub

    def simulate_batch_stream(self, count=30):
        """
        Generates 30 distinct records across EOI, ABSENCE, and BILLING
        """
        first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Elizabeth", "William", "Linda"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
        platforms = ["WORKDAY_BENEFITS", "AFLAC_PORTAL", "ADP_SYNC"]

        self.hub.clear_ledger()

        # Build an exact, balanced 30-item allocation pool
        pool_configs = []
        for _ in range(10): pool_configs.append({"work_profile": "EOI", "tier": "GREEN"})
        for _ in range(10): pool_configs.append({"work_profile": "ABSENCE", "tier": "ORANGE"})
        for _ in range(10): pool_configs.append({"work_profile": "BILLING", "tier": "RED"})
        
        random.shuffle(pool_configs)

        for i in range(1, count + 1):
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            config = pool_configs[i - 1]
            
            work_profile = config["work_profile"]
            assigned_tier = config["tier"]
            emp_id = f"{work_profile}_{1000 + i}"
            origin = random.choice(platforms)

            current_amt = random.randint(2, 5) * 1000
            requested_amt = current_amt + random.randint(3, 7) * 1000

            raw_payload = {
                "emp_id": emp_id,
                "name": name,
                "current_amt": current_amt,
                "requested_amt": requested_amt,
                "origin": origin,
                "tier": assigned_tier,
                "work_profile": work_profile  # <-- CRITICAL: Passed here
            }
            
            self.hub.intercept_and_compute_event(raw_payload)
            time.sleep(0.01)