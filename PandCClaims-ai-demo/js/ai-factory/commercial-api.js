/* ═══════════════════════════════════════════════════════════════
   AI Factory — Commercial API
   FNOL analysis for commercial property fire / damage claims.
   Depends on:
     prompts/commercial.js     (window._AIPrompts.commercial)
     shared/media-processor.js (window._AIShared.MediaProcessor)
     shared/gemini-client.js   (window._AIShared.GeminiClient)
   Attaches to: window._AIApis.commercial
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._AIApis = global._AIApis || {};

  global._AIApis.commercial = {

    /*
     * Run full multimodal FNOL analysis for a commercial property claim.
     *
     * sc: { claimId, lob, state, narrative, photos, mobileAttachment }
     * Returns Promise<parsedAiResponseObject>
     */
    analyze: function (sc, apiKey, endpoint) {
      return global._AIShared.MediaProcessor.buildLabeledImageParts(sc)
        .then(function (media) {
          var scWithCount = Object.assign({}, sc, { _imageCount: media.count });
          var promptText  = global._AIPrompts.commercial.build(scWithCount);
          var parts       = [{ text: promptText }].concat(media.parts);
          return global._AIShared.GeminiClient.call(parts, apiKey, endpoint);
        });
    },

    /* Build the display prompt (no fetch — for API payload panel) */
    buildPrompt: function (sc, imageCount) {
      return global._AIPrompts.commercial.build(
        Object.assign({}, sc, { _imageCount: imageCount || 0 })
      );
    }

  };

})(window);
