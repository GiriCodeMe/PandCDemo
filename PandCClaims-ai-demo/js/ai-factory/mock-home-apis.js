/* ═══════════════════════════════════════════════════════════════
   AI Factory — Mock External Data APIs (Home Claims)
   Simulates three external enrichment services that Gemini triggers
   via function calling during the Home FNOL orchestration pipeline.

   APIs simulated:
     GET /weather/history          — NWS storm event validation
     GET /property/roof-risk-score — Roof age, material, RCV, risk score
     GET /contractor/network       — Licensed contractor availability

   Mock data keyed to the Home demo scenario:
     Property  : 2847 Magnolia Court, Gainesville, FL 32601
     ZIP       : 32601 (Alachua County, FL)
     Storm     : Severe Thunderstorm + Hail — April 2026

   Attaches to: window._MockHomeAPIs
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._MockHomeAPIs = {

    /* ── Weather event database ──────────────────────────────────── */
    _weatherDb: {
      '32601': {
        nwsEventId      : 'NWS-FL-2026-041203',
        stormType       : 'Severe Thunderstorm — Hail & Wind',
        date            : 'April 12, 2026',
        hailSize        : '1.25 inches (Moderate)',
        maxWindGust     : '58 mph',
        sustainedWind   : '43 mph',
        rainfall        : '1.8 inches over 2 hours',
        county          : 'Alachua County, FL',
        stormTrack      : 'Confirmed track over Gainesville NW quadrant',
        stormTrackConfirmed: true,
        perilValidation : 'CONFIRMED — Hail / Wind'
      }
    },

    /* ── Property / roof-risk database ──────────────────────────── */
    _propertyDb: {
      '2847-magnolia': {
        address             : '2847 Magnolia Court, Gainesville, FL 32601',
        roofAge             : 6,
        roofMaterial        : 'Architectural Shingles (30-yr rated)',
        constructionType    : 'Wood Frame',
        roofRiskScore       : 0.42,
        replacementCostValue: '$318,000',
        yearBuilt           : 2001,
        squareFootage       : 2340,
        roofSquares         : 28,
        lastInspection      : '2022-04-15'
      }
    },

    /* ── Contractor network ──────────────────────────────────────── */
    _contractorDb: {
      '32601': [
        {
          vendorId      : 'VND-FL-4821',
          name          : 'Sunshine Roofing & Restoration',
          licenseNumber : 'CCC1333221',
          serviceTypes  : ['Roof Replacement', 'Emergency Tarping', 'Water Mitigation'],
          availability  : 'Available within 48 hours',
          rating        : 4.8,
          reviewCount   : 312,
          serviceArea   : 'Alachua County + surrounding counties'
        },
        {
          vendorId      : 'VND-FL-5033',
          name          : 'Gulf Coast Restoration Group',
          licenseNumber : 'CGC1528441',
          serviceTypes  : ['Water Mitigation', 'Mold Remediation', 'Structural Drying'],
          availability  : 'Available within 24 hours',
          rating        : 4.7,
          reviewCount   : 189,
          serviceArea   : 'North Central Florida'
        }
      ]
    },

    /* ── Gemini function declarations (used by home-orchestration.js) ─ */
    FUNCTION_DECLARATIONS: [
      {
        name        : 'get_weather_history',
        description : 'Fetch historical weather event data for a location and date to validate reported storm occurrence, hail size, and wind speed.',
        parameters  : {
          type      : 'object',
          properties: {
            zip_code  : { type: 'string', description: 'ZIP code of the property location' },
            loss_date : { type: 'string', description: 'Date of the reported loss' }
          },
          required: ['zip_code']
        }
      },
      {
        name        : 'get_property_roof_risk',
        description : 'Retrieve property details including roof age, construction type, replacement cost value, and hail/wind risk score from the property data service.',
        parameters  : {
          type      : 'object',
          properties: {
            address: { type: 'string', description: 'Full property address of the insured' }
          },
          required: ['address']
        }
      },
      {
        name        : 'get_contractor_network',
        description : 'Find available licensed contractors for roof repair, emergency tarping, or water mitigation in the property zip code area.',
        parameters  : {
          type      : 'object',
          properties: {
            zip_code    : { type: 'string' },
            service_type: { type: 'string', description: 'roof | water-mitigation | emergency-tarping | general' }
          },
          required: ['zip_code']
        }
      }
    ],

    /* ── Simulated REST API calls ────────────────────────────────── */
    api: {

      /*
       * GET /weather/history?zip={zip}&date={date}
       * 340 ms simulated latency — external NWS data enrichment
       */
      getWeatherHistory: function (zipCode) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            var zip  = (zipCode || '').toString().substring(0, 5);
            var data = global._MockHomeAPIs._weatherDb[zip] || {
              stormTrackConfirmed: false,
              perilValidation    : 'NOT FOUND — manual verification required'
            };
            resolve({
              status  : 200,
              endpoint: 'GET /weather/history?zip=' + zip,
              data    : data
            });
          }, 340);
        });
      },

      /*
       * GET /property/roof-risk-score?address={encoded}
       * 280 ms simulated latency
       */
      getPropertyRoofRisk: function (address) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            var addr  = (address || '').toLowerCase();
            var match = addr.includes('magnolia') || addr.includes('32601') || addr.includes('gainesville');
            var data  = match
              ? global._MockHomeAPIs._propertyDb['2847-magnolia']
              : { roofRiskScore: null, note: 'Property record not found' };
            resolve({
              status  : 200,
              endpoint: 'GET /property/roof-risk-score?address=' + encodeURIComponent(address || ''),
              data    : data
            });
          }, 280);
        });
      },

      /*
       * GET /contractor/network?zip={zip}&service={type}
       * 210 ms simulated latency
       */
      getContractorNetwork: function (zipCode, serviceType) {
        return new Promise(function (resolve) {
          setTimeout(function () {
            var zip         = (zipCode || '32601').toString().substring(0, 5);
            var contractors = global._MockHomeAPIs._contractorDb[zip] || [];
            resolve({
              status  : 200,
              endpoint: 'GET /contractor/network?zip=' + zip + '&service=' + (serviceType || 'roof'),
              data    : contractors
            });
          }, 210);
        });
      },

      /* Dispatcher used by the orchestration function-call handler */
      dispatch: function (funcName, args) {
        if (funcName === 'get_weather_history') {
          return global._MockHomeAPIs.api.getWeatherHistory(args.zip_code, args.loss_date);
        }
        if (funcName === 'get_property_roof_risk') {
          return global._MockHomeAPIs.api.getPropertyRoofRisk(args.address);
        }
        if (funcName === 'get_contractor_network') {
          return global._MockHomeAPIs.api.getContractorNetwork(args.zip_code, args.service_type);
        }
        return Promise.reject(new Error('Unknown home API function: ' + funcName));
      }
    }

  };

})(window);
