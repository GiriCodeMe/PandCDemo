import random
import time
from api_hub import MuleSoftApiHub

class HRSystemSimulator:
    def __init__(self, api_hub: MuleSoftApiHub):
        self.hub = api_hub

    def simulate_batch_stream(self, count=50):
        """
        Generates clean stream data records evenly across 5 distinct Use Case domains (10 per domain)
        """
        first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Elizabeth", "William", "Linda"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
        platforms = ["WORKDAY_BENEFITS", "AFLAC_PORTAL", "ADP_SYNC"]

        self.hub.clear_ledger()

        # Allocate exactly 10 transactions per Use Case domain to hit target count of 50
        pool_configs = []
        for _ in range(10): pool_configs.append({"work_profile": "EOI", "tier": "GREEN"})
        for _ in range(10): pool_configs.append({"work_profile": "ABSENCE", "tier": "ORANGE"})
        for _ in range(10): pool_configs.append({"work_profile": "BILLING", "tier": "RED"})
        for _ in range(10): pool_configs.append({"work_profile": "COB", "tier": "GREEN"})
        for _ in range(10): pool_configs.append({"work_profile": "PORTABILITY", "tier": "ORANGE"})
        
        random.shuffle(pool_configs)

        for i in range(1, len(pool_configs) + 1):
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            config = pool_configs[i - 1]
            
            work_profile = config["work_profile"]
            assigned_tier = config["tier"]
            emp_id = f"{work_profile}_{1000 + i}"
            origin = random.choice(platforms)

            # Establish baseline financials and variance requests
            current_amt = random.randint(2, 6) * 1000
            requested_amt = current_amt + random.choice([-1000, 0, 2000, 5000])

            raw_payload = {
                "emp_id": emp_id,
                "name": name,
                "current_amt": current_amt,
                "requested_amt": requested_amt,
                "origin": origin,
                "tier": assigned_tier,
                "work_profile": work_profile
            }
            
            self.hub.intercept_and_compute_event(raw_payload)
            time.sleep(0.005)