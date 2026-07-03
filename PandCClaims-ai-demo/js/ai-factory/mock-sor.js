/* ═══════════════════════════════════════════════════════════════
   AI Factory — Mock System of Record (SOR)
   Simulates the Customer Information System and Policy Administration
   System that would exist in a production P&C carrier environment.
   Provides: customer lookup, vehicle lookup, policy lookup.

   Mock data is keyed to the Auto demo scenario:
     Claimant  : Sarah Johnson
     Policy    : LMIC-7812456
     Vehicle   : 2022 Honda Civic Silver NJZ-4821
     State     : New Jersey (NJ)

   Attaches to: window._MockSOR
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._MockSOR = {

    /* ── Customer records ──────────────────────────────────────── */
    customers: {
      'C-NJ-00847': {
        customerId      : 'C-NJ-00847',
        firstName       : 'Sarah',
        lastName        : 'Johnson',
        email           : 'sarah.johnson@email.com',
        phone           : '+1-609-555-0182',
        address         : '142 Maple Street, Princeton, NJ 08540',
        drivingLicense  : 'NJ-D4782910',
        dateOfBirth     : '1988-04-12',
        memberSince     : '2019-06-01',
        vehicles        : ['VH-NJ-7812']
      },
      'C-FL-00392': {
        customerId      : 'C-FL-00392',
        firstName       : 'Michael',
        lastName        : 'Rivera',
        email           : 'michael.rivera@email.com',
        phone           : '+1-352-555-0247',
        address         : '2847 Magnolia Court, Gainesville, FL 32601',
        drivingLicense  : 'FL-R7749201',
        dateOfBirth     : '1979-09-23',
        memberSince     : '2017-11-15',
        vehicles        : []
      },
      'C-TX-00291': {
        customerId      : 'C-TX-00291',
        entityType      : 'Commercial',
        businessName    : 'Metro Retail LLC',
        taxId           : '47-8821930',
        riskManager     : 'David Chen',
        email           : 'dchen@metroretail.com',
        phone           : '+1-512-555-0384',
        address         : '890 Commerce Blvd, Austin, TX 78701',
        industry        : 'Retail — Specialty Boutique',
        memberSince     : '2020-03-01',
        vehicles        : [],
        policies        : ['CP-TX-884721', 'BI-TX-884721', 'GL-TX-884721']
      }
    },

    /* ── Vehicle records ───────────────────────────────────────── */
    vehicles: {
      'VH-NJ-7812': {
        vehicleId    : 'VH-NJ-7812',
        vin          : '1HGBH41JXMN109186',
        make         : 'Honda',
        model        : 'Civic',
        year         : 2022,
        color        : 'Silver',
        licensePlate : 'NJZ-4821',
        mileage      : 28400
      }
    },

    /* ── Policy records ────────────────────────────────────────── */
    policies: {
      'LMIC-7812456': {
        policyNumber   : 'LMIC-7812456',
        customerId     : 'C-NJ-00847',
        status         : 'Active',
        effectiveDate  : '2025-03-01',
        expirationDate : '2026-03-01',
        annualPremium  : 1240,
        premiumStatus  : 'Current — Paid Through 2026-03-01',
        lob            : 'Personal Auto',
        state          : 'New Jersey (NJ)',
        vehicles       : ['VH-NJ-7812'],
        coverages: {
          collision: {
            active      : true,
            limit       : 25000,
            deductible  : 500,
            description : 'Covers vehicle damage in a collision event'
          },
          comprehensive: {
            active      : true,
            limit       : 25000,
            deductible  : 500,
            description : 'Covers non-collision damage (weather, theft, fire)'
          },
          liability_bodily: {
            active               : true,
            limit                : 100000,
            perOccurrenceLimit   : 300000,
            description          : 'Bodily injury liability — NJ minimum exceeded'
          },
          liability_property: {
            active      : true,
            limit       : 50000,
            description : 'Property damage liability coverage'
          },
          pip: {
            active      : true,
            limit       : 15000,
            description : 'Personal Injury Protection — NJ state-mandated'
          },
          rental_reimbursement: {
            active      : true,
            dailyLimit  : 35,
            maxDays     : 30,
            description : 'Rental car reimbursement during vehicle repair'
          },
          roadside_towing: {
            active      : true,
            limit       : 100,
            description : 'Towing and roadside assistance coverage'
          }
        },
        exclusions    : [],
        priorClaims   : 0,
        lastModified  : '2025-03-01'
      },
      'HO-FL-293847': {
        policyNumber   : 'HO-FL-293847',
        customerId     : 'C-FL-00392',
        status         : 'Active',
        effectiveDate  : '2025-11-01',
        expirationDate : '2026-11-01',
        annualPremium  : 3840,
        premiumStatus  : 'Current — Paid Through 2027-01-01',
        lob            : 'Homeowners',
        state          : 'Florida (FL)',
        vehicles       : [],
        property       : {
          address        : '2847 Magnolia Court, Gainesville, FL 32601',
          constructionType: 'Wood Frame',
          yearBuilt      : 2001,
          squareFootage  : 2340
        },
        coverages: {
          dwelling: {
            active     : true,
            limit      : 320000,
            deductible : 2500,
            description: 'Coverage A — Dwelling structure'
          },
          other_structures: {
            active     : true,
            limit      : 32000,
            description: 'Coverage B — Detached structures (10% of dwelling)'
          },
          personal_property: {
            active     : true,
            limit      : 160000,
            description: 'Coverage C — Personal property (50% of dwelling)'
          },
          loss_of_use: {
            active        : true,
            limit         : 64000,
            durationMonths: 12,
            description   : 'Coverage D — Additional Living Expense (ALE)'
          },
          liability: {
            active     : true,
            limit      : 300000,
            description: 'Coverage E — Personal liability'
          },
          medical_payments: {
            active     : true,
            limit      : 5000,
            description: 'Coverage F — Medical payments to others'
          },
          wind_hail: {
            active     : true,
            deductible : 2500,
            description: 'Wind & Hail deductible — applies to non-named storms'
          },
          hurricane: {
            active     : true,
            percentage : 2,
            note       : 'FL mandate: hurricane deductible applies to named storms only; otherwise standard wind/hail deductible applies',
            description: '2% hurricane deductible (named storms only)'
          }
        },
        exclusions    : ['Flood (requires separate NFIP policy)', 'Earthquake'],
        priorClaims   : 0,
        lastModified  : '2025-11-01'
      },

      /* ── Commercial: Metro Retail LLC (Austin TX) — 3-policy enterprise ── */
      'CP-TX-884721': {
        policyNumber   : 'CP-TX-884721',
        customerId     : 'C-TX-00291',
        status         : 'Active',
        effectiveDate  : '2025-06-01',
        expirationDate : '2026-06-01',
        annualPremium  : 8400,
        premiumStatus  : 'Current',
        lob            : 'Commercial Property',
        state          : 'Texas (TX)',
        property       : { address: '890 Commerce Blvd, Austin, TX 78701', squareFootage: 8400, constructionType: 'Masonry/Steel Frame', yearBuilt: 2004 },
        coverages: {
          building          : { active: true, limit: 500000, deductible: 5000, description: 'Commercial building — all-risk including fire' },
          business_personal_property: { active: true, limit: 120000, deductible: 5000, description: 'Inventory + equipment' },
          equipment_breakdown: { active: true, limit: 50000, description: 'Mechanical/electrical breakdown' }
        },
        exclusions     : [],
        priorClaims    : 1,
        lastModified   : '2025-06-01'
      },
      'BI-TX-884721': {
        policyNumber   : 'BI-TX-884721',
        customerId     : 'C-TX-00291',
        status         : 'Active',
        effectiveDate  : '2025-06-01',
        expirationDate : '2026-06-01',
        annualPremium  : 2800,
        premiumStatus  : 'Current',
        lob            : 'Business Interruption',
        state          : 'Texas (TX)',
        coverages: {
          business_income     : { active: true, limit: 250000, waitingPeriodDays: 3, periodOfIndemnityMonths: 12, description: 'Business income loss + extra expense' },
          extra_expense       : { active: true, limit: 50000, description: 'Extra expenses to resume operations' }
        },
        exclusions     : [],
        priorClaims    : 1,
        lastModified   : '2025-06-01'
      },
      'GL-TX-884721': {
        policyNumber   : 'GL-TX-884721',
        customerId     : 'C-TX-00291',
        status         : 'Active',
        effectiveDate  : '2025-06-01',
        expirationDate : '2026-06-01',
        annualPremium  : 3200,
        premiumStatus  : 'Current',
        lob            : 'General Liability',
        state          : 'Texas (TX)',
        coverages: {
          general_liability   : { active: true, limit: 1000000, perOccurrence: 1000000, aggregate: 2000000, deductible: 10000, description: 'CGL — premises and operations' },
          products_completed  : { active: true, limit: 1000000, description: 'Products-completed operations' }
        },
        exclusions     : [],
        priorClaims    : 0,
        lastModified   : '2025-06-01'
      }
    },

    /* ── Lookup helpers ────────────────────────────────────────── */
    getCustomerInfo: function (customerId) {
      return this.customers[customerId] || null;
    },

    getEnterprisePoliciesInfo: function (customerId) {
      var customer = this.customers[customerId] || null;
      if (!customer) return null;
      var policyNums = customer.policies || [];
      var self = this;
      var policies = policyNums.map(function (num) { return self.policies[num] || null; }).filter(Boolean);
      return {
        customerId   : customerId,
        insured      : customer.businessName || (customer.firstName + ' ' + customer.lastName),
        policyCount  : policies.length,
        policies     : policies.map(function (p) {
          return {
            number     : p.policyNumber,
            type       : p.lob,
            status     : p.status,
            limit      : p.coverages && (Object.values(p.coverages)[0] || {}).limit || null,
            deductible : p.coverages && (Object.values(p.coverages)[0] || {}).deductible || null,
            premium    : p.annualPremium,
            priorClaims: p.priorClaims
          };
        }),
        priorClaims  : policies.reduce(function (sum, p) { return sum + (p.priorClaims || 0); }, 0)
      };
    },

    getPolicyInfo: function (policyNumber) {
      var policy = this.policies[policyNumber];
      if (!policy) return null;
      var customer = this.customers[policy.customerId] || null;
      var vehicle  = customer && customer.vehicles && customer.vehicles.length
        ? this.vehicles[customer.vehicles[0]] : null;
      return {
        policyNumber   : policy.policyNumber,
        status         : policy.status,
        effectiveDate  : policy.effectiveDate,
        expirationDate : policy.expirationDate,
        annualPremium  : policy.annualPremium,
        premiumStatus  : policy.premiumStatus,
        lob            : policy.lob,
        state          : policy.state,
        property       : policy.property || null,
        coverages      : policy.coverages,
        exclusions     : policy.exclusions,
        priorClaims    : policy.priorClaims,
        customer       : customer,
        vehicle        : vehicle
      };
    },

    /* ── Simulated REST API layer ──────────────────────────────── */
    api: {
      /*
       * Simulates: GET /insurance/policy/{policyNumber}
       * Used by the orchestration step 2 function-call handler.
       * Returns a Promise so it looks like a real async network call.
       */
      getPolicy: function (policyNumber) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            var result = global._MockSOR.getPolicyInfo(policyNumber);
            if (result) {
              resolve({
                status   : 200,
                endpoint : 'GET /insurance/policy/' + policyNumber,
                data     : result
              });
            } else {
              reject(new Error('Policy not found: ' + policyNumber));
            }
          }, 280); /* Simulate 280 ms API latency */
        });
      },

      /*
       * Simulates: GET /insurance/customer/{customerId}
       */
      getCustomer: function (customerId) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            var result = global._MockSOR.getCustomerInfo(customerId);
            if (result) {
              resolve({
                status   : 200,
                endpoint : 'GET /insurance/customer/' + customerId,
                data     : result
              });
            } else {
              reject(new Error('Customer not found: ' + customerId));
            }
          }, 210);
        });
      },

      /*
       * Simulates: GET /insurance/enterprise/{customerId}/policies
       * Returns all policies linked to an enterprise customer.
       * Used by commercial orchestration step 3.
       */
      getEnterprisePolicies: function (customerId) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            var result = global._MockSOR.getEnterprisePoliciesInfo(customerId);
            if (result) {
              resolve({
                status   : 200,
                endpoint : 'GET /insurance/enterprise/' + customerId + '/policies',
                data     : result
              });
            } else {
              reject(new Error('Enterprise customer not found: ' + customerId));
            }
          }, 350);
        });
      }
    }

  };

})(window);
