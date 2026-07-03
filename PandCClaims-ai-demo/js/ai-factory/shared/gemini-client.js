/* ═══════════════════════════════════════════════════════════════
   AI Factory — Gemini Client
   Core POST to the Gemini REST API, response parsing, and error
   handling. All three LOB APIs go through this single transport.
   Attaches to: window._AIShared.GeminiClient
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._AIShared = global._AIShared || {};

  var DEFAULT_ENDPOINT =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

  var GeminiClient = {

    DEFAULT_ENDPOINT: DEFAULT_ENDPOINT,

    /*
     * Send a multimodal request to Gemini.
     *
     * parts   — array of {text} and/or {inlineData} objects, built by
     *           a LOB API from prompt text + MediaProcessor output
     * apiKey  — Google AI Studio key
     * endpoint — optional override; defaults to gemini-flash-latest
     *
     * Returns Promise<parsedJsonObject>
     * Throws a descriptive Error on API failure or malformed response.
     */
    call: function (parts, apiKey, endpoint) {
      endpoint = endpoint || DEFAULT_ENDPOINT;

      var reqBody = {
        contents: [{ role: 'user', parts: parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 3000
        }
      };

      return fetch(endpoint + '?key=' + apiKey, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(reqBody)
      })
      .then(function (res) {
        if (!res.ok) {
          return res.json()
            .catch(function () { return {}; })
            .then(function (errBody) {
              var msg = errBody && errBody.error && errBody.error.message
                ? errBody.error.message
                : 'HTTP ' + res.status;
              throw new Error('Gemini API error: ' + msg);
            });
        }
        return res.json();
      })
      .then(function (data) {
        var jsonText =
          data &&
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0] &&
          data.candidates[0].content.parts[0].text;

        if (!jsonText) {
          var reason =
            data && data.candidates && data.candidates[0] && data.candidates[0].finishReason
              ? data.candidates[0].finishReason
              : 'unknown';
          throw new Error('Empty Gemini response (finishReason: ' + reason + ')');
        }

        try {
          return JSON.parse(jsonText);
        } catch (e) {
          throw new Error(
            'Gemini returned non-JSON text: ' + jsonText.slice(0, 300)
          );
        }
      });
    }

  };

  global._AIShared.GeminiClient = GeminiClient;

})(window);
