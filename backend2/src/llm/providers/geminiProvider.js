import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseLLMProvider } from './baseProvider.js';

export class GeminiProvider extends BaseLLMProvider {
  constructor({ apiKey, model }) {
    super({ apiKey, model });
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generate(prompt, { temperature, topK, topP }) {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: { temperature, topK, topP },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response?.usageMetadata) {
      throw new Error('Missing Gemini usage metadata');
    }

    return {
      text: response.text(),
      usage: {
        promptTokens: response.usageMetadata.promptTokenCount,
        outputTokens: response.usageMetadata.candidatesTokenCount,
        totalTokens: response.usageMetadata.totalTokenCount,
      },
    };
  }
}
