const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiProvider {
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.models = {
      fast:    process.env.AI_MODEL_FAST    || 'gemini-1.5-flash',
      vision:  process.env.AI_MODEL_VISION  || 'gemini-1.5-pro',
      complex: process.env.AI_MODEL_COMPLEX || 'gemini-1.5-pro',
    };
  }

  async callRaw(prompt, fileBuffer = null, mimeType = null, modelTier = 'fast') {
    const modelName = this.models[modelTier] || this.models.fast;
    const model = this.client.getGenerativeModel({ model: modelName });
    const parts = [];
    if (fileBuffer) parts.push({ inlineData: { mimeType, data: fileBuffer.toString('base64') } });
    parts.push(prompt);
    const result = await model.generateContent(parts);
    return result.response.text().trim();
  }

  async call(prompt, fileBuffer = null, mimeType = null, modelTier = 'fast') {
    const modelName = this.models[modelTier] || this.models.fast;
    const model = this.client.getGenerativeModel({ model: modelName });

    const parts = [];
    if (fileBuffer) {
      parts.push({ inlineData: { mimeType, data: fileBuffer.toString('base64') } });
    }
    parts.push(prompt);

    const result = await model.generateContent(parts);
    const text = result.response.text();

    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Provider did not return valid JSON: ' + text.substring(0, 300));
    }
  }
}

module.exports = GeminiProvider;
