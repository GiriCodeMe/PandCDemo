/* ═══════════════════════════════════════════════════════════════
   AI Factory — Mock External Data APIs (Commercial Claims)
   Simulates enterprise enrichment services triggered by Gemini
   function calling during the Commercial FNOL orchestration pipeline.

   APIs simulated:
     GET /weather/catastrophe          — Cat event check + fire weather
     GET /assets/facility/{id}         — Building/equipment inventory + RCV
     GET /erp/financials/{customerId}  — Revenue baseline + BI modeling inputs

   Mock data keyed to the Commercial demo scenario:
     Insured   : Metro Retail LLC
     Location  : 890 Commerce Blvd, Austin, TX 78701
     Incident  : Electrical fire — rear storage area
     ZIP       : 78701 (Travis County, TX)

   Attaches to: window._MockCommercialAPIs
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._MockCommercialAPIs = {

    /* ── Weather / Catastrophe database ─────────────────────────── */
    _weatherCatDb: {
      '78701': {
        observationDate    : 'April 12, 2026',
        conditions         : 'Clear — Normal Conditions',
        temperature        : '74°F',
        relativeHumidity   : '42%',
        windSpeed          : '8 mph SW',
        precipitationMM    : 0,
        catEventId         : null,
        catDesignation     : 'Non-Cat Event — No Active CAT Declaration',
        fireWeather: {
          redFlagWarning   : false,
          droughtIndex     : 'D0 (Abnormally Dry)',
          fireSpreadRisk   : 'Low — contained structure, no wildland interface'
        },
        county             : 'Travis County, TX',
        validatedDate      : '2026-04-12',
        externalIgnitionRisk: 'None — electrical internal origin confirmed by AFD'
      }
    },

    /* ── Asset / Facility database ───────────────────────────────── */
    _assetDb: {
      '890-commerce-austin': {
        facilityId          : 'FAC-TX-4421',
        insured             : 'Metro Retail LLC',
        address             : '890 Commerce Blvd, Austin, TX 78701',
        constructionType    : 'Masonry/Steel Frame',
        yearBuilt           : 2004,
        squareFootage       : 8400,
        affectedArea        : '2,400 sq ft — Rear Storage & Utility Room',
        buildingRCV         : 420000,
        building: {
          replacementCostValue : 420000,
          depreciatedValue     : 318000,
          lastAppraisal        : '2025-03-01'
        },
        equipment: {
          electricalInfrastructure: { rcv: 42000, age: 8 },
          hvacSystem              : { rcv: 28000, age: 5 },
          sprinklerSystem         : { rcv: 18500, age: 8, inspected: '2025-11-10' },
          posTerminals            : { rcv: 12000, age: 2 }
        },
        totalEquipmentRCV   : 100500,
        inventory: {
          estimatedValue      : 62000,
          skuCount            : 847,
          storageLocation     : 'Rear storage — primary fire area'
        },
        lastSafetyInspection: '2025-09-20',
        violationsOnRecord  : 0,
        maintenanceHistory  : [
          { date: '2025-09-20', type: 'Electrical inspection', result: 'Pass' },
          { date: '2025-11-10', type: 'Sprinkler inspection',  result: 'Pass' }
        ]
      }
    },

    /* ── ERP / Finance database ──────────────────────────────────── */
    _erpDb: {
      'C-TX-00291': {
        entityName          : 'Metro Retail LLC',
        customerId          : 'C-TX-00291',
        industry            : 'Retail — Specialty Boutique',
        monthlyRevenue      : 380000,
        dailyRevenue        : 12667,
        annualRevenue       : 4560000,
        grossMargin         : 0.48,
        payrollMonthly      : 45000,
        fixedCostsMonthly   : 62000,
        downtimeCostPerHour : 528,
        downtimeCostPerDay  : 12667,
        employeeCount       : 14,
        businessHours       : '9am-9pm Mon-Sat, 10am-6pm Sun',
        revenueHistory: [
          { month: '2026-01', revenue: 372000 },
          { month: '2026-02', revenue: 358000 },
          { month: '2026-03', revenue: 391000 },
          { month: '2026-04', revenue: 0, note: 'Fire event — partial month' }
        ],
        priorClaims: [
          { date: '2024-12-15', type: 'Business Interruption', amount: 28000, policy: 'BI-TX-884721-PREV', status: 'Settled' }
        ],
        taxId               : '47-8821930',
        domicileState       : 'Texas'
      }
    },

    /* ── Gemini function declarations ────────────────────────────── */
    FUNCTION_DECLARATIONS: [
      {
        name        : 'get_weather_catastrophe_data',
        description : 'Fetch weather conditions and catastrophe event status for the loss location and date. Determines if the incident occurred during a declared CAT event, fire weather warning, or natural disaster.',
        parameters  : {
          type      : 'object',
          properties: {
            zip_code : { type: 'string', description: 'ZIP code of the commercial property location' },
            loss_date: { type: 'string', description: 'Date of the reported loss event' }
          },
          required: ['zip_code']
        }
      },
      {
        name        : 'get_asset_facility_inventory',
        description : 'Retrieve commercial facility data including building replacement cost value, equipment inventory, and prior inspection history from the Asset Management System.',
        parameters  : {
          type      : 'object',
          properties: {
            facility_address: { type: 'string', description: 'Full address of the commercial facility' },
            facility_id     : { type: 'string', description: 'Optional: internal facility ID if known' }
          },
          required: ['facility_address']
        }
      },
      {
        name        : 'get_erp_financial_data',
        description : 'Retrieve revenue history, payroll exposure, daily downtime cost, and prior claims data from the ERP / financial system. Used for Business Interruption modeling.',
        parameters  : {
          type      : 'object',
          properties: {
            customer_id: { type: 'string', description: 'Enterprise customer ID' },
            months_back: { type: 'number', description: 'Number of months of revenue history to retrieve (default 12)' }
          },
          required: ['customer_id']
        }
      }
    ],

    /* ── Simulated REST API calls ─────────────────────────────────── */
    api: {

      /*
       * GET /weather/catastrophe?zip={zip}&date={date}
       * 320 ms simulated latency
       */
      getWeatherCatastrophe: function (zipCode) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            var zip  = (zipCode || '78701').toString().substring(0, 5);
            var data = global._MockCommercialAPIs._weatherCatDb[zip] || {
              catEventId     : null,
              catDesignation : 'No Data — manual verification required'
            };
            resolve({
              status  : 200,
              endpoint: 'GET /weather/catastrophe?zip=' + zip,
              data    : data
            });
          }, 320);
        });
      },

      /*
       * GET /assets/facility/{encoded-address}
       * 410 ms simulated latency — asset registry lookup
       */
      getAssetFacilityInventory: function (facilityAddress) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            var addr  = (facilityAddress || '').toLowerCase();
            var match = addr.includes('890') || addr.includes('commerce') || addr.includes('78701') || addr.includes('austin');
            var data  = match
              ? global._MockCommercialAPIs._assetDb['890-commerce-austin']
              : { buildingRCV: null, note: 'Facility record not found' };
            resolve({
              status  : 200,
              endpoint: 'GET /assets/facility/' + encodeURIComponent(facilityAddress || ''),
              data    : data
            });
          }, 410);
        });
      },

      /*
       * GET /erp/financials/{customerId}
       * 380 ms simulated latency — ERP integration
       */
      getERPFinancialData: function (customerId) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            var data = global._MockCommercialAPIs._erpDb[customerId] ||
                       global._MockCommercialAPIs._erpDb['C-TX-00291'];
            resolve({
              status  : 200,
              endpoint: 'GET /erp/financials/' + (customerId || 'C-TX-00291'),
              data    : data
            });
          }, 380);
        });
      },

      /* Dispatcher used by the orchestration function-call handler */
      dispatch: function (funcName, args) {
        if (funcName === 'get_weather_catastrophe_data') {
          return global._MockCommercialAPIs.api.getWeatherCatastrophe(args.zip_code, args.loss_date);
        }
        if (funcName === 'get_asset_facility_inventory') {
          return global._MockCommercialAPIs.api.getAssetFacilityInventory(args.facility_address);
        }
        if (funcName === 'get_erp_financial_data') {
          return global._MockCommercialAPIs.api.getERPFinancialData(args.customer_id);
        }
        return Promise.reject(new Error('Unknown commercial API function: ' + funcName));
      }
    }

  };

})(window);
