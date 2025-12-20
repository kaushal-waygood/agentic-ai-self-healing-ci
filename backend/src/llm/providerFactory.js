import { GeminiProvider } from './providers/geminiProvider.js';
import { OpenAIProvider } from './providers/openaiProvider.js';
import { DeepSeekProvider } from './providers/deepseekProvider.js';

export function getLLMProvider() {
  const provider = process.env.LLM_PROVIDER || 'gemini';

  switch (provider) {
    case 'openai':
      return new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4.1-mini',
      });

    case 'deepseek':
      console.log('calling');
      return new DeepSeekProvider({
        apiKey: process.env.DEEPSEEK_API_KEY,
        model: 'deepseek-chat',
      });

    case 'gemini':
    default:
      return new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-2.5-flash',
      });
  }
}
