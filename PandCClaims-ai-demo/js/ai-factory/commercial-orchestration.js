/* ═══════════════════════════════════════════════════════════════
   AI Factory — Commercial Claim E2E Orchestration Pipeline
   12-step pipeline covering all 16 architecture points of the
   Enterprise Commercial FNOL processing architecture.

   Step 01 — FNOL Intake + API Gateway        (Arch 1+2: mobile channel)
   Step 02 — Document AI + Structured Data    (Arch 4: Document processing)
   Step 03 — Multi-Policy Resolution           (Arch 3: enterprise policy lookup)
   Step 04 — Loss Classification + Entity Ext (Arch 5.1+5.2: Gemini core)
   Step 05 — Weather + Asset Enrichment        (Arch 6a: external APIs)
   Step 06 — Finance + ERP Enrichment          (Arch 6b: ERP + BI inputs)
   Step 07 — Business Interruption Model       (Arch 7: BI calculation)
   Step 08 — Fraud & Risk Scoring              (Arch 8: ML + Gemini)
   Step 09 — Coverage + Liability Decision     (Arch 9: multi-policy Gemini)
   Step 10 — Damage & Loss Estimation          (Arch 10: cost model)
   Step 11 — Claim Decision Engine             (Arch 11: final AI reasoning)
   Step 12 — System Execution + Routing        (Arch 12-16: Guidewire + vendors)

   Test scenario: Metro Retail LLC — Commercial Fire (Austin, TX)
   Policy: CP-TX-884721 + BI-TX-884721 + GL-TX-884721

   Depends on:
     window._AIShared.GeminiClient    (gemini-client.js)
     window._AIShared.MediaProcessor  (media-processor.js)
     window._MockSOR                  (mock-sor.js)
     window._MockCommercialAPIs       (mock-commercial-apis.js)

   Attaches to: window._CommercialOrchestration
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  var STEP_COUNT = 12;

  /* ── Gemini tool: enterprise multi-policy SOR lookup ───────────── */
  var ENTERPRISE_SOR_TOOLS = [{
    function_declarations: [{
      name        : 'get_enterprise_policies',
      description : 'Retrieve all active insurance policies linked to an enterprise customer from the Policy Administration System. Returns commercial property, business interruption, and liability policies.',
      parameters  : {
        type      : 'object',
        properties: {
          customer_id: { type: 'string', description: 'Enterprise customer ID' },
          insured_name: { type: 'string', description: 'Legal entity name of the insured business' }
        },
        required: ['customer_id']
      }
    }]
  }];

  /* ── Gemini tools: external commercial APIs ──────────────────── */
  var ENRICHMENT_TOOLS = [{
    function_declarations: global._MockCommercialAPIs
      ? global._MockCommercialAPIs.FUNCTION_DECLARATIONS
      : []
  }];

  /* ── Pre-built simulation results ────────────────────────────── */
  var SIM = {
    step1: {
      incidentType       : 'Commercial Fire — Electrical Origin',
      lossTypes          : ['Property Damage', 'Business Interruption', 'Inventory Loss'],
      severity           : 'High',
      entity             : 'Metro Retail LLC',
      location           : '890 Commerce Blvd, Austin, TX 78701',
      policyRef          : 'CP-TX-884721',
      fireReportNumber   : 'AFD-2026-041879',
      channelDetected    : 'Mobile App',
      initialSeverityScore: 0.87,
      apiGatewayTag      : 'HIGH-PRIORITY',
      payloadNormalized  : true
    },
    step2: {
      documentsProcessed: 5,
      extractedData: {
        fireIncidentReport    : { extracted: true, reportId: 'AFD-2026-041879', origin: 'Electrical — rear storage switchgear', confidence: 0.97 },
        purchaseOrders        : { extracted: true, inventoryValue: '$62,000', skuCount: 847, confidence: 0.95 },
        buildingDamageReport  : { extracted: true, affectedArea: '2,400 sq ft rear section', confidence: 0.91 },
        financialStatement    : { extracted: true, monthlyRevenue: '$380,000', confidence: 0.94 },
        safetyInspection      : { extracted: false, status: 'Requested from insured — pending' }
      },
      structuredDatasetConfidence: 0.94,
      entitiesExtracted  : 6
    },
    step3: {
      insured            : 'Metro Retail LLC',
      customerId         : 'C-TX-00291',
      policyCount        : 3,
      policies: [
        { number: 'CP-TX-884721', type: 'Commercial Property',      limit: 500000,   deductible: 5000,  status: 'Active', waitingPeriod: null },
        { number: 'BI-TX-884721', type: 'Business Interruption',    limit: 250000,   period: '12 months', waitingPeriod: 3, status: 'Active' },
        { number: 'GL-TX-884721', type: 'General Liability',        limit: 1000000,  deductible: 10000, status: 'Active', waitingPeriod: null }
      ],
      priorClaims        : 1,
      priorClaimDetail   : 'BI claim settled Dec 2024 — $28,000',
      functionCalled     : 'get_enterprise_policies',
      apiEndpoint        : 'GET /insurance/enterprise/C-TX-00291/policies'
    },
    step4: {
      lossTypes          : ['Property Damage', 'Business Interruption', 'Inventory Loss'],
      primaryLoss        : 'Commercial Fire — Electrical',
      entities: {
        insured          : 'Metro Retail LLC',
        location         : '890 Commerce Blvd, Austin, TX 78701',
        affectedArea     : 'Rear Storage & Utility Room (2,400 sq ft)',
        assets           : ['Inventory ($62,000)', 'Electrical infrastructure', 'Structural — rear section']
      },
      severityIntelligence: {
        operationalDowntimeRisk: 'HIGH',
        revenueDailyLoss       : '$12,667',
        safetyRiskLevel        : 'Contained — Sprinkler system suppressed fire',
        regulatoryExposure     : 'Austin Fire Marshal origin report required'
      },
      adjusterTypeRequired: 'Complex Commercial + BI Specialist',
      emergencyResponseTriggered: false
    },
    step5: {
      weather: {
        conditions         : 'Clear — Normal Conditions',
        windSpeed          : '8 mph SW',
        catEventId         : null,
        catDesignation     : 'Non-Cat Event — No Active CAT Declaration',
        fireWeather        : { redFlagWarning: false, fireSpreadRisk: 'Low — contained structure' }
      },
      fireMapping: {
        causeType          : 'Electrical Internal',
        externalIgnitionSource: false,
        sprinklerActivation: true,
        fireContained      : true
      },
      functionsCalled: [
        'GET /weather/catastrophe?zip=78701',
        'GET /fire/region-mapping?address=890-commerce-blvd-austin'
      ]
    },
    step6: {
      assets: {
        buildingRCV            : 420000,
        equipmentValue         : 100500,
        inventoryAtRisk        : 62000,
        totalAssetExposure     : 582500,
        lastSafetyInspection   : '2025-09-20',
        violationsOnRecord     : 0
      },
      financials: {
        monthlyRevenue         : 380000,
        dailyRevenue           : 12667,
        payrollMonthly         : 45000,
        fixedCostsMonthly      : 62000,
        downtimeCostPerHour    : 528,
        priorClaim             : { date: '2024-12-15', type: 'Business Interruption', amount: 28000 }
      },
      functionsCalled: [
        'GET /assets/facility/890-commerce-austin',
        'GET /erp/financials/C-TX-00291'
      ]
    },
    step7: {
      revenueLossDaily       : 12667,
      estimatedDowntimeDays  : 21,
      totalGrossBI           : 266007,
      waitingPeriodDays      : 3,
      eligibleBIDays         : 18,
      eligibleBIAmount       : 228006,
      policyBILimit          : 250000,
      cappedBIExposure       : 228006,
      fixedCostsSaved        : 18000,
      netBIExposure          : 210006,
      recoveryTimeline       : '14–21 days to partial operations; 30 days full recovery',
      industryBenchmark      : 'Retail avg: 18 days downtime for equivalent fire event'
    },
    step8: {
      fraudScore    : 'MEDIUM',
      riskScore     : 0.41,
      signals: {
        incidentTiming        : 'PASS — No suspicious timing pattern (early AM fire, fire dept response 6 min)',
        documentAuthenticity  : 'PASS — AFD report #AFD-2026-041879 verified via public record',
        claimHistory          : '⚠ REVIEW — Prior BI claim settled 18 months ago ($28,000)',
        invoiceConsistency    : 'PASS — PO documentation cross-referenced with inventory claim',
        vendorValidation      : 'PENDING — Restoration contractor not yet engaged'
      },
      anomalies: [
        'Prior BI claim within 24-month lookback window — SIU preliminary review triggered',
        'Claim amount $87,500 exceeds $50,000 enhanced-review threshold'
      ],
      suiuTriggered          : true
    },
    step9: {
      decisions: [
        {
          policy        : 'CP-TX-884721',
          type          : 'Commercial Property',
          decision      : 'APPROVED',
          coveredAmount : 82500,
          deductible    : 5000,
          notes         : 'Electrical fire covered under all-risk commercial property — pending Fire Marshal clearance'
        },
        {
          policy        : 'BI-TX-884721',
          type          : 'Business Interruption',
          decision      : 'APPROVED',
          coveredAmount : 180000,
          waitingPeriod : '3 days',
          notes         : 'BI coverage active — 12-month period of indemnity; daily loss documentation required'
        },
        {
          policy        : 'GL-TX-884721',
          type          : 'General Liability',
          decision      : 'MONITOR',
          coveredAmount : null,
          notes         : 'No third-party liability identified — monitoring for subrogation potential'
        }
      ],
      totalCoveredExposure   : 262500,
      subrogationPotential   : 'LOW — Internal electrical failure; no third-party vendor negligence confirmed',
      exclusions             : [],
      reserveRecommendation  : 267500
    },
    step10: {
      components: [
        { item: 'Structural Repair — Rear Section (2,400 sq ft)', cost: 25500 },
        { item: 'Electrical Systems Replacement',                 cost: 14000 },
        { item: 'Inventory Replacement (847 SKUs)',               cost: 62000 },
        { item: 'Fire/Smoke/Water Cleanup & Remediation',         cost: 18000 },
        { item: 'Sprinkler System Inspection & Recertification',  cost: 4500  },
        { item: 'Temporary Board-Up & Security',                  cost: 3500  }
      ],
      structuralRepairCost   : 39500,
      inventoryLoss          : 62000,
      cleanupCost            : 22500,
      totalPropertyLoss      : 87500,
      engineeringReportRequired: true,
      emergencyMitigation    : 'Board-up completed; water extraction from sprinkler activation in progress'
    },
    step11: {
      claimSeverityScore     : 0.87,
      severity               : 'High',
      reserveBreakdown       : { property: 87500, bi: 180000, total: 267500 },
      routingDecision        : 'Complex Claims Team + BI Specialist + SIU Preliminary Review',
      settlementStrategy     : 'Two-stage: Property settlement upon Fire Marshal clearance; BI settlement upon documented production restoration',
      estimatedSettlementRange: '$240,000 – $270,000',
      recommendedActions: [
        'Assign complex commercial adjuster within 4 hours',
        'Request Fire Marshal final origin & cause report (AFD-2026-041879)',
        'Activate BI coverage — document daily revenue loss beginning Day 4',
        'SIU preliminary review — prior BI claim cross-reference required'
      ]
    },
    step12: {
      claimFileCreated       : true,
      claimSystem            : 'Guidewire ClaimCenter',
      claimFileId            : 'COM-2026-073201',
      policiesActivated      : ['CP-TX-884721', 'BI-TX-884721'],
      reservesAllocated      : { property: 87500, bi: 180000, total: 267500 },
      adjusterQueue          : 'Complex Claims — Commercial Fire + BI Specialist',
      suiuTriggered          : true,
      suiuNote               : 'SIU preliminary review — prior BI claim + threshold exceedance',
      vendorsDispatched      : ['ServiceMaster Commercial Restoration (Austin)', 'Structural Assessment Group TX'],
      fireMarshalRequested   : true,
      regulatoryFiling       : 'Austin Fire Marshal — Origin & Cause Report Requested',
      customerNotification   : 'Acknowledgment email sent to risk manager + business owner',
      estimatedResolutionDays: 45,
      nextAction             : 'On-site adjuster inspection within 24 hours; Fire Marshal report within 72 hours'
    }
  };

  /* ── Utilities ────────────────────────────────────────────────── */
  function delay (ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  function geminiPost (parts, apiKey, endpoint, extraConfig) {
    var body = {
      contents        : [{ role: 'user', parts: parts }],
      generationConfig: Object.assign({
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

  /* Multi-turn function-calling helper — handles ONE tool round */
  function geminiWithTool (prompt, tools, dispatchFn, apiKey, endpoint) {
    var reqBody = {
      contents        : [{ role: 'user', parts: [{ text: prompt }] }],
      tools           : tools,
      generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
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
        var t = parts1[0] && parts1[0].text;
        return t ? JSON.parse(t) : {};
      }

      var name = funcCall.functionCall.name;
      var args = funcCall.functionCall.args;

      return dispatchFn(name, args).then(function (apiResult) {
        var reqBody2 = {
          contents: [
            { role: 'user',  parts: [{ text: prompt }] },
            { role: 'model', parts: parts1 },
            { role: 'user',  parts: [{ functionResponse: { name: name, response: apiResult.data || apiResult } }] }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature     : 0.1,
            maxOutputTokens : 1200
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
          parsed.apiEndpoint    = apiResult.endpoint || ('/' + name);
          return parsed;
        });
      });
    });
  }

  /* ── Live step implementations ───────────────────────────────── */

  function liveStep1 (sc, ctx, apiKey, endpoint) {
    var prompt = [
      'You are an enterprise commercial claims intake specialist.',
      'Extract structured FNOL data from this commercial loss notification (mobile channel).',
      '',
      'NARRATIVE:', '"""', sc.narrative, '"""',
      '',
      'Return ONLY valid JSON:',
      '{ "incidentType":"<Commercial Fire|Equipment Breakdown|Cyber|Flood — description>",',
      '  "lossTypes":["<Property Damage|Business Interruption|Inventory Loss|Liability>"],',
      '  "severity":"<Low|Moderate|High>",',
      '  "entity":"<legal business name>",',
      '  "location":"<full facility address>",',
      '  "policyRef":"<policy number from narrative>",',
      '  "fireReportNumber":"<official report number if present>",',
      '  "channelDetected":"Mobile App",',
      '  "initialSeverityScore":<0.0-1.0>,',
      '  "apiGatewayTag":"<STANDARD|HIGH-PRIORITY>",',
      '  "payloadNormalized":true }'
    ].join('\n');
    return global._AIShared.MediaProcessor.buildLabeledImageParts(sc)
      .then(function (media) {
        ctx._imageParts = media.parts;
        return geminiPost([{ text: prompt }].concat(media.parts), apiKey, endpoint);
      });
  }

  function liveStep2 (sc, ctx, apiKey, endpoint) {
    var prompt = [
      'You are a commercial Document AI processor.',
      'Analyze the provided commercial claim documents and photos.',
      '',
      'INCIDENT:', (ctx.step1 && ctx.step1.incidentType) || sc.narrative.substring(0, 200),
      '',
      'For each document/image, extract key data.',
      'Return ONLY valid JSON:',
      '{ "documentsProcessed":<number>,',
      '  "extractedData": {',
      '    "fireIncidentReport":{ "extracted":<bool>,"reportId":"<id>","origin":"<cause>","confidence":<0-1> },',
      '    "purchaseOrders":{ "extracted":<bool>,"inventoryValue":"<$amount>","skuCount":<num>,"confidence":<0-1> },',
      '    "buildingDamageReport":{ "extracted":<bool>,"affectedArea":"<sq ft>","confidence":<0-1> },',
      '    "financialStatement":{ "extracted":<bool>,"monthlyRevenue":"<$amount>","confidence":<0-1> },',
      '    "safetyInspection":{ "extracted":<bool>,"status":"<result>" }',
      '  },',
      '  "structuredDatasetConfidence":<0-1>,',
      '  "entitiesExtracted":<number> }'
    ].join('\n');
    return geminiPost([{ text: prompt }].concat(ctx._imageParts || []), apiKey, endpoint);
  }

  function liveStep3 (sc, ctx, apiKey, endpoint) {
    var insured   = (ctx.step1 && ctx.step1.entity) || 'Metro Retail LLC';
    var policyRef = (ctx.step1 && ctx.step1.policyRef) || 'CP-TX-884721';
    var prompt = [
      'You are a commercial multi-policy resolution agent.',
      'Retrieve all insurance policies for enterprise customer: ' + insured,
      'Primary policy reference: ' + policyRef,
      'Use get_enterprise_policies to fetch all policies linked to this customer.',
      'Return a JSON summary of all policies found.',
      'IMPORTANT: Return ONLY the JSON — no markdown.'
    ].join(' ');
    return geminiWithTool(prompt, ENTERPRISE_SOR_TOOLS,
      function (name, args) {
        return global._MockSOR.api.getEnterprisePolicies(args.customer_id || 'C-TX-00291');
      },
      apiKey, endpoint
    );
  }

  function liveStep4 (sc, ctx, apiKey, endpoint) {
    var s1 = ctx.step1 || {};
    var prompt = [
      'You are a Gemini commercial claims reasoning engine.',
      '',
      'NARRATIVE:', sc.narrative,
      '',
      'INCIDENT TYPE:', s1.incidentType || 'Commercial Fire',
      'ENTITY:', s1.entity || 'Commercial insured',
      'LOCATION:', s1.location || sc.entities && sc.entities.property || 'unknown',
      '',
      'Classify the loss types, extract entities, and assess severity intelligence.',
      '',
      'Return ONLY valid JSON:',
      '{ "lossTypes":["<Property Damage|Business Interruption|Inventory Loss|Liability>"],',
      '  "primaryLoss":"<description>",',
      '  "entities":{ "insured":"<name>","location":"<addr>","affectedArea":"<area>","assets":["<asset>"] },',
      '  "severityIntelligence":{ "operationalDowntimeRisk":"<LOW|MEDIUM|HIGH>","revenueDailyLoss":"<$amount>","safetyRiskLevel":"<status>","regulatoryExposure":"<requirement>" },',
      '  "adjusterTypeRequired":"<adjuster type>",',
      '  "emergencyResponseTriggered":<true|false> }'
    ].join('\n');
    return geminiPost([{ text: prompt }].concat(ctx._imageParts || []), apiKey, endpoint);
  }

  function liveStep5 (sc, ctx, apiKey, endpoint) {
    var s1  = ctx.step1 || {};
    var zip = '78701';
    return global._MockCommercialAPIs.api.getWeatherCatastrophe(zip)
      .then(function (wxResult) {
        var prompt = [
          'You are a commercial catastrophe and fire weather analyst.',
          '',
          'WEATHER/CAT DATA: ' + JSON.stringify(wxResult.data),
          'FIRE INCIDENT: ' + (s1.incidentType || 'Commercial Fire'),
          'LOCATION: ' + (s1.location || '890 Commerce Blvd, Austin TX'),
          '',
          'Return ONLY valid JSON:',
          '{ "weather":{ "conditions":"<>","windSpeed":"<>","catEventId":<null|"id">,"catDesignation":"<>","fireWeather":{ "redFlagWarning":<bool>,"fireSpreadRisk":"<>" } },',
          '  "fireMapping":{ "causeType":"<>","externalIgnitionSource":<bool>,"sprinklerActivation":<bool>,"fireContained":<bool> },',
          '  "functionsCalled":["<endpoints>"] }'
        ].join('\n');
        return geminiPost([{ text: prompt }], apiKey, endpoint)
          .then(function (parsed) {
            parsed.functionsCalled = [wxResult.endpoint];
            return parsed;
          });
      });
  }

  function liveStep6 (sc, ctx, apiKey, endpoint) {
    return Promise.all([
      global._MockCommercialAPIs.api.getAssetFacilityInventory('890 Commerce Blvd, Austin TX 78701'),
      global._MockCommercialAPIs.api.getERPFinancialData('C-TX-00291')
    ]).then(function (results) {
      var assetResult  = results[0];
      var erpResult    = results[1];
      var prompt = [
        'Synthesise commercial facility and financial data for this claim.',
        '',
        'ASSET DATA: ' + JSON.stringify(assetResult.data),
        'ERP/FINANCIAL DATA: ' + JSON.stringify(erpResult.data),
        '',
        'Return ONLY valid JSON:',
        '{ "assets":{ "buildingRCV":<num>,"equipmentValue":<num>,"inventoryAtRisk":<num>,"totalAssetExposure":<num>,"lastSafetyInspection":"<date>","violationsOnRecord":<num> },',
        '  "financials":{ "monthlyRevenue":<num>,"dailyRevenue":<num>,"payrollMonthly":<num>,"fixedCostsMonthly":<num>,"downtimeCostPerHour":<num>,"priorClaim":<null|object> },',
        '  "functionsCalled":<array of endpoint strings> }'
      ].join('\n');
      return geminiPost([{ text: prompt }], apiKey, endpoint)
        .then(function (parsed) {
          parsed.functionsCalled = [assetResult.endpoint, erpResult.endpoint];
          return parsed;
        });
    });
  }

  function liveStep7 (sc, ctx, apiKey, endpoint) {
    var s6 = ctx.step6 || {};
    var fin = s6.financials || {};
    var prompt = [
      'You are a commercial Business Interruption (BI) modeling specialist.',
      '',
      'FINANCIAL INPUTS:',
      '  Daily Revenue: $' + (fin.dailyRevenue || 12667),
      '  Fixed Costs Monthly: $' + (fin.fixedCostsMonthly || 62000),
      '  Payroll Monthly: $' + (fin.payrollMonthly || 45000),
      '  Prior BI Claim: ' + JSON.stringify(fin.priorClaim || null),
      '',
      'BI POLICY: ' + JSON.stringify(ctx.step3 && ctx.step3.policies && ctx.step3.policies.find(function(p){return p.type&&p.type.includes('Business');})),
      '',
      'Estimate BI exposure for a commercial fire with 14-21 day estimated downtime.',
      '',
      'Return ONLY valid JSON:',
      '{ "revenueLossDaily":<num>,"estimatedDowntimeDays":<num>,',
      '  "totalGrossBI":<num>,"waitingPeriodDays":<num>,',
      '  "eligibleBIDays":<num>,"eligibleBIAmount":<num>,',
      '  "policyBILimit":<num>,"cappedBIExposure":<num>,',
      '  "fixedCostsSaved":<num>,"netBIExposure":<num>,',
      '  "recoveryTimeline":"<description>",',
      '  "industryBenchmark":"<retail avg>" }'
    ].join('\n');
    return geminiPost([{ text: prompt }], apiKey, endpoint);
  }

  function liveStep8 (sc, ctx, apiKey, endpoint) {
    var s6 = ctx.step6 || {};
    var s3 = ctx.step3 || {};
    var prompt = [
      'You are a commercial fraud and risk analyst.',
      '',
      'NARRATIVE:', sc.narrative,
      'PRIOR CLAIMS:', JSON.stringify(s3.priorClaimDetail || s3.priorClaims),
      'ASSET DATA:', JSON.stringify(s6.assets || {}),
      'FINANCIALS:', JSON.stringify(s6.financials || {}),
      '',
      'Return ONLY valid JSON:',
      '{ "fraudScore":"<LOW|MEDIUM|HIGH>",',
      '  "riskScore":<0.0-1.0>,',
      '  "signals":{ "incidentTiming":"<PASS|⚠ REVIEW — reason>",',
      '               "documentAuthenticity":"<PASS|⚠ REVIEW — reason>",',
      '               "claimHistory":"<PASS|⚠ REVIEW — reason>",',
      '               "invoiceConsistency":"<PASS|⚠ REVIEW — reason>",',
      '               "vendorValidation":"<PASS|PENDING|FAIL — reason>" },',
      '  "anomalies":["<anomaly or empty>"],',
      '  "suiuTriggered":<true|false> }'
    ].join('\n');
    return geminiPost([{ text: prompt }].concat(ctx._imageParts || []), apiKey, endpoint);
  }

  function liveStep9 (sc, ctx, apiKey, endpoint) {
    var s3 = ctx.step3 || {};
    var s4 = ctx.step4 || {};
    var prompt = [
      'You are a commercial coverage and liability decision engine.',
      'Determine coverage applicability across all policies for this enterprise.',
      '',
      'POLICIES:', JSON.stringify(s3.policies || []),
      'LOSS TYPES:', JSON.stringify(s4.lossTypes || []),
      'INCIDENT:', (ctx.step1 && ctx.step1.incidentType) || 'Commercial Fire',
      'STATE:', sc.state,
      '',
      'Return ONLY valid JSON:',
      '{ "decisions":[ { "policy":"<num>","type":"<type>","decision":"<APPROVED|DENIED|MONITOR|PARTIAL>","coveredAmount":<num|null>,"deductible":<num|null>,"notes":"<>" } ],',
      '  "totalCoveredExposure":<num>,',
      '  "subrogationPotential":"<LOW|MEDIUM|HIGH — reason>",',
      '  "exclusions":["<exclusion or empty>"],',
      '  "reserveRecommendation":<num> }'
    ].join('\n');
    return geminiPost([{ text: prompt }], apiKey, endpoint);
  }

  function liveStep10 (sc, ctx, apiKey, endpoint) {
    var s6 = ctx.step6 || {};
    var prompt = [
      'You are a commercial damage and loss estimation specialist.',
      'Estimate total property loss for this commercial fire claim.',
      '',
      'DAMAGE NARRATIVE:', sc.narrative,
      'AFFECTED AREA:', (ctx.step4 && ctx.step4.entities && ctx.step4.entities.affectedArea) || '2,400 sq ft',
      'ASSET DATA:', JSON.stringify(s6.assets || {}),
      '',
      'Break down costs: structural, electrical, inventory, cleanup, emergency mitigation.',
      '',
      'Return ONLY valid JSON:',
      '{ "components":[{"item":"<description>","cost":<number>}],',
      '  "structuralRepairCost":<num>,"inventoryLoss":<num>,"cleanupCost":<num>,"totalPropertyLoss":<num>,',
      '  "engineeringReportRequired":<bool>,',
      '  "emergencyMitigation":"<status>" }'
    ].join('\n');
    return geminiPost([{ text: prompt }].concat(ctx._imageParts || []), apiKey, endpoint);
  }

  function liveStep11 (sc, ctx, apiKey, endpoint) {
    var s8  = ctx.step8  || {};
    var s9  = ctx.step9  || {};
    var s10 = ctx.step10 || {};
    var s7  = ctx.step7  || {};
    var prompt = [
      'You are the final commercial claim decision engine.',
      '',
      'FRAUD SCORE:', s8.fraudScore || 'MEDIUM',
      'TOTAL PROPERTY LOSS:', '$' + (s10.totalPropertyLoss || 87500),
      'BI EXPOSURE (net):', '$' + (s7.netBIExposure || 210006),
      'COVERAGE DECISIONS:', JSON.stringify(s9.decisions || []),
      'SUBROGATION POTENTIAL:', s9.subrogationPotential || 'LOW',
      '',
      'Return ONLY valid JSON:',
      '{ "claimSeverityScore":<0-1>,"severity":"<Low|Moderate|High>",',
      '  "reserveBreakdown":{ "property":<num>,"bi":<num>,"total":<num> },',
      '  "routingDecision":"<routing>",',
      '  "settlementStrategy":"<description>",',
      '  "estimatedSettlementRange":"<$X – $X>",',
      '  "recommendedActions":["<action 1>","<action 2>","<action 3>","<action 4>"] }'
    ].join('\n');
    return geminiPost([{ text: prompt }], apiKey, endpoint);
  }

  function buildSystemExecutionResult (ctx) {
    var s8  = ctx.step8  || {};
    var s11 = ctx.step11 || {};
    var s10 = ctx.step10 || {};
    var fraud   = (s8.fraudScore || 'MEDIUM').toUpperCase();
    var totalLoss = (s10.totalPropertyLoss || 87500);

    var adjQueue, resolutionDays;
    if (fraud === 'HIGH') {
      adjQueue       = 'SIU Formal Investigation — Fraud Escalation';
      resolutionDays = 90;
    } else if (fraud === 'MEDIUM' || totalLoss > 50000) {
      adjQueue       = 'Complex Claims — Commercial Fire + BI Specialist';
      resolutionDays = 45;
    } else {
      adjQueue       = 'Commercial Desk Adjuster';
      resolutionDays = 21;
    }

    var reserve = s11.reserveBreakdown || { property: 87500, bi: 180000, total: 267500 };

    return {
      claimFileCreated       : true,
      claimSystem            : 'Guidewire ClaimCenter',
      claimFileId            : 'COM-2026-073201',
      policiesActivated      : ['CP-TX-884721', 'BI-TX-884721'],
      reservesAllocated      : reserve,
      adjusterQueue          : adjQueue,
      suiuTriggered          : s8.suiuTriggered || (fraud === 'MEDIUM' || fraud === 'HIGH'),
      suiuNote               : 'Prior BI claim + threshold exceedance — SIU preliminary review',
      vendorsDispatched      : ['ServiceMaster Commercial Restoration (Austin)', 'Structural Assessment Group TX'],
      fireMarshalRequested   : true,
      regulatoryFiling       : 'Austin Fire Marshal — Origin & Cause Report Requested',
      customerNotification   : 'Acknowledgment email sent to risk manager + business owner',
      estimatedResolutionDays: resolutionDays,
      nextAction             : 'On-site adjuster inspection within 24 hours; Fire Marshal report within 72 hours'
    };
  }

  /* ── Simulation delays per step ──────────────────────────────── */
  var SIM_DELAYS = [1200, 980, 850, 780, 720, 810, 690, 760, 640, 730, 580, 320];

  /* ── Step runner table ───────────────────────────────────────── */
  var LIVE_FNS = [
    liveStep1, liveStep2, liveStep3, liveStep4, liveStep5, liveStep6,
    liveStep7, liveStep8, liveStep9, liveStep10, liveStep11,
    null /* step12 rule-based */
  ];

  var SIM_KEYS = [
    'step1','step2','step3','step4','step5','step6',
    'step7','step8','step9','step10','step11','step12'
  ];

  /* ── Public API ──────────────────────────────────────────────── */
  global._CommercialOrchestration = {

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
              stepPromise = (function (d) {
                return new Promise(function (res) {
                  setTimeout(function () { res(buildSystemExecutionResult(context)); }, d);
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
