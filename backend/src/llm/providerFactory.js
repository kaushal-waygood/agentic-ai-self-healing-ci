import { GeminiProvider } from './providers/geminiProvider.js';
import { OpenAIProvider } from './providers/openaiProvider.js';
import { DeepSeekProvider } from './providers/deepseekProvider.js';

function buildProvider(name) {
  switch (name) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) return null;
      return new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4.1-mini',
      });

    case 'deepseek':
      if (!process.env.DEEPSEEK_API_KEY) return null;
      return new DeepSeekProvider({
        apiKey: process.env.DEEPSEEK_API_KEY,
        model: 'deepseek-chat',
      });

    case 'gemini':
      if (!process.env.GEMINI_API_KEY) return null;
      return new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-2.5-flash',
      });

    default:
      return null;
  }
}

const QUOTA_ERROR_CODES = [429, 502, 503];

function isQuotaOrUnavailableError(err) {
  const status = err?.status ?? err?.statusCode ?? err?.response?.status;
  if (QUOTA_ERROR_CODES.includes(status)) return true;
  const msg = String(err?.message || '').toLowerCase();
  return (
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('exceeded') ||
    msg.includes('resource exhausted') ||
    msg.includes('too many requests')
  );
}

export function getLLMProvider() {
  const primary = process.env.LLM_PROVIDER || 'gemini';
  return buildProvider(primary) || buildProvider('gemini');
}

export function getLLMProviderChain() {
  const primary = process.env.LLM_PROVIDER || 'gemini';
  const order = [primary, 'gemini', 'openai', 'deepseek'];
  const seen = new Set();
  const chain = [];

  for (const name of order) {
    if (seen.has(name)) continue;
    seen.add(name);
    const p = buildProvider(name);
    if (p) chain.push(p);
  }

  return chain;
}

export async function generateWithFallback(prompt, options = {}) {
  const chain = getLLMProviderChain();

  if (chain.length === 0) {
    throw new Error('No LLM providers configured. Check API key env vars.');
  }

  let lastError;
  for (const provider of chain) {
    try {
      return await provider.generate(prompt, options);
    } catch (err) {
      lastError = err;
      console.warn(
        `LLM provider ${provider.constructor.name} failed: ${err.message}`,
      );
      if (!isQuotaOrUnavailableError(err)) {
        throw err;
      }
    }
  }

  throw lastError;
}
