/* ═══════════════════════════════════════════════════════════════
   AI Factory — Auto API
   FNOL analysis for personal auto / collision claims.
   Depends on:
     prompts/auto.js          (window._AIPrompts.auto)
     shared/media-processor.js (window._AIShared.MediaProcessor)
     shared/gemini-client.js   (window._AIShared.GeminiClient)
   Attaches to: window._AIApis.auto
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._AIApis = global._AIApis || {};

  global._AIApis.auto = {

    /*
     * Run full multimodal FNOL analysis for an auto claim.
     *
     * sc: { claimId, lob, state, narrative, photos, mobileAttachment }
     * Returns Promise<parsedAiResponseObject>
     */
    analyze: function (sc, apiKey, endpoint) {
      return global._AIShared.MediaProcessor.buildLabeledImageParts(sc)
        .then(function (media) {
          var scWithCount = Object.assign({}, sc, { _imageCount: media.count });
          var promptText  = global._AIPrompts.auto.build(scWithCount);
          var parts       = [{ text: promptText }].concat(media.parts);
          return global._AIShared.GeminiClient.call(parts, apiKey, endpoint);
        });
    },

    /* Build the display prompt (no fetch — for API payload panel) */
    buildPrompt: function (sc, imageCount) {
      return global._AIPrompts.auto.build(
        Object.assign({}, sc, { _imageCount: imageCount || 0 })
      );
    }

  };

})(window);
