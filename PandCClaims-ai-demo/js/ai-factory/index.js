/* ═══════════════════════════════════════════════════════════════
   AI Factory — Router / Public Entry Point
   Routes analyze() and buildPrompt() calls to the correct LOB API
   based on sc.lob. Exposes window.AIFactory for use by the
   ClaimsProfessionalWorkbench and any future consumers.

   Load order (all must be loaded before this file):
     prompts/_schema.js
     prompts/auto.js
     prompts/home.js
     prompts/commercial.js
     shared/media-processor.js
     shared/gemini-client.js
     auto-api.js
     home-api.js
     commercial-api.js
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  /* Map LOB strings (lowercase) → LOB API module */
  var LOB_MAP = {
    'auto':                global._AIApis.auto,
    'personal auto':       global._AIApis.auto,
    'homeowners':          global._AIApis.home,
    'home':                global._AIApis.home,
    'homeowner':           global._AIApis.home,
    'commercial':          global._AIApis.commercial,
    'commercial property': global._AIApis.commercial,
    'commercial fire':     global._AIApis.commercial
  };

  function resolveApi(sc) {
    var lobKey = ((sc.lob || '') + ' ' + (sc.key || '')).toLowerCase().trim();

    /* Try full lob string first */
    if (LOB_MAP[sc.lob && sc.lob.toLowerCase()]) {
      return LOB_MAP[sc.lob.toLowerCase()];
    }
    /* Try scenario key */
    if (sc.key && LOB_MAP[sc.key.toLowerCase()]) {
      return LOB_MAP[sc.key.toLowerCase()];
    }
    /* Substring fallback */
    if (lobKey.includes('commercial')) return global._AIApis.commercial;
    if (lobKey.includes('home') || lobKey.includes('owner')) return global._AIApis.home;
    /* Default to auto */
    return global._AIApis.auto;
  }

  global.AIFactory = {

    /*
     * Main entry point — routes by sc.lob to the correct LOB API.
     *
     * sc: { claimId, lob, state, narrative, photos, mobileAttachment }
     * Returns Promise<parsedAiResponseObject>
     * Throws on API error — caller should catch and fall back to sim data.
     */
    analyze: function (sc, apiKey, endpoint) {
      return resolveApi(sc).analyze(sc, apiKey, endpoint);
    },

    /*
     * Build the display prompt for the payload panel (no image fetching).
     * imageCount — pass the number of evidence files for the image note.
     */
    buildPrompt: function (sc, imageCount) {
      return resolveApi(sc).buildPrompt(sc, imageCount);
    },

    /* Direct LOB API access */
    apis: {
      auto:       function () { return global._AIApis.auto; },
      home:       function () { return global._AIApis.home; },
      commercial: function () { return global._AIApis.commercial; }
    },

    /* Shared utilities */
    MediaProcessor: global._AIShared.MediaProcessor,
    GeminiClient:   global._AIShared.GeminiClient
  };

})(window);
