/* ═══════════════════════════════════════════════════════════════
   AI Factory — Home Claim E2E Orchestration Pipeline
   10-step pipeline covering all 15 architectural layers of the
   Home FNOL processing architecture.

   Step 01 — FNOL Intake & Channel Detection  (Gemini multimodal)
   Step 02 — Policy Verification              (Gemini function calling + SOR)
   Step 03 — Document & Image Ingestion       (Gemini Vision: roof + interior)
   Step 04 — Weather & Property Enrichment    (3 external API function calls)
   Step 05 — Gemini Understanding Layer       (Peril ID + entity + severity)
   Step 06 — Fraud & Risk Scoring             (ML + Gemini cross-validation)
   Step 07 — Coverage & ALE Decision          (Gemini reasoning)
   Step 08 — Damage & Cost Estimation         (Gemini Vision + cost model)
   Step 09 — Claim Decision Engine            (Final Gemini reasoning)
   Step 10 — System Execution & Routing       (Rule-based: Guidewire + vendor)

   Depends on:
     window._AIShared.GeminiClient   (gemini-client.js)
     window._AIShared.MediaProcessor (media-processor.js)
     window._MockSOR                 (mock-sor.js)
     window._MockHomeAPIs            (mock-home-apis.js)

   Attaches to: window._HomeOrchestration
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  var STEP_COUNT = 10;

  /* ── Gemini tools: SOR policy lookup ─────────────────────────── */
  var SOR_TOOLS = [{
    function_declarations: [{
      name        : 'get_policy_details',
      description : 'Fetch full homeowners insurance policy details including dwelling coverage, ALE, hurricane deductible rules, and prior claims from the Policy Administration System.',
      parameters  : {
        type      : 'object',
        properties: {
          policy_number: { type: 'string', description: 'Homeowners policy number' }
        },
        required: ['policy_number']
      }
    }]
  }];

  /* ── Gemini tools: external enrichment APIs ──────────────────── */
  var ENRICHMENT_TOOLS = [{
    function_declarations: global._MockHomeAPIs
      ? global._MockHomeAPIs.FUNCTION_DECLARATIONS
      : []
  }];

  /* ── Pre-built simulation results ────────────────────────────── */
  var SIM = {
    step1: {
      incidentType        : 'Wind & Hail — Severe Weather Event',
      severity            : 'Moderate',
      damageAreas         : ['Roof — shingle impact craters', 'Gutters — dented/displaced', 'Interior ceiling — water intrusion'],
      entityProperty      : '2847 Magnolia Court, Gainesville, FL 32601',
      entityPolicy        : 'HO-FL-293847',
      entityClaimant      : 'Michael & Karen Rivera',
      entityContractor    : null,
      initialSeverityScore: 0.68,
      missingDocuments    : ['Contractor estimate'],
      channelDetected     : 'Mobile App'
    },
    step2: {
      policyNumber      : 'HO-FL-293847',
      policyStatus      : 'Active',
      premiumStatus     : 'Current — Paid Through 2027-01-01',
      coverageActive    : true,
      dwellingCoverage  : { active: true, limit: 320000, deductible: 2500 },
      aleCoverage       : { active: true, limit: 64000, durationMonths: 12 },
      windHailDeductible: { active: true, amount: 2500 },
      hurricaneDeductible: { active: true, percentage: '2%', note: 'Applies to named storms only — FL mandate' },
      priorClaims       : 0,
      functionCalled    : 'get_policy_details',
      apiEndpoint       : 'GET /insurance/policy/HO-FL-293847'
    },
    step3: {
      roofDamageDetected  : true,
      roofDamageSeverity  : 'Moderate',
      roofDamageZones     : ['North slope — impact craters (1.25”)', 'Ridge cap — displaced sections', 'Gutters — significant denting'],
      waterIntrusionDetected: true,
      waterIntrusionZones : ['Living room ceiling — active staining', 'Master bedroom NE corner'],
      structuralAnomalies : [],
      documentExtracted   : { roofInspectionReport: 'Pending', contractorEstimate: 'Not yet provided' }
    },
    step4: {
      weather: {
        nwsEventId       : 'NWS-FL-2026-041203',
        stormType        : 'Severe Thunderstorm — Hail & Wind',
        hailSize         : '1.25 inches (Moderate)',
        maxWindGust      : '58 mph',
        stormTrack       : 'Confirmed track over Gainesville NW quadrant',
        perilValidation  : 'CONFIRMED — Hail / Wind'
      },
      property: {
        roofAge             : 6,
        roofMaterial        : 'Architectural Shingles (30-yr rated)',
        roofRiskScore       : 0.42,
        replacementCostValue: '$318,000',
        constructionType    : 'Wood Frame',
        roofSquares         : 28
      },
      contractor: {
        vendorName  : 'Sunshine Roofing & Restoration',
        availability: 'Available within 48 hours',
        licenseNumber: 'CCC1333221',
        serviceArea : 'Alachua County, FL'
      },
      functionsCalled: [
        'GET /weather/history?zip=32601',
        'GET /property/roof-risk-score?address=2847-magnolia-ct',
        'GET /contractor/network?zip=32601&service=roof'
      ]
    },
    step5: {
      perilConfirmed      : 'Hail / Wind',
      perilType           : 'Weather-Related — Severe Thunderstorm',
      narrativeConsistent : true,
      weatherMatchScore   : 0.94,
      severityClassification: 'Moderate',
      missingInfo         : [],
      entityProfile: {
        property : '2847 Magnolia Court, Gainesville, FL 32601',
        policy   : 'HO-FL-293847',
        insured  : 'Michael & Karen Rivera'
      }
    },
    step6: {
      fraudScore : 'LOW',
      riskScore  : 0.09,
      signals: {
        weatherCorroboration   : 'PASS — NWS storm track confirmed over subject property',
        damagePhotoConsistency : 'PASS — Impact craters consistent with 1.25″ hail pattern',
        claimHistory           : 'PASS — Zero prior claims on HO-FL-293847',
        contractorValidation   : 'PASS — Licensed FL contractor, active CCC license',
        priorDamageRisk        : 'LOW — Roof age 6 yrs, no pre-existing damage indicators'
      },
      anomalies: []
    },
    step7: {
      coverageDecision           : 'APPROVED',
      perilMatch                 : true,
      applicableDeductible       : '$2,500 (Wind/Hail Deductible)',
      hurricaneDeductibleApplied : false,
      hurricaneNote              : 'Non-named storm event — standard wind/hail deductible applies, not hurricane deductible',
      aleEligible                : true,
      aleNote                    : 'Property uninhabitable during repair — ALE active up to $64,000 / 12 months',
      exclusions                 : [],
      eligibleCoverageAmount     : '$317,500 (Dwelling limit − deductible)'
    },
    step8: {
      roofRepairScope : 'Full roof replacement recommended — damage exceeds 30% of total roof area',
      components: [
        { item: 'Architectural Shingle Replacement (28 sq)', cost: 8400  },
        { item: 'Ridge Cap Replacement',                     cost: 850   },
        { item: 'Gutter Replacement (140 LF)',               cost: 1960  },
        { item: 'Interior Drywall Repair',                   cost: 2200  },
        { item: 'Water Mitigation Services',                 cost: 1800  },
        { item: 'Labor & Incidentals',                       cost: 2400  }
      ],
      totalEstimateMin   : 16800,
      totalEstimateMax   : 19600,
      mitigation         : 'Emergency roof tarping recommended immediately to prevent further water damage',
      repairVsReplace    : 'Replace — Damage extent warrants full replacement'
    },
    step9: {
      claimSeverityScore     : 0.68,
      severity               : 'Moderate',
      reserveEstimate        : '$18,500',
      recommendedActions: [
        'Dispatch field adjuster for on-site inspection',
        'Approve emergency roof tarping immediately',
        'Activate ALE coverage — property assessment required',
        'Engage preferred contractor for certified estimate'
      ],
      routingDecision       : 'Desk Adjuster with Field Inspection',
      settlementPathway     : 'Standard — contractor estimate required before settlement authorization',
      estimatedSettlementRange: '$16,800 – $19,600'
    },
    step10: {
      claimFileCreated       : true,
      claimSystem            : 'Guidewire ClaimCenter',
      claimFileId            : 'HOM-2026-073104',
      reserveSetup           : '$18,500',
      adjusterQueue          : 'Desk Adjuster — Moderate Severity + Field Inspection',
      fieldInspectionRequired: true,
      mitigationDispatched   : 'Sunshine Roofing & Restoration — Emergency Tarping',
      customerNotification   : 'SMS + Email sent to insured',
      estimatedResolutionDays: 14,
      nextAction             : 'Schedule field adjuster inspection within 72 hours'
    }
  };

  /* ── Utilities ────────────────────────────────────────────────── */
  function delay (ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  function geminiPost (parts, apiKey, endpoint, extraConfig) {
    var body = {
      contents         : [{ role: 'user', parts: parts }],
      generationConfig : Object.assign({
        responseMimeType: 'application/json',
        temperature     : 0.1,
        maxOutputTokens : 1500
      }, extraConfig || {})
    };
    return fetch(endpoint + '?key=' + apiKey, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body)
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var text = d.candidates && d.candidates[0] &&
                 d.candidates[0].content && d.candidates[0].content.parts &&
                 d.candidates[0].content.parts[0] && d.candidates[0].content.parts[0].text;
      if (!text) throw new Error('Empty Gemini response');
      return JSON.parse(text);
    });
  }

  /* Helper: send a function-calling request and handle one round of tool use */
  function geminiWithTools (prompt, tools, apiKey, endpoint) {
    var reqBody = {
      contents        : [{ role: 'user', parts: [{ text: prompt }] }],
      tools           : tools,
      generationConfig: { temperature: 0.1, maxOutputTokens: 800 }
    };
    return fetch(endpoint + '?key=' + apiKey, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(reqBody)
    })
    .then(function (r) { return r.json(); })
    .then(function (d1) {
      var candidate = d1.candidates && d1.candidates[0];
      if (!candidate) throw new Error('No response (tools turn 1)');
      var parts1   = candidate.content && candidate.content.parts || [];
      var funcCall = parts1.find(function (p) { return p.functionCall; });

      if (!funcCall) {
        /* Gemini answered without calling a tool */
        var t = parts1[0] && parts1[0].text;
        return t ? JSON.parse(t) : {};
      }

      var name = funcCall.functionCall.name;
      var args = funcCall.functionCall.args;

      /* Route to the correct mock API */
      return global._MockSOR.api.getPolicy(args.policy_number || args.policyNumber || 'HO-FL-293847')
        .catch(function () {
          return global._MockHomeAPIs.api.dispatch(name, args);
        })
        .then(function (sorResult) {
          var reqBody2 = {
            contents: [
              { role: 'user',  parts: [{ text: prompt }] },
              { role: 'model', parts: parts1 },
              { role: 'user',  parts: [{ functionResponse: { name: name, response: sorResult.data || sorResult } }] }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature     : 0.1,
              maxOutputTokens : 1000
            }
          };
          return fetch(endpoint + '?key=' + apiKey, {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify(reqBody2)
          })
          .then(function (r) { return r.json(); })
          .then(function (d2) {
            var text = d2.candidates && d2.candidates[0] &&
                       d2.candidates[0].content && d2.candidates[0].content.parts &&
                       d2.candidates[0].content.parts[0] && d2.candidates[0].content.parts[0].text;
            if (!text) throw new Error('Empty response after function call');
            var parsed = JSON.parse(text);
            parsed.functionCalled = name;
            parsed.apiEndpoint    = 'GET /insurance/policy/' + (args.policy_number || 'HO-FL-293847');
            return parsed;
          });
        });
    });
  }

  /* ── Live step implementations ───────────────────────────────── */

  function liveStep1 (sc, ctx, apiKey, endpoint) {
    var prompt = [
      'You are a P&C homeowners claims intake specialist.',
      'Extract structured FNOL data from this first notice of loss.',
      '',
      'CLAIM NARRATIVE:', '"""', sc.narrative, '"""',
      '',
      'Return ONLY valid JSON:',
      '{ "incidentType":"<Wind|Hail|Water|Fire — description>",',
      '  "severity":"<Low|Moderate|High>",',
      '  "damageAreas":["<area 1>"],',
      '  "entityProperty":"<full address>",',
      '  "entityPolicy":"<policy number>",',
      '  "entityClaimant":"<insured name>",',
      '  "initialSeverityScore":<0.0-1.0>,',
      '  "missingDocuments":["<doc>"],',
      '  "channelDetected":"<Mobile App|Web|Call Center|Agent>" }'
    ].join('\n');
    return global._AIShared.MediaProcessor.buildLabeledImageParts(sc)
      .then(function (media) {
        ctx._imageParts = media.parts;
        return geminiPost([{ text: prompt }].concat(media.parts), apiKey, endpoint);
      });
  }

  function liveStep2 (sc, ctx, apiKey, endpoint) {
    var policyNum = (ctx.step1 && ctx.step1.entityPolicy) || 'HO-FL-293847';
    var prompt = [
      'You are a homeowners insurance policy verification agent.',
      'Retrieve full policy details for policy ' + policyNum + '.',
      'Use get_policy_details. Verify: dwelling coverage, ALE coverage,',
      'hurricane vs wind/hail deductible rules (FL), and prior claims.',
      'Return a JSON summary of policy verification findings.'
    ].join(' ');
    return geminiWithTools(prompt, SOR_TOOLS, apiKey, endpoint);
  }

  function liveStep3 (sc, ctx, apiKey, endpoint) {
    var s1 = ctx.step1 || {};
    var prompt = [
      'You are a property damage image analyst.',
      'Analyze the attached property damage photos.',
      '',
      'REPORTED DAMAGE AREAS:', (s1.damageAreas || []).join(', '),
      '',
      'For each photo, identify:',
      '- Roof: damage severity, zones affected, hail impact indicators',
      '- Interior: water intrusion, staining, structural concerns',
      '',
      'Return ONLY valid JSON:',
      '{ "roofDamageDetected":<true|false>,',
      '  "roofDamageSeverity":"<Minor|Moderate|Severe>",',
      '  "roofDamageZones":["<zone>"],',
      '  "waterIntrusionDetected":<true|false>,',
      '  "waterIntrusionZones":["<zone>"],',
      '  "structuralAnomalies":["<anomaly or empty>"],',
      '  "documentExtracted":{"roofInspectionReport":"<status>","contractorEstimate":"<status>"} }'
    ].join('\n');
    return geminiPost([{ text: prompt }].concat(ctx._imageParts || []), apiKey, endpoint);
  }

  function liveStep4 (sc, ctx, apiKey, endpoint) {
    /* Run all 3 external APIs in parallel, then synthesise with Gemini */
    var s1      = ctx.step1 || {};
    var address = s1.entityProperty || '2847 Magnolia Court, Gainesville, FL 32601';
    var zip     = '32601';

    return Promise.all([
      global._MockHomeAPIs.api.getWeatherHistory(zip),
      global._MockHomeAPIs.api.getPropertyRoofRisk(address),
      global._MockHomeAPIs.api.getContractorNetwork(zip, 'roof')
    ]).then(function (results) {
      var weather    = results[0].data;
      var property   = results[1].data;
      var contractors= results[2].data;
      var endpoints  = [results[0].endpoint, results[1].endpoint, results[2].endpoint];

      var prompt = [
        'Synthesise these three external data API results for a homeowners claim in Gainesville, FL.',
        '',
        'WEATHER DATA: ' + JSON.stringify(weather),
        'PROPERTY DATA: ' + JSON.stringify(property),
        'CONTRACTOR NETWORK: ' + JSON.stringify(contractors),
        '',
        'Return ONLY valid JSON:',
        '{ "weather":{ "stormType":"<>","hailSize":"<>","maxWindGust":"<>","perilValidation":"<>" },',
        '  "property":{ "roofAge":<num>,"roofMaterial":"<>","roofRiskScore":<num>,"replacementCostValue":"<>" },',
        '  "contractor":{ "vendorName":"<>","availability":"<>","licenseNumber":"<>" },',
        '  "functionsCalled":<array of endpoint strings> }'
      ].join('\n');

      return geminiPost([{ text: prompt }], apiKey, endpoint)
        .then(function (parsed) {
          parsed.functionsCalled = endpoints;
          return parsed;
        });
    });
  }

  function liveStep5 (sc, ctx, apiKey, endpoint) {
    var s1 = ctx.step1 || {};
    var s4 = ctx.step4 || {};
    var prompt = [
      'You are a Gemini-powered homeowners claims understanding layer.',
      'Confirm peril type, validate narrative, extract entities, classify severity.',
      '',
      'NARRATIVE:', sc.narrative,
      'WEATHER: ' + JSON.stringify(s4.weather || {}),
      'DAMAGE ZONES: ' + (s1.damageAreas || []).join(', '),
      '',
      'Return ONLY valid JSON:',
      '{ "perilConfirmed":"<Hail/Wind|Water|Fire>",',
      '  "perilType":"<weather-related description>",',
      '  "narrativeConsistent":<true|false>,',
      '  "weatherMatchScore":<0.0-1.0>,',
      '  "severityClassification":"<Minor|Moderate|Severe>",',
      '  "missingInfo":["<info>"],',
      '  "entityProfile":{ "property":"<addr>","policy":"<num>","insured":"<name>" } }'
    ].join('\n');
    return geminiPost([{ text: prompt }], apiKey, endpoint);
  }

  function liveStep6 (sc, ctx, apiKey, endpoint) {
    var prompt = [
      'You are a P&C fraud and risk analyst.',
      'Assess fraud risk for this homeowners claim.',
      '',
      'NARRATIVE:', sc.narrative,
      'WEATHER MATCH: ' + JSON.stringify(ctx.step4 && ctx.step4.weather || {}),
      'ROOF DATA: ' + JSON.stringify(ctx.step4 && ctx.step4.property || {}),
      'DAMAGE ANALYSIS: ' + JSON.stringify(ctx.step3 || {}),
      'PRIOR CLAIMS: ' + ((ctx.step2 && ctx.step2.priorClaims) || 0),
      '',
      'Return ONLY valid JSON:',
      '{ "fraudScore":"<LOW|MEDIUM|HIGH>",',
      '  "riskScore":<0.0-1.0>,',
      '  "signals":{ "weatherCorroboration":"<PASS|FAIL — reason>",',
      '               "damagePhotoConsistency":"<PASS|FAIL — reason>",',
      '               "claimHistory":"<PASS|FAIL>",',
      '               "contractorValidation":"<PASS|FAIL>",',
      '               "priorDamageRisk":"<LOW|MEDIUM|HIGH>" },',
      '  "anomalies":["<anomaly or empty>"] }'
    ].join('\n');
    return geminiPost([{ text: prompt }].concat(ctx._imageParts || []), apiKey, endpoint);
  }

  function liveStep7 (sc, ctx, apiKey, endpoint) {
    var prompt = [
      'You are a homeowners coverage eligibility analyst.',
      'Determine coverage eligibility and ALE applicability.',
      '',
      'POLICY: ' + JSON.stringify(ctx.step2 || {}),
      'PERIL: ' + ((ctx.step5 && ctx.step5.perilConfirmed) || 'Wind/Hail'),
      'STATE: ' + sc.state + ' (IMPORTANT: FL hurricane deductible applies to NAMED STORMS only)',
      'DAMAGE SEVERITY: ' + ((ctx.step5 && ctx.step5.severityClassification) || 'Moderate'),
      '',
      'Return ONLY valid JSON:',
      '{ "coverageDecision":"<APPROVED|DENIED|PARTIAL>",',
      '  "perilMatch":<true|false>,',
      '  "applicableDeductible":"<amount + description>",',
      '  "hurricaneDeductibleApplied":<true|false>,',
      '  "hurricaneNote":"<FL rule explanation>",',
      '  "aleEligible":<true|false>,',
      '  "aleNote":"<ALE coverage detail>",',
      '  "exclusions":["<exclusion or empty>"],',
      '  "eligibleCoverageAmount":"<amount>" }'
    ].join('\n');
    return geminiPost([{ text: prompt }], apiKey, endpoint);
  }

  function liveStep8 (sc, ctx, apiKey, endpoint) {
    var s4 = ctx.step4 || {};
    var prop = s4.property || {};
    var prompt = [
      'You are an auto & property damage cost estimation specialist.',
      'Estimate repair costs for this homeowners storm damage claim.',
      '',
      'ROOF DATA: Squares=' + (prop.roofSquares || 28) + ', Material=' + (prop.roofMaterial || 'Architectural Shingles'),
      'DAMAGE ZONES: ' + JSON.stringify(ctx.step3 && ctx.step3.roofDamageZones || []),
      'WATER INTRUSION: ' + JSON.stringify(ctx.step3 && ctx.step3.waterIntrusionZones || []),
      '',
      'Return ONLY valid JSON:',
      '{ "roofRepairScope":"<Replace|Repair — rationale>",',
      '  "components":[{"item":"<name>","cost":<number>}],',
      '  "totalEstimateMin":<number>,"totalEstimateMax":<number>,',
      '  "mitigation":"<emergency action if needed>",',
      '  "repairVsReplace":"<recommendation>" }'
    ].join('\n');
    return geminiPost([{ text: prompt }].concat(ctx._imageParts || []), apiKey, endpoint);
  }

  function liveStep9 (sc, ctx, apiKey, endpoint) {
    var prompt = [
      'You are a senior homeowners claims decision engine.',
      'Produce the final claim severity score, reserve estimate, and routing decision.',
      '',
      'PIPELINE SUMMARY:',
      '- Peril: ' + (ctx.step5 && ctx.step5.perilConfirmed || 'Wind/Hail'),
      '- Coverage: ' + (ctx.step7 && ctx.step7.coverageDecision || 'APPROVED'),
      '- Fraud Score: ' + (ctx.step6 && ctx.step6.fraudScore || 'LOW'),
      '- Estimate: $' + (ctx.step8 && ctx.step8.totalEstimateMin || 16800) + ' – $' + (ctx.step8 && ctx.step8.totalEstimateMax || 19600),
      '- ALE Eligible: ' + (ctx.step7 && ctx.step7.aleEligible ? 'YES' : 'NO'),
      '',
      'Return ONLY valid JSON:',
      '{ "claimSeverityScore":<0.0-1.0>,"severity":"<Minor|Moderate|Severe>",',
      '  "reserveEstimate":"<$amount>",',
      '  "recommendedActions":["<action 1>","<action 2>","<action 3>","<action 4>"],',
      '  "routingDecision":"<routing>",',
      '  "settlementPathway":"<description>",',
      '  "estimatedSettlementRange":"<$X – $X>" }'
    ].join('\n');
    return geminiPost([{ text: prompt }], apiKey, endpoint);
  }

  function buildRoutingResult (ctx) {
    var s6   = ctx.step6 || {};
    var s9   = ctx.step9 || {};
    var s8   = ctx.step8 || {};
    var fraud = (s6.fraudScore || 'LOW').toUpperCase();
    var costMax = s8.totalEstimateMax || 0;

    var adjQueue, fieldRequired, resolutionDays;
    if (fraud === 'HIGH') {
      adjQueue = 'SIU Review Queue — Fraud Escalation';
      fieldRequired = true;
      resolutionDays = 30;
    } else if (costMax > 25000 || fraud === 'MEDIUM') {
      adjQueue = 'Field Adjuster — High Severity';
      fieldRequired = true;
      resolutionDays = 21;
    } else {
      adjQueue = 'Desk Adjuster — Moderate Severity + Field Inspection';
      fieldRequired = true;
      resolutionDays = 14;
    }

    return {
      claimFileCreated       : true,
      claimSystem            : 'Guidewire ClaimCenter',
      claimFileId            : 'HOM-2026-073104',
      reserveSetup           : s9.reserveEstimate || '$18,500',
      adjusterQueue          : adjQueue,
      fieldInspectionRequired: fieldRequired,
      mitigationDispatched   : 'Sunshine Roofing & Restoration — Emergency Tarping',
      customerNotification   : 'SMS + Email sent to insured',
      estimatedResolutionDays: resolutionDays,
      nextAction             : 'Schedule field adjuster inspection within 72 hours'
    };
  }

  /* ── Simulation delays per step ──────────────────────────────── */
  var SIM_DELAYS = [1100, 900, 850, 780, 700, 820, 680, 760, 620, 350];

  /* ── Step runner table ───────────────────────────────────────── */
  var LIVE_FNS = [
    liveStep1, liveStep2, liveStep3, liveStep4, liveStep5,
    liveStep6, liveStep7, liveStep8, liveStep9, null /* step10 rule-based */
  ];

  var SIM_KEYS = [
    'step1','step2','step3','step4','step5',
    'step6','step7','step8','step9','step10'
  ];

  /* ── Public API ──────────────────────────────────────────────── */
  global._HomeOrchestration = {

    STEP_COUNT: STEP_COUNT,
    SIM       : SIM,

    run: function (sc, mode, apiKey, endpoint, cb) {
      var context = {};
      var isLive  = mode === 'live';

      var chain = Promise.resolve();

      for (var i = 0; i < STEP_COUNT; i++) {
        (function (idx) {
          chain = chain.then(function () {
            cb.onStepStart(idx);
            var t0 = Date.now();

            var stepPromise;
            if (idx === STEP_COUNT - 1) {
              /* Last step always rule-based */
              stepPromise = (function (d) {
                return new Promise(function (res) {
                  setTimeout(function () { res(buildRoutingResult(context)); }, d);
                });
              })(SIM_DELAYS[idx]);
            } else if (isLive && LIVE_FNS[idx]) {
              stepPromise = LIVE_FNS[idx](sc, context, apiKey, endpoint);
            } else {
              stepPromise = (function (key, d) {
                return new Promise(function (res) {
                  setTimeout(function () { res(SIM[key]); }, d);
                });
              })(SIM_KEYS[idx], SIM_DELAYS[idx]);
            }

            return stepPromise
              .then(function (result) {
                context[SIM_KEYS[idx]] = result;
                cb.onStepComplete(idx, result, Date.now() - t0);
              })
              .catch(function (err) {
                cb.onStepError(idx, err);
                throw err;
              });
          });
        })(i);
      }

      chain
        .then(function () { cb.onComplete(context); })
        .catch(function (err) { if (cb.onPipelineError) cb.onPipelineError(err); });
    }

  };

})(window);
