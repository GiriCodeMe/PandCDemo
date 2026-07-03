/* ═══════════════════════════════════════════════════════════════
   AI Factory — Home API
   FNOL analysis for homeowners wind, hail, and water claims.
   Depends on:
     prompts/home.js           (window._AIPrompts.home)
     shared/media-processor.js (window._AIShared.MediaProcessor)
     shared/gemini-client.js   (window._AIShared.GeminiClient)
   Attaches to: window._AIApis.home
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._AIApis = global._AIApis || {};

  global._AIApis.home = {

    /*
     * Run full multimodal FNOL analysis for a homeowners claim.
     *
     * sc: { claimId, lob, state, narrative, photos, mobileAttachment }
     * Returns Promise<parsedAiResponseObject>
     */
    analyze: function (sc, apiKey, endpoint) {
      return global._AIShared.MediaProcessor.buildLabeledImageParts(sc)
        .then(function (media) {
          var scWithCount = Object.assign({}, sc, { _imageCount: media.count });
          var promptText  = global._AIPrompts.home.build(scWithCount);
          var parts       = [{ text: promptText }].concat(media.parts);
          return global._AIShared.GeminiClient.call(parts, apiKey, endpoint);
        });
    },

    /* Build the display prompt (no fetch — for API payload panel) */
    buildPrompt: function (sc, imageCount) {
      return global._AIPrompts.home.build(
        Object.assign({}, sc, { _imageCount: imageCount || 0 })
      );
    }

  };

})(window);
