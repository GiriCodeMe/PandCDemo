const GeminiProvider = require('./providers/gemini.provider');

class AIFactory {
  constructor() {
    const providerName = process.env.AI_PROVIDER || 'gemini';
    if (providerName === 'gemini') {
      this.provider = new GeminiProvider();
    } else {
      throw new Error(`Unknown AI provider: "${providerName}". Supported: gemini`);
    }
  }

  async run(agentModule, input) {
    const prompt = agentModule.buildPrompt(input);
    const tier = typeof agentModule.modelTier === 'function'
      ? agentModule.modelTier(input)
      : agentModule.modelTier;
    if (agentModule.responseType === 'text') {
      return this.provider.callRaw(prompt, input.fileBuffer, input.mimeType, tier);
    }
    return this.provider.call(prompt, input.fileBuffer, input.mimeType, tier);
  }
}

module.exports = new AIFactory();
