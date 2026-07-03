/* ═══════════════════════════════════════════════════════════════
   AI Factory — Media Processor
   Shared utilities for converting images and PDFs into Gemini
   inlineData parts. Builds labeled, interleaved text+image arrays
   so Gemini knows exactly what each document is before reading it.
   Attaches to: window._AIShared.MediaProcessor
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._AIShared = global._AIShared || {};

  /* ── Internal helpers ──────────────────────────────────────── */

  function blobToInlinePart(blob, fallbackMime) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = reader.result; // "data:<mime>;base64,<data>"
        var comma  = result.indexOf(',');
        var header = result.slice(0, comma);
        var mime   = (header.match(/:(.*?);/) || [])[1] || fallbackMime || 'image/jpeg';
        resolve({ inlineData: { mimeType: mime, data: result.slice(comma + 1) } });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /* ── Public API ────────────────────────────────────────────── */

  var MediaProcessor = {

    /* Fetch any image URL (relative or absolute) → inlineData part */
    fetchImageAsInlinePart: function (src) {
      return fetch(src)
        .then(function (resp) {
          if (!resp.ok) throw new Error('Image fetch failed (' + resp.status + '): ' + src);
          return resp.blob();
        })
        .then(function (blob) { return blobToInlinePart(blob, 'image/jpeg'); });
    },

    /* Fetch a PDF URL → inlineData part (mimeType: application/pdf) */
    fetchPdfAsInlinePart: function (src) {
      return fetch(src)
        .then(function (resp) {
          if (!resp.ok) throw new Error('PDF fetch failed (' + resp.status + '): ' + src);
          return resp.blob();
        })
        .then(function (blob) { return blobToInlinePart(blob, 'application/pdf'); });
    },

    /* Convert an already-loaded data URL → inlineData part */
    dataUrlToInlinePart: function (dataUrl) {
      var comma  = dataUrl.indexOf(',');
      var header = dataUrl.slice(0, comma);
      var mime   = (header.match(/:(.*?);/) || [])[1] || 'image/jpeg';
      return { inlineData: { mimeType: mime, data: dataUrl.slice(comma + 1) } };
    },

    /*
     * Build labeled interleaved parts for a Gemini multimodal request.
     *
     * For each evidence file we emit:
     *   { text: "Document: <label>" }   ← tells Gemini what it's about to see
     *   { inlineData: { ... } }         ← the actual image / PDF bytes
     *
     * Priority order:
     *   1. sc.mobileAttachment  — user-uploaded photo from mobile app
     *   2. sc.photos[]          — scenario evidence files (images + PDFs)
     *
     * Options:
     *   maxPhotos (default 6) — cap on scenario evidence files
     *
     * Returns Promise<{ parts: Array, count: Number }>
     *   parts — the interleaved array ready to concat after the prompt text part
     *   count — number of files successfully loaded (used in prompt image note)
     */
    buildLabeledImageParts: function (sc, maxPhotos) {
      maxPhotos = maxPhotos || 6;
      var tasks = [];

      /* Mobile attachment */
      if (sc.mobileAttachment && sc.mobileAttachment.data) {
        tasks.push({
          label: sc.mobileAttachment.label || 'Mobile Upload',
          promise: Promise.resolve({
            inlineData: {
              mimeType: sc.mobileAttachment.mimeType || 'image/jpeg',
              data: sc.mobileAttachment.data
            }
          })
        });
      }

      /* Scenario evidence */
      var photos = (sc.photos || [])
        .filter(function (p) { return p.src; })
        .slice(0, maxPhotos);

      photos.forEach(function (photo) {
        var src   = photo.src;
        var lower = src.toLowerCase();
        var fetchFn = lower.endsWith('.pdf')
          ? MediaProcessor.fetchPdfAsInlinePart
          : MediaProcessor.fetchImageAsInlinePart;

        tasks.push({
          label:   photo.label || 'Evidence',
          promise: fetchFn(src).catch(function (err) {
            console.warn('[MediaProcessor] Could not load "' + photo.label + '":', err.message);
            return null;
          })
        });
      });

      var labels   = tasks.map(function (t) { return t.label; });
      var promises = tasks.map(function (t) { return t.promise; });

      return Promise.all(promises).then(function (results) {
        var parts = [];
        var count = 0;

        results.forEach(function (inlinePart, i) {
          if (!inlinePart) return;
          parts.push({ text: 'Document: ' + labels[i] });
          parts.push(inlinePart);
          count++;
        });

        return { parts: parts, count: count };
      });
    }

  };

  global._AIShared.MediaProcessor = MediaProcessor;

})(window);
