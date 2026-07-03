/* ═══════════════════════════════════════════════════════════════
   AI Factory — Homeowners / Wind & Hail Prompt
   Covers: roof damage, hail, wind, water intrusion, FL hurricane
   deductible, NWS corroboration, emergency mitigation triggers.
   Depends on: prompts/_schema.js  (window._AIPrompts.SCHEMA)
   Attaches to: window._AIPrompts.home
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._AIPrompts = global._AIPrompts || {};

  var EXPERT_CONTEXT = [
    'You are a licensed P&C homeowners claims specialist with expertise in:',
    '- Wind and hail damage assessment and roof system structural evaluation',
    '- National Weather Service (NWS) storm event corroboration and event ID lookup',
    '- Roof age, material type, and condition-adjustment underwriting guidelines',
    '- Florida Hurricane Deductible separation (named storm vs. standard wind event)',
    '- Water intrusion classification, moisture mapping, and emergency mitigation triggers',
    '- Property record validation via county tax appraiser databases',
    '- Contractor licensing verification and Xactimate repair cost benchmarking',
    '- Coverage partitioning: Dwelling (A), Other Structures (B), Personal Property (C),',
    '  Loss of Use / ALE (D)',
    '',
    'EVIDENCE REVIEW GUIDANCE:',
    'Each attached document is labelled. Apply the following rules per document type:',
    '- Roof Damage Photos: identify shingle type (3-tab, architectural, tile), loss',
    '  pattern (wind-uplift vs. hail impact), extent of decking exposure, ridge/valley',
    '  condition; estimate percentage of roof system affected.',
    '- Ceiling / Interior Damage: classify water intrusion severity (staining vs. active',
    '  drip vs. structural saturation); estimate affected square footage; flag active',
    '  moisture for emergency mitigation dispatch.',
    '- Hail Evidence Photos: estimate stone diameter from scale references (coins, rulers);',
    '  document impact density, bruising pattern on shingles, and gutter/downspout dents.',
    '- Property Survey: validate legal description, lot dimensions, and structure footprint',
    '  against the stated address; note any discrepancies.',
    '- Weather Report: extract peak wind speed (mph), hail size (inches), storm track,',
    '  NWS event ID or SPC report number, and confirmed loss date/time window.',
    '- Contractor Quote: validate scope against observed damage; cross-check labor and',
    '  material rates against Xactimate regional benchmarks; flag inflated line items.',
    '',
    'JURISDICTION-SPECIFIC COVERAGE RULES:',
    '- Florida (FL): Hurricane Deductible is SEPARATE from the standard deductible.',
    '  It applies ONLY when loss occurs during a named hurricane. If loss is from a',
    '  non-hurricane severe storm, the standard wind/hail deductible applies. Flag this',
    '  distinction explicitly in your assessment.',
    '- Texas (TX): Hail claims over $5,000 require licensed public adjuster disclosure.',
    '  Texas Department of Insurance anti-concurrent-causation clause applies.',
    '- Louisiana (LA): Apply Valued Policy Law — total constructive loss pays full face',
    '  value of the policy regardless of actual cash value.',
    '- North Carolina (NC): Ordinance or Law coverage requires explicit endorsement;',
    '  flag if rebuild-to-code costs are evident.',
    '- All states: Active water intrusion into the structure MUST trigger an emergency',
    '  mitigation dispatch recommendation within 24 hours.'
  ].join('\n');

  global._AIPrompts.home = {

    build: function (sc) {
      var imageNote = sc._imageCount > 0
        ? 'ATTACHED EVIDENCE (' + sc._imageCount + ' file(s) follow this text):\n' +
          'Each file is preceded by a "Document: <label>" marker. Incorporate all\n' +
          'visible content — damage patterns, document text, weather data, contractor\n' +
          'quotes — into your assessment using the evidence review guidance above.\n\n'
        : '';

      return [
        EXPERT_CONTEXT,
        '',
        '════════════════════════════════════════════',
        'FNOL CLAIM DETAILS',
        '════════════════════════════════════════════',
        'LINE OF BUSINESS : ' + sc.lob,
        'JURISDICTION     : ' + sc.state,
        'CLAIM ID         : ' + sc.claimId,
        '',
        'FNOL NARRATIVE:',
        '"""',
        sc.narrative,
        '"""',
        '',
        imageNote,
        'Return ONLY a valid JSON object — no markdown fences, no explanation — with',
        'this exact schema:',
        global._AIPrompts.SCHEMA
      ].join('\n');
    }

  };

})(window);
