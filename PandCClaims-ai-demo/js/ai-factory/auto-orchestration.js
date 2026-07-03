/* ═══════════════════════════════════════════════════════════════
   AI Factory — Auto Claim E2E Orchestration Pipeline
   Executes 7 sequential steps that mirror a production-grade
   P&C claims processing pipeline. Each step maps to a distinct
   AI / backend concern.

   Step 1 — Claim Intake          (Gemini multimodal extraction)
   Step 2 — Policy Verification   (Gemini function calling + SOR)
   Step 3 — Coverage Verification (Gemini reasoning layer)
   Step 4 — Fraud Scoring         (Gemini classification)
   Step 5 — Damage Estimation     (Gemini computer vision)
   Step 6 — AI Claim Summary      (Gemini narrative generation)
   Step 7 — Workflow Routing      (rule-based orchestration)

   Depends on:
     window._AIShared.GeminiClient   (gemini-client.js)
     window._AIShared.MediaProcessor (media-processor.js)
     window._MockSOR                 (mock-sor.js)

   Attaches to: window._AutoOrchestration
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  /* ── Gemini function declarations for Step 2 ───────────────── */
  var SOR_TOOLS = [{
    function_declarations: [
      {
        name        : 'get_policy_details',
        description : 'Fetch full insurance policy details including coverage limits, deductible, and status from the Policy Administration System.',
        parameters  : {
          type       : 'object',
          properties : {
            policy_number: {
              type        : 'string',
              description : 'The insurance policy number, e.g. LMIC-7812456'
            }
          },
          required: ['policy_number']
        }
      },
      {
        name        : 'get_customer_info',
        description : 'Fetch customer demographic and driving record from the Customer Information System.',
        parameters  : {
          type       : 'object',
          properties : {
            customer_id: {
              type        : 'string',
              description : 'The internal customer ID'
            }
          },
          required: ['customer_id']
        }
      }
    ]
  }];

  /* ── Pre-built simulation results (zero API cost) ───────────── */
  var SIM = {
    step1: {
      incidentType      : 'Hydroplaning — Weather-Related Collision',
      severity          : 'Moderate',
      damageZones       : ['Front Bumper', 'Radiator', 'Left Headlight Assembly'],
      entityVehicle     : '2022 Honda Civic — Silver — NJZ-4821',
      entityLocation    : 'Route 1 South, NJ, MP 47 — near Princeton Junction',
      entityDriver      : 'Sarah Johnson — NJ-D4782910',
      entityPolicy      : 'LMIC-7812456',
      entityPoliceReport: 'NJSP-2026-874512',
      entityTowCompany  : 'Garden State Towing LLC',
      initialSeverityScore: 0.62,
      missingDocuments  : []
    },
    step2: {
      policyNumber     : 'LMIC-7812456',
      policyStatus     : 'Active',
      premiumStatus    : 'Current — Paid Through 2026-03-01',
      coverageActive   : true,
      collisionCoverage: { active: true, limit: 25000, deductible: 500 },
      rentalReimbursement: { active: true, dailyLimit: 35, maxDays: 30 },
      towingCoverage   : { active: true, limit: 100 },
      priorClaims      : 0,
      functionCalled   : 'get_policy_details',
      apiEndpoint      : 'GET /insurance/policy/LMIC-7812456'
    },
    step3: {
      covered              : true,
      perilMatch           : true,
      exclusions           : [],
      coverageType         : 'Collision — Weather-Related',
      deductibleApplies    : true,
      deductible           : 500,
      eligibleCoverageAmount: 24500,
      reasoning            : 'Hydroplaning collision on Route 1, NJ is a covered peril under the collision endorsement. NJ weather records confirm heavy rain on loss date. No applicable exclusions.'
    },
    step4: {
      riskLevel  : 'LOW',
      riskScore  : 0.12,
      reasoning  : 'All supporting documentation is internally consistent. NOAA weather data corroborates rain event. No prior claims on record. Damage pattern aligns with reported loss event. Police report badge registry confirmed.',
      signals    : {
        weatherMatch       : 'PASS — NOAA data confirms heavy rain on Route 1, NJ on loss date',
        damageConsistency  : 'PASS — Front-end impact consistent with guardrail strike during hydroplaning',
        documentAuthenticity: 'PASS — Police report badge registry confirmed; tow GPS cross-matched',
        priorClaimsCheck   : 'PASS — Zero prior claims on policy LMIC-7812456'
      }
    },
    step5: {
      components: [
        { part: 'Front Bumper Assembly',    action: 'Replace', cost: 850  },
        { part: 'Radiator',                 action: 'Replace', cost: 1200 },
        { part: 'Headlight Assembly (Left)',action: 'Replace', cost: 650  },
        { part: 'Hood Panel (minor)',        action: 'Repair',  cost: 400  },
        { part: 'Labor (12 hrs)',            action: 'Labor',   cost: 1560 }
      ],
      severity          : 'Moderate',
      laborHours        : 12,
      estimatedCostMin  : 4200,
      estimatedCostMax  : 5200,
      rentalDaysEstimate: 5
    },
    step6: {
      summary          : 'Policy LMIC-7812456 is active with collision coverage confirmed. Hydroplaning event on Route 1, NJ is corroborated by NOAA weather data and police report NJSP-2026-874512. Fraud risk is Low. Estimated repair cost $4,200–$5,200. Recommend standard adjuster assignment with vehicle inspection.',
      recommendation   : 'Assign Adjuster',
      priority         : 'Standard',
      autoSettleEligible: false,
      settlementRange  : '$4,200 – $5,200',
      rentalEligible   : true,
      towingEligible   : true
    },
    step7: {
      queue               : 'Auto Adjuster — Standard Complexity Queue',
      routingReason       : 'Damage estimate within standard threshold · Fraud risk LOW · No exclusions',
      priority            : 'P2 — Standard',
      nextAction          : 'Schedule Vehicle Inspection within 48 hours',
      estimatedResolutionDays: 7,
      parallelActions     : ['Rental car activation', 'Towing reimbursement'],
      notificationSent    : true
    }
  };

  /* ── Utility ────────────────────────────────────────────────── */
  function delay (ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  function geminiPost (parts, extraConfig, apiKey, endpoint) {
    var body = {
      contents          : [{ role: 'user', parts: parts }],
      generationConfig  : Object.assign({
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

  /* ── Live step implementations ──────────────────────────────── */

  function liveStep1 (sc, ctx, apiKey, endpoint) {
    var prompt = [
      'You are a P&C auto claims intake specialist.',
      'Extract structured FNOL data from this first notice of loss.',
      '',
      'CLAIM NARRATIVE:',
      '"""',
      sc.narrative,
      '"""',
      '',
      'Return ONLY a valid JSON object:',
      '{',
      '  "incidentType": "<type, e.g. Hydroplaning — Weather-Related Collision>",',
      '  "severity": "<Low | Moderate | High | Total Loss>",',
      '  "damageZones": ["<zone 1>"],',
      '  "entityVehicle": "<make, model, year, color, plate>",',
      '  "entityLocation": "<incident location>",',
      '  "entityDriver": "<driver name + DL number>",',
      '  "entityPolicy": "<policy number>",',
      '  "entityPoliceReport": "<police report number or null>",',
      '  "entityTowCompany": "<tow company or null>",',
      '  "initialSeverityScore": <0.0–1.0>,',
      '  "missingDocuments": ["<doc type if needed>"]',
      '}'
    ].join('\n');

    /* Include images for rich multimodal extraction */
    return global._AIShared.MediaProcessor.buildLabeledImageParts(sc)
      .then(function (media) {
        ctx._imageParts = media.parts; /* Cache for later steps */
        var parts = [{ text: prompt }].concat(media.parts);
        return geminiPost(parts, null, apiKey, endpoint);
      });
  }

  function liveStep2 (sc, ctx, apiKey, endpoint) {
    var policyNum  = (ctx.step1 && ctx.step1.entityPolicy) || 'LMIC-7812456';
    var prompt     = [
      'You are an insurance policy verification agent.',
      'A claim has been filed for policy ' + policyNum + '.',
      'Use the get_policy_details function to retrieve the full policy record.',
      'Verify: policy status, collision coverage limits and deductible,',
      'rental reimbursement availability, and prior claims count.',
      'Return a JSON summary of the policy verification findings.'
    ].join('\n');

    var reqBody1 = {
      contents        : [{ role: 'user', parts: [{ text: prompt }] }],
      tools           : SOR_TOOLS,
      generationConfig: { temperature: 0.1, maxOutputTokens: 800 }
    };

    return fetch(endpoint + '?key=' + apiKey, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(reqBody1)
    })
    .then(function (r) { return r.json(); })
    .then(function (d1) {
      var candidate = d1.candidates && d1.candidates[0];
      if (!candidate) throw new Error('No response from Gemini (step 2 turn 1)');

      var parts1 = candidate.content && candidate.content.parts;
      var funcCall = parts1 && parts1.find(function (p) { return p.functionCall; });

      if (funcCall) {
        /* Gemini wants to call a function — execute it against the Mock SOR */
        var name = funcCall.functionCall.name;
        var args = funcCall.functionCall.args;

        var sorPromise;
        if (name === 'get_policy_details') {
          sorPromise = global._MockSOR.api.getPolicy(args.policy_number);
        } else if (name === 'get_customer_info') {
          sorPromise = global._MockSOR.api.getCustomer(args.customer_id);
        } else {
          sorPromise = Promise.resolve({ error: 'Unknown function: ' + name });
        }

        return sorPromise.then(function (sorResult) {
          /* Send function response back to Gemini */
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
            if (!text) throw new Error('Empty Gemini response (step 2 turn 2)');
            var parsed = JSON.parse(text);
            /* Annotate with function call metadata for the UI */
            parsed.functionCalled = name;
            parsed.apiEndpoint    = 'GET /insurance/policy/' + (args.policy_number || args.customer_id);
            return parsed;
          });
        });
      }

      /* Gemini answered directly without calling a function (fallback) */
      var directText = parts1 && parts1[0] && parts1[0].text;
      if (!directText) throw new Error('No usable response from step 2');
      return JSON.parse(directText);
    });
  }

  function liveStep3 (sc, ctx, apiKey, endpoint) {
    var s1 = ctx.step1 || {};
    var s2 = ctx.step2 || {};
    var prompt = [
      'You are a P&C coverage eligibility analyst.',
      'Determine coverage eligibility for the following loss event.',
      '',
      'POLICY:',
      JSON.stringify(s2, null, 2),
      '',
      'LOSS EVENT:',
      '- Incident: ' + (s1.incidentType || 'Auto collision'),
      '- Damage Zones: ' + ((s1.damageZones || []).join(', ') || 'Front-end'),
      '- Location: ' + (s1.entityLocation || sc.state),
      '- State: ' + sc.state,
      '',
      'Return ONLY valid JSON:',
      '{',
      '  "covered": <true|false>,',
      '  "perilMatch": <true|false>,',
      '  "exclusions": [],',
      '  "coverageType": "<type>",',
      '  "deductibleApplies": true,',
      '  "deductible": <amount>,',
      '  "eligibleCoverageAmount": <limit minus deductible>,',
      '  "reasoning": "<brief explanation>"',
      '}'
    ].join('\n');
    return geminiPost([{ text: prompt }], null, apiKey, endpoint);
  }

  function liveStep4 (sc, ctx, apiKey, endpoint) {
    var s1 = ctx.step1 || {};
    var s3 = ctx.step3 || {};
    var prompt = [
      'You are a P&C fraud detection analyst.',
      'Assess fraud risk for this auto claim.',
      '',
      'CLAIM NARRATIVE:',
      '"""',
      sc.narrative,
      '"""',
      '',
      'INTAKE DATA:',
      JSON.stringify({ incidentType: s1.incidentType, damageZones: s1.damageZones, policeReport: s1.entityPoliceReport }, null, 2),
      '',
      'COVERAGE RESULT:',
      JSON.stringify({ covered: s3.covered, coverageType: s3.coverageType }, null, 2),
      '',
      'Return ONLY valid JSON:',
      '{',
      '  "riskLevel": "<LOW | MEDIUM | HIGH>",',
      '  "riskScore": <0.0–1.0 where 0.0 is no risk>,',
      '  "reasoning": "<2-3 sentences>",',
      '  "signals": {',
      '    "weatherMatch": "<PASS | FAIL | INCONCLUSIVE — explanation>",',
      '    "damageConsistency": "<PASS | FAIL | INCONCLUSIVE — explanation>",',
      '    "documentAuthenticity": "<PASS | FAIL | INCONCLUSIVE — explanation>",',
      '    "priorClaimsCheck": "<PASS | FAIL — based on policy data>"',
      '  }',
      '}'
    ].join('\n');
    return geminiPost([{ text: prompt }], null, apiKey, endpoint);
  }

  function liveStep5 (sc, ctx, apiKey, endpoint) {
    var s1 = ctx.step1 || {};
    var prompt = [
      'You are an auto damage estimation specialist.',
      'Analyze the vehicle damage shown in the attached photos and estimate repair requirements.',
      '',
      'INCIDENT CONTEXT:',
      '- Incident: ' + (s1.incidentType || 'Collision'),
      '- Reported Damage Zones: ' + ((s1.damageZones || []).join(', ')),
      '',
      'From visible damage, estimate repair components and costs.',
      'Return ONLY valid JSON:',
      '{',
      '  "components": [',
      '    { "part": "<part name>", "action": "<Replace|Repair|Inspect>", "cost": <number> }',
      '  ],',
      '  "severity": "<Minor | Moderate | Severe | Total Loss>",',
      '  "laborHours": <number>,',
      '  "estimatedCostMin": <number>,',
      '  "estimatedCostMax": <number>,',
      '  "rentalDaysEstimate": <number>',
      '}'
    ].join('\n');

    /* Reuse cached image parts from step 1 if available */
    var imageParts = ctx._imageParts || [];
    var parts      = [{ text: prompt }].concat(imageParts);
    return geminiPost(parts, null, apiKey, endpoint);
  }

  function liveStep6 (sc, ctx, apiKey, endpoint) {
    var prompt = [
      'You are a senior P&C claims adjuster.',
      'Generate an executive summary and recommendation based on this claim pipeline output.',
      '',
      'PIPELINE RESULTS:',
      '- Intake: ' + JSON.stringify(ctx.step1),
      '- Policy: ' + JSON.stringify(ctx.step2),
      '- Coverage: ' + JSON.stringify(ctx.step3),
      '- Fraud Risk: ' + JSON.stringify(ctx.step4),
      '- Damage Estimate: ' + JSON.stringify(ctx.step5),
      '',
      'Return ONLY valid JSON:',
      '{',
      '  "summary": "<2-3 sentence professional narrative>",',
      '  "recommendation": "<Assign Adjuster | Auto-Settle | Inspect | Deny>",',
      '  "priority": "<Standard | Urgent | Critical>",',
      '  "autoSettleEligible": <true|false>,',
      '  "settlementRange": "<$X,XXX – $X,XXX>",',
      '  "rentalEligible": <true|false>,',
      '  "towingEligible": <true|false>',
      '}'
    ].join('\n');
    return geminiPost([{ text: prompt }], null, apiKey, endpoint);
  }

  function buildRoutingResult (ctx) {
    /* Pure rule-based routing — no Gemini call */
    var s4 = ctx.step4 || {};
    var s5 = ctx.step5 || {};
    var s6 = ctx.step6 || {};
    var costMax = s5.estimatedCostMax || 0;
    var risk    = (s4.riskLevel || 'LOW').toUpperCase();

    var queue, priority, nextAction, resolutionDays;

    if (risk === 'HIGH') {
      queue = 'SIU Review Queue — Fraud Escalation';
      priority = 'P1 — Urgent';
      nextAction = 'Assign SIU investigator immediately';
      resolutionDays = 21;
    } else if (costMax > 15000 || risk === 'MEDIUM') {
      queue = 'Auto Adjuster — Complex Claim Queue';
      priority = 'P2 — Elevated';
      nextAction = 'Schedule vehicle inspection within 24 hours';
      resolutionDays = 10;
    } else {
      queue = 'Auto Adjuster — Standard Complexity Queue';
      priority = 'P2 — Standard';
      nextAction = 'Schedule vehicle inspection within 48 hours';
      resolutionDays = 7;
    }

    return {
      queue              : queue,
      routingReason      : 'Damage estimate within standard threshold · Fraud risk ' + risk + ' · No exclusions',
      priority           : priority,
      nextAction         : nextAction,
      estimatedResolutionDays: resolutionDays,
      parallelActions    : ['Rental car activation', 'Towing reimbursement'],
      recommendation     : s6.recommendation || 'Assign Adjuster',
      notificationSent   : true
    };
  }

  /* ── Public API ─────────────────────────────────────────────── */
  global._AutoOrchestration = {

    SIM: SIM,

    /*
     * Run the full 7-step pipeline.
     *
     * sc       — scenario object (narrative, photos, lob, state, etc.)
     * mode     — 'sim' | 'live'
     * apiKey   — Gemini API key (ignored in sim mode)
     * endpoint — Gemini endpoint URL (ignored in sim mode)
     * cb       — {
     *              onStepStart(stepIndex)
     *              onStepComplete(stepIndex, result, elapsedMs)
     *              onStepError(stepIndex, error)
     *              onComplete(context)
     *            }
     */
    run: function (sc, mode, apiKey, endpoint, cb) {
      var context = {};
      var isLive  = mode === 'live';

      /* Step definitions: sim result + live fn + sim delay */
      var STEPS = [
        { simKey: 'step1', liveFn: liveStep1, simDelay: 1100 },
        { simKey: 'step2', liveFn: liveStep2, simDelay: 900  },
        { simKey: 'step3', liveFn: liveStep3, simDelay: 650  },
        { simKey: 'step4', liveFn: liveStep4, simDelay: 800  },
        { simKey: 'step5', liveFn: liveStep5, simDelay: 700  },
        { simKey: 'step6', liveFn: liveStep6, simDelay: 550  },
        { simKey: 'step7', liveFn: null,       simDelay: 320  } /* rule-based, no Gemini */
      ];

      var chain = Promise.resolve();

      STEPS.forEach(function (step, i) {
        chain = chain.then(function () {
          cb.onStepStart(i);
          var t0 = Date.now();

          var stepPromise;
          if (isLive && step.liveFn) {
            stepPromise = step.liveFn(sc, context, apiKey, endpoint);
          } else if (!isLive && step.simKey === 'step7') {
            /* Routing step: always rule-based */
            stepPromise = delay(step.simDelay).then(function () {
              return buildRoutingResult(context);
            });
          } else if (isLive && !step.liveFn) {
            /* Routing step in live mode */
            stepPromise = delay(step.simDelay).then(function () {
              return buildRoutingResult(context);
            });
          } else {
            stepPromise = delay(step.simDelay).then(function () {
              return SIM[step.simKey];
            });
          }

          return stepPromise
            .then(function (result) {
              var ms = Date.now() - t0;
              context[step.simKey] = result;
              cb.onStepComplete(i, result, ms);
            })
            .catch(function (err) {
              cb.onStepError(i, err);
              throw err;
            });
        });
      });

      chain
        .then(function () { cb.onComplete(context); })
        .catch(function (err) {
          if (cb.onPipelineError) cb.onPipelineError(err);
        });
    }

  };

})(window);
