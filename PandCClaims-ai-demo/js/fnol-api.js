/* ═══════════════════════════════════════════════════════════════
   P&C Claims AI — Shared Gemini FNOL API Client
   Loaded by both mobileApp.html and ClaimsProfessionalWorkbench.html
   Exposes: window.FNOLApi
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  const DEFAULT_ENDPOINT =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

  /* ── Prompt builder ────────────────────────────────────────── */
  function buildFNOLPrompt(sc) {
    return `You are an expert P&C insurance claims AI analyst working within an enterprise FNOL processing pipeline. Your task is to analyze the FNOL narrative below and return a comprehensive, structured JSON assessment.

LINE OF BUSINESS: ${sc.lob}
JURISDICTION: ${sc.state}
CLAIM ID: ${sc.claimId}

FNOL NARRATIVE:
"""
${sc.narrative}
"""

${sc.photos && sc.photos.filter(p => p.src).length
  ? 'ATTACHED EVIDENCE IMAGES: ' + sc.photos.filter(p => p.src).length + ' damage photo(s) are included in this multimodal request. Incorporate visible damage, document content, and visual evidence into your assessment.\n'
  : ''}
Return ONLY a valid JSON object — no markdown fences, no explanation — with this exact schema:
{
  "overallConfidence": <float 0.0–1.0, overall AI confidence in the assessment>,
  "policyMatch": <float 0.0–1.0, confidence that narrative matches a valid policy>,
  "damageAssessment": <float 0.0–1.0, confidence in damage estimation accuracy>,
  "fraudDetection": <float 0.0–1.0, inverse fraud risk: 1.0 = very clean, 0.5 = moderate concern>,
  "coverageValidation": <float 0.0–1.0, confidence that loss event falls within coverage>,
  "metadata": {
    "lossType": "<e.g. Auto Collision | Wind & Hail Damage | Commercial Property Fire>",
    "cause": "<specific root cause of the loss>",
    "policyTier": "<estimated insurance product tier>",
    "state": "<full state name and abbreviation>",
    "weather": "<weather conditions at time of loss, or Normal Conditions>",
    "estimatedDamage": "<dollar estimate with $ sign, e.g. $5,750>",
    "fraudRisk": "<Low Risk Profile | Moderate — Enhanced Review | High — SIU Required>",
    "deductible": "<estimated deductible based on policy tier>"
  },
  "entities": {
    <key-value pairs of all entities extracted — include: insured name, vehicle or property,
     VIN or address, policy number, incident report numbers, tow company, repair estimate,
     contractor, coverage limit, or any other specific identifiers in the narrative>
  },
  "aiSummary": "<2–3 sentence professional claims analyst summary covering: policy status, loss event validation, fraud risk assessment, and recommended next action>",
  "fraud": [
    "<fraud validation check 1 — prefix with ⚠ ONLY if flagged as a concern>",
    "<fraud validation check 2>",
    "<fraud validation check 3>",
    "<fraud validation check 4>",
    "<fraud validation check 5>",
    "<fraud validation check 6>"
  ],
  "nextSteps": [
    "<recommended action 1>",
    "<recommended action 2>",
    "<recommended action 3>",
    "<recommended action 4>",
    "<recommended action 5>"
  ],
  "timeline": [
    "<pipeline processing event 1 — earliest>",
    "<pipeline processing event 2>",
    "<pipeline processing event 3>",
    "<pipeline processing event 4>",
    "<pipeline processing event 5>",
    "<pipeline processing event 6>",
    "<pipeline processing event 7>",
    "<pipeline processing event 8 — latest>"
  ]
}`;
  }

  /* ── Image → Gemini inlineData part ───────────────────────── */
  /* Converts a URL (relative or absolute) to a Gemini inline part via fetch + FileReader */
  function fetchImageAsInlinePart(src) {
    return fetch(src)
      .then(function (resp) {
        if (!resp.ok) throw new Error('Image fetch failed: ' + src);
        return resp.blob();
      })
      .then(function (blob) {
        return new Promise(function (resolve, reject) {
          var reader = new FileReader();
          reader.onload = function () {
            var result = reader.result; // "data:image/jpeg;base64,XXXX"
            var comma = result.indexOf(',');
            var header = result.slice(0, comma);
            var data = result.slice(comma + 1);
            var mimeMatch = header.match(/:(.*?);/);
            var mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            resolve({ inlineData: { mimeType: mimeType, data: data } });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
  }

  /* Converts an already-loaded data URL (from FileReader/canvas) to an inline part */
  function dataUrlToInlinePart(dataUrl) {
    var comma = dataUrl.indexOf(',');
    var header = dataUrl.slice(0, comma);
    var data = dataUrl.slice(comma + 1);
    var mimeMatch = header.match(/:(.*?);/);
    var mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    return { inlineData: { mimeType: mimeType, data: data } };
  }

  /*
   * Build all image parts for a Gemini request.
   * Priority order:
   *   1. sc.mobileAttachment — { data: base64, mimeType } from mobile upload
   *   2. sc.photos — scenario photo URLs fetched and converted (up to maxPhotos)
   *
   * Returns a Promise<Array<inlineDataPart>>
   */
  function buildImageParts(sc, maxPhotos) {
    maxPhotos = maxPhotos || 4;
    var parts = [];

    // Mobile user-uploaded attachment takes first slot
    if (sc.mobileAttachment && sc.mobileAttachment.data) {
      parts.push({
        inlineData: {
          mimeType: sc.mobileAttachment.mimeType || 'image/jpeg',
          data: sc.mobileAttachment.data
        }
      });
    }

    // Scenario evidence photos (fetch + convert)
    var photoSources = (sc.photos || [])
      .filter(function (p) { return p.src; })
      .slice(0, maxPhotos);

    var fetchPromises = photoSources.map(function (photo) {
      return fetchImageAsInlinePart(photo.src).catch(function () { return null; });
    });

    return Promise.all(fetchPromises).then(function (results) {
      results.forEach(function (part) {
        if (part) parts.push(part);
      });
      return parts;
    });
  }

  /*
   * Main FNOL analysis call — multimodal (text + images).
   *
   * sc: {
   *   claimId, lob, state, narrative,
   *   photos: [{ src, label }],           // scenario evidence photos
   *   mobileAttachment: { data, mimeType } // optional user-uploaded photo
   * }
   *
   * Returns Promise<parsedAiResponseObject>
   * Throws on API error — caller should catch and fall back to sc.ai (sim data)
   */
  function callFNOLAnalysis(sc, apiKey, endpoint) {
    endpoint = endpoint || DEFAULT_ENDPOINT;

    return buildImageParts(sc).then(function (imgParts) {
      var parts = [{ text: buildFNOLPrompt(sc) }];
      parts = parts.concat(imgParts);

      var reqBody = {
        contents: [{ role: 'user', parts: parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 3000
        }
      };

      return fetch(endpoint + '?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      });
    })
    .then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (errBody) {
          throw new Error('HTTP ' + res.status + ': ' + (errBody && errBody.error && errBody.error.message || JSON.stringify(errBody)));
        });
      }
      return res.json();
    })
    .then(function (data) {
      var jsonText = data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text;
      if (!jsonText) throw new Error('Empty response from Gemini');
      return JSON.parse(jsonText);
    });
  }

  /* ── Public API ────────────────────────────────────────────── */
  global.FNOLApi = {
    DEFAULT_ENDPOINT: DEFAULT_ENDPOINT,
    buildFNOLPrompt: buildFNOLPrompt,
    fetchImageAsInlinePart: fetchImageAsInlinePart,
    dataUrlToInlinePart: dataUrlToInlinePart,
    buildImageParts: buildImageParts,
    callFNOLAnalysis: callFNOLAnalysis
  };

})(window);
