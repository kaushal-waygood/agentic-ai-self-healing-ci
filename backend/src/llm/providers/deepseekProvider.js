import OpenAI from 'openai';
import { BaseLLMProvider } from './baseProvider.js';

export class DeepSeekProvider extends BaseLLMProvider {
  constructor({ apiKey, model }) {
    super({ apiKey, model });
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });
  }

  async generate(prompt, { temperature }) {
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
    });

    return {
      text: res.choices[0].message.content,
      usage: {
        promptTokens: res.usage.prompt_tokens,
        outputTokens: res.usage.completion_tokens,
        totalTokens: res.usage.total_tokens,
      },
    };
  }
}
